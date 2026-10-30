import { router } from 'expo-router';

import { Body, Button, Card, Empty, JerseyBadge, Muted, Row, Screen } from '@/components/ui';
import { playerName, sortPlayers, useStore } from '@/lib/store';

export default function TeamScreen() {
  const { data } = useStore();
  const players = sortPlayers(data.players);

  return (
    <Screen>
      <Button title="Ajouter un joueur" icon="person-add" onPress={() => router.push('/player/new')} />
      {players.length === 0 ? (
        <Empty icon="people-outline" text="Ton effectif est vide. Ajoute tes joueurs pour composer tes équipes." />
      ) : (
        players.map((player) => (
          <Card key={player.id} onPress={() => router.push(`/player/${player.id}`)}>
            <Row>
              <JerseyBadge number={player.number} />
              <Body style={{ flex: 1, fontWeight: '700' }}>{playerName(player)}</Body>
              <Muted>{player.position}</Muted>
            </Row>
          </Card>
        ))
      )}
    </Screen>
  );
}
