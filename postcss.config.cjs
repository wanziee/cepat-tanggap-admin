module.exports = {
    plugins: [
      require('postcss-import'),
      require('postcss-nesting'),
      require('@tailwindcss/postcss'), // ✅ bukan 'tailwindcss' lagi!
      require('autoprefixer'),
    ],
  }
  