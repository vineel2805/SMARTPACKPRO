import type { Config } from 'tailwindcss';

// Light theme colors
const lightColors = {
  background: '#ffffff',
  foreground: '#1a1a1a',
  card: '#f8f9fa',
  'card-foreground': '#1a1a1a',
  popover: '#ffffff',
  'popover-foreground': '#1a1a1a',
  primary: '#3b82f6',
  'primary-foreground': '#ffffff',
  secondary: '#f0f4f8',
  'secondary-foreground': '#1a1a1a',
  muted: '#e5e7eb',
  'muted-foreground': '#6b7280',
  accent: '#f3f4f6',
  'accent-foreground': '#1a1a1a',
  destructive: '#dc2626',
  'destructive-foreground': '#ffffff',
  border: '#e5e7eb',
  input: '#ffffff',
  ring: '#3b82f6',
};

// Dark theme colors
const darkColors = {
  background: '#0f1419',
  foreground: '#f5f7fa',
  card: '#1a1f2e',
  'card-foreground': '#f5f7fa',
  popover: '#1a1f2e',
  'popover-foreground': '#f5f7fa',
  primary: '#60a5fa',
  'primary-foreground': '#0f1419',
  secondary: '#252d3d',
  'secondary-foreground': '#f5f7fa',
  muted: '#3a4555',
  'muted-foreground': '#8b95a7',
  accent: '#3a4555',
  'accent-foreground': '#f5f7fa',
  destructive: '#dc2626',
  'destructive-foreground': '#fecaca',
  border: '#3a4555',
  input: '#252d3d',
  ring: '#60a5fa',
};

const config: Config = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: lightColors.background,
        foreground: lightColors.foreground,
        card: lightColors.card,
        'card-foreground': lightColors['card-foreground'],
        popover: lightColors.popover,
        'popover-foreground': lightColors['popover-foreground'],
        primary: lightColors.primary,
        'primary-foreground': lightColors['primary-foreground'],
        secondary: lightColors.secondary,
        'secondary-foreground': lightColors['secondary-foreground'],
        muted: lightColors.muted,
        'muted-foreground': lightColors['muted-foreground'],
        accent: lightColors.accent,
        'accent-foreground': lightColors['accent-foreground'],
        destructive: lightColors.destructive,
        'destructive-foreground': lightColors['destructive-foreground'],
        border: lightColors.border,
        input: lightColors.input,
        ring: lightColors.ring,
      },
    },
  },
  plugins: [
    function ({ addBase, theme }: any) {
      addBase({
        ':root': Object.entries(lightColors).reduce(
          (acc, [key, value]) => ({
            ...acc,
            [`--${key}`]: value,
          }),
          {}
        ),
        '.dark': Object.entries(darkColors).reduce(
          (acc, [key, value]) => ({
            ...acc,
            [`--${key}`]: value,
          }),
          {}
        ),
      });
    },
  ],
};

export default config;
