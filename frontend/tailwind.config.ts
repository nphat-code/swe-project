import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        starbucks: {
          green: '#006241',
          dark: '#1e3932',
          hover: '#00754a',
          mint: '#d4e9e2',
          cream: '#f2f0eb',
          oat: '#f7f7f7',
          gold: '#cba258',
        },
        brand: {
          espresso: '#1e3932',
          terracotta: '#006241',
          cream: '#d4e9e2',
          oat: '#f2f0eb',
        },
        surface: '#ffffff',
        content: {
          primary: '#212121',
          muted: '#595959',
        },
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        pill: '9999px',
      },
    },
  },
  plugins: [],
};

export default config;
