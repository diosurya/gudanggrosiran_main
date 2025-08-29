<script setup lang="ts">
const { data: blogs } = await useFetch("/blogs", {
  baseURL: useRuntimeConfig().public.apiBase
})

useHead({
  title: "Hubungi Kami - Gudang Grosiran",
  meta: [
    { name: "description", content: "Hubungi Kami Gudang Grosiran, e-commerce grosir terpercaya untuk belanja murah." },
    { name: "keywords", content: "tentang gudang grosiran, ecommerce grosir" },
    { property: "og:title", content: "Tentang Gudang Grosiran" },
    { property: "og:description", content: "Hubungi Kami Gudang Grosiran, e-commerce grosir terpercaya untuk belanja murah." },
  ]
})
</script>

<template>
  <div class="container mb-5">
    <h1>Hubungi Kami</h1>
  </div>
</template>
