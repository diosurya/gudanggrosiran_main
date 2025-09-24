<template>
  <section class="promo-section py-5">
    <div class="container-fluid">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h3 class="section-title">Promo untuk Kamu</h3>
        <NuxtLink to="/promo" class="btn btn-link text-decoration-none text-main">
          Lihat semua
        </NuxtLink>
      </div>

      <!-- Tabs -->
      <div class="mb-3">
        <ul class="nav nav-tabs">
          <li class="nav-item">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'partner' }"
              @click="activeTab = 'partner'"
            >
              Promo Partner
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link"
              :class="{ active: activeTab === 'lainnya' }"
              @click="activeTab = 'lainnya'"
            >
              Promo Lainnya
            </button>
          </li>
        </ul>
      </div>

      <!-- Slider -->
      <div v-if="!loading" class="slider-container position-relative">
        <div
          class="slider-wrapper row flex-nowrap"
          :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
        >
          <div
            v-for="(promo, i) in filteredPromos"
            :key="i"
            class="col-md-4 col-12 promo-slide"
          >
            <a :href="promo.link" target="_blank">
              <img
                :src="promo.image"
                :alt="promo.alt"
                class="img-fluid rounded"
                @error="handleImageError"
              />
            </a>
          </div>
        </div>

        <!-- Navigation -->
        <button
          v-if="canSlidePrev"
          @click="slidePrev"
          class="slider-button slider-button-prev"
        >
          <i class="bi bi-chevron-left"></i>
        </button>
        <button
          v-if="canSlideNext"
          @click="slideNext"
          class="slider-button slider-button-next"
        >
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>

      <!-- Skeleton Loading -->
      <div v-else class="row flex-nowrap overflow-hidden">
        <div
          v-for="i in 3"
          :key="i"
          class="col-md-4 col-12 mb-3"
        >
          <div class="skeleton-card"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue"

interface Promo {
  link: string
  image: string
  alt: string
  type: "partner" | "lainnya"
}

// State
const activeTab = ref<"partner" | "lainnya">("partner")
const promos = ref<Promo[]>([])
const loading = ref(true)
const currentSlide = ref(0)
const slidesPerView = ref(3)
const sliderContainer = ref<HTMLElement>()
let autoplayInterval: NodeJS.Timeout | null = null

// Filter promos by tab
const filteredPromos = computed(() =>
  promos.value.filter((p) => p.type === activeTab.value)
)

// Slider helpers
const maxSlide = computed(() =>
  Math.max(0, filteredPromos.value.length - slidesPerView.value)
)
const canSlidePrev = computed(() => currentSlide.value > 0)
const canSlideNext = computed(() => currentSlide.value < maxSlide.value)

