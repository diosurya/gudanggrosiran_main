<script setup lang="ts">
const { $api } = useNuxtApp()

// ambil produk
const { data } = await $api.get("/products")
console.log("Produk:", data)
</script>

<template>
  <div>
    <h1>Home</h1>
    <p>Lihat console untuk data produk</p>
  </div>
</template>
