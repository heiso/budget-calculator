import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      transitionProperty: {
        height: 'height, margin-top, margin-bottom, padding-top, padding-bottom',
      },
    },
  },
  plugins: [],
} satisfies Config
