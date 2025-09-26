<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useRoute } from "vue-router"

const route = useRoute()
const { $baseAPi, $baseUrlBE, $BASE_URL_BE } = useNuxtApp()

// State management
const product = ref<any>(null)
const selectedVariant = ref<any>(null)
const quantity = ref(1)
const activeImageIndex = ref(0)
const loading = ref(false)
const relatedProducts = ref<any[]>([])

// ---- Helpers
const getImageUrl = (imagePath: string | null) => {
  if (!imagePath) return '/placeholder-product.jpg'
  return `${$BASE_URL_BE}${imagePath}`
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)
}

// ---- API calls
const apiProductDetail = (slug: string | string[]) =>
  $baseAPi.get(`/v1/stores/78fb0c59-8d46-11f0-ae4e-b42e99edc3be/products/${slug}`).then(res => res.data)

const apiRelatedProducts = () =>
  $baseAPi.get('/v1/stores/78fb0c59-8d46-11f0-ae4e-b42e99edc3be/products?limit=4').then(res => res.data)

// ---- SSR/SSG fetch (SEO friendly)
const { data: productRes } = await useAsyncData(
  `product-${route.params.slug}`,
  () => apiProductDetail(route.params.slug)
)

if (productRes.value?.success) {
  product.value = productRes.value.data.product
  // Set default variant
  if (product.value?.variants?.length > 0) {
    selectedVariant.value = product.value.variants[0]
  }
}

// Client refresh for dynamic updates
onMounted(async () => {
  try {
    const freshProduct = await apiProductDetail(route.params.slug)
    if (freshProduct?.success) {
      product.value = freshProduct.data.product
      if (product.value?.variants?.length > 0 && !selectedVariant.value) {
        selectedVariant.value = product.value.variants[0]
      }
    }

    const freshRelated = await apiRelatedProducts()
    if (freshRelated?.success) {
      relatedProducts.value = freshRelated.data?.slice(0, 4) || []
    }
  } catch (e) {
    console.error(e)
  }
})

// ---- Computed properties
const currentPrice = computed(() => {
  if (selectedVariant.value) {
    return selectedVariant.value.pricing.sale_price || selectedVariant.value.pricing.regular_price
  }
  return product.value?.pricing?.sale_price || product.value?.pricing?.regular_price || 0
})

const originalPrice = computed(() => {
  if (selectedVariant.value) {
    return selectedVariant.value.pricing.regular_price
  }
  return product.value?.pricing?.regular_price || 0
})

const hasDiscount = computed(() => {
  return currentPrice.value < originalPrice.value
})

const discountPercentage = computed(() => {
  if (!hasDiscount.value) return 0
  return Math.round(((originalPrice.value - currentPrice.value) / originalPrice.value) * 100)
})

const isInStock = computed(() => {
  if (selectedVariant.value) {
    return selectedVariant.value.inventory.in_stock && selectedVariant.value.inventory.stock_quantity > 0
  }
  return product.value?.inventory?.in_stock || false
})

const stockQuantity = computed(() => {
  if (selectedVariant.value) {
    return selectedVariant.value.inventory.stock_quantity
  }
  return product.value?.inventory?.total_stock || 0
})

// ---- Methods
const selectVariant = (variant: any) => {
  selectedVariant.value = variant
  quantity.value = 1
}

const updateQuantity = (change: number) => {
  const newQty = quantity.value + change
  if (newQty >= 1 && newQty <= stockQuantity.value) {
    quantity.value = newQty
  }
}

const addToCart = () => {
  if (!isInStock.value) return
  
  loading.value = true
  // Simulate API call
  setTimeout(() => {
    loading.value = false
    alert('Produk berhasil ditambahkan ke keranjang!')
  }, 1000)
}

const buyNow = () => {
  if (!isInStock.value) return
  // Redirect to checkout or cart
  console.log('Buy now clicked')
}

