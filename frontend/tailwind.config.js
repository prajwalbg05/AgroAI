/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef8ff',
          100: '#d7eeff',
          200: '#b0dbff',
          300: '#84c1ff',
          400: '#59a6ff',
          500: '#2b86ff',
          600: '#2069db',
          700: '#194faf',
          800: '#153f8a',
          900: '#11336f',
        },
        accent: {
          100: '#fff7e8',
          200: '#ffe5b8',
          300: '#ffd184',
          400: '#ffb94d',
          500: '#ff9f0a',
        },
        leaf: {
          100: '#ecfdf5',
          300: '#a7f3d0',
          500: '#10b981',
        }
      },
      boxShadow: {
        card: '0 10px 25px -10px rgba(0,0,0,0.2)'
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2.5rem', // 40px
      }
    },
  },
  plugins: [],
}
