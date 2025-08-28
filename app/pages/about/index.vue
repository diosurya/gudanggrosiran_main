<script setup lang="ts">
const { data: blogs } = await useFetch("/blogs", {
  baseURL: useRuntimeConfig().public.apiBase
})

useHead({
  title: "Tentang Kami - Gudang Grosiran",
  meta: [
    { name: "description", content: "Kenali Gudang Grosiran, e-commerce grosir terpercaya untuk belanja murah." },
    { name: "keywords", content: "tentang gudang grosiran, ecommerce grosir" },
    { property: "og:title", content: "Tentang Gudang Grosiran" },
    { property: "og:description", content: "Kenali Gudang Grosiran, e-commerce grosir terpercaya untuk belanja murah." },
  ]
})
</script>

<template>
  <div class="container my-5">
    <h1>About</h1>
    <ul>
      <li v-for="blog in blogs" :key="blog.id">
        <NuxtLink :to="`/blogs/${blog.slug}`">{{ blog.title }}</NuxtLink>
      </li>
    </ul>
  </div>
</template>
