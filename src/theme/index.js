// ─── SmartRecycle AI — Design System ────────────────────────────────────────
// Single source of truth. Edit here to change the entire visual identity.

// ── Colors ──────────────────────────────────────────────────────────────────
export const colors = {
  // Brand greens — selva costarricense, no menta tech
  forest:    '#1B4332',   // primario: verde selva oscuro
  canopy:    '#2D6A4F',   // secundario: dosel
  sage:      '#74A689',   // acento verde desaturado
  sageFaint: '#EBF2EE',   // fondo de badges verdes

  // Action amber — cálido, terroso, diferencia acción de navegación
  amber:      '#C17A3A',
  amberDark:  '#A3612A',
  amberLight: '#F5E6D3',
  amberFaint: '#FBF3EB',

  // Warm neutrals — papel sin blanquear, no gris frío
  bark:     '#F7F4EF',   // background de toda la app
  surface:  '#FFFFFF',   // cards (blanco solo aquí)
  stone50:  '#FAF8F5',
  stone100: '#EDE8E1',   // bordes, separadores
  stone200: '#DDD5CA',   // disabled, placeholder border
  stone400: '#A09585',   // texto terciario, iconos inactivos
  stone600: '#6B5F52',   // texto secundario
  ink:      '#1C1611',   // texto principal — negro cálido

  // Semantic — derivados de la paleta, sin Material Design genérico
  successBg:   '#E6F0EB',
  successText: '#1B4332',
  errorBg:     '#F5E8E6',
  errorText:   '#9B3A2A',
  warningBg:   '#F5E6D3',
  warningText: '#A0611A',

  // Utility
  white:       '#FFFFFF',
  transparent: 'transparent',
  overlay:     'rgba(28, 22, 17, 0.45)',
  overlayDark: 'rgba(28, 22, 17, 0.70)',
};

// ── Typography ───────────────────────────────────────────────────────────────
export const font = {
  display:   'DMSerifDisplay_400Regular',   // títulos con carácter
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

// ── Border radius ────────────────────────────────────────────────────────────
export const radius = {
  xs:   4,
  sm:   6,
  md:   10,
  lg:   14,
  pill: 100,
};

// ── Shadows ──────────────────────────────────────────────────────────────────
// shadowColor usa el primario, no negro genérico
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