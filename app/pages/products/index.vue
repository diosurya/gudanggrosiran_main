<template>
  <div class="min-vh-100 bg-white bg-gradient-to-br">
    <div class="container py-5">
      <div class="row g-4">
        
        <!-- Sidebar Filter -->
        <div class="col-lg-3 col-md-4 hide-mobile">
          <div class="bg-white rounded shadow-sm p-4 sticky-top" style="border: 1px solid #dee2e6;">
            
            <!-- Search -->
            <div class="mb-4">
              <div class="position-relative">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Mencari..."
                  class="form-control ps-4 pe-5"
                  @input="filterProducts"
                />
                <i class="bi bi-search position-absolute top-50 end-0 translate-middle-y me-3 text-muted"></i>
              </div>
            </div>

            <!-- Category Filter -->
            <div class="mb-4">
              <h6 class="fw-semibold text-dark mb-3">Kategori</h6>
              <div class="d-flex flex-column gap-2">
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    value=""
                    v-model="selectedCategories"
                    @change="filterProducts"
                    id="categoryAll"
                  />
                  <label class="form-check-label small text-muted" for="categoryAll">
                    Semua
                  </label>
                </div>
                <div 
                  v-for="category in categories" 
                  :key="category.id"
                  class="form-check"
                >
                  <input
                    class="form-check-input"
                    type="checkbox"
                    :value="category.id"
                    v-model="selectedCategories"
                    @change="filterProducts"
                    :id="`category${category.id}`"
                  />
                  <label class="form-check-label small text-muted d-flex justify-content-between w-100" :for="`category${category.id}`">
                    <span>{{ category.name }}</span>
                    <small class="text-secondary">({{ getCategoryCount(category.id) }})</small>
                  </label>
                </div>
              </div>
            </div>

            <!-- Brand Filter -->
            <div class="mb-4" v-if="brands.length > 0">
              <h6 class="fw-semibold text-dark mb-3">Brand</h6>
              <div class="d-flex flex-column gap-2">
                <div 
                  v-for="brand in brands" 
                  :key="brand.id"
                  class="form-check"
                >
                  <input
                    class="form-check-input"
                    type="checkbox"
                    :value="brand.id"
                    v-model="selectedBrands"
                    @change="filterProducts"
                    :id="`brand${brand.id}`"
                  />
                  <label class="form-check-label small text-muted d-flex justify-content-between w-100" :for="`brand${brand.id}`">
                    <span>{{ brand.name }}</span>
                    <small class="text-secondary">({{ getBrandCount(brand.id) }})</small>
                  </label>
                </div>
              </div>
            </div>

            <!-- Price Range -->
            <div class="mb-4">
              <h6 class="fw-semibold text-dark mb-3">Harga</h6>
              <div class="row g-2">
                <div class="col-6">
                  <input
                    v-model="priceRange.min"
                    type="number"
                    placeholder="Min"
                    class="form-control form-control-sm"
                    @input="filterProducts"
                  />
                </div>
                <div class="col-6">
                  <input
                    v-model="priceRange.max"
                    type="number"
                    placeholder="Max"
                    class="form-control form-control-sm"
                    @input="filterProducts"
                  />
                </div>
              </div>
            </div>

            <!-- Clear Filters -->
            <button
              @click="clearFilters"
              class="btn btn-outline-secondary btn-sm w-100"
            >
              <i class="bi bi-arrow-clockwise me-1"></i>
              Hapus Filter
            </button>
          </div>
        </div>

        <!-- Main Content -->
        <div class="col-lg-9 col-md-8">
          
          <!-- Header & Controls -->
          <div class="bg-white rounded shadow-sm p-4 mb-4" style="border: 1px solid #dee2e6;">
            <div class="row align-items-center">
              <div class="col-md-6">
                <h4 class="fw-bold text-dark mb-1">Produk</h4>
                <small class="text-muted">{{ filteredProducts.length }} Produk ditemukan</small>
              </div>
              
              <div class="col-md-6">
                <div class="d-flex justify-content-md-end gap-2 mt-3 mt-md-0">
                  <!-- View Toggle -->
                  <div class="btn-group btn-group-sm" role="group">
                    <button
                      @click="viewMode = 'grid'"
                      :class="[
                        'btn',
                        viewMode === 'grid' ? 'btn-main' : 'btn-outline-secondary'
                      ]"
                    >
                      <i class="bi bi-grid-3x3-gap"></i>
                    </button>
                    <button
                      @click="viewMode = 'list'"
                      :class="[
                        'btn',
                        viewMode === 'list' ? 'btn-main' : 'btn-outline-secondary'
                      ]"
                    >
                      <i class="bi bi-list"></i>
                    </button>
                  </div>
                  
                  <!-- Sort -->
                  <select
                    v-model="sortBy"
                    @change="sortProducts"
                    class="form-select form-select-sm"
                    style="width: 140px;"
                  >
                    <option value="">Urutkan</option>
                    <option value="name_asc">Nama A-Z</option>
                    <option value="name_desc">Nama Z-A</option>
                    <option value="price_asc">Harga Terendah</option>
                    <option value="price_desc">Harga Tertinggi</option>
                    <option value="newest">Terbaru</option>
                  </select>

                  <!-- Items per page -->
                  <select
                    v-model="itemsPerPage"
                    @change="updatePagination"
                    class="form-select form-select-sm"
                    style="width: 80px;"
                  >
                    <option value="12">12</option>
                    <option value="24">24</option>
                    <option value="36">36</option>
                    <option value="48">48</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="row g-3">
            <div 
              v-for="n in 12" 
              :key="n"
              class="col-lg-4 col-md-6"
            >
              <div class="card h-100">
                <div class="placeholder-glow">
                  <div class="placeholder bg-secondary w-100" style="height: 200px;"></div>
                </div>
                <div class="card-body">
                  <div class="placeholder-glow">
                    <span class="placeholder col-8"></span>
                    <span class="placeholder col-6"></span>
                    <span class="placeholder col-4"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- No Products -->
          <div v-else-if="paginatedProducts.length === 0" class="text-center py-5">
            <i class="bi bi-search display-1 text-muted mb-3"></i>
            <h5 class="text-dark mb-2">Produk tidak ditemukan</h5>
            <p class="text-muted">Coba ubah filter atau kata kunci pencarian Anda</p>
          </div>

          <!-- Products Grid -->
          <div 
            v-else-if="viewMode === 'grid'"
            class="row g-3"
          >
            <div
              v-for="product in paginatedProducts"
              :key="product.id"
              class="col-lg-4 col-md-6"
            >
              <div class="card h-100 product-card position-relative overflow-hidden">
                <!-- Product Image -->
                <div class="position-relative bg-light" style="height: 200px;">
                  <img
                    :src="getImageUrl(product.images.cover?.url)"
                    :alt="product.name"
                    class="card-img-top h-100 w-100 object-fit-cover product-image"
                    @error="handleImageError"
                  />
                  
                  <!-- Badges -->
                  <div class="position-absolute top-0 start-0 p-2">
                    <span v-if="product.pricing.sale_price && product.pricing.sale_price < product.pricing.regular_price" 
                          class="badge bg-danger text-white small">
                      SALE
                    </span>
                    <span v-if="isNewProduct(product)" 
                          class="badge bg-success text-white small ms-1">
                      NEW
                    </span>
                  </div>

                  <!-- Quick Actions -->
                  <!-- <div class="position-absolute top-0 end-0 p-2 product-actions">
                    <div class="d-flex flex-column gap-1">
                      <button class="btn btn-light btn-sm rounded-circle p-2 shadow-sm">
                        <i class="bi bi-heart"></i>
                      </button>
                      <button class="btn btn-light btn-sm rounded-circle p-2 shadow-sm">
                        <i class="bi bi-eye"></i>
                      </button>
                    </div>
                  </div> -->
                </div>

                <!-- Product Info -->
                <div class="card-body p-3">
                  <small class="text-muted">{{ product.brand?.name || 'No Brand' }}</small>
                    <NuxtLink :to="`/products/${product.slug}`">
                        <h6 class="card-title mt-1 mb-2 lh-base text-truncate-2">
                            {{ product.name }}
                        </h6>
                    </NuxtLink>
                  
                  <!-- Price -->
                  <div class="mb-2">
                    <div v-if="product.pricing.sale_price && product.pricing.sale_price < product.pricing.regular_price">
                      <span class="fw-bold text-danger">
                        {{ formatPrice(product.pricing.sale_price) }}
                      </span>
                      <small class="text-muted text-decoration-line-through ms-1">
                        {{ formatPrice(product.pricing.regular_price) }}
                      </small>
                    </div>
                    <div v-else class="fw-bold text-dark">
                      {{ product.pricing.price_range || formatPrice(product.pricing.regular_price) }}
                    </div>
                  </div>

                  <!-- Variants & Stock -->
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <small v-if="product.variants && product.variants.length > 0" class="text-muted">
                      {{ product.variants.length }} varian
                    </small>
                    <small :class="hasStock(product) ? 'text-success' : 'text-danger'">
                      <i :class="hasStock(product) ? 'bi bi-check-circle' : 'bi bi-x-circle'"></i>
                      {{ hasStock(product) ? 'Tersedia' : 'Stok Habis' }}
                    </small>
                  </div>

                  <!-- Add to Cart Button -->
                  <!-- <button 
                    :disabled="!hasStock(product)"
                    class="btn btn-main btn-sm w-100"
                  >
                    <i class="bi bi-cart-plus me-1"></i>
                    Lihat Selengkapnya
                  </button> -->
                  <NuxtLink 
                    :to="`/products/${product.slug}`"
                    class="btn btn-main btn-sm w-100"
                    >
                      Lihat Selengkapnya
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>

          <!-- Products List -->
          <div v-else class="d-flex flex-column gap-3">
            <div
              v-for="product in paginatedProducts"
              :key="product.id"
              class="card"
            >
              <div class="row g-0">
                <div class="col-md-3">
                  <img
                    :src="getImageUrl(product.images.cover?.url)"
                    :alt="product.name"
                    class="img-fluid h-100 w-100 object-fit-cover"
                    style="min-height: 150px;"
                    @error="handleImageError"
                  />
                </div>
                <div class="col-md-9">
                  <div class="card-body">
                    <div class="d-flex justify-content-between">
                      <div class="flex-grow-1">
                        <small class="text-muted">{{ product.brand?.name || 'No Brand' }}</small>
                        <h6 class="card-title">{{ product.name }}</h6>
                        <p class="card-text small text-muted">{{ product.description?.short }}</p>
                        
                        <!-- Categories -->
                        <div class="mb-2">
                          <span 
                            v-for="category in product.categories" 
                            :key="category.id"
                            class="badge bg-light text-dark me-1"
                          >
                            {{ category.name }}
                          </span>
                        </div>
                      </div>
                      
                      <div class="text-end">
                        <!-- Price -->
                        <div class="mb-2">
                          <div v-if="product.pricing.sale_price && product.pricing.sale_price < product.pricing.regular_price">
                            <div class="fw-bold text-danger">
                              {{ formatPrice(product.pricing.sale_price) }}
                            </div>
                            <small class="text-muted text-decoration-line-through">
                              {{ formatPrice(product.pricing.regular_price) }}
                            </small>
                          </div>
                          <div v-else class="fw-bold text-dark">
                            {{ product.pricing.price_range || formatPrice(product.pricing.regular_price) }}
                          </div>
                        </div>

                        <!-- Actions -->
                        <div class="d-flex gap-2">
                          <button class="btn btn-outline-primary btn-sm">
                            <i class="bi bi-heart"></i>
                          </button>
                          <button 
                            :disabled="!hasStock(product)"
                            class="btn btn-main btn-sm"
                          >
                            <i class="bi bi-cart-plus me-1"></i>
                            Tambah
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <nav v-if="totalPages > 1" class="mt-4">
            <ul class="pagination justify-content-center">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button
                  class="page-link"
                  @click="goToPage(currentPage - 1)"
                  :disabled="currentPage === 1"
                >
                  <i class="bi bi-chevron-left"></i>
                </button>
              </li>
              
              <li 
                v-for="page in getVisiblePages()"
                :key="page"
                class="page-item"
                :class="{ active: page === currentPage }"
              >
                <button
                  class="page-link"
                  @click="goToPage(page)"
                  v-if="typeof page === 'number'"
                >
                  {{ page }}
                </button>
                <span v-else class="page-link">{{ page }}</span>
              </li>
              
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button
                  class="page-link"
                  @click="goToPage(currentPage + 1)"
                  :disabled="currentPage === totalPages"
                >
                  <i class="bi bi-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

