// ─── SmartRecycle AI — Design System ────────────────────────────────────────
// Single source of truth. Edit here to change the entire visual identity.

// ── Colors ──────────────────────────────────────────────────────────────────
export const colors = {
  // Brand greens
  // forest: sin cambio — ancla oscura necesaria para headers con buen contraste
  // canopy/sage: más vibrantes y luminosos que la paleta anterior
  forest:    '#1B4332',   // primario: verde selva (sin cambio)
  canopy:    '#2A7850',   // secundario: más vivo que #2D6A4F (contraste 5:1 en blanco ✓)
  sage:      '#62B88E',   // acento verde: más saturado y fresco que #74A689
  sageFaint: '#E3F4EC',   // fondo de badges: tint más limpio

  // Accent coral — reemplaza el amber terroso (#C17A3A) con coral moderno
  // Tendencia dominante 2024 en apps lifestyle/eco para audiencia joven
  amber:      '#F07058',  // coral vivo  (antes naranja-café #C17A3A)
  amberDark:  '#D35640',  // coral oscuro (antes #A3612A)
  amberLight: '#FDE8E2',  // fondo coral suave (antes #F5E6D3)
  amberFaint: '#FFF2EE',  // fondo coral muy suave (antes #FBF3EB)

  // Neutrals — derivados del verde primario (teal-gray, no brown-gray)
  // Refactoring UI: los grises deben heredar el hue del color primario
  bark:     '#F3F6F4',   // background: tinte verde-gris sutil (antes beige-cálido)
  surface:  '#FFFFFF',
  stone50:  '#F7FAF8',   // antes #FAF8F5
  stone100: '#DCE9E4',   // bordes: notablemente más frío (antes #EDE8E1)
  stone200: '#C6D8D2',   // placeholder border (antes #DDD5CA)
  stone400: '#82A09A',   // texto terciario / iconos inactivos (antes marrón #A09585)
  stone600: '#4C6A63',   // texto secundario (antes marrón #6B5F52)
  ink:      '#111D1A',   // texto principal: verde-negro (antes café-negro #1C1611)

  // Semantic — alineados con la nueva paleta
  successBg:   '#E3F2EB',
  successText: '#1B4332',
  errorBg:     '#FDE8E2',
  errorText:   '#A83222',
  warningBg:   '#FEF0E6',
  warningText: '#9E5010',

  // Utility
  white:       '#FFFFFF',
  transparent: 'transparent',
  overlay:     'rgba(17, 29, 26, 0.45)',   // verde-negro (antes marrón rgba(28,22,17))
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

// ── Border radius ────────────────────────────────────────────────────────────
export const radius = {
  xs:   4,
  sm:   6,
  md:   10,
  lg:   14,
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
