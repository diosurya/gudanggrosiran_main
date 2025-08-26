<script setup lang="ts">
import Features from './home/components/Features.vue';
import Slider from './home/components/Slider.vue';
import BestSeller from './home/components/BestSeller.vue';


definePageMeta({
  title: "Gudang Grosiran - Home",
  description: "Belanja grosir murah dan terpercaya"
})
</script>

<template>
  <div class="container my-3">
    <Slider />
    <Features />

     <BestSeller 
      title="Best Seller"
      subtitle="A virtual assistant collects the products from your list"
      :limit="6"
      api-endpoint="/api/products/bestsellers"
    />
  </div>
</template>
