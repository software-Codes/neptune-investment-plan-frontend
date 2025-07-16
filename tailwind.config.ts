/* eslint-disable @typescript-eslint/no-require-imports */
/* tailwind.config.ts */
import { themes } from '@/lib/theme';
import type { Config } from 'tailwindcss'
import plugin, { PluginAPI } from 'tailwindcss/plugin'
// ---------------------------------------------------------------------------
//  Utilities – convert the theme object          { background: "0 0% 100%", … }
//  into CSS-variable declarations and HSL helpers used below.
// ---------------------------------------------------------------------------
const toCssVars = (palette: Record<string, string>) =>
  Object.entries(palette).reduce(
    (acc, [k, v]) => ({ ...acc, [`--${k}`]: v }),
    {} as Record<string, string>
  );

const cssVarsLight = toCssVars(themes.light);
const cssVarsDark  = toCssVars(themes.dark);

export default <Partial<Config>>{
  darkMode: ['class', '[data-theme="dark"]'],

  content: [
    './app/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],

  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },

    extend: {
      // ---------------------------------------------------------------------
      //  1 · Color system (all shadcn tokens map to CSS variables)
      // ---------------------------------------------------------------------
      colors: {
        border:        'hsl(var(--border))',
        input:         'hsl(var(--input))',
        ring:          'hsl(var(--ring))',
        background:    'hsl(var(--background))',
        foreground:    'hsl(var(--foreground))',

        primary:   { DEFAULT: 'hsl(var(--primary))',   foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted:     { DEFAULT: 'hsl(var(--muted))',     foreground: 'hsl(var(--muted-foreground))' },
        accent:    { DEFAULT: 'hsl(var(--accent))',    foreground: 'hsl(var(--accent-foreground))' },
        popover:   { DEFAULT: 'hsl(var(--popover))',   foreground: 'hsl(var(--popover-foreground))' },
        card:      { DEFAULT: 'hsl(var(--card))',      foreground: 'hsl(var(--card-foreground))' },

        // brand palette (unchanged)
        brand: {
          green: {
            50:  '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac',
            400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d',
            800: '#166534', 900: '#14532d',
          },
          yellow: {
            50:  '#fefce8', 100: '#fef9c3', 200: '#fef08a', 300: '#fde047',
            400: '#facc15', 500: '#eab308', 600: '#ca8a04', 700: '#a16207',
            800: '#854d0e', 900: '#713f12',
          },
        },
      },

      // ---------------------------------------------------------------------
      //  2 · Radius helpers (align with shadcn design system)
      // ---------------------------------------------------------------------
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },

      // ---------------------------------------------------------------------
      //  3 · Animations (kept from your original file)
      // ---------------------------------------------------------------------
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        'slide-down': {
          from: { opacity: '0', transform: 'translateY(-10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          from: { opacity: '1', transform: 'translateY(0)' },
          to:   { opacity: '0', transform: 'translateY(-10px)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        'slide-down':     'slide-down 0.15s ease-out',
        'slide-up':       'slide-up 0.15s ease-out',
      },
    },
  },


  // -------------------------------------------------------------------------
  //  4 · Inject the CSS variables once – keeps the config self-contained
  // -------------------------------------------------------------------------
  corePlugins: { preflight: false }, // we’ll add our own below
  plugins: [
    require('tailwindcss-animate'),
    plugin(function ({ addBase }: PluginAPI) {
      addBase({
        ':root': cssVarsLight,
        '[data-theme="dark"]': cssVarsDark,
      });
    }),
  ],
};
