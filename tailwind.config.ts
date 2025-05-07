module.exports = {
    content: [
      './src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
      extend: {
        colors: {
          emerald: {
            50: '#ecfdf5',
            // ...other shades if needed
          },
        },
        boxShadow: {
          'custom': '0 8px 30px rgba(0, 0, 0, 0.12)',
        },
      },
    },
    plugins: [],
  }