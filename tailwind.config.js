/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
       
        'zoolife-verde': 'rgba(30, 165, 30,0.9)', // Un color azul personalizado
        'zoolife-verde-oscuro': 'rgba(25, 131, 25  ,0.9)', // Un color naranja personalizado
      },
    },
  },
  plugins: [],
}

