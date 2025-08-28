/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-poppins)", "sans-serif"], // default pakai poppins
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      animation: {
        'bounce-slower': 'bounce 3s infinite',
        'spin-slow': 'spin 20s linear infinite',
        'wave': 'wave 4s ease-in-out infinite',
        'scale-pulse': 'scale 2s ease-in-out infinite',
        'fade-in-out': 'fadeInOut 3s ease-in-out infinite',
      },
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        scale: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
        },
        fadeInOut: {
          '0%, 100%': { opacity: 0.3 },
          '50%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
