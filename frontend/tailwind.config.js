/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./index.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./contexts/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          800: '#0E182A',
          900: '#001226',
          950: '#040914',
        },
        royal: {
          500: '#0055B3',
          600: '#004B99',
          700: '#002D62',
          900: '#001938',
        },
        gold: {
          300: '#FCE89B',
          400: '#fbbf24',
          500: '#D4AF37',
          600: '#AA871D',
        },
        crimson: {
          600: '#9E1B1B',
          700: '#7F1515',
        }
      },
      fontFamily: {
        display: ['Oswald', 'Noto Sans Arabic', 'Tajawal', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
