import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router/stack';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { Body, Button, Empty, Muted, Screen } from '@/components/ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { AuthProvider, useAuth } from '@/lib/auth';
import { StoreProvider, useStore } from '@/lib/store';
import { supabase, supabaseConfigured } from '@/lib/supabase';

function Loading() {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background }}>
      <ActivityIndicator color={theme.primary} />
    </View>
  );
}

/** Attend que l'équipe du compte soit chargée avant d'afficher l'app. */
function TeamGate({ children }: { children: ReactNode }) {
  const { loaded, loadError, retry } = useStore();
  if (loadError) {
    return (
      <Screen>
        <Empty icon="cloud-offline-outline" text="Impossible de charger ton équipe. Vérifie ta connexion internet." />
        <Muted style={{ textAlign: 'center' }}>{loadError}</Muted>
        <Button title="Réessayer" icon="refresh" onPress={retry} />
        <Button title="Se déconnecter" variant="secondary" onPress={() => supabase.auth.signOut()} />
      </Screen>
    );
  }
  return loaded ? children : <Loading />;
}

function Navigation() {
  const { session, loading } = useAuth();
  const theme = useTheme();

  if (loading) return <Loading />;

  const signedIn = Boolean(session);
  const stack = (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.card },
        headerTintColor: theme.text,
        headerBackTitle: 'Retour',
        contentStyle: { backgroundColor: theme.background },
      }}>
      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="player/[id]" options={{ title: 'Joueur' }} />
        <Stack.Screen name="event/[id]" options={{ title: 'Événement' }} />
      </Stack.Protected>
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ title: 'Créer un compte' }} />
      </Stack.Protected>
    </Stack>
  );

  if (!session) return stack;
  return (
    <StoreProvider
      key={session.user.id}
      userId={session.user.id}
      defaultTeamName={session.user.user_metadata?.team_name as string | undefined}>
      <TeamGate>{stack}</TeamGate>
    </StoreProvider>
  );
}

function MissingConfig() {
  return (
    <Screen>
      <Empty icon="construct-outline" text="Supabase n’est pas configuré." />
      <Body>
        Renseigne EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_ANON_KEY dans le fichier .env (voir README), puis
        relance « npx expo start ».
      </Body>
    </Screen>
  );
}

export default function RootLayout() {
  const scheme = useColorScheme();
  return (
    <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      {supabaseConfigured ? (
        <AuthProvider>
          <Navigation />
        </AuthProvider>
      ) : (
        <MissingConfig />
      )}
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
