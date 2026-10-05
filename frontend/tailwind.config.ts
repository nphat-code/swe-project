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
          green: '#006241',       // Starbucks House Green
          dark: '#1e3932',        // Deep Forest Green
          hover: '#00754a',       // Accent hover green
          mint: '#d4e9e2',        // Soft mint cream for pills/badges
          cream: '#f2f0eb',       // Warm light neutral
          oat: '#f7f7f7',         // Subtle background
          gold: '#cba258',        // Warm star gold accent
        },
        brand: {
          espresso: '#1e3932',    // Xanh đậm Starbucks cho tiêu đề
          terracotta: '#006241',  // Xanh lá House Green cho nút CTA chính
          cream: '#d4e9e2',       // Mint cream nhẹ
          oat: '#f2f0eb',         // Nền phụ
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
