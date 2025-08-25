<script setup>
const route = useRoute()
const { data: blog } = await useFetch(`/blogs/${route.params.slug}`, {
  baseURL: useRuntimeConfig().public.apiBase
})
</script>

<template>
  <div v-if="blog">
    <h1>{{ blog.title }}</h1>
    <p>{{ blog.content }}</p>
  </div>
</template>
