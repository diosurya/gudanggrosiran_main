<script setup lang="ts">
import { ref, onMounted } from "vue"
const { $baseAPi, $BASE_URL_BE } = useNuxtApp()

// state
const slides = ref<any[]>([])
const loading = ref(true)

// fetch sliders
const fetchSliders = async () => {
  loading.value = true
  try {
    const res = await $baseAPi.get("/v1/sliders")
    if (res.data.success) {
      slides.value = res.data.data.map((item: any) => ({
        id: item.id,
        image: `${$BASE_URL_BE}/storage/${item.path}`,
        title: item.title,
        caption: item.caption,
        link: item.link
      }))
    }
  } catch (err) {
    console.error("Gagal ambil sliders:", err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchSliders()
})
</script>

<template>
  <!-- Slider Desktop -->
  <div id="sliderDkstp">
    <!-- Carousel -->
    <BCarousel
      v-if="!loading && slides.length > 0"
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

    <!-- Skeleton -->
    <div v-else class="skeleton-slider mb-3"></div>
  </div>

  <div id="sliderMobile">
  </div>
</template>

<style scoped>
/* Skeleton Slider */
.skeleton-slider {
  width: 100%;
  height: 400px;
  border-radius: 0.5rem;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

#sliderMobile {
  display: none;
}

@media (max-width: 768px) {
  #sliderDkstp {
    display: none;
  }
  #sliderMobile {
    display: block;
  }
}

/* Responsive height */
@media (max-width: 768px) {
  .skeleton-slider {
    height: 200px;
  }
}
</style>
