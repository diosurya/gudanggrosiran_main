<template>
  <section class="bestseller-section py-5 my-5">
    <div class="container">
      <!-- Section Header -->
      <div class="row mb-2 px-3">
        <div class="col-12">
          <h2 class="section-title mb-3">{{ title || 'Best Seller' }}</h2>
          <div class="title-divider mb-3">
            <i class="bi bi-award text-success"></i>
          </div>
          <p class="text-muted">
            {{ subtitle || 'A virtual assistant collects the products from your list' }}
          </p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="row">
        <div v-for="n in 6" :key="n" class="col-md-12 col-sm-6 col-md-4 col-lg-3 col-xl-2 mb-4">
          <div class="product-skeleton">
            <div class="skeleton-image"></div>
            <div class="skeleton-content">
              <div class="skeleton-title"></div>
              <div class="skeleton-weight"></div>
              <div class="skeleton-price"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="row">
        <div class="col-12">
          <div class="alert alert-danger text-center">
            <i class="bi bi-exclamation-triangle me-2"></i>
            {{ error }}
            <button @click="fetchProducts" class="btn btn-outline-danger btn-sm ms-3">
              <i class="bi bi-arrow-clockwise me-1"></i>
              Retry
            </button>
          </div>
        </div>
      </div>

      <!-- Products Grid -->
      <div v-else class="row">
        <div 
          v-for="product in displayedProducts" 
          :key="product.id" 
          class="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2 mb-4"
        >
          <div class="product-card h-100">
            <div class="product-image-wrapper position-relative">
              <img 
                :src="getProductImage(product)" 
                :alt="product.name" 
                class="product-image w-100"
                @error="handleImageError"
              >
              
              <!-- Best Seller Badge -->
              <div v-if="product.is_bestseller" class="bestseller-badge">
                <i class="bi bi-star-fill"></i>
                Best
              </div>
              
              <!-- Hover overlay with view button -->
              <!-- <div class="hover-overlay d-flex align-items-center justify-content-center">
                <button class="btn btn-view text-white fw-bold px-4 py-2" @click="viewProduct(product)">
                  View
                </button>
              </div> -->
              
              <!-- Action icons -->
              <div class="product-actions">
                <button 
                  class="action-btn" 
                  @click="toggleQuickView(product)" 
                  :title="'Quick View'"
                >
                  <i class="bi bi-eye"></i>
                </button>
                <button 
                  class="action-btn" 
                  @click="toggleCompare(product)" 
                  :title="'Compare'"
                >
                  <i class="bi bi-arrow-repeat"></i>
                </button>
                <button 
                  class="action-btn" 
                  @click="toggleWishlist(product)" 
                  :class="{ active: isInWishlist(product.id) }" 
                  :title="'Wishlist'"
                >
                  <i class="bi" :class="isInWishlist(product.id) ? 'bi-heart-fill' : 'bi-heart'"></i>
                </button>
              </div>
            </div>
            
            <!-- Product info -->
            <div class="product-info p-3">
              <h6 class="product-title mb-2">{{ product.name }}</h6>
              <div class="product-meta d-flex justify-content-between align-items-center mb-2">
                <span class="product-weight text-muted small">{{ formatWeight(product.weight) }}</span>
                <div v-if="product.rating" class="product-rating">
                  <i class="bi bi-star-fill text-warning"></i>
                  <span class="small">{{ product.rating }}</span>
                </div>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <div class="price-container">
                  <span v-if="product.discount_price" class="product-price-old text-muted small">
                    <!-- ${{ formatPrice(product.original_price) }} -->
                    Rp 17.000
                  </span>
                  <span class="product-price fw-bold text-main">
                    <!-- ${{ formatPrice(product.price || product.discount_price || product.original_price) }} -->
                    Rp 12.000
                  </span>
                </div>
                <button 
                  class="btn btn-outline-primary btn-sm add-to-cart-btn" 
                  @click="addToCart(product)"
                  :disabled="!product.in_stock"
                >
                  <i class="bi" :class="product.in_stock ? 'bi-plus' : 'bi-x'"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Load More Button -->
      <div v-if="hasMore && !loading" class="row mt-4">
        <div class="col-12 text-center">
          <button 
            @click="loadMore" 
            class="btn btn-outline-danger px-5 py-2"
            :disabled="loadingMore"
          >
            <span v-if="loadingMore">
              <i class="bi bi-arrow-clockwise spin me-2"></i>
              Loading...
            </span>
            <span v-else>
              See More
            </span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  title: { type: String, default: 'Best Seller' },
  subtitle: { type: String, default: 'Produk dummy random' },
  limit: { type: Number, default: 10 },
  category: { type: String, default: null }
})

// Reactive data
const products = ref([])
const displayedProducts = ref([])
const loading = ref(true)
const loadingMore = ref(false)
const error = ref(null)
const hasMore = ref(true)
const currentPage = ref(1)
const wishlist = ref([])

// jumlah produk per halaman
const perPage = computed(() => props.limit)

// ⬇️ Fallback data generator (dummy random)
const getFallbackData = (count = 8, startId = 1) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: startId + i,
    name: `Produk Dummy ${startId + i}`,
    image: `https://picsum.photos/seed/${Math.random().toString(36).substring(2,8)}/300/300`,
    price: Math.floor(Math.random() * 50000) + 10000,
    original_price: Math.floor(Math.random() * 70000) + 60000,
    weight: 1000,
    rating: (Math.random() * 5).toFixed(1),
    in_stock: Math.random() > 0.2,
    is_bestseller: Math.random() > 0.5
  }))
}