// Types
interface Product {
  id: string
  name: string
  slug: string
  description: {
    short: string
  }
  sku: string
  type: string
  status: string
  pricing: {
    regular_price: number
    sale_price: number | null
    cost_price: number
    min_variant_price: number
    max_variant_price: number
    price_range: string
  }
  images: {
    cover: {
      url: string
      name: string | null
      alt: string | null
      sort_order: number | null
    }
  }
  brand: {
    id: string
    name: string
  }
  categories: Array<{
    id: string
    name: string
  }>
  variants: Array<{
    id: string
    type: string | null
    attribute_name: string
    attribute_value: string | null
    pricing: {
      regular_price: number
      sale_price: number | null
      cost_price: number
      formatted_price: string
    }
    inventory: {
      stock_quantity: number
      in_stock: boolean
    }
    status: string
  }>
}

interface Store {
  id: string
  name: string
  slug: string
  contact: {
    address: string | null
    phone: string | null
  }
}

// Composables
const { $baseAPi, $BASE_URL_BE } = useNuxtApp()
const route = useRoute()

// Reactive data
const products = ref<Product[]>([])
const filteredProducts = ref<Product[]>([])
const paginatedProducts = ref<Product[]>([])
const store = ref<Store | null>(null)
const loading = ref(true)

// Filters
const searchQuery = ref('')
const selectedCategories = ref<string[]>([])
const selectedBrands = ref<string[]>([])
const priceRange = ref({ min: '', max: '' })
const sortBy = ref('')
const viewMode = ref<'grid' | 'list'>('grid')

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(12)
const totalPages = ref(1)

