import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';

import { AuthHeader } from '@/components/auth-header';
import { Button, Field, Muted, Screen } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { authErrorMessage } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const signIn = async () => {
    setBusy(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (signInError) setError(authErrorMessage(signInError.message));
    // En cas de succès, la session change et la navigation bascule vers l'app.
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen>
        <AuthHeader subtitle="Connecte-toi pour retrouver ton équipe." />
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
          label="Mot de passe"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
          autoComplete="current-password"
          textContentType="password"
          onSubmitEditing={signIn}
        />
        {error && <Muted style={{ color: theme.them }}>{error}</Muted>}
        <Button
          title={busy ? 'Connexion…' : 'Se connecter'}
          icon="log-in"
          onPress={signIn}
          disabled={busy || !email.trim() || !password}
        />
        <Button title="Créer un compte" variant="secondary" onPress={() => router.push('/signup')} />
      </Screen>
    </KeyboardAvoidingView>
  );
}
