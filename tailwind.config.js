/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dashboard-blue': '#1e3a8a', // Deep Blue
        'dashboard-green': '#10b981', // Emerald Green
        'dashboard-red': '#ef4444', // Soft Red
      },
      screens: {
        'xs': '400px',
      },
    },
  },
  plugins: [],
}
