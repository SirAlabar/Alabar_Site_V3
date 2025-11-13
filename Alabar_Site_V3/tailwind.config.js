/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'rpg': {
          'darker': '#0a0a0f',
          'dark': '#1a1a2e',
          'accent': '#ffcc33',
          'accent-hover': '#ffdd55',
          'text': '#e0e0e0'
        }
      },
      fontFamily: {
        'pixel': ['"Press Start 2P"', 'cursive'],
        'game': ['"VT323"', 'monospace']
      },
      animation: {
        'pixel-blink': 'blink 1s step-end infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out'
      },
      keyframes: {
        blink: {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideIn: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      }
    },
  },
  plugins: [],
}
