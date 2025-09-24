<script setup lang="ts">
import Features from '../components/home/Features.vue';
import Slider from '../components/home/Slider.vue';
import PromoSection from '@/components/home/PromoSection.vue';
import RecomendedProduct from '@/components/home/RecomendedProduct.vue';
import PenawaranHariIni from '@/components/home/PenawaranHariIni.vue';
import LatestArticles from '@/components/home/LatestArticles.vue';
import ImageHome from '@/components/home/ImageHome.vue';

useHead({
  title: "Gudang Grosiran - Belanja Grosir, Kualitas Premium",
  meta: [
    { name: "description", content: "Belanja grosir murah, terpercaya dan kualitas premium" },
    { name: "keywords", content: "grosir, ecommerce, belanja murah, kualitas premium, belanja partai" },
    { property: "og:title", content: "Gudang Grosiran - Belanja Grosir, Kualitas Premium" },
    { property: "og:description", content: "Belanja grosir murah, terpercaya dan kualitas premium" },
    { property: "og:type", content: "website" },
  ]
})
</script>

<template>
  <div class="container my-3">
    <Slider />
    <Features />
    <hr class="normal ">
    <RecomendedProduct />
    <hr class="normal hide-mobile">
    <ImageHome />
    <hr class="normal ">
    <PenawaranHariIni />
    <hr class="normal ">
    <PromoSection />
    <hr class="normal ">
    <LatestArticles />

     <!-- <BestSeller 
      title="Best Seller"
      subtitle="A virtual assistant collects the products from your list"
      :limit="6"
      api-endpoint="/api/products/bestsellers"
    /> -->
  </div>
</template>
