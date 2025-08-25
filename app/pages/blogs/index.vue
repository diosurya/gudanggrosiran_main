<script setup>
const { data: blogs } = await useFetch("/blogs", {
  baseURL: useRuntimeConfig().public.apiBase
})
</script>

<template>
  <div>
    <h1>Blog</h1>
    <ul>
      <li v-for="blog in blogs" :key="blog.id">
        <NuxtLink :to="`/blogs/${blog.slug}`">{{ blog.title }}</NuxtLink>
      </li>
    </ul>
  </div>
</template>
