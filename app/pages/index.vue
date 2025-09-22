<script setup lang="ts">
import Features from './home/components/Features.vue';
import Slider from './home/components/Slider.vue';
import BestSeller from './home/components/BestSeller.vue';
import RecomendedProduct from './home/components/RecomendedProduct.vue';
import PenawaranHariIni from './home/components/PenawaranHariIni.vue';
import LatestArticles from './home/components/LatestArticles.vue';

useHead({
  title: "Gudang Grosiran - Belanja Murah",
  meta: [
    { name: "description", content: "Belanja grosir murah dan terpercaya" },
    { name: "keywords", content: "grosir, ecommerce, belanja murah" },
    { property: "og:title", content: "Gudang Grosiran - Home" },
    { property: "og:description", content: "Belanja grosir murah dan terpercaya" },
    { property: "og:type", content: "website" },
  ]
})
</script>

<template>
  <div class="container my-3">
    <Slider />
    <Features />
    <RecomendedProduct />
    <PenawaranHariIni />
    <LatestArticles />

     <!-- <BestSeller 
      title="Best Seller"
      subtitle="A virtual assistant collects the products from your list"
      :limit="6"
      api-endpoint="/api/products/bestsellers"
    /> -->
  </div>
</template>
