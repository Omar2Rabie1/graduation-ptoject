function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${variableName}), ${opacityValue})`;
    }
    return `rgb(var(${variableName}))`;
  };
}

module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Cairo', 'Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          bg: withOpacity('--bg-page-rgb'),
          surface: withOpacity('--bg-surface-rgb'),
          'surface-light': withOpacity('--bg-sidebar-active-rgb'),
          border: withOpacity('--border-default-rgb'),
          primary: withOpacity('--color-primary-rgb'),
          'primary-hover': withOpacity('--color-primary-hover-rgb'),
          text: withOpacity('--text-secondary-rgb'),
          'text-primary': withOpacity('--text-primary-rgb'),
          muted: withOpacity('--text-muted-rgb'),
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulseSlow 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(15px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.7' },
        }
      }
    },
  },
  plugins: [],
};