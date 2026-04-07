// GusPad Design System
// Primary: #0C2729 (deep dark green)
// Secondary: #BAEBBE (light mint green)

export const Colors = {
  // Backgrounds
  background: '#0C2729',
  surface: '#112E30',        // cards, elevated surfaces
  surfaceAlt: '#0A2224',     // deeper variation

  // Brand
  primary: '#0C2729',
  secondary: '#BAEBBE',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#BAEBBE',
  textMuted: 'rgba(186, 235, 190, 0.55)',

  // Input
  inputBackground: '#112E30',
  inputBorder: 'rgba(186, 235, 190, 0.35)',
  inputBorderFocused: '#BAEBBE',
  inputText: '#FFFFFF',
  inputPlaceholder: 'rgba(186, 235, 190, 0.45)',

  // Button
  buttonPrimary: '#BAEBBE',
  buttonPrimaryText: '#0C2729',
  buttonSecondaryBorder: '#BAEBBE',
  buttonSecondaryText: '#BAEBBE',
  buttonDanger: '#E05555',
  buttonDangerText: '#FFFFFF',

  // Status
  error: '#FF6B6B',
  success: '#BAEBBE',
  warning: '#F0C040',

  // Misc
  divider: 'rgba(186, 235, 190, 0.15)',
  overlay: 'rgba(12, 39, 41, 0.85)',
} as const;

// Font family names — must match the keys used in useFonts()
export const FontFamily = {
  // League Spartan (Google Fonts — loaded via @expo-google-fonts/league-spartan)
  headingBold: 'LeagueSpartan_700Bold',
  headingSemiBold: 'LeagueSpartan_600SemiBold',
  headingRegular: 'LeagueSpartan_400Regular',

  // Glacial Indifference — use these once .otf files are in assets/fonts/:
  // body: 'GlacialIndifference-Regular',
  // bodyBold: 'GlacialIndifference-Bold',
  body: 'LeagueSpartan_400Regular',
  bodyBold: 'LeagueSpartan_700Bold',
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 16,
  lg: 20,
  xl: 26,
  xxl: 34,
  hero: 44,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 999,
} as const;
