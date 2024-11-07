/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          light: 'hsl(var(--primary-light))',
        },
        secondary: 'hsl(var(--secondary))',
        accent: 'hsl(var(--accent))',
      },
      boxShadow: {
        'highlight': '0 0 0 2px hsl(var(--primary))',
      },
    },
  },
  plugins: [],
};