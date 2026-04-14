/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Manrope"', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#effbff',
          100: '#d8f4ff',
          200: '#b8e9ff',
          300: '#86dbff',
          400: '#4dc8ff',
          500: '#18b1ff',
          600: '#0090e6',
          700: '#0071b4',
          800: '#075f93',
          900: '#0c5078',
        },
      },
      boxShadow: {
        glow: '0 18px 45px -18px rgba(0, 176, 255, 0.45)',
        soft: '0 18px 60px -24px rgba(15, 23, 42, 0.18)',
      },
      backgroundImage: {
        'hero-radial':
          'radial-gradient(circle at top left, rgba(56, 189, 248, 0.18), transparent 40%), radial-gradient(circle at top right, rgba(14, 165, 233, 0.15), transparent 30%), linear-gradient(180deg, #ffffff 0%, #f3fbff 65%, #ffffff 100%)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        float: 'float 5s ease-in-out infinite',
        'fade-up': 'fadeUp 0.7s ease forwards',
        shimmer: 'shimmer 1.5s infinite',
      },
    },
  },
  plugins: [],
};
