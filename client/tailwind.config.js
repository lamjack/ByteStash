/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'light-bg': 'rgb(var(--color-light-bg) / <alpha-value>)',
        'light-surface': 'rgb(var(--color-light-surface) / <alpha-value>)',
        'light-border': 'rgb(var(--color-light-border) / <alpha-value>)',
        'light-text': 'rgb(var(--color-light-text) / <alpha-value>)',
        'light-text-secondary': 'rgb(var(--color-light-text-secondary) / <alpha-value>)',
        'light-primary': 'rgb(var(--color-light-primary) / <alpha-value>)',
        'light-hover': 'rgb(var(--color-light-hover) / <alpha-value>)',
        'light-hover-more': 'rgb(var(--color-light-hover-more) / <alpha-value>)',

        'dark-bg': 'rgb(var(--color-dark-bg) / <alpha-value>)',
        'dark-surface': 'rgb(var(--color-dark-surface) / <alpha-value>)',
        'dark-border': 'rgb(var(--color-dark-border) / <alpha-value>)',
        'dark-text': 'rgb(var(--color-dark-text) / <alpha-value>)',
        'dark-text-secondary': 'rgb(var(--color-dark-text-secondary) / <alpha-value>)',
        'dark-primary': 'rgb(var(--color-dark-primary) / <alpha-value>)',
        'dark-hover': 'rgb(var(--color-dark-hover) / <alpha-value>)',
        'dark-hover-more': 'rgb(var(--color-dark-hover-more) / <alpha-value>)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
