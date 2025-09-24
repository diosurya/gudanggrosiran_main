export default defineNuxtConfig({
  css: [
    "bootstrap/dist/css/bootstrap.css",
    "bootstrap-vue-next/dist/bootstrap-vue-next.css",
    "bootstrap-icons/font/bootstrap-icons.css",
    "@/assets/css/custom.css"
  ],

  site: {
    url: 'https://gudanggrosiran.com/'
  },

  nitro: {
    preset: "node-server",
    prerender: {
      failOnError: false,
      crawlLinks: false,
      routes: []
    }
  },

  modules: [
    "@bootstrap-vue-next/nuxt",
    "@nuxtjs/sitemap",
    "@nuxtjs/robots"
  ],

  app: {
    head: {
      title: "Gudang Grosiran - Belanja Grosir, Kualitas Premium",
      meta: [
        { name: "description", content: "Belanja Grosir, Kualitas Premium" },
        { name: "keywords", content: "grosir, ecommerce, belanja murah, kualitas premium, belanja partai" }
      ],
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        { 
          rel: "stylesheet", 
          href: "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" 
        }
      ]
    }
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE || "http://localhost:8000/api"
    }
  },

  compatibilityDate: "2025-08-25",
  devtools: { enabled: true }
})