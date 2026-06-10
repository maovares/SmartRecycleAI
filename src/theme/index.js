// ─── SmartRecycle AI — Design System ────────────────────────────────────────

export const lightColors = {
  forest:    '#1B4332',
  canopy:    '#2A7850',
  sage:      '#62B88E',
  sageFaint: '#D0EDDF',

  amber:      '#F07058',
  amberDark:  '#D35640',
  amberLight: '#FDE8E2',
  amberFaint: '#FFF2EE',

  bark:     '#F5FBF4',
  surface:  '#FFFFFF',
  stone50:  '#F7FAF8',
  stone100: '#DCE9E4',
  stone200: '#C6D8D2',
  outline:  '#6B7C74',
  stone400: '#82A09A',
  stone600: '#4C6A63',
  ink:      '#111D1A',

  successBg:   '#E3F2EB',
  successText: '#1B4332',
  errorBg:     '#FDE8E2',
  errorText:   '#A83222',
  warningBg:   '#FEF0E6',
  warningText: '#9E5010',

  white:       '#FFFFFF',
  transparent: 'transparent',
  overlay:     'rgba(17, 29, 26, 0.45)',
  overlayDark: 'rgba(17, 29, 26, 0.72)',
};

export const darkColors = {
  forest:    '#1B4332',
  canopy:    '#4BAF7A',
  sage:      '#62B88E',
  sageFaint: '#162A1F',

  amber:      '#F07058',
  amberDark:  '#D35640',
  amberLight: '#3D1E14',
  amberFaint: '#2A1510',

  bark:     '#0D1711',
  surface:  '#172319',
  stone50:  '#172319',
  stone100: '#1F3029',
  stone200: '#2A4036',
  outline:  '#3A5246',
  stone400: '#6E9088',
  stone600: '#A8C2BA',
  ink:      '#EAF5EE',

  successBg:   '#162A1F',
  successText: '#62B88E',
  errorBg:     '#3D1E14',
  errorText:   '#E8957F',
  warningBg:   '#2D1E0E',
  warningText: '#E8A07A',

  white:       '#FFFFFF',
  transparent: 'transparent',
  overlay:     'rgba(0, 0, 0, 0.55)',
  overlayDark: 'rgba(0, 0, 0, 0.78)',
};

// Kept for screens not yet updated — always light
export const colors = lightColors;

// ── Typography ───────────────────────────────────────────────────────────────
export const font = {
  display:   'DMSans_700Bold',
  regular:   'DMSans_400Regular',
  medium:    'DMSans_500Medium',
  semibold:  'DMSans_600SemiBold',
  bold:      'DMSans_700Bold',
  extrabold: 'DMSans_800ExtraBold',
};

// ── Font scale ───────────────────────────────────────────────────────────────
export const size = {
  xs:   11,
  sm:   13,
  base: 15,
  md:   17,
  lg:   20,
  xl:   24,
  xxl:  32,
};

// ── Spacing ──────────────────────────────────────────────────────────────────
export const space = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  xxl:  32,
  xxxl: 48,
};

// ── Border radius ────────────────────────────────────────────────────────────
export const radius = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  pill: 100,
};

// ── Shadows ──────────────────────────────────────────────────────────────────
export const shadow = {
  sm: {
    shadowColor: '#1B4332',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#1B4332',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#1B4332',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 12,
    elevation: 8,
  },
};
