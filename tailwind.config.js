const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}"
  ],
  theme: {
    extend: {
      width: {
        '1/10': '10%',
      },

      spacing: {
        '0.75': '0.1875rem'
      },

      colors: {
        cyan: colors.cyan,
        'bright-cyan': '#00FFD1',
        'bright-yellow': '#FFFF00',
        'opaque-cyan': 'rgba(0, 255, 187, 0.10)',
        'bright-green': '#45FF58',
        'bright-red': '#FF4545'
      },

      fontSize: {
        'tiny': '0.6rem',
        'teeny': '0.5rem',
        'atomic': '0.4rem'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
}