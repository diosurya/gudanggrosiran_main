// https://nuxt.com/docs/api/configuration/nuxt-config
// export default defineNuxtConfig({
//   compatibilityDate: '2025-07-15',
//   devtools: { enabled: true }
// })
// nuxt.config.ts
export default defineNuxtConfig({
  css: [
    "bootstrap/dist/css/bootstrap.css",
    "bootstrap-vue-next/dist/bootstrap-vue-next.css"
  ],
  modules: [
    "@bootstrap-vue-next/nuxt",
    "@nuxtjs/seo"
  ],
  app: {
    head: {
      title: "Gudang Grosiran - E-commerce",
      meta: [
        { name: "description", content: "Belanja grosir murah dan terpercaya" },
        { name: "keywords", content: "grosir, ecommerce, belanja murah" }
      ],
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }]
    }
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE || "http://localhost:8000/api"
    }
  }
})

