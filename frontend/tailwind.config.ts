import type { Config } from 'tailwindcss'
import colors from 'tailwindcss/colors'

export default {
  content: [
    `./components/**/*.vue`,
    `./pages/**/*.vue`,
    `./layouts/**/*.vue`,
    `./composables/**/*.ts`,
  ],
  theme: {
    extend: {
      colors: {
        primary: colors.amber,
        success: colors.emerald,
        neutral: colors.slate,
      },
    },
  },
} satisfies Config
