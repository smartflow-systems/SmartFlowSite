/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './client/index.html',
    './client/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(0, 0%, 0%)',
        foreground: 'hsl(0, 0%, 100%)',
        muted: 'hsl(25, 8%, 15%)',
        card: 'hsl(25, 8%, 10%)',
        border: 'hsl(25, 8%, 14%)',
        input: 'hsl(25, 8%, 14%)',

        // Brand colors
        primary: 'hsl(43, 70%, 52%)',  // Gold
        secondary: 'hsl(25, 40%, 12%)', // Dark brown
        accent: 'hsl(43, 70%, 52%)',   // Accent gold

        // Custom palette
        primaryBlack: 'hsl(0, 0%, 0%)',
        secondaryBrown: 'hsl(25, 40%, 12%)',
        richBrown: 'hsl(25, 30%, 25%)',
        darkBrown: 'hsl(25, 20%, 8%)',
        accentGold: 'hsl(43, 70%, 52%)',
        goldTrim: 'hsl(51, 100%, 65%)',
        neutralGray: 'hsl(0, 0%, 50%)',
        darkBg: 'hsl(25, 20%, 4%)',
        cardBg: 'hsl(25, 25%, 10%)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        gold: '0 0 20px rgba(255, 215, 0, 0.3)',
        'gold-hover': '0 0 30px rgba(255, 215, 0, 0.5)',
        'premium-glow': '0 0 20px rgba(255, 215, 0, 0.4), 0 0 40px rgba(255, 215, 0, 0.2)',
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};
