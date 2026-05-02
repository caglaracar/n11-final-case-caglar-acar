import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

export default {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: '1rem', screens: { '2xl': '1400px' } },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        // Brand palette derived from #BB2522
        brand: {
          50: '#FBEAEA',
          100: '#F5D0CF',
          200: '#EDA29F',
          300: '#E26C68',
          400: '#D74440',
          500: '#C72E2B',
          600: '#BB2522',
          700: '#9C1E1B',
          800: '#7B1816',
          900: '#631512',
          950: '#380A09',
          DEFAULT: '#BB2522',
        },
        // Ink palette derived from #362A37
        ink: {
          50: '#F4F2F4',
          100: '#E5E1E6',
          200: '#C9C1CB',
          300: '#A698A9',
          400: '#7E6E83',
          500: '#5C4D5F',
          600: '#463B49',
          700: '#362A37',
          800: '#2A222C',
          900: '#1F1820',
          DEFAULT: '#362A37',
        },
      },
      borderRadius: { lg: 'var(--radius)', md: 'calc(var(--radius) - 2px)', sm: 'calc(var(--radius) - 4px)' },
    },
  },
  plugins: [animate],
} satisfies Config;
