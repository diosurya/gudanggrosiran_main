<script setup lang="ts">
const config = useRuntimeConfig()

// ambil data dari API
const { data: page } = await useFetch("/pages/slug/about", {
  baseURL: config.public.apiBase
})

// pasang meta SEO dari API
useHead({
  title: page.value?.meta_title || page.value?.title,
  meta: [
    { name: "description", content: page.value?.meta_description },
    { name: "keywords", content: page.value?.meta_keywords },
    { property: "og:title", content: page.value?.og_title },
    { property: "og:description", content: page.value?.og_description },
    { property: "og:type", content: page.value?.og_type },
    { property: "og:image", content: page.value?.og_image },
    { property: "twitter:title", content: page.value?.twitter_title },
    { property: "twitter:description", content: page.value?.twitter_description },
    { property: "twitter:image", content: page.value?.twitter_image },
    { property: "twitter:card", content: page.value?.twitter_card },
  ],
  link: [
    page.value?.canonical_url ? { rel: "canonical", href: page.value.canonical_url } : {}
  ]
})
</script>

<template>
  <div class="container mb-5">
    <div v-html="page?.content"></div>
  </div>
</template>
