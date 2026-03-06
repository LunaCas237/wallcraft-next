import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'brand-gold': '#B08038',
        'deep-black': '#080808',
      },
      fontFamily: {
        // ตั้งค่าให้ใช้ Helvetica Neue และ LINE Seed Sans เป็นฟอนต์หลัก
        // ลบ Prompt และ Noto ออกตามคำขอ
        sans: ['"Helvetica Neue"', '"LINE Seed Sans"', 'Helvetica', 'Arial', 'sans-serif'],
      },
      animation: {
        reveal: 'reveal 1.2s cubic-bezier(0.77, 0, 0.175, 1) forwards',
      },
      keyframes: {
        reveal: {
          '0%': { transform: 'translateY(40px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
};

export default config;