<template>
  <div class="penawaran-hari-ini py-5 my-5">
    <div class="container-fluid p-0">
      <div class="penawaran-wrapper">
        <!-- Banner Section (Left) -->
        <div class="banner-section">
          <div class="banner-content">
            <div class="sale-badge">
              <div class="great-sale-text">
                <span class="great-text">GREAT</span>
                <span class="mid-year-text">END-YEAR</span>
                <span class="sale-text">SALE</span>
              </div>
              <div class="date-range">01 SEPTEMBER - 9 DESEMBER</div>
            </div>
            <div class="promo-info">
              <div class="cod-info">
                <span class="gratis-text">GRATIS</span>
                <span class="cod-text">COD</span>
                <div class="cod-detail">GRATIS ONGKIR HEMAT 2025</div>
              </div>
              <div class="discount-info">
                <span class="discount-text">DISKON</span>
                <span class="percentage">50%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Products Section (Right) -->
        <div class="products-section">
          <div class="section-header">
            <h3 class="section-title">Penawaran Spesial Hari Ini</h3>
          </div>

          <!-- Products Slider -->
          <div v-if="!loading && products.length > 0" class="products-slider">
            <div class="slider-container" ref="sliderContainer">
              <div 
                class="slider-wrapper"
                :style="{ transform: `translateX(-${currentSlide * slideWidth}px)` }"
              >
                <div 
                  v-for="product in products" 
                  :key="product.id"
                  class="product-slide"
                  :style="{ width: slideWidth + 'px' }"
                >
                  <div class="product-card" @click="viewProduct(product)">
                    <!-- Product Image -->
                    <div class="product-image-wrapper position-relative">
                      <img 
                        :src="getProductImage(product.cover_image)" 
                        :alt="product.name"
                        class="product-image"
                      />
                      
                      <!-- Discount Badge -->
                      <div 
                        v-if="product.has_discount" 
                        class="discount-badge position-absolute"
                      >
                        -{{ product.discount_percentage }}%
                      </div>
                    </div>

                    <!-- Product Info -->
                    <div class="product-info">
                      <h6 class="product-name" :title="product.name">
                        {{ truncateText(product.name, 40) }}
                      </h6>
                      
                      <!-- Price -->
                      <div class="price-section">
                        <div class="current-price">
                            {{ formatRupiah(product.sale_price) }}
                        </div>
                        <div 
                          v-if="product.sale_price" 
                          class="original-price"
                        >
                          {{ formatRupiah(product.price) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Navigation -->
              <button 
                v-if="canSlidePrev" 
                @click="slidePrev" 
                class="slider-button slider-button-prev"
                type="button"
              >
                <i class="bi bi-chevron-left"></i>
              </button>
              <button 
                v-if="canSlideNext" 
                @click="slideNext" 
                class="slider-button slider-button-next"
                type="button"
              >
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>

          <!-- Loading State -->
          <div v-else-if="loading" class="loading-slider">
            <div class="d-flex gap-3">
              <div 
                v-for="i in 4" 
                :key="i"
                class="product-skeleton"
              >
                <div class="skeleton-image"></div>
                <div class="skeleton-content">
                  <div class="skeleton-line skeleton-title"></div>
                  <div class="skeleton-line skeleton-price"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="empty-state">
            <p class="text-muted text-center">Belum ada penawaran hari ini</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from "vue"

// Types
interface Product {
  id: number
  name: string
  slug: string
  short_description: string
  original_price: number
  sale_price: number
  final_price: number
  price: number
  has_discount: boolean
  discount_percentage: number
  sku: string
  is_featured: boolean
  views_count: number
  sales_count: number
  brand_name: string
  cover_image: string | null
  sort_order: number
}

// Composables
const { $baseAPi, $BASE_URL_BE } = useNuxtApp()

// State
const products = ref<Product[]>([])
const loading = ref(true)
const error = ref('')
const sliderContainer = ref<HTMLElement>()
const currentSlide = ref(0)
const slidesPerView = ref(4)
const slideWidth = ref(200)
let autoplayInterval: NodeJS.Timeout | null = null

// Computed
const maxSlide = computed(() => {
  return Math.max(0, products.value.length - slidesPerView.value)
})

const canSlidePrev = computed(() => {
  return currentSlide.value > 0
})

const canSlideNext = computed(() => {
  return currentSlide.value < maxSlide.value
})

// Methods
const fetchProducts = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const res = await $baseAPi.get('/v1/recommended-products?section=penawaran-hari-ini')
    if (res.data.success) {
      products.value = res.data.data.products
      
      // Setup slider after products loaded
      await nextTick()
      setupSlider()
    } else {
      error.value = res.data.message || 'Gagal mengambil data produk'
    }
  } catch (err: any) {
    console.error('Gagal ambil produk penawaran hari ini:', err)
    error.value = 'Terjadi kesalahan saat mengambil data produk'
    products.value = []
  } finally {
    loading.value = false
  }
}

