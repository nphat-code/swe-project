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
        brand: {
          espresso: '#3D2314', // Nâu cà phê đậm cho header/text nhấn
          terracotta: '#C85A32', // Cam đất cho nút CTA chính
          cream: '#F4EDE4',    // Nền card/badge nhẹ
          oat: '#F9F6F0',      // Nền phụ
        },
        surface: '#FCFCFD',
        content: {
          primary: '#1F2937',
          muted: '#6B7280',
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