// Computed
const categories = computed(() => {
  const allCategories = products.value.flatMap(p => p.categories)
  const uniqueCategories = allCategories.filter((category, index, self) => 
    self.findIndex(c => c.id === category.id) === index
  )
  return uniqueCategories.sort((a, b) => a.name.localeCompare(b.name))
})

const brands = computed(() => {
  const allBrands = products.value.map(p => p.brand).filter(Boolean)
  const uniqueBrands = allBrands.filter((brand, index, self) => 
    self.findIndex(b => b.id === brand.id) === index
  )
  return uniqueBrands.sort((a, b) => a.name.localeCompare(b.name))
})

// Methods
const fetchProducts = async () => {
  loading.value = true
  try {
    // Get store UUID from header or use default
    const storeUUID = window.getSelectedStoreUUID?.() || '78fb0c59-8d46-11f0-ae4e-b42e99edc3be'
    
    const response = await $baseAPi.get(`/v1/stores/${storeUUID}/products`)
    if (response.data.success) {
      products.value = response.data.data.products || []
      store.value = response.data.data.store || null
      filteredProducts.value = [...products.value]
      updatePagination()
    }
  } catch (error) {
    console.error('Error fetching products:', error)
  } finally {
    loading.value = false
  }
}

const filterProducts = () => {
  let filtered = [...products.value]
  
  // Search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(product => 
      product.name.toLowerCase().includes(query) ||
      product.description?.short?.toLowerCase().includes(query) ||
      product.brand?.name?.toLowerCase().includes(query) ||
      product.sku.toLowerCase().includes(query)
    )
  }
  
  // Category filter
  if (selectedCategories.value.length > 0 && !selectedCategories.value.includes('')) {
    filtered = filtered.filter(product => 
      product.categories.some(cat => selectedCategories.value.includes(cat.id))
    )
  }
  
  // Brand filter
  if (selectedBrands.value.length > 0) {
    filtered = filtered.filter(product => 
      product.brand && selectedBrands.value.includes(product.brand.id)
    )
  }
  
  // Price filter
  if (priceRange.value.min || priceRange.value.max) {
    filtered = filtered.filter(product => {
      const price = product.pricing.sale_price || product.pricing.regular_price
      const min = parseFloat(priceRange.value.min) || 0
      const max = parseFloat(priceRange.value.max) || Infinity
      return price >= min && price <= max
    })
  }
  
  filteredProducts.value = filtered
  currentPage.value = 1
  updatePagination()
}

