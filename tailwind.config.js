/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#f2460d",
        "secondary": "#fcd34d",
        "background-light": "#f8fafc",
      },
      fontFamily: {
        "display": ["var(--font-lexend)", "sans-serif"],
        "body": ["var(--font-noto-sans)", "sans-serif"]
      }
    },
  },
  plugins: [],
}
