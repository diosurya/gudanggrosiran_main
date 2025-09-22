<script setup lang="ts">
import { ref, onMounted } from "vue"

const { $baseAPi } = useNuxtApp()

const page = ref<any>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await $baseAPi.get("/v1/pages/slug/kebijakan-privasi")
    page.value = res.data.data
  } catch (err) {
    console.error("Gagal fetch page:", err)
  } finally {
    loading.value = false
  }
})

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
  link: page.value?.canonical_url
    ? [{ rel: "canonical", href: page.value.canonical_url }]
    : [],
})
</script>

<template>
  <div class="container mb-5">
    <!-- Skeleton Loading -->
    <div v-if="loading" class="about-skeleton">
      <div class="skeleton-title mb-4"></div>
      <div class="skeleton-line mb-2" v-for="i in 8" :key="i"></div>
      <div class="skeleton-line w-75 mb-2"></div>
      <div class="skeleton-line w-50"></div>
    </div>

    <!-- Page Content -->
    <div v-else v-html="page?.content"></div>
  </div>
</template>

<style scoped>
.about-skeleton {
  max-width: 800px;
  margin: 0 auto;
}

.skeleton-title {
  height: 28px;
  width: 60%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 6px;
}

.skeleton-line {
  height: 14px;
  width: 100%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}

.skeleton-line.w-75 {
  width: 75%;
}
.skeleton-line.w-50 {
  width: 50%;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