const sortProducts = () => {
  if (!sortBy.value) return
  
  const sorted = [...filteredProducts.value]
  
  switch (sortBy.value) {
    case 'name_asc':
      sorted.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'name_desc':
      sorted.sort((a, b) => b.name.localeCompare(a.name))
      break
    case 'price_asc':
      sorted.sort((a, b) => {
        const priceA = a.pricing.sale_price || a.pricing.regular_price
        const priceB = b.pricing.sale_price || b.pricing.regular_price
        return priceA - priceB
      })
      break
    case 'price_desc':
      sorted.sort((a, b) => {
        const priceA = a.pricing.sale_price || a.pricing.regular_price
        const priceB = b.pricing.sale_price || b.pricing.regular_price
        return priceB - priceA
      })
      break
    case 'newest':
      sorted.reverse()
      break
  }
  
  filteredProducts.value = sorted
  updatePagination()
}

const updatePagination = () => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  paginatedProducts.value = filteredProducts.value.slice(start, end)
  totalPages.value = Math.ceil(filteredProducts.value.length / itemsPerPage.value)
}

const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  updatePagination()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const getVisiblePages = () => {
  const delta = 2
  const range = []
  const rangeWithDots = []

  for (let i = Math.max(2, currentPage.value - delta);
       i <= Math.min(totalPages.value - 1, currentPage.value + delta);
       i++) {
    range.push(i)
  }

  if (currentPage.value - delta > 2) {
    rangeWithDots.push(1, '...')
  } else {
    rangeWithDots.push(1)
  }

  rangeWithDots.push(...range)

  if (currentPage.value + delta < totalPages.value - 1) {
    rangeWithDots.push('...', totalPages.value)
  } else if (totalPages.value > 1) {
    rangeWithDots.push(totalPages.value)
  }

  return rangeWithDots.filter(p => p !== 1 || totalPages.value === 1)
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedCategories.value = []
  selectedBrands.value = []
  priceRange.value = { min: '', max: '' }
  sortBy.value = ''
  filterProducts()
}