// ---- SEO
useHead(() => {
  const title = product.value?.seo?.meta_title || product.value?.name || "Gudang Grosiran - Product"
  const desc = product.value?.seo?.meta_description || product.value?.description?.short || ""
  const img = product.value?.images?.cover || getImageUrl(null)
  const url = `https://gudanggrosiran.com/products/${product.value?.slug || route.params.slug}`

  return {
    title,
    meta: [
      { name: "description", content: desc },
      { name: "keywords", content: product.value?.seo?.meta_keywords || "" },
      { property: "og:title", content: product.value?.social?.og_title || title },
      { property: "og:description", content: product.value?.social?.og_description || desc },
      { property: "og:image", content: product.value?.social?.og_image || img },
      { property: "og:type", content: "product" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: desc },
      { name: "twitter:image", content: img }
    ],
    link: [{ rel: "canonical", href: product.value?.seo?.canonical_url || url }]
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <div class="container mx-auto px-4 py-6">
      
      <!-- Breadcrumb -->
      <nav aria-label="breadcrumb" class="mb-4">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><NuxtLink to="/">Home</NuxtLink></li>
          <li class="breadcrumb-item"><NuxtLink to="/products">Products</NuxtLink></li>
          <li class="breadcrumb-item active" aria-current="page">{{ product?.name }}</li>
        </ol>
      </nav>

      <div v-if="!product" class="card border-0 shadow-sm p-4 text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 mb-0">Memuat produk...</p>
      </div>

      <div v-else class="row">
        <!-- Product Images -->
        <div class="col-lg-6 mb-4">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-0">
              <!-- Main Image -->
              <div class="position-relative mb-3">
                <img 
                  :src="getImageUrl(product.images?.cover.url)" 
                  :alt="product.name"
                  class="img-fluid w-100 rounded-top"
                  style="height: 400px; object-fit: contain;"
                >
                <div v-if="hasDiscount" class="position-absolute top-0 start-0 m-3">
                  <span class="badge bg-danger fs-6">-{{ discountPercentage }}%</span>
                </div>
              </div>

              <!-- Thumbnail Gallery -->
              <div v-if="product.images?.gallery?.length > 0" class="px-3 pb-3">
                <div class="d-flex gap-2 overflow-auto">
                  <img
                    v-for="(image, index) in product.images.gallery"
                    :key="index"
                    :src="getImageUrl(image.url)"
                    :alt="`${product.name} ${index + 1}`"
                    class="border rounded cursor-pointer"
                    :class="{ 'border-primary': activeImageIndex === index }"
                    style="width: 80px; height: 80px; object-fit: cover;"
                    @click="activeImageIndex = index"
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Product Info -->
        <div class="col-lg-6 mb-4">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <!-- Brand -->
              <div v-if="product.brand" class="mb-2">
                <span class="badge bg-light text-dark border">{{ product.brand.name }}</span>
              </div>

              <!-- Title -->
              <h1 class="h3 fw-bold mb-3">{{ product.name }}</h1>

              <!-- Price -->
              <div class="mb-4">
                <div class="d-flex align-items-center gap-3">
                  <span class="h4 text-danger fw-bold mb-0">{{ formatPrice(currentPrice) }}</span>
                  <span v-if="hasDiscount" class="text-muted text-decoration-line-through">
                    {{ formatPrice(originalPrice) }}
                  </span>
                </div>
              </div>

              <!-- Short Description -->
              <div v-if="product.description?.short" class="mb-4">
                <p class="text-muted">{{ product.description.short }}</p>
              </div>

              <!-- Variants -->
              <div v-if="product.variants?.length > 0" class="mb-4">
                <label class="form-label fw-semibold">
                  {{ product.variants[0]?.attribute_name || 'Pilihan' }}:
                </label>
                <div class="d-flex flex-wrap gap-2">
                  <button
                    v-for="variant in product.variants"
                    :key="variant.id"
                    type="button"
                    class="btn btn-outline-primary"
                    :class="{ active: selectedVariant?.id === variant.id }"
                    @click="selectVariant(variant)"
                    :disabled="!variant.inventory.in_stock"
                  >
                    {{ variant.attribute_value }}
                    <small v-if="!variant.inventory.in_stock" class="d-block text-muted">
                      (Habis)
                    </small>
                  </button>
                </div>
              </div>

              <!-- Stock Status -->
              <div class="mb-4">
                <div v-if="isInStock" class="d-flex align-items-center text-success">
                  <i class="bi bi-check-circle-fill me-2"></i>
                  <span>Stok tersedia ({{ stockQuantity }} pcs)</span>
                </div>
                <div v-else class="d-flex align-items-center text-danger">
                  <i class="bi bi-x-circle-fill me-2"></i>
                  <span>Stok habis</span>
                </div>
              </div>

              <!-- Quantity -->
              <div v-if="isInStock" class="mb-4">
                <label class="form-label fw-semibold">Jumlah:</label>
                <div class="d-flex align-items-center gap-3">
                  <div class="input-group" style="width: 150px;">
                    <button 
                      class="btn btn-outline-secondary" 
                      type="button"
                      @click="updateQuantity(-1)"
                      :disabled="quantity <= 1"
                    >
                      <i class="bi bi-dash"></i>
                    </button>
                    <input 
                      v-model.number="quantity" 
                      type="number" 
                      class="form-control text-center"
                      :min="1"
                      :max="stockQuantity"
                    >
                    <button 
                      class="btn btn-outline-secondary" 
                      type="button"
                      @click="updateQuantity(1)"
                      :disabled="quantity >= stockQuantity"
                    >
                      <i class="bi bi-plus"></i>
                    </button>
                  </div>
                  <span class="text-muted">Maks. {{ stockQuantity }} pcs</span>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="d-flex gap-3">
                <button
                  type="button"
                  class="btn btn-outline-primary flex-fill"
                  :disabled="!isInStock || loading"
                  @click="addToCart"
                >
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="bi bi-cart-plus me-2"></i>
                  Tambah ke Keranjang
                </button>
                <button
                  type="button"
                  class="btn btn-primary flex-fill"
                  :disabled="!isInStock"
                  @click="buyNow"
                >
                  <i class="bi bi-lightning-fill me-2"></i>
                  Beli Sekarang
                </button>
              </div>

              <!-- Product Meta -->
              <div class="mt-4 pt-4 border-top">
                <div class="row text-sm">
                  <div class="col-sm-6 mb-2">
                    <strong>SKU:</strong> {{ product.sku }}
                  </div>
                  <div class="col-sm-6 mb-2">
                    <strong>Tipe:</strong> {{ product.type }}
                  </div>
                  <div class="col-sm-6 mb-2">
                    <strong>Berat:</strong> {{ product.specifications?.weight || '-' }} kg
                  </div>
                  <div class="col-sm-6 mb-2">
                    <strong>Status:</strong> 
                    <span class="badge bg-success ms-1">{{ product.status }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Product Description -->
      <div v-if="product?.description?.full" class="row mt-4">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-0">
              <h5 class="fw-bold mb-0">Deskripsi Produk</h5>
            </div>
            <div class="card-body">
              <div class="gg-prose" v-html="product.description.full"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Related Products -->
      <div v-if="relatedProducts.length > 0" class="row mt-4">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-0">
              <h5 class="fw-bold mb-0">Produk Terkait</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div 
                  v-for="item in relatedProducts" 
                  :key="item.id"
                  class="col-lg-3 col-md-4 col-sm-6 mb-4"
                >
                  <div class="card border-0 shadow-sm h-100">
                    <img 
                      :src="getImageUrl(item.images?.cover)" 
                      :alt="item.name"
                      class="card-img-top"
                      style="height: 200px; object-fit: cover;"
                    >
                    <div class="card-body">
                      <h6 class="card-title">{{ item.name }}</h6>
                      <p class="card-text text-danger fw-bold">{{ formatPrice(item.pricing?.sale_price || item.pricing?.regular_price) }}</p>
                      <NuxtLink 
                        :to="`/products/${item.slug}`" 
                        class="btn btn-primary btn-sm w-100"
                      >
                        Lihat Detail
                      </NuxtLink>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:root { 
  --main-color: #e62129; 
}

.cursor-pointer {
  cursor: pointer;
}

.gg-prose :where(h1,h2,h3) {
  margin-top: 1.25rem;
  margin-bottom: 0.75rem;
}

.gg-prose p {
  margin-bottom: 1rem;
  line-height: 1.8;
}

.gg-prose img {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

.gg-prose ul, .gg-prose ol {
  padding-left: 1.25rem;
  margin: 0.5rem 0 1rem;
}

.gg-prose blockquote {
  border-left: 4px solid var(--main-color);
  padding-left: 1rem;
  color: #6c757d;
}

.breadcrumb {
  --bs-breadcrumb-divider: '›';
}

.btn.active {
  background-color: var(--main-color) !important;
  border-color: var(--main-color) !important;
  color: white !important;
}

.text-sm {
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .d-flex.gap-3 {
    flex-direction: column;
  }
  
  .d-flex.gap-3 .btn {
    margin-bottom: 0.5rem;
  }
}
</style>