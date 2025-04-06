/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      transitionDuration: {
        '1500': '1500ms',
        '1800': '1800ms',
      },
      transitionDelay: {
        '300': '300ms',
        '600': '600ms',
        '1200': '1200ms',
      },
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