const getCategoryCount = (categoryId: string) => {
  return products.value.filter(product => 
    product.categories.some(cat => cat.id === categoryId)
  ).length
}

const getBrandCount = (brandId: string) => {
  return products.value.filter(product => product.brand?.id === brandId).length
}

const getImageUrl = (imagePath: string | null) => {
  if (!imagePath) return 'https://via.placeholder.com/400x300/f8f9fa/6c757d?text=No+Image'
  return `${$BASE_URL_BE}${imagePath}`
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = 'https://via.placeholder.com/400x300/f8f9fa/6c757d?text=No+Image'
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)
}

const hasStock = (product: Product) => {
  if (product.variants && product.variants.length > 0) {
    return product.variants.some(variant => variant.inventory.in_stock)
  }
  return product.status === 'published'
}

const isNewProduct = (product: Product) => {
  // Placeholder logic - you can implement based on created_at date
  return false
}

// Watchers
watch([selectedCategories, selectedBrands, priceRange], () => {
  filterProducts()
}, { deep: true })

watch(sortBy, () => {
  sortProducts()
})

watch(itemsPerPage, () => {
  currentPage.value = 1
  updatePagination()
})

// Lifecycle
onMounted(() => {
  fetchProducts()
  
  if (process.client) {
    window.addEventListener('storeLocationChanged', fetchProducts)
  }
})

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('storeLocationChanged', fetchProducts)
  }
})

