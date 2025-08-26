<script setup lang="ts">
const slides = [
  { id: 1, image: "https://picsum.photos/1200/400?1", title: "Kacamata Selam", caption: "Diskon 34%" },
  { id: 2, image: "https://picsum.photos/1200/400?2", title: "Cuci Gudang", caption: "Diskon 79%" },
  { id: 3, image: "https://picsum.photos/1200/400?3", title: "Produk Terlaris", caption: "10RB++ Terjual" }
]
</script>

<template>
  <!-- <div class="container my-3"> -->
  <BCarousel
    id="carousel-fade"
    fade
    indicators
    controls
    background="#000"
    :interval="3000"
    img-width="1024"
    img-height="400"
    class="mb-3"
  >
    <BCarouselSlide
      v-for="slide in slides"
      :key="slide.id"
      :img-src="slide.image"
    >
      <h3>{{ slide.title }}</h3>
      <p>{{ slide.caption }}</p>
    </BCarouselSlide>
  </BCarousel>
  <!-- </div> -->
</template>
