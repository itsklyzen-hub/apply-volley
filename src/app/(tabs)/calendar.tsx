import { router } from 'expo-router';
import { useState } from 'react';

import { Body, Button, Card, Chips, Empty, Muted, Row, Screen } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { formatDate, todayISO } from '@/lib/dates';
import { useStore } from '@/lib/store';
import type { CalendarEvent } from '@/lib/types';

const KIND_LABEL: Record<CalendarEvent['kind'], string> = {
  training: 'Entraînement',
  match: 'Match',
  other: 'Autre',
};

export default function CalendarScreen() {
  const { data } = useStore();
  const theme = useTheme();
  const [period, setPeriod] = useState<'À venir' | 'Passés'>('À venir');

  const today = todayISO();
  const events = [...data.events]
    .filter((e) => (period === 'À venir' ? e.date >= today : e.date < today))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  if (period === 'Passés') events.reverse();

  const kindColor: Record<CalendarEvent['kind'], string> = {
    training: theme.success,
    match: theme.primary,
    other: theme.textSecondary,
  };

  return (
    <Screen>
      <Button title="Ajouter un événement" icon="add" onPress={() => router.push('/event/new')} />
      <Chips options={['À venir', 'Passés'] as const} value={period} onChange={setPeriod} />
      {events.length === 0 ? (
        <Empty icon="calendar-outline" text="Rien de prévu. Ajoute tes entraînements et matchs pour suivre les présences." />
      ) : (
        events.map((event) => {
          const present = Object.values(event.attendance).filter((a) => a === 'present').length;
          return (
            <Card key={event.id} onPress={() => router.push(`/event/${event.id}`)}>
              <Row style={{ justifyContent: 'space-between' }}>
                <Body style={{ fontWeight: '700', flex: 1 }}>{event.title}</Body>
                <Muted style={{ color: kindColor[event.kind], fontWeight: '700' }}>{KIND_LABEL[event.kind]}</Muted>
              </Row>
              <Muted>
                {formatDate(event.date)} · {event.time}
                {event.location ? ` · ${event.location}` : ''}
              </Muted>
              <Muted>
                {present} / {data.players.length} présent(s)
              </Muted>
            </Card>
          );
        })
      )}
    </Screen>
  );
}
