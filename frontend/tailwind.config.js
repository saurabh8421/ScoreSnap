/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ['"Orbitron"', 'sans-serif'],
      },
      colors: {
        brandBlue: '#2563eb',
        brandGreen: '#10b981',
      },
    },
  },
  plugins: [],
}

