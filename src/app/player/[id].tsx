import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { Button, Chips, Field, Label, Screen, Title } from '@/components/ui';
import { newId, playerName, usePlayer, useStore } from '@/lib/store';
import { POSITIONS, type Position } from '@/lib/types';

export default function PlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, upsert, remove } = useStore();
  const existing = usePlayer(id);
  const isNew = id === 'new' || !existing;

  const [firstName, setFirstName] = useState(existing?.firstName ?? '');
  const [lastName, setLastName] = useState(existing?.lastName ?? '');
  const [number, setNumber] = useState(existing ? String(existing.number) : '');
  const [position, setPosition] = useState<Position>(existing?.position ?? 'R4');

  const numberValue = Number.parseInt(number, 10);
  const numberTaken = data.players.some((p) => p.number === numberValue && p.id !== existing?.id);
  const valid = firstName.trim().length > 0 && Number.isInteger(numberValue) && numberValue >= 0 && !numberTaken;

  const save = () => {
    upsert('players', {
      id: existing?.id ?? newId(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      number: numberValue,
      position,
    });
    router.back();
  };

  const confirmDelete = () => {
    if (!existing) return;
    Alert.alert('Supprimer ce joueur ?', `${playerName(existing)} sera retiré de l’effectif.`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => {
          remove('players', existing.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <Screen>
      <Stack.Screen options={{ title: isNew ? 'Nouveau joueur' : playerName(existing) }} />

      <Title>{isNew ? 'Informations' : 'Modifier'}</Title>
      <Field label="Prénom" value={firstName} onChangeText={setFirstName} placeholder="Prénom" />
      <Field label="Nom" value={lastName} onChangeText={setLastName} placeholder="Nom" />
      <Field
        label={numberTaken ? 'Numéro (déjà pris)' : 'Numéro de maillot'}
        value={number}
        onChangeText={setNumber}
        keyboardType="number-pad"
        maxLength={2}
        placeholder="ex. 7"
      />
      <Label>Poste</Label>
      <Chips options={POSITIONS} value={position} onChange={setPosition} />

      <Button title="Enregistrer" icon="checkmark" onPress={save} disabled={!valid} />
      {!isNew && <Button title="Supprimer" icon="trash" variant="danger" onPress={confirmDelete} />}
    </Screen>
  );
}
