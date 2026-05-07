/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { main: '#0288D1', light: '#03A9F4', dark: '#01579B', contrastText: '#FFFFFF' },
        secondary: { main: '#2E7D32', light: '#66BB6A', dark: '#1B5E20', contrastText: '#FFFFFF' },
        success: { main: '#4CAF50', light: '#81C784', dark: '#388E3C' },
        error: { main: '#F44336', light: '#EF5350', dark: '#D32F2F' },
        warning: { main: '#FF9800', light: '#FFB74D', dark: '#F57C00' },
        info: { main: '#2196F3', light: '#64B5F6', dark: '#1976D2' },
        background: { default: '#FAFAFA', paper: '#FFFFFF' },
      },
      fontFamily: {
        sans: ['GrozenMedical', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
