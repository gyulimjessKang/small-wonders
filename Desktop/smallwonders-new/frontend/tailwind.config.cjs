module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7c3aed', // purple-600
          light: '#a78bfa'
        }
      },
      gradientColorStops: theme => theme('colors')
    }
  },
  plugins: []
}; 