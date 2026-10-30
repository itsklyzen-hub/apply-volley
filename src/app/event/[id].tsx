import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable } from 'react-native';

import { Body, Button, Card, Chips, Field, JerseyBadge, Label, Muted, Row, Screen, Title } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { isValidDate, isValidTime, todayISO } from '@/lib/dates';
import { newId, playerName, sortPlayers, useCalendarEvent, useStore } from '@/lib/store';
import type { Attendance, CalendarEvent } from '@/lib/types';

const KINDS = ['training', 'match', 'other'] as const;
const KIND_LABEL: Record<CalendarEvent['kind'], string> = {
  training: 'Entraînement',
  match: 'Match',
  other: 'Autre',
};
const NEXT: Record<Attendance, Attendance> = { unknown: 'present', present: 'absent', absent: 'unknown' };

export default function EventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, upsert, update, remove } = useStore();
  const theme = useTheme();
  const existing = useCalendarEvent(id);
  const isNew = id === 'new' || !existing;

  const [kind, setKind] = useState<CalendarEvent['kind']>(existing?.kind ?? 'training');
  const [title, setTitle] = useState(existing?.title ?? '');
  const [date, setDate] = useState(existing?.date ?? todayISO());
  const [time, setTime] = useState(existing?.time ?? '19:00');
  const [location, setLocation] = useState(existing?.location ?? '');
  const [editing, setEditing] = useState(isNew);

  const valid = isValidDate(date) && isValidTime(time);

  const save = () => {
    const event: CalendarEvent = {
      id: existing?.id ?? newId(),
      kind,
      title: title.trim() || KIND_LABEL[kind],
      date,
      time,
      location: location.trim(),
      attendance: existing?.attendance ?? {},
    };
    upsert('events', event);
    if (isNew) router.back();
    else setEditing(false);
  };

  const toggleAttendance = (playerId: string) => {
    if (!existing) return;
    update('events', existing.id, (e) => ({
      ...e,
      attendance: { ...e.attendance, [playerId]: NEXT[e.attendance[playerId] ?? 'unknown'] },
    }));
  };

  const confirmDelete = () => {
    if (!existing) return;
    Alert.alert('Supprimer cet événement ?', existing.title, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => {
          remove('events', existing.id);
          router.back();
        },
      },
    ]);
  };

  const attendanceIcon = {
    present: { name: 'checkmark-circle', color: theme.success },
    absent: { name: 'close-circle', color: theme.them },
    unknown: { name: 'help-circle-outline', color: theme.textSecondary },
  } as const;

  const counts = existing
    ? data.players.reduce(
        (acc, p) => {
          acc[existing.attendance[p.id] ?? 'unknown']++;
          return acc;
        },
        { present: 0, absent: 0, unknown: 0 } as Record<Attendance, number>,
      )
    : null;

  return (
    <Screen>
      <Stack.Screen options={{ title: isNew ? 'Nouvel événement' : existing.title }} />

      {editing ? (
        <>
          <Label>Type</Label>
          <Chips options={KINDS} value={kind} onChange={setKind} format={(k) => KIND_LABEL[k]} />
          <Field label="Titre" value={title} onChangeText={setTitle} placeholder={KIND_LABEL[kind]} />
          <Row>
            <Field
              label="Date (AAAA-MM-JJ)"
              value={date}
              onChangeText={setDate}
              style={{ minWidth: 150 }}
              autoCorrect={false}
            />
            <Field label="Heure (HH:MM)" value={time} onChangeText={setTime} style={{ minWidth: 100 }} />
          </Row>
          {!valid && <Muted style={{ color: theme.them }}>Date ou heure invalide.</Muted>}
          <Field label="Lieu" value={location} onChangeText={setLocation} placeholder="Gymnase…" />
          <Button title="Enregistrer" icon="checkmark" onPress={save} disabled={!valid} />
          {!isNew && <Button title="Annuler" variant="secondary" onPress={() => setEditing(false)} />}
        </>
      ) : (
        existing && (
          <>
            <Card>
              <Label>{KIND_LABEL[existing.kind]}</Label>
              <Title>{existing.title}</Title>
              <Muted>
                {existing.date} à {existing.time}
                {existing.location ? ` · ${existing.location}` : ''}
              </Muted>
              <Row style={{ gap: 8 }}>
                <Button title="Modifier" icon="pencil" variant="secondary" compact onPress={() => setEditing(true)} />
                <Button title="Supprimer" icon="trash" variant="danger" compact onPress={confirmDelete} />
              </Row>
            </Card>

            <Title>Présences</Title>
            {counts && (
              <Muted>
                {counts.present} présent(s) · {counts.absent} absent(s) · {counts.unknown} sans réponse — touche un
                joueur pour changer son statut.
              </Muted>
            )}
            {data.players.length === 0 && <Muted>Ajoute des joueurs dans l’onglet Effectif.</Muted>}
            {sortPlayers(data.players).map((player) => {
              const status = existing.attendance[player.id] ?? 'unknown';
              return (
                <Pressable key={player.id} onPress={() => toggleAttendance(player.id)}>
                  <Card>
                    <Row>
                      <JerseyBadge number={player.number} size={30} />
                      <Body style={{ flex: 1 }}>{playerName(player)}</Body>
                      <Ionicons
                        name={attendanceIcon[status].name}
                        color={attendanceIcon[status].color}
                        size={28}
                      />
                    </Row>
                  </Card>
                </Pressable>
              );
            })}
          </>
        )
      )}
    </Screen>
  );
}
