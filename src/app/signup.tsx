import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';

import { AuthHeader } from '@/components/auth-header';
import { Body, Button, Card, Field, Muted, Screen } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { authErrorMessage } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

const MIN_PASSWORD = 6;

export default function SignupScreen() {
  const theme = useTheme();
  const [teamName, setTeamName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  const mismatch = confirm.length > 0 && confirm !== password;
  const valid = email.trim().length > 0 && password.length >= MIN_PASSWORD && password === confirm;

  const signUp = async () => {
    setBusy(true);
    setError(null);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { team_name: teamName.trim() || undefined } },
    });
    setBusy(false);
    if (signUpError) {
      setError(authErrorMessage(signUpError.message));
    } else if (!data.session) {
      // Le projet Supabase exige une confirmation par email.
      setAwaitingConfirmation(true);
    }
  };

  if (awaitingConfirmation) {
    return (
      <Screen>
        <AuthHeader subtitle="Plus qu’une étape !" />
        <Card>
          <Body>
            Un email de confirmation a été envoyé à <Body style={{ fontWeight: '700' }}>{email.trim()}</Body>. Clique sur
            le lien qu’il contient, puis reviens te connecter.
          </Body>
        </Card>
        <Button title="Aller à la connexion" icon="log-in" onPress={() => router.replace('/login')} />
      </Screen>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen>
        <AuthHeader subtitle="Crée ton compte pour gérer ton équipe." />
        <Field label="Nom de l'équipe" value={teamName} onChangeText={setTeamName} placeholder="ex. VC Montreuil U17" />
        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="toi@exemple.fr"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
        />
        <Field
          label={`Mot de passe (${MIN_PASSWORD} caractères min.)`}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
        />
        <Field
          label="Confirmer le mot de passe"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
        />
        {mismatch && <Muted style={{ color: theme.them }}>Les mots de passe ne correspondent pas.</Muted>}
        {error && <Muted style={{ color: theme.them }}>{error}</Muted>}
        <Button
          title={busy ? 'Création…' : 'Créer mon compte'}
          icon="person-add"
          onPress={signUp}
          disabled={busy || !valid}
        />
        <Button title="J’ai déjà un compte" variant="secondary" onPress={() => router.back()} />
      </Screen>
    </KeyboardAvoidingView>
  );
}