// Fake fetch promos
const fetchPromos = async () => {
  loading.value = true
  try {
    promos.value = [
      {
        link: "https://example.com/ocbc",
        image: "https://cdn.ruparupa.io/filters:format(webp)/filters:format(webp)/media/promotion/ruparupa/partnership/double-date/2025/9-9/homepage-ocbcdb.jpg",
        alt: "OCBC Promo",
        type: "partner"
      },
      {
        link: "https://example.com/kredivo",
        image: "https://cdn.ruparupa.io/filters:format(webp)/filters:format(webp)/media/promotion/ruparupa/partnership/double-date/2025/9-9/homepage-kredivo.jpg",
        alt: "Kredivo Promo",
        type: "partner"
      },
      {
        link: "https://example.com/mega",
        image: "https://cdn.ruparupa.io/filters:format(webp)/filters:format(webp)/media/promotion/ruparupa/partnership/double-date/2025/9-9/homepage-mega.jpg",
        alt: "Mega Promo",
        type: "partner"
      },
      {
        link: "https://example.com/mega",
        image: "https://cdn.ruparupa.io/filters:format(webp)/filters:format(webp)/promotion/ruparupa/partnership/oktober-24/kredivo/homepage.jpg",
        alt: "Kredivo Promo 1jt",
        type: "partner"
      },
      {
        link: "https://example.com/mega",
        image: "http://cdn.ruparupa.io/filters:format(webp)/filters:format(webp)/media/tahu-asset/IMAGE_TAHU_homepage_1750919810.jpeg",
        alt: "DBS digibank Promo",
        type: "partner"
      },
       {
        link: "https://example.com/mega",
        image: "https://cdn.ruparupa.io/filters:format(webp)/filters:format(webp)/media/tahu-asset/IMAGE_TAHU_homepage_1735554002.jpeg",
        alt: "CIMB Niaga Promo",
        type: "partner"
      },
      {
        link: "https://example.com/kredivo",
        image: "https://cdn.ruparupa.io/filters:format(webp)/filters:format(webp)/media/promotion/ruparupa/partnership/double-date/2025/9-9/homepage-kredivo.jpg",
        alt: "Kredivo Promo",
        type: "lainnya"
      },
      {
        link: "https://example.com/mega",
        image: "https://cdn.ruparupa.io/filters:format(webp)/filters:format(webp)/media/promotion/ruparupa/partnership/double-date/2025/9-9/homepage-mega.jpg",
        alt: "Mega Promo",
        type: "lainnya"
      },
      {
        link: "https://example.com/mega",
        image: "https://cdn.ruparupa.io/filters:format(webp)/filters:format(webp)/promotion/ruparupa/partnership/oktober-24/kredivo/homepage.jpg",
        alt: "Kredivo Promo 1jt",
        type: "lainnya"
      },
    ]
    await nextTick()
    setupSlider()
  } finally {
    loading.value = false
  }
}

const setupSlider = () => {
  updateSlidesPerView()
  if (typeof window !== "undefined") {
    window.addEventListener("resize", handleResize)
  }
}

const updateSlidesPerView = () => {
  if (typeof window === "undefined") return
  if (window.innerWidth >= 1200) {
    slidesPerView.value = 3
  } else {
    slidesPerView.value = 2
  }
}

const handleResize = () => updateSlidesPerView()

const slideNext = () => {
  if (canSlideNext.value) currentSlide.value++
  else currentSlide.value = 0
}

const slidePrev = () => {
  if (canSlidePrev.value) currentSlide.value--
  else currentSlide.value = maxSlide.value
}

const startAutoplay = () => {
  if (filteredPromos.value.length <= slidesPerView.value) return
  autoplayInterval = setInterval(() => {
    slideNext()
  }, 4000)
}

const stopAutoplay = () => {
  if (autoplayInterval) clearInterval(autoplayInterval)
  autoplayInterval = null
}

const handleImageError = (e: Event) => {
  (e.target as HTMLImageElement).src = "/images/no-image-placeholder.jpg"
}

// Lifecycle
onMounted(() => {
  fetchPromos()
})
onUnmounted(() => {
  stopAutoplay()
  if (typeof window !== "undefined") {
    window.removeEventListener("resize", handleResize)
  }
})
</script>

<style scoped>
.section-title {
  font-weight: bold;
  font-size: 1.25rem;
}
.slider-container {
  overflow: hidden;
}
.slider-wrapper {
  transition: transform 0.5s ease;
}
.promo-slide img {
  flex-shrink: 0;
}
.slider-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: rgba(255, 255, 255, 0.7);
  padding: 0.5rem 0.8rem;
  border-radius: 50%;
  cursor: pointer;
}
.slider-button-prev {
  left: 10px;
}
.slider-button-next {
  right: 10px;
}

.nav-tabs .nav-link.active{
    color:#000;
    font-weight: 600;
}

.nav-tabs .nav-link{
    color:#666;
    font-weight:400;
}

/* Skeleton */
.skeleton-card {
  height: 200px;
  border-radius: 8px;
  background: linear-gradient(
    90deg,
    #e0e0e0 25%,
    #f5f5f5 37%,
    #e0e0e0 63%
  );
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
}
@keyframes shimmer {
  0% {
    background-position: -400px 0;
  }
  100% {
    background-position: 400px 0;
  }
}
</style>
