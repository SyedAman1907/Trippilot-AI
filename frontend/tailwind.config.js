/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#050505',
          dark: '#020202',
          light: '#090611',
        },
        secondary: {
          DEFAULT: '#090611',
          dark: '#050505',
          light: '#12091F',
        },
        accent: {
          violet: '#7C3AED',
          purple: '#A855F7',
          crimson: '#DC2626',
          red: '#EF4444',
          gold: '#F5C542',
          yellow: '#FACC15',
          champagne: '#FFF1A8',
          teal: '#14B8A6',
          sky: '#38BDF8',
          warm: '#F59E0B',
          coral: '#F43F5E',
        },
        luxury: {
          light: {
            bg: '#FAFAF9',
            secondary: '#F5F3FF',
            surface: '#FFFFFF',
            primary: '#7C3AED',
            accent: '#DC2626',
            gold: '#D97706',
            text: '#111111',
            muted: '#71717A'
          },
          dark: {
            bg: '#050505',
            secondary: '#090611',
            surface: '#12091F',
            elevated: '#180A24',
            primary: '#7C3AED',
            crimson: '#DC2626',
            gold: '#F5C542',
            yellow: '#FACC15',
            ai: '#A855F7',
            text: '#FFFFFF',
            muted: '#A1A1AA'
          }
        },
        brand: {
          navy: {
            950: '#050505',
            900: '#090611',
            850: '#0E081A',
            800: '#12091F',
            700: '#180A24',
            600: '#261238',
          },
          dark: {
            base: '#050505',
            surface: '#090611',
            card: '#12091F',
            elevated: '#180A24',
          },
          violet: {
            300: '#C084FC',
            400: '#A855F7',
            500: '#8B5CF6',
            600: '#7C3AED',
            700: '#6D28D9',
            800: '#5B21B6',
            900: '#3B0764',
          },
          red: {
            400: '#F87171',
            500: '#EF4444',
            600: '#DC2626',
            700: '#B91C1C',
            800: '#991B1B',
          },
          crimson: {
            400: '#FB7185',
            500: '#F43F5E',
            600: '#E11D48',
            700: '#BE123C',
          },
          gold: {
            200: '#FEF08A',
            300: '#FFF1A8',
            400: '#FDE68A',
            500: '#F5C542',
            600: '#EAB308',
            700: '#D97706',
            800: '#B45309',
          },
          yellow: {
            400: '#FACC15',
            500: '#EAB308',
          },
          teal: {
            300: '#5EEAD4',
            400: '#2DD4BF',
            500: '#14B8A6',
            600: '#0D9488',
          },
          sky: {
            300: '#7DD3FC',
            400: '#38BDF8',
            500: '#0EA5E9',
            600: '#0284C7',
          },
        },
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        display: ['Sora', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient': 'gradient 8s ease infinite',
        'glow': 'glow 3s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2.5s infinite',
        'blob': 'blob 18s cubic-bezier(0.4, 0, 0.2, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        glow: {
          '0%': { boxShadow: '0 0 15px rgba(124, 58, 237, 0.2)' },
          '100%': { boxShadow: '0 0 35px rgba(245, 197, 66, 0.35)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(40px, -50px) scale(1.12)' },
          '66%': { transform: 'translate(-30px, 30px) scale(0.92)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        }
      }
    },
  },

  plugins: [],
};
