/**
 * 🎨 DESIGN SYSTEM - AthletIA
 * 
 * Paleta de Cores:
 * - Orange: #F9A620 (Cor primária/accent)
 * - Pitch Black: #070600 (Background escuro)
 * - Ghost White: #F7F7FF (Texto claro/background claro)
 * - Dim Grey: #63625F (Texto secundário/borders)
 */

export const colors = {
  // Cores principais
  primary: {
    DEFAULT: '#F9A620',
    50: '#FEF5E6',
    100: '#FDE8C4',
    200: '#FBD08A',
    300: '#F9A620',
    400: '#E8940D',
    500: '#C77A0A',
    600: '#A66008',
    700: '#854606',
    800: '#632C04',
    900: '#421202',
  },
  
  // Backgrounds
  dark: {
    DEFAULT: '#070600',
    light: '#0F0E0A',
    lighter: '#1A1814',
    card: '#141210',
  },
  
  // Textos
  light: {
    DEFAULT: '#F7F7FF',
    muted: '#E0E0E8',
    dim: '#C8C8D0',
  },
  
  // Neutros
  grey: {
    DEFAULT: '#63625F',
    light: '#8A8985',
    dark: '#4A4946',
  },
  
  // Estados
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
} as const

export const theme = {
  colors,
  
  // Tipografia
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      display: ['Poppins', 'system-ui', 'sans-serif'],
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  
  // Espaçamento
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
    '2xl': '4rem',
  },
  
  // Bordas
  borderRadius: {
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    full: '9999px',
  },
  
  // Sombras
  shadows: {
    sm: '0 2px 4px rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.5)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.6)',
    glow: '0 0 20px rgba(249, 166, 32, 0.3)',
  },
  
  // Transições
  transitions: {
    fast: '150ms ease-in-out',
    normal: '300ms ease-in-out',
    slow: '500ms ease-in-out',
  },
} as const

export default theme