// SEO
useHead({
  title: computed(() => store.value ? `Produk - ${store.value.name} | Gudang Grosiran` : 'Produk - Gudang Grosiran'),
  meta: [
    { name: 'description', content: 'Temukan berbagai produk berkualitas dengan harga grosir terbaik' },
    { name: 'keywords', content: 'produk, grosir, belanja, kualitas, murah' }
  ]
})
</script>

<style scoped>
/* Product Card Styles */
.product-card {
  transition: all 0.3s ease;
  border: 1px solid #e9ecef;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.product-image {
  transition: transform 0.3s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.product-actions {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.product-card:hover .product-actions {
  opacity: 1;
}

/* Text Truncate */
.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.2;
  max-height: calc(1.2em * 2);
}

/* Sticky Sidebar */
.sticky-top {
  top: 1rem;
}

/* Custom Scroll */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f3f4;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

/* Badge Styles */
.badge {
  font-size: 0.7em;
}

/* Button Hover Effects */
.btn {
  transition: all 0.2s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

/* Form Controls */
.form-control:focus,
.form-select:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

/* Responsive Adjustments */
@media (max-width: 767.98px) {
  .sticky-top {
    position: relative !important;
    top: auto !important;
  }
  
  .col-lg-4 {
    flex: 0 0 auto;
    width: 50%;
  }
}

@media (max-width: 575.98px) {
  .col-lg-4 {
    width: 100%;
  }
}

/* Loading Placeholder */
.placeholder-glow .placeholder {
  animation: placeholder-glow 2s ease-in-out infinite alternate;
}

@keyframes placeholder-glow {
  50% {
    opacity: 0.5;
  }
}

/* Card hover effects */
.card {
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Price styling */
.text-danger {
  color: #dc3545 !important;
}

.text-decoration-line-through {
  text-decoration: line-through !important;
}

/* Button group styling */
.btn-group .btn {
  border-radius: 0;
}

.btn-group .btn:first-child {
  border-top-left-radius: 0.375rem;
  border-bottom-left-radius: 0.375rem;
}

.btn-group .btn:last-child {
  border-top-right-radius: 0.375rem;
  border-bottom-right-radius: 0.375rem;
}

/* Pagination styling */
.pagination .page-link {
  color: #6c757d;
  border-color: #dee2e6;
}

.pagination .page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.pagination .page-link:hover {
  color: #0d6efd;
  background-color: #e9ecef;
  border-color: #dee2e6;
}

/* Object fit support for older browsers */
.object-fit-cover {
  object-fit: cover;
}

/* Filter sidebar styling */
.form-check-input:checked {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.form-check-input:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

/* Badge positioning */
.badge {
  font-weight: 500;
  letter-spacing: 0.025em;
}

/* Quick action buttons */
.btn-sm.rounded-circle {
  width: 2rem;
  height: 2rem;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* List view specific styling */
.card .row.g-0 .col-md-3 {
  max-height: 200px;
  overflow: hidden;
}

/* Custom utilities */
.text-truncate-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.min-vh-100 {
  min-height: 100vh;
}

/* Shadow utilities */
.shadow-sm {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075) !important;
}

/* Background utilities */
.bg-light {
  background-color: #f8f9fa !important;
}

/* Border utilities */
.border {
  border: 1px solid #dee2e6 !important;
}

/* Spacing utilities */
.gap-1 {
  gap: 0.25rem !important;
}

.gap-2 {
  gap: 0.5rem !important;
}

.gap-3 {
  gap: 1rem !important;
}

.gap-4 {
  gap: 1.5rem !important;
}

/* Position utilities */
.position-relative {
  position: relative !important;
}

.position-absolute {
  position: absolute !important;
}

.top-0 {
  top: 0 !important;
}

.start-0 {
  left: 0 !important;
}

.end-0 {
  right: 0 !important;
}

/* Display utilities */
.d-flex {
  display: flex !important;
}

.d-none {
  display: none !important;
}

/* Flex utilities */
.flex-column {
  flex-direction: column !important;
}

.flex-grow-1 {
  flex-grow: 1 !important;
}

.align-items-center {
  align-items: center !important;
}

.justify-content-between {
  justify-content: space-between !important;
}

.justify-content-center {
  justify-content: center !important;
}

.justify-content-md-end {
  justify-content: flex-end !important;
}

/* Text utilities */
.text-center {
  text-align: center !important;
}

.text-end {
  text-align: right !important;
}

.text-muted {
  color: #6c757d !important;
}

.text-dark {
  color: #212529 !important;
}

.text-primary {
  color: #0d6efd !important;
}

.text-success {
  color: #198754 !important;
}

/* Font weight utilities */
.fw-bold {
  font-weight: 700 !important;
}

.fw-semibold {
  font-weight: 600 !important;
}

/* Line height utilities */
.lh-base {
  line-height: 1.5 !important;
}

/* Margin utilities */
.mb-1 {
  margin-bottom: 0.25rem !important;
}

.mb-2 {
  margin-bottom: 0.5rem !important;
}

.mb-3 {
  margin-bottom: 0.75rem !important;
}

.mb-4 {
  margin-bottom: 1rem !important;
}

.mt-3 {
  margin-top: 0.75rem !important;
}

.mt-4 {
  margin-top: 1rem !important;
}

.mt-md-0 {
  margin-top: 0 !important;
}

.me-1 {
  margin-right: 0.25rem !important;
}

.me-3 {
  margin-right: 0.75rem !important;
}

.ms-1 {
  margin-left: 0.25rem !important;
}

/* Padding utilities */
.p-2 {
  padding: 0.5rem !important;
}

.p-3 {
  padding: 0.75rem !important;
}

.p-4 {
  padding: 1rem !important;
}

.p-5 {
  padding: 1.5rem !important;
}

.px-4 {
  padding-left: 1rem !important;
  padding-right: 1rem !important;
}

.py-4 {
  padding-top: 1rem !important;
  padding-bottom: 1rem !important;
}

.py-5 {
  padding-top: 1.5rem !important;
  padding-bottom: 1.5rem !important;
}

.ps-4 {
  padding-left: 1rem !important;
}

.pe-3 {
  padding-right: 0.75rem !important;
}

.pe-5 {
  padding-right: 1.5rem !important;
}

/* Width utilities */
.w-100 {
  width: 100% !important;
}

/* Height utilities */
.h-100 {
  height: 100% !important;
}

/* Overflow utilities */
.overflow-hidden {
  overflow: hidden !important;
}

/* Border radius utilities */
.rounded {
  border-radius: 0.375rem !important;
}

.rounded-circle {
  border-radius: 50% !important;
}

/* Animation and transition improvements */
.product-card,
.btn,
.form-control,
.form-select {
  transition: all 0.15s ease-in-out;
}

/* Focus states */
.btn:focus {
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

/* Hover improvements */
.product-card:hover {
  border-color: #0d6efd;
}

/* Loading state improvements */
.placeholder {
  background-color: currentColor;
  opacity: 0.5;
}

/* Print styles */
@media print {
  .product-actions,
  .pagination,
  .btn-group,
  .form-control,
  .form-select {
    display: none !important;
  }
}

.btn-main {
    color: #fff;
    background-color: #e62129;
    border: 1px solid #e62129;
}
</style>