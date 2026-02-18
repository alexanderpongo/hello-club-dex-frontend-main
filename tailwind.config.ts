import type { Config } from 'tailwindcss';
const { fontFamily } = require('tailwindcss/defaultTheme');

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      container: {
        center: true,
        screens: {
          '2xl': '1364px',
        },
        padding: '1rem',
      },
      colors: {
        primary: {
          DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
        },
        dark: {
          DEFAULT: '#0F0F0F',
        },
        red: {
          DEFAULT: '#D32F2F',
        },
        slate: {
          DEFAULT: 'rgba(255, 255, 255, 0.6)',
        },
        silver: {
          DEFAULT: '#CBDEE6',
        },
        plus: {
          DEFAULT: '#00FF00',
        },
        minus: {
          DEFAULT: '#FF5C5C',
        },
        destructive: {
          DEFAULT: '#D32F2F',
        },
        success: {
          DEFAULT: '#00FFAD',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: '18px',
        md: '16px',
        sm: '8px',
        xs: '4px',
      },
      fontFamily: {
        formula: ['var(--font-formula-condensed)', ...fontFamily.sans],
        barlow: ['var(--font-barlow-condensed)', ...fontFamily.sans],
        lato: ['var(--font-lato)', ...fontFamily.sans],
      },
      fontWeight: {
        normal: '400',
        medium: '400',
        semibold: '400',
        bold: '400',
      },
      backgroundColor: {
        glass: 'rgba(255, 255, 255, 0.05)',
      },
      backgroundImage: {
        'gradient-regular':
          'linear-gradient(90deg, #1B0526 -0.11%, #002328 99.99%)',
      },
      keyframes: {
        progress: {
          '0%': {
            transform: 'translateX(0) scaleX(0)',
          },
          '40%': {
            transform: 'translateX(0) scaleX(0.4)',
          },
          '100%': {
            transform: 'translateX(100%) scaleX(0.5)',
          },
        },
        'caret-blink': {
          '0%,70%,100%': {
            opacity: '1',
          },
          '20%,50%': {
            opacity: '0',
          },
        },
      },
      animation: {
        progress: 'progress 1s infinite linear',
        'caret-blink': 'caret-blink 1.25s ease-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
