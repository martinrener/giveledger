export default defineNuxtConfig({
  modules: [
    `@pinia/nuxt`,
  ],

  plugins: [
    `~/plugins/i18n.ts`,
  ],

  imports: {
    presets: [
      {
        from: `class-variance-authority`,
        imports: [`cva`],
      },
      {
        from: `vue-i18n`,
        imports: [`useI18n`],
      },
    ],
  },

  typescript: {
    strict: true,
    typeCheck: true,
  },
})
