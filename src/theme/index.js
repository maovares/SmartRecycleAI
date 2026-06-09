// ─── SmartRecycle AI — Design System ────────────────────────────────────────
// Aligned to Material Design 3 color roles while staying cross-platform.
// M3 role annotations appear inline → primary, onPrimary, primaryContainer, etc.

// ── Colors ──────────────────────────────────────────────────────────────────
export const colors = {
  // ── Primary (M3: primary / onPrimary / primaryContainer / onPrimaryContainer)
  forest:    '#1B4332',   // primary — brand anchor, headers, filled buttons
  canopy:    '#2A7850',   // secondary — supporting labels, active accents (5:1 on white ✓)
  sage:      '#62B88E',   // decorative accent — icons, illustrations
  sageFaint: '#D0EDDF',   // primaryContainer — pill indicators, badges, step numbers

  // ── Tertiary (M3: tertiary / tertiaryContainer)
  amber:      '#F07058',  // tertiary — coral accent, EcoPoints, CTAs
  amberDark:  '#D35640',  // tertiary pressed / dark
  amberLight: '#FDE8E2',  // tertiaryContainer — soft coral backgrounds
  amberFaint: '#FFF2EE',  // tertiaryContainer subtle

  // ── Surface & background (M3: background, surface, surfaceContainer, outline)
  bark:     '#F5FBF4',   // background — app background (tone 98, green tint)
  surface:  '#FFFFFF',   // surface / surfaceContainerLowest — cards
  stone50:  '#F7FAF8',
  stone100: '#DCE9E4',   // outlineVariant — dividers, subtle borders
  stone200: '#C6D8D2',   // surface border / placeholder outlines
  outline:  '#6B7C74',   // M3 outline — component borders (buttons, text fields)
  stone400: '#82A09A',   // onSurfaceVariant muted — inactive icons, tertiary text
  stone600: '#4C6A63',   // onSurfaceVariant — secondary text
  ink:      '#111D1A',   // onSurface — primary text

  // ── Semantic
  successBg:   '#E3F2EB',
  successText: '#1B4332',
  errorBg:     '#FDE8E2',
  errorText:   '#A83222',
  warningBg:   '#FEF0E6',
  warningText: '#9E5010',

  // ── Utility
  white:       '#FFFFFF',
  transparent: 'transparent',
  overlay:     'rgba(17, 29, 26, 0.45)',
  overlayDark: 'rgba(17, 29, 26, 0.72)',
};

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

// ── Spacing (multiples of 4) ─────────────────────────────────────────────────
export const space = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  xxl:  32,
  xxxl: 48,
};

// ── Border radius (M3 shape scale) ──────────────────────────────────────────
// Extra Small=4, Small=8, Medium=12, Large=16, Full=∞
export const radius = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  pill: 100,
};

// ── Shadows ──────────────────────────────────────────────────────────────────
// shadowColor basado en el primario, no negro genérico
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
