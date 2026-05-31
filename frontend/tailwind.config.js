/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        astroDark: '#0B0F19',
        astroCard: '#151D30',
        astroAccent: '#4F46E5',
      },
      backgroundImage: {
        'gradient-night': 'linear-gradient(135deg, #0B0F19 0%, #151D30 100%)',
      },
      animation: {
        'space-rotation': 'space-rotation 180s linear infinite',
        'zoom-hero': 'zoom-hero 3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'pulse-island': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'space-rotation': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'zoom-hero': {
          '0%': { 
            transform: 'scale(1.9)',
            filter: 'blur(5px)',
            opacity: '0',
          },
          '100%': { 
            transform: 'scale(1)',
            filter: 'blur(0px)',
            opacity: '1',
          },
        },
      },
    },
  },
  plugins: [],
};
