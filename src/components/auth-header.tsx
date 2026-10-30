import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { Muted } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';

export function AuthHeader({ subtitle }: { subtitle: string }) {
  const theme = useTheme();
  return (
    <View style={styles.header}>
      <View style={[styles.logo, { backgroundColor: theme.primary }]}>
        <Ionicons name="tennisball" size={36} color={theme.primaryText} />
      </View>
      <Text style={[styles.title, { color: theme.text }]}>Apply Volley</Text>
      <Muted style={{ textAlign: 'center' }}>{subtitle}</Muted>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', gap: 8, paddingTop: 32, paddingBottom: 12 },
  logo: { width: 72, height: 72, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '900' },
});
