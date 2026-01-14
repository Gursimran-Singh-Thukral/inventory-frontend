/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // <--- ADD THIS LINE
  theme: {
    extend: {
      colors: {
        primary: "#2563eb",
        secondary: "#1e293b", 
        accent: "#f59e0b",
        background: "#f1f5f9",
        darkbg: "#0f172a", // Deep blue-black for dark mode
        darkcard: "#1e293b" // Lighter blue-black for cards
      }
    },
  },
  plugins: [],
}