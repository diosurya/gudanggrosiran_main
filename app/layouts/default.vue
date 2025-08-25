<template>
  <div>
    <Header />
    <main class="container py-4">
      <slot />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import Header from "@/components/Header.vue"
import Footer from "@/components/Footer.vue"
</script>