const setupSlider = () => {
  updateSlidesPerView()
  startAutoplay()
  
  // Add resize listener
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handleResize)
  }
}

const updateSlidesPerView = () => {
  if (typeof window === 'undefined') return
  
  const containerWidth = sliderContainer.value?.offsetWidth || 800
  const gap = 15

  if (window.innerWidth >= 992) {
    slidesPerView.value = Math.min(3, products.value.length)
  } else if (window.innerWidth >= 768) {
    slidesPerView.value = Math.min(2, products.value.length)
  } else {
    slidesPerView.value = 1
  }

  slideWidth.value = (containerWidth - (gap * (slidesPerView.value - 1))) / slidesPerView.value

  if (currentSlide.value > maxSlide.value) {
    currentSlide.value = maxSlide.value
  }
}

const handleResize = () => {
  updateSlidesPerView()
}

const slideNext = () => {
  if (canSlideNext.value) {
    currentSlide.value++
  } else if (products.value.length > slidesPerView.value) {
    currentSlide.value = 0 // Loop back to start
  }
}

const slidePrev = () => {
  if (canSlidePrev.value) {
    currentSlide.value--
  } else if (products.value.length > slidesPerView.value) {
    currentSlide.value = maxSlide.value // Loop to end
  }
}

const startAutoplay = () => {
  if (products.value.length <= slidesPerView.value) return
  
  autoplayInterval = setInterval(() => {
    slideNext()
  }, 3000)
}

const stopAutoplay = () => {
  if (autoplayInterval) {
    clearInterval(autoplayInterval)
    autoplayInterval = null
  }
}

const getProductImage = (imagePath: string | null) => {
  return `${$BASE_URL_BE}${imagePath}`
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/images/no-image-placeholder.jpg'
}

const truncateText = (text: string, maxLength: number) => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

const viewProduct = (product: Product) => {
  navigateTo(`/products/${product.slug}`)
}

const formatRupiah = (value: number | string) => {
  if (!value) return 'Rp 0'
  const number = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(number)
}

// Lifecycle
onMounted(async () => {
  await fetchProducts()
})

onUnmounted(() => {
  stopAutoplay()
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', handleResize)
  }
})
</script>

<style scoped>
.penawaran-hari-ini {
  margin: 2rem 0;
}

