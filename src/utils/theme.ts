export const Colors = {
  primary:      '#1D9E75',
  primaryDark:  '#0F6E56',
  primaryLight: '#E1F5EE',
  warning:      '#BA7517',
  warningLight: '#FAEEDA',
  danger:       '#E24B4A',
  white:        '#FFFFFF',
  black:        '#0A0A0A',
  gray50:       '#F9F9F9',
  gray100:      '#F1F1F1',
  gray200:      '#E0E0E0',
  gray400:      '#9E9E9E',
  gray600:      '#616161',
  gray800:      '#2C2C2A',
};

export const Typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, color: Colors.black },
  h2: { fontSize: 22, fontWeight: '600' as const, color: Colors.black },
  h3: { fontSize: 18, fontWeight: '600' as const, color: Colors.black },
  body: { fontSize: 15, fontWeight: '400' as const, color: Colors.gray800 },
  small: { fontSize: 13, fontWeight: '400' as const, color: Colors.gray600 },
  label: { fontSize: 12, fontWeight: '500' as const, color: Colors.gray600 },
};

export const Spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32,
};

export const Radius = {
  sm: 8, md: 12, lg: 16, xl: 24, full: 999,
};
