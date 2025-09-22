<script setup lang="ts">
import Features from '../components/home/Features.vue';
import Slider from '../components/home/Slider.vue';
import BestSeller from '@/components/home/BestSeller.vue';
import RecomendedProduct from '@/components/home/RecomendedProduct.vue';
import PenawaranHariIni from '@/components/home/PenawaranHariIni.vue';
import LatestArticles from '@/components/home/LatestArticles.vue';

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