.penawaran-wrapper {
  display: flex;
  background: linear-gradient(135deg, #ff4444, #cc0000);
  border-radius: 1rem;
  overflow: hidden;
  min-height: 280px;
}

/* Banner Section */
.banner-section {
  flex: 0 0 300px;
  background: linear-gradient(135deg, #ff4444, #cc0000);
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.banner-content {
  text-align: center;
  color: white;
}

.sale-badge {
  margin-bottom: 1.5rem;
}

.great-sale-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-weight: 900;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.great-text {
  font-size: 2.5rem;
  line-height: 1;
  color: #fff200;
}

.mid-year-text {
  font-size: 1.5rem;
  line-height: 1;
  color: white;
  margin: -0.2rem 0;
}

.sale-text {
  font-size: 2.5rem;
  line-height: 1;
  color: #fff200;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.2rem 1rem;
  border-radius: 2rem;
}

.date-range {
  background: #fff200;
  color: #cc0000;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-weight: bold;
  font-size: 0.9rem;
  margin-top: 1rem;
}

.promo-info {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.cod-info, .discount-info {
  background: rgba(255, 255, 255, 0.9);
  color: #cc0000;
  padding: 1rem;
  border-radius: 0.5rem;
  flex: 1;
  text-align: center;
}

.gratis-text, .cod-text, .discount-text {
  font-weight: bold;
  display: block;
}

.cod-detail {
  font-size: 0.7rem;
  margin-top: 0.2rem;
}

.percentage {
  font-size: 2rem;
  font-weight: 900;
  color: #ff4444;
}

/* Products Section */
.products-section {
  flex: 1;
  background: white;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.section-header {
  margin-bottom: 1rem;
}

.section-title {
  color: #333;
  font-weight: 600;
  font-size: 1.25rem;
  margin: 0;
}

.products-slider {
  flex: 1;
  position: relative;
}

.slider-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.slider-wrapper {
  display: flex;
  gap: 15px;
  transition: transform 0.3s ease;
  height: 100%;
}

.product-slide {
  flex-shrink: 0;
}

.product-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  width: 100%;
}

.product-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.product-image-wrapper {
  width: 100%;
  height: auto;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.discount-badge {
  top: 8px;
  right: 8px;
  background: #dc3545;
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  z-index: 2;
}

.product-info {
  padding: 0.75rem;
  height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.product-name {
  font-size: 0.8rem;
  font-weight: 500;
  line-height: 1.2;
  margin: 0;
  color: #333;
}

.price-section {
  margin-top: auto;
}

.current-price {
  font-size: 0.9rem;
  font-weight: bold;
  color: #ff4444;
}

.original-price {
  font-size: 0.7rem;
  text-decoration: line-through;
  color: #999;
}

/* Slider Navigation */
.slider-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #e9ecef;
  color: #ff4444;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.slider-button:hover {
  background: #ff4444;
  color: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.slider-button-prev {
  left: 0;
}

.slider-button-next {
  right: -15px;
}

.slider-button i {
  font-size: 12px;
}

/* Loading State */
.loading-slider {
  flex: 1;
}

.product-skeleton {
  flex: 0 0 180px;
  background: #f8f9fa;
  border-radius: 0.5rem;
  overflow: hidden;
  height: 200px;
}

.skeleton-image {
  width: 100%;
  height: 120px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

.skeleton-content {
  padding: 0.75rem;
}

.skeleton-line {
  height: 12px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.skeleton-title {
  width: 80%;
}

.skeleton-price {
  width: 60%;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Empty State */
.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Responsive */
@media (max-width: 992px) {
  .penawaran-wrapper {
    flex-direction: column;
  }
  
  .banner-section {
    flex: none;
    min-height: 200px;
  }
  
  .great-text, .sale-text {
    font-size: 2rem;
  }
  
  .mid-year-text {
    font-size: 1.2rem;
  }
  
  .promo-info {
    margin-top: 1rem;
  }
}

@media (max-width: 768px) {
  .banner-section {
    padding: 1.5rem;
    min-height: 160px;
  }
  
  .products-section {
    padding: 1rem;
  }
  
  .great-text, .sale-text {
    font-size: 1.8rem;
  }
  
  .promo-info {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .cod-info, .discount-info {
    padding: 0.75rem;
  }
}

@media (max-width: 576px) {
  .penawaran-wrapper {
    border-radius: 0.5rem;
  }
  
  .banner-section {
    padding: 1rem;
    min-height: 140px;
  }
  
  .great-text, .sale-text {
    font-size: 1.5rem;
  }
  
  .mid-year-text {
    font-size: 1rem;
  }
  
  .product-card {
    height: 180px;
  }
  
  .product-image-wrapper {
    height: 100px;
  }
  
  .product-info {
    height: 80px;
    padding: 0.5rem;
  }
  
  .product-name {
    font-size: 0.75rem;
  }
  
  .current-price {
    font-size: 0.8rem;
  }
}
</style>