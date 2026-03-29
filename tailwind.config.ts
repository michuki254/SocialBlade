import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Airbnb Primary Brand Colors
        rausch: {
          DEFAULT: '#FF5A5F',
          light: '#FF7A7F',
          dark: '#E54A4F',
        },
        babu: {
          DEFAULT: '#00A699',
          light: '#20B6A9',
          dark: '#008679',
        },
        arches: {
          DEFAULT: '#FC642D',
          light: '#FC844D',
          dark: '#DC541D',
        },
        // Neutral Colors
        hof: {
          DEFAULT: '#484848',
          light: '#686868',
          dark: '#282828',
        },
        foggy: {
          DEFAULT: '#767676',
          light: '#969696',
          dark: '#565656',
        },
      },
      fontFamily: {
        sans: ['Rubik', 'sans-serif'],
      },
      fontSize: {
        // Typography Scale
        'headline-1': ['48px', { lineHeight: '1.2', fontWeight: '700' }],
        'headline-2': ['32px', { lineHeight: '1.3', fontWeight: '600' }],
        'headline-3': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'small': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '1.4', fontWeight: '400' }],
        'label': ['12px', { lineHeight: '1.4', fontWeight: '500' }],
      },
      spacing: {
        'xs': '8px',
        's': '16px',
        'm': '24px',
        'l': '32px',
        'xl': '48px',
        '2xl': '64px',
      },
      borderRadius: {
        'subtle': '4px',
        'standard': '8px',
        'medium': '12px',
        'large': '16px',
      },
      boxShadow: {
        'elevation-1': '0 2px 4px rgba(0, 0, 0, 0.08)',
        'elevation-2': '0 4px 12px rgba(0, 0, 0, 0.12)',
        'elevation-3': '0 8px 24px rgba(0, 0, 0, 0.16)',
      },
    },
  },
  plugins: [],
}

export default config
