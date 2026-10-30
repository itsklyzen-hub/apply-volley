export const Colors = {
  light: {
    text: '#0F172A',
    textSecondary: '#64748B',
    background: '#F4F6FA',
    card: '#FFFFFF',
    border: '#E2E8F0',
    primary: '#F97316',
    primaryText: '#FFFFFF',
    us: '#2563EB',
    them: '#DC2626',
    success: '#16A34A',
    warning: '#CA8A04',
    court: '#F59E0B',
    courtLine: '#FFFFFF',
  },
  dark: {
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    background: '#0B1120',
    card: '#151E2F',
    border: '#253047',
    primary: '#FB923C',
    primaryText: '#0B1120',
    us: '#60A5FA',
    them: '#F87171',
    success: '#4ADE80',
    warning: '#FACC15',
    court: '#B45309',
    courtLine: '#FDE68A',
  },
} as const;

export type ThemeColors = { [K in keyof typeof Colors.light]: string };
