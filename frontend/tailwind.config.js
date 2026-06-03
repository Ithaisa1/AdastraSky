/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        astroDark: '#0B0F19',
        astroCard: '#151D30',
        astroAccent: '#4F46E5',
        nebulaPink: '#EC4899',
        solarFlare: '#F59E0B',
        auroraGreen: '#10B981',
        starWhite: '#F8FAFC',
        cosmicPurple: '#7C3AED',
        deepSpace: '#070A14',
      },
      backgroundImage: {
        'gradient-night': 'linear-gradient(135deg, #0B0F19 0%, #151D30 100%)',
        'gradient-dashboard': 'linear-gradient(180deg, #070A14 0%, #0B0F19 40%, #151D30 100%)',
        'gradient-card': 'linear-gradient(145deg, rgba(21,29,48,0.8) 0%, rgba(11,15,25,0.9) 100%)',
        'gradient-globe': 'radial-gradient(ellipse at center, rgba(79,70,229,0.15) 0%, transparent 70%)',
      },
      animation: {
        'space-rotation': 'space-rotation 180s linear infinite',
        'zoom-hero': 'zoom-hero 3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'pulse-island': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'star-twinkle': 'star-twinkle 2s ease-in-out infinite',
        'gauge-fill': 'gauge-fill 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'ken-burns': 'ken-burns 25s ease-in-out infinite alternate',
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
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(79,70,229,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(79,70,229,0.6)' },
        },
        'star-twinkle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        'gauge-fill': {
          '0%': { strokeDashoffset: '283' },
          '100%': { strokeDashoffset: 'var(--gauge-offset)' },
        },
        'ken-burns': {
          '0%': {
            transform: 'scale(1) translateX(0)',
          },
          '50%': {
            transform: 'scale(1.15) translateX(-2%)',
          },
          '100%': {
            transform: 'scale(1.08) translateX(1%)',
          },
        },
      },
    },
  },
  plugins: [],
};
