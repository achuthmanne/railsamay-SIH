export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        railblue: '#1E3A8A',
        railgreen: '#10B981',
        railorange: '#F59E0B',
        railred: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        hindi: ['Mukta', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
