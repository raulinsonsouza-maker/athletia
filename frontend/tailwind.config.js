/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cores da paleta
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
        dark: {
          DEFAULT: '#070600',
          light: '#0F0E0A',
          lighter: '#1A1814',
          card: '#141210',
        },
        light: {
          DEFAULT: '#F7F7FF',
          muted: '#E0E0E8',
          dim: '#C8C8D0',
        },
        grey: {
          DEFAULT: '#63625F',
          light: '#8A8985',
          dark: '#4A4946',
        },
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'sm': '0 2px 4px rgba(0, 0, 0, 0.3)',
        'md': '0 4px 6px rgba(0, 0, 0, 0.4)',
        'lg': '0 10px 15px rgba(0, 0, 0, 0.5)',
        'xl': '0 20px 25px rgba(0, 0, 0, 0.6)',
        'glow': '0 0 20px rgba(249, 166, 32, 0.3)',
        'glow-lg': '0 0 30px rgba(249, 166, 32, 0.4)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #F9A620 0%, #E8940D 100%)',
        'gradient-dark': 'linear-gradient(135deg, #070600 0%, #0F0E0A 100%)',
      },
    },
  },
  plugins: [],
}
