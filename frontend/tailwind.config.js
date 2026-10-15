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
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#1b1231', // Dark purple card background
          900: '#130c24', // Dark purple section background
          950: '#0c0717', // Main deep dark purple background
        },
        novel: {
          dark: '#0a0614',
          card: '#130d24',
          surface: '#1b1333',
          border: '#2e1e54',
          accent: '#9333ea',
          light: '#a855f7',
        },
        secondary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#282142', // Dark purple-tinted gray
          800: '#1b1431', // Dark purple-tinted gray
          900: '#120c24', // Dark purple-tinted gray
          950: '#0c0717', // Main deep dark purple background
        }
      },
      backgroundColor: {
        'primary-dark': '#0c0717',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}