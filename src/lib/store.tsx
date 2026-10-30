import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, type ReactNode, useContext, useEffect, useRef, useState } from 'react';

import { supabase } from './supabase';
import type { AppData, CalendarEvent, Player } from './types';

/** Données de la version sans compte, importées au premier login. */
const LEGACY_STORAGE_KEY = 'apply-volley/data/v1';

const SAVE_DELAY_MS = 600;

const INITIAL_DATA: AppData = {
  teamName: 'Mon équipe',
  players: [],
  events: [],
};

type Collection = 'players' | 'events';

type ItemOf<K extends Collection> = AppData[K][number];

type Store = {
  data: AppData;
  loaded: boolean;
  /** Message d'erreur si le chargement a échoué (ex. hors connexion). */
  loadError: string | null;
  /** Vrai si la dernière sauvegarde en ligne a échoué. */
  saveFailed: boolean;
  retry: () => void;
  setTeamName: (name: string) => void;
  upsert: <K extends Collection>(collection: K, item: ItemOf<K>) => void;
  remove: (collection: Collection, id: string) => void;
  update: <K extends Collection>(collection: K, id: string, fn: (item: ItemOf<K>) => ItemOf<K>) => void;
};

const StoreContext = createContext<Store | null>(null);

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalize(saved: Partial<AppData> | null | undefined): AppData {
  return {
    teamName: saved?.teamName ?? INITIAL_DATA.teamName,
    players: saved?.players ?? [],
    events: (saved?.events ?? []).map(({ sessionId: _, ...e }: CalendarEvent & { sessionId?: string }) => e),
  };
}

async function loadTeam(userId: string, defaultTeamName?: string): Promise<AppData> {
  const { data: row, error } = await supabase.from('team_data').select('data').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  if (row) return normalize(row.data as Partial<AppData>);

  // Premier login : reprendre les données déjà saisies sur ce téléphone, s'il y en a.
  const legacy = await AsyncStorage.getItem(LEGACY_STORAGE_KEY).catch(() => null);
  const initial = normalize(legacy ? (JSON.parse(legacy) as Partial<AppData>) : { teamName: defaultTeamName });
  const { error: insertError } = await supabase.from('team_data').insert({ user_id: userId, data: initial });
  if (insertError) throw insertError;
  if (legacy) await AsyncStorage.removeItem(LEGACY_STORAGE_KEY).catch(() => undefined);
  return initial;
}

export function StoreProvider({
  userId,
  defaultTeamName,
  children,
}: {
  userId: string;
  /** Nom saisi à l'inscription, utilisé à la création de l'équipe. */
  defaultTeamName?: string;
  children: ReactNode;
}) {
  const [data, setData] = useState<AppData>(INITIAL_DATA);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const skipSave = useRef(true);

  useEffect(() => {
    let cancelled = false;
    loadTeam(userId, defaultTeamName)
      .then((team) => {
        if (cancelled) return;
        skipSave.current = true;
        setData(team);
        setLoadError(null);
        setLoaded(true);
      })
      .catch((error: Error) => {
        if (!cancelled) setLoadError(error.message);
      });
    return () => {
      cancelled = true;
    };
  }, [userId, defaultTeamName, attempt]);

  useEffect(() => {
    if (!loaded) return;
    // Ne pas réécrire immédiatement ce qu'on vient de lire.
    if (skipSave.current) {
      skipSave.current = false;
      return;
    }
    const timer = setTimeout(() => {
      supabase
        .from('team_data')
        .upsert({ user_id: userId, data, updated_at: new Date().toISOString() })
        .then(({ error }) => {
          if (error) console.warn('Sauvegarde impossible', error.message);
          setSaveFailed(Boolean(error));
        });
    }, SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [data, loaded, userId]);

  const store: Store = {
    data,
    loaded,
    loadError,
    saveFailed,
    retry: () => {
      setLoadError(null);
      setAttempt((n) => n + 1);
    },
    setTeamName: (teamName) => setData((d) => ({ ...d, teamName })),
    upsert: (collection, item) =>
      setData((d) => {
        const list = d[collection] as { id: string }[];
        const exists = list.some((x) => x.id === item.id);
        const next = exists ? list.map((x) => (x.id === item.id ? item : x)) : [...list, item];
        return { ...d, [collection]: next };
      }),
    remove: (collection, id) =>
      setData((d) => ({
        ...d,
        [collection]: (d[collection] as { id: string }[]).filter((x) => x.id !== id),
      })),
    update: (collection, id, fn) =>
      setData((d) => ({
        ...d,
        [collection]: (d[collection] as ItemOf<typeof collection>[]).map((x) =>
          x.id === id ? fn(x) : x,
        ),
      })),
  };

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore doit être utilisé dans <StoreProvider>');
  return store;
}

export function usePlayer(id: string | undefined): Player | undefined {
  return useStore().data.players.find((p) => p.id === id);
}

export function useCalendarEvent(id: string | undefined): CalendarEvent | undefined {
  return useStore().data.events.find((e) => e.id === id);
}

export function playerName(player: Player | undefined): string {
  if (!player) return 'Joueur supprimé';
  return `${player.firstName} ${player.lastName}`.trim();
}

export function sortPlayers(players: Player[]): Player[] {
  return [...players].sort((a, b) => a.number - b.number);
}