// ⬇️ Pura-pura fetch, padahal isi dummy
const fetchProducts = async (page = 1, append = false) => {
  try {
    if (page === 1) {
      loading.value = true
      error.value = null
    } else {
      loadingMore.value = true
    }

    // ❌ API dimatiin, langsung pakai dummy
    const newProducts = getFallbackData(perPage.value, (page - 1) * perPage.value + 1)

    if (append) {
      products.value.push(...newProducts)
      displayedProducts.value = [...products.value]
    } else {
      products.value = newProducts
      displayedProducts.value = newProducts
    }

    hasMore.value = products.value.length < 8 // max 40 produk
    currentPage.value = page
  } catch (err) {
    console.error('Error fetching products:', err)
    error.value = 'Failed to load dummy products'
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const loadMore = async () => {
  if (!hasMore.value || loadingMore.value) return
  await fetchProducts(currentPage.value + 1, true)
}

// Utility functions
const getProductImage = (product) =>
  product.image || 'https://via.placeholder.com/300x300?text=No+Image'

const formatPrice = (price) =>
  typeof price === 'number'
    ? price.toLocaleString("id-ID")
    : parseFloat(price || 0).toLocaleString("id-ID")

const formatWeight = (weight) => `${weight / 1000} KG`

const handleImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/300x300?text=No+Image'
}

// Product actions
const addToCart = (product) => {
  if (!product.in_stock) return
  console.log('Add to cart:', product)
}

const toggleWishlist = (product) => {
  const index = wishlist.value.findIndex(id => id === product.id)
  if (index > -1) wishlist.value.splice(index, 1)
  else wishlist.value.push(product.id)
}

const isInWishlist = (id) => wishlist.value.includes(id)

const toggleQuickView = (product) => console.log('Quick view:', product)
const toggleCompare = (product) => console.log('Compare:', product)

// Lifecycle
onMounted(() => {
  fetchProducts()
})
</script>


<style scoped>
/* Section Styling */
.bestseller-section {
/*  background: #f8f9fa; */
  background: #fff;
}

.section-title {
  color: #2c3e50;
  /* font-size: 2.5rem; */
  font-weight: 700;
  margin-bottom: 1rem;
}

.title-divider {
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #28a745, #20c997);
  border-radius: 2px;
  position: relative;
}

.title-divider i {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  background: #f8f9fa;
  padding: 0 10px;
  font-size: 1.2rem;
}

.section-subtitle {
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
}

/* Product Card Styling - Same as ProductBox */
.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.product-image-wrapper {
  overflow: hidden;
  background-color: #f8f9fa;
  aspect-ratio: 1;
}

.product-image {
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

/* Best Seller Badge */
.bestseller-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: linear-gradient(45deg, #ff6b35, #f7931e);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(255, 107, 53, 0.3);
}

.bestseller-badge i {
  font-size: 0.6rem;
  margin-right: 2px;
}

/* Hover overlay - Same as ProductBox */
.hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 2;
}

.product-card:hover .hover-overlay {
  opacity: 1;
}

.btn-view {
  background: rgba(52, 144, 220, 0.9);
  border: 2px solid white;
  border-radius: 6px;
  font-size: 14px;
  letter-spacing: 0.5px;
  transform: translateY(10px);
  transition: all 0.3s ease;
}

.product-card:hover .btn-view {
  transform: translateY(0);
}

.btn-view:hover {
  background: rgba(52, 144, 220, 1);
  transform: scale(1.05);
}

/* Action buttons - Same as ProductBox */
.product-actions {
  position: absolute;
  bottom: 15px;
  left: 15px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
  z-index: 3;
}

.product-card:hover .product-actions {
  opacity: 1;
  transform: translateY(0);
}

.action-btn {
  width: 32px;
  height: 32px;
  background: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
  color: #666;
}

.action-btn:hover {
  background: #e62129;
  color: white;
  transform: scale(1.1);
}

.action-btn.active {
  background: #e74c3c;
  color: white;
}

/* Product info */
.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-title {
  color: #2c3e50;
  font-size: 14px;
  line-height: 1.4;
  height: 2.8em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-weight {
  font-size: 12px;
  color: #7f8c8d;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 4px;
}

.price-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.product-price-old {
  text-decoration: line-through;
  font-size: 12px;
}

.product-price {
  color: #e62129;
  font-size: 16px;
}

.add-to-cart-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid #e62129;
  color: #e62129;
  transition: all 0.2s ease;
}

.add-to-cart-btn:hover:not(:disabled) {
  background: #e62129;
  color: white;
  transform: scale(1.1);
}

.add-to-cart-btn:disabled {
  border-color: #dc3545;
  color: #dc3545;
  cursor: not-allowed;
}

/* Loading Skeleton */
.product-skeleton {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  height: 100%;
}

.skeleton-image {
  aspect-ratio: 1;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

.skeleton-content {
  padding: 1rem;
}

.skeleton-title {
  height: 16px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 8px;
}

.skeleton-weight {
  height: 12px;
  width: 60%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 8px;
}

.skeleton-price {
  height: 16px;
  width: 40%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}

/* Loading Animation */
@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsive */


@media (max-width: 576px) {
  .section-title {
    font-size: 2rem;
  }
  
  .product-title {
    font-size: 13px;
  }
  
  .product-price {
    font-size: 15px;
  }
}
</style>