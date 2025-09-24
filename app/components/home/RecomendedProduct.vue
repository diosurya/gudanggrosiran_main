<template>
  <div class="rekomendasi-product my-5">
    <!-- Header dengan Tabs -->
    <div class="section-header mb-4">
      <div class="d-flex align-items-center justify-content-between flex-wrap">
        <h3 class="section-title mb-3">{{ currentSectionLabel }}</h3>
        
        <!-- Tab Navigation -->
        <div class="tab-navigation gap-2 mt-2 mt-md-0">
          <button
            v-for="section in predefinedSections"
            :key="section.value"
            @click="changeSection(section.value)"
            :class="[
              'btn me-2',
              activeSection === section.value ? 'btn-main' : 'btn-outline-main',
              'btn-sm'
            ]"
            :disabled="loading"
          >
            {{ section.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Product Grid -->
    <div v-if="!loading && products.length > 0" class="product-grid">
      <div class="row g-3">
        <div 
          v-for="product in products" 
          :key="product.id"
          class="col-6 col-md-4 col-lg-3 col-xl-2"
        >
          <div class="product-card h-100">
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
              
              <!-- Featured Badge -->
              <div 
                v-if="product.is_featured" 
                class="featured-badge position-absolute"
              >
                <i class="fas fa-star"></i>
              </div>
            </div>

            <!-- Product Info -->
            <div class="product-info p-2">
              <h6 class="product-name text-truncate mb-1" :title="product.name">
                {{ product.name }}
              </h6>
              
              <p v-if="product.short_description" class="product-description text-muted small mb-2">
                {{ truncateText(product.short_description, 50) }}
              </p>

              <!-- Price -->
                <div class="price-section">
                <div 
                    v-if="product.sale_price" 
                    class="current-price"
                >
                    {{ formatRupiah(product.sale_price) }}
                </div>
                <div 
                    v-else 
                    class="current-price"
                >
                    {{ formatRupiah(product.price) }}
                </div>
                </div>


              <!-- Sales Info -->
              <div v-if="product.sales_count > 0" class="sales-info text-muted small mt-1">
                {{ product.sales_count }} terjual
              </div>
            </div>

            <!-- Product Actions -->
            <div class="product-actions p-2 pt-0">
              <button 
                @click="viewProduct(product)"
                class="btn btn-outline-main btn-sm w-100"
              >
                Lihat Detail
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="loading-grid">
      <div class="row g-3">
        <div 
          v-for="i in 12" 
          :key="i"
          class="col-6 col-md-4 col-lg-3 col-xl-2"
        >
          <div class="product-skeleton">
            <div class="skeleton-image"></div>
            <div class="skeleton-content p-2">
              <div class="skeleton-line skeleton-title mb-2"></div>
              <div class="skeleton-line skeleton-description mb-2"></div>
              <div class="skeleton-line skeleton-price"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state text-center py-5">
      <i class="fas fa-box-open fa-3x text-muted mb-3"></i>
      <h5 class="text-muted">Belum ada produk</h5>
      <p class="text-muted">Produk untuk kategori ini sedang dalam persiapan.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue"

// Types
interface Product {
  id: number
  name: string
  slug: string
  short_description: string
  original_price: number
  sale_price: number
  final_price: number
  formatted_price: string
  formatted_original_price: string
  has_discount: boolean
  discount_percentage: number
  sku: string
  is_featured: boolean
  views_count: number
  sales_count: number
  brand_name: string
  cover_image: string | null
  sort_order: number
   price: number
}

interface Section {
  value: string
  label: string
}

// Composables
const { $baseAPi, $BASE_URL_BE } = useNuxtApp()

// State
const products = ref<Product[]>([])
const activeSection = ref('recommended')
const loading = ref(true)
const error = ref('')

// Predefined sections - fixed tabs
const predefinedSections = ref<Section[]>([
  { value: 'recommended', label: 'Produk Pilihan' },
  { value: 'best-seller', label: 'Penjualan Terbaik' },
  { value: 'new-arrival', label: 'Produk Terbaru' }
])

// Computed
const currentSectionLabel = computed(() => {
  const section = predefinedSections.value.find(s => s.value === activeSection.value)
  return section?.label || 'Produk Pilihan'
})

// Methods
const fetchProducts = async (section: string = activeSection.value) => {
  loading.value = true
  error.value = ''
  
  try {
    const res = await $baseAPi.get(`/v1/recommended-products?section=${section}`)
    if (res.data.success) {
      products.value = res.data.data.products
    } else {
      error.value = res.data.message || 'Gagal mengambil data produk'
    }
  } catch (err: any) {
    console.error('Gagal ambil produk:', err)
    error.value = 'Terjadi kesalahan saat mengambil data produk'
    products.value = []
  } finally {
    loading.value = false
  }
}

const changeSection = async (section: string) => {
  if (activeSection.value !== section && !loading.value) {
    activeSection.value = section
    await fetchProducts(section)
  }
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
  // Navigate to product detail page
  navigateTo(`/products/${product.slug}`)
}

// Lifecycle
onMounted(async () => {
  await fetchProducts()
})
</script>

<style scoped>
.rekomendasi-product {
  margin-bottom: 2rem;
}

.section-title {
  color: #333;
  font-weight: 600;
  font-size: 1.25rem;
}

.tab-navigation {
  flex-wrap: wrap;
}

.tab-navigation .btn {
  font-size: 0.875rem;
  padding: 0.375rem 0.75rem;
  border-radius: 1rem;
  transition: all 0.3s ease;
}

.product-grid .product-card {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
  overflow: hidden;
}

.product-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.product-image-wrapper {
  width: 100%;
  height: 150px;
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
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  z-index: 2;
}

.featured-badge {
  top: 8px;
  left: 8px;
  background: #ffc107;
  color: #333;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  z-index: 2;
}

.product-name {
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.3;
}

.product-description {
  font-size: 0.75rem;
  line-height: 1.2;
}


.original-price {
  font-size: 0.75rem;
}

.sales-info {
  font-size: 0.7rem;
}

/* Skeleton Loading */
.product-skeleton {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  overflow: hidden;
  height: 280px;
}

.skeleton-image {
  width: 100%;
  height: 150px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

.skeleton-line {
  height: 12px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}

.skeleton-title {
  width: 80%;
}

.skeleton-description {
  width: 60%;
}

.skeleton-price {
  width: 50%;
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
.empty-state i {
  opacity: 0.5;
}

/* Responsive */
@media (max-width: 768px) {
  .section-header {
    text-align: center;
  }
  
  .section-header .d-flex {
    flex-direction: column;
    align-items: center !important;
  }
  
  .tab-navigation {
    justify-content: center;
  }
  
  .tab-navigation .btn {
    font-size: 0.8rem;
    padding: 0.25rem 0.5rem;
  }
  
  .product-image-wrapper {
    height: 120px;
  }
  
  .product-name {
    font-size: 0.8rem;
  }
  
  .current-price {
    font-size: 0.8rem;
  }
}

@media (max-width: 576px) {
  .product-image-wrapper {
    height: 100px;
  }
  
  .product-info {
    padding: 0.75rem !important;
  }
  
  .product-actions {
    padding: 0.75rem !important;
    padding-top: 0 !important;
  }
}
</style>