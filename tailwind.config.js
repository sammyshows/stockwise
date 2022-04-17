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
      colors: {
        cyan: colors.cyan,
        'bright-cyan': '#00FFD1',
        'opaque-cyan': 'rgba(0, 255, 187, 0.10)',
        'bright-green': '#45FF58',
        'bright-red': '#FF4545'
      },

      fontSize: {
        'tiny': '0.6rem'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
}