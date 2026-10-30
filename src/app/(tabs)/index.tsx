import { router } from 'expo-router';
import { useState } from 'react';

import { Body, Button, Card, Field, Label, Muted, Row, Screen, Stat, Title } from '@/components/ui';
import { formatDate, todayISO } from '@/lib/dates';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth';
import { useStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';

export default function HomeScreen() {
  const { data, setTeamName, saveFailed } = useStore();
  const { session } = useAuth();
  const theme = useTheme();
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(data.teamName);

  const today = todayISO();
  const upcoming = [...data.events]
    .filter((e) => e.date >= today)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 3);

  return (
    <Screen>
      {saveFailed && (
        <Muted style={{ color: theme.them }}>
          Dernière modification non enregistrée en ligne. Vérifie ta connexion : elle sera renvoyée à la prochaine
          modification.
        </Muted>
      )}
      <Card>
        <Label>Équipe</Label>
        {editingName ? (
          <>
            <Field label="Nom de l'équipe" value={name} onChangeText={setName} autoFocus />
            <Button
              title="Enregistrer"
              onPress={() => {
                setTeamName(name.trim() || 'Mon équipe');
                setEditingName(false);
              }}
            />
          </>
        ) : (
          <Row style={{ justifyContent: 'space-between' }}>
            <Title>{data.teamName}</Title>
            <Button title="Modifier" compact variant="secondary" icon="pencil" onPress={() => setEditingName(true)} />
          </Row>
        )}
        <Row style={{ flexWrap: 'wrap', gap: 8 }}>
          <Stat label="Joueurs" value={data.players.length} />
          <Stat label="Événements à venir" value={data.events.filter((e) => e.date >= today).length} />
        </Row>
      </Card>

      <Title>Prochainement</Title>
      {upcoming.length === 0 ? (
        <Muted>Aucun événement prévu. Ajoute un entraînement ou un match dans l’Agenda.</Muted>
      ) : (
        upcoming.map((event) => (
          <Card key={event.id} onPress={() => router.push(`/event/${event.id}`)}>
            <Body style={{ fontWeight: '700' }}>{event.title}</Body>
            <Muted>
              {formatDate(event.date)} · {event.time}
              {event.location ? ` · ${event.location}` : ''}
            </Muted>
          </Card>
        ))
      )}

      <Title>Raccourcis</Title>
      <Button title="Ajouter un événement" icon="calendar" onPress={() => router.push('/event/new')} />
      <Button
        title="Ajouter un joueur"
        icon="person-add"
        variant="secondary"
        onPress={() => router.push('/player/new')}
      />

      <Title>Compte</Title>
      <Card>
        <Muted>Connecté avec {session?.user.email}</Muted>
        <Button title="Se déconnecter" icon="log-out" variant="secondary" onPress={() => supabase.auth.signOut()} />
      </Card>
    </Screen>
  );
}
