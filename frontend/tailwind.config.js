/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
        colors: {

            PrimaryColor: "#d8f3dc",
            SecondaryColor: "#95d5b2",
            DarkColor: "#52b788",
            ExtraDarkColor: "#1b4332",
          },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
