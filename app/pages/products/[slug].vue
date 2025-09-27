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
const isDescriptionExpanded = ref(false)
const showImageModal = ref(false)
const modalImageIndex = ref(0)
const isProductLoading = ref(true)
const isRelatedLoading = ref(true)
const modalImageLoading = ref(false)
const selectedStore = ref(null)

// Function to get current selected store
const getCurrentStore = () => {
  if (process.client && window.getSelectedStoreData) {
    return window.getSelectedStoreData()
  }
  return null
}

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
  isProductLoading.value = false
}

// Client refresh for dynamic updates
onMounted(async () => {
  try {
     selectedStore.value = getCurrentStore()
  
    // Listen for store location changes
    if (process.client) {
      window.addEventListener('storeLocationChanged', (event) => {
        selectedStore.value = event.detail.storeData
      })
    }
    
    console.log('Product data:', product.value)
    console.log('Cover image:', product.value?.cover_image)
    console.log('Images cover:', product.value?.images?.cover)
    console.log('Gallery:', product.value?.images?.gallery)
    
    if (!product.value) {
      const freshProduct = await apiProductDetail(route.params.slug)
      if (freshProduct?.success) {
        product.value = freshProduct.data.product
        if (product.value?.variants?.length > 0 && !selectedVariant.value) {
          selectedVariant.value = product.value.variants[0]
        }
      }
      isProductLoading.value = false
    }

    const freshRelated = await apiRelatedProducts()
    if (freshRelated?.success) {
      relatedProducts.value = freshRelated.data?.slice(0, 4) || []
    }
    isRelatedLoading.value = false
  } catch (e) {
    console.error(e)
    isProductLoading.value = false
    isRelatedLoading.value = false
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

const allImages = computed(() => {
  const images = []
  
  // 1. Jika ada variant terpilih dan memiliki images, prioritaskan images variant
  if (selectedVariant.value?.images?.length > 0) {
    selectedVariant.value.images.forEach(img => {
      images.push({
        id: img.id,
        url: img.url,
        sort_order: parseInt(img.sort_order) || 0,
        alt: `${product.value?.name} - ${selectedVariant.value?.attribute_value}`
      })
    })
  } else {
    // 2. Fallback ke images produk utama - SELALU tampilkan semua images
    const imageCover = product.value?.images?.cover
    const gallery = product.value?.images?.gallery || []
    
    // Prioritaskan cover di urutan pertama
    if (imageCover) {
      images.push({
        id: imageCover.id,
        url: imageCover.url,
        sort_order: -1, // Negatif agar selalu pertama
        alt: product.value?.name
      })
    }
    
    // Tambahkan semua gallery images, termasuk yang sama dengan cover
    gallery.forEach(img => {
      images.push({
        id: img.id,
        url: img.url,
        sort_order: parseInt(img.sort_order) || 0,
        alt: product.value?.name
      })
    })
  }
  
  return images.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
})

const truncatedDescription = computed(() => {
  const fullDesc = product.value?.description?.full || ''
  if (!fullDesc || isDescriptionExpanded.value) return fullDesc
  
  // Check if we're on client side (browser)
  if (typeof document !== 'undefined') {
    // Client-side: Use DOM for accurate text extraction
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = fullDesc
    const textContent = tempDiv.textContent || tempDiv.innerText || ''
    
    // If text is short, return original HTML
    if (textContent.length <= 300) return fullDesc
    
    // Create truncated version
    const truncatedText = textContent.substring(0, 300) + '...'
    return `<p>${truncatedText}</p>`
  } else {
    // Server-side: Simple text truncation without DOM manipulation
    // Remove HTML tags for length calculation using regex
    const textContent = fullDesc.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, '')
    
    if (textContent.length <= 300) return fullDesc
    
    const truncatedText = textContent.substring(0, 300) + '...'
    return `<p>${truncatedText}</p>`
  }
})

// WHATSAPP
const generateWhatsAppMessage = (type: 'inquiry' | 'order') => {
  if (!product.value) return ''
  
  const productName = product.value.name
  const productUrl = `${window.location.origin}/products/${product.value.slug}`
  const currentPriceFormatted = formatPrice(currentPrice.value)
  const variantText = selectedVariant.value ? ` - ${selectedVariant.value.attribute_value}` : ''
  const quantityText = quantity.value > 1 ? ` (${quantity.value} pcs)` : ''
  
  let message = ''
  
  if (type === 'inquiry') {
    message = `Halo Kak, saya ingin bertanya tentang produk *${productName}${variantText}* dengan harga ${currentPriceFormatted}. Bisakah Anda memberikan informasi lebih detail tentang produk ini? Terima kasih!

Saya melihat dari link produk: ${productUrl}`
  } else {
    message = `Halo Kak, saya ingin memesan produk *${productName}${variantText}${quantityText}* dengan harga ${currentPriceFormatted}. Bisakah Anda membantu proses pemesanannya? Terima kasih!

Saya melihat dari link produk: ${productUrl}`
  }
  
  return encodeURIComponent(message)
}

const openWhatsApp = (type: 'inquiry' | 'order') => {
  const currentStore = selectedStore.value || getCurrentStore()
  
  // Extract phone number from store data and format it properly
  let phoneNumber = '6281130757550' // fallback default
  
  if (currentStore && currentStore.phone) {
    // Remove any non-digit characters and ensure it starts with 62
    let cleanPhone = currentStore.phone.replace(/\D/g, '')
    
    // If it starts with 0, replace with 62
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.substring(1)
    }
    // If it doesn't start with 62, add it
    else if (!cleanPhone.startsWith('62')) {
      cleanPhone = '62' + cleanPhone
    }
    
    phoneNumber = cleanPhone
  }
  const message = generateWhatsAppMessage(type)
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`
  
  console.log('Opening WhatsApp for store:', currentStore?.name, 'Phone:', phoneNumber)
  
  window.open(whatsappUrl, '_blank')
}

const currentStorePhone = computed(() => {
  const store = selectedStore.value || getCurrentStore()
  if (store && store.phone) {
    let cleanPhone = store.phone.replace(/\D/g, '')
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.substring(1)
    } else if (!cleanPhone.startsWith('62')) {
      cleanPhone = '62' + cleanPhone
    }
    return cleanPhone
  }
  return '6281130757550' // fallback
})



// ---- Methods
const selectVariant = (variant: any) => {
  selectedVariant.value = variant
  quantity.value = 1
  activeImageIndex.value = 0 // Reset to first image when variant changes
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

const openImageModal = (index: number) => {
  modalImageIndex.value = index
  showImageModal.value = true
  modalImageLoading.value = true
}

const nextModalImage = () => {
  modalImageLoading.value = true
  modalImageIndex.value = (modalImageIndex.value + 1) % allImages.value.length
}

const prevModalImage = () => {
  modalImageLoading.value = true
  modalImageIndex.value = modalImageIndex.value === 0 ? allImages.value.length - 1 : modalImageIndex.value - 1
}

const onModalImageLoad = () => {
  modalImageLoading.value = false
}

const toggleDescription = () => {
  isDescriptionExpanded.value = !isDescriptionExpanded.value
}

// ---- SEO
useHead(() => {
  const title = product.value?.seo?.meta_title + ' - Gudang Grosiran'  || product.value?.name + ' - Gudang Grosiran' || "Gudang Grosiran - Product"
  const desc = product.value?.seo?.meta_description || product.value?.description?.short || ""
  const img = product.value?.images?.cover || getImageUrl(null)
  const url = `https://gudanggrosiran.com/products/${product.value?.slug || route.params.slug}`

  return {
    title,
    meta: [
      { name: "description", content: desc},
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
      
      <!-- Product Loading Skeleton -->
      <div v-if="isProductLoading" class="row">
        <!-- Image Skeleton -->
        <div class="col-lg-6 mb-4">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-0">
              <div class="skeleton" style="height: 400px; border-radius: 0.375rem 0.375rem 0 0;"></div>
              <div class="px-3 pb-3 pt-3">
                <div class="d-flex gap-2">
                  <div v-for="i in 4" :key="i" class="skeleton" style="width: 80px; height: 80px; border-radius: 0.375rem;"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Product Info Skeleton -->
        <div class="col-lg-6 mb-4">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <div class="skeleton skeleton-text mb-3" style="width: 100px; height: 24px;"></div>
              <div class="skeleton skeleton-text mb-3" style="width: 80%; height: 32px;"></div>
              
              <div class="d-flex align-items-center gap-3 mb-4">
                <div class="skeleton skeleton-text" style="width: 120px; height: 28px;"></div>
                <div class="skeleton skeleton-text" style="width: 100px; height: 20px;"></div>
              </div>

              <div class="skeleton skeleton-text mb-4" style="width: 100%; height: 60px;"></div>
              
              <div class="mb-4">
                <div class="skeleton skeleton-text mb-2" style="width: 80px; height: 16px;"></div>
                <div class="d-flex gap-2">
                  <div v-for="i in 3" :key="i" class="skeleton" style="width: 80px; height: 38px; border-radius: 0.375rem;"></div>
                </div>
              </div>

              <div class="skeleton skeleton-text mb-4" style="width: 150px; height: 20px;"></div>
              <div class="skeleton skeleton-text mb-4" style="width: 200px; height: 40px;"></div>

              <div class="d-flex gap-3">
                <div class="skeleton flex-fill" style="height: 46px; border-radius: 0.375rem;"></div>
                <div class="skeleton flex-fill" style="height: 46px; border-radius: 0.375rem;"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actual Product Content -->
      <div v-else-if="product" class="row">
        <!-- Product Images -->
        <div class="col-lg-6 mb-4">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-0">
              <!-- Main Image -->
              <div class="position-relative mb-3">
                <img 
                  :src="getImageUrl(allImages[activeImageIndex]?.url)" 
                  :alt="allImages[activeImageIndex]?.alt || product.name"
                  class="img-fluid w-100 rounded-top cursor-pointer"
                  style="height: 400px; object-fit: contain;"
                  @click="openImageModal(activeImageIndex)"
                >
                <div v-if="hasDiscount" class="position-absolute top-0 start-0 m-3">
                  <span class="badge bg-danger fs-6">-{{ discountPercentage }}%</span>
                </div>
              </div>

              <!-- Thumbnail Gallery -->
              <div v-if="allImages.length > 0" class="px-3 pb-3">
                <div class="d-flex gap-2 overflow-auto">
                  <img
                    v-for="(image, index) in allImages"
                    :key="image.id"
                    :src="getImageUrl(image.url)"
                    :alt="image.alt"
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
                    class="btn btn-outline-main"
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
              <!-- <div v-if="isInStock" class="mb-4">
                <label class="form-label fw-semibold">Jumlah:</label>
                <div class="d-flex align-items-center gap-3">
                  <div class="input-group" style="width: 150px;">
                    <button 
                      class="btn btn-outline-secondary" 
                      type="button"
                      @click="updateQuantity(-1)"
                      :disabled="quantity <= 1"
                      disabled
                    >
                      <i class="bi bi-dash"></i>
                    </button>
                    <input 
                      v-model.number="quantity" 
                      type="number" 
                      class="form-control text-center"
                      :min="1"
                      :max="stockQuantity"
                      readonly
                    >
                    <button 
                      class="btn btn-outline-secondary" 
                      type="button"
                      @click="updateQuantity(1)"
                      disabled
                    >
                      <i class="bi bi-plus"></i>
                    </button>
                  </div>
                  <span class="text-muted">Maks. {{ stockQuantity }} pcs</span>
                </div>
              </div> -->

              <!-- Action Buttons -->
               
              <!-- WhatsApp Button -->
              <!-- Action Buttons -->
              <div class="d-flex gap-3">
                <button
                  type="button"
                  class="btn btn-outline-success flex-fill"
                  :disabled="!isInStock"
                  @click="openWhatsApp('inquiry')"
                >
                  <i class="bi bi-whatsapp me-2"></i>
                  Tanya via WhatsApp
                </button>
                <button
                  type="button" 
                  class="btn btn-success flex-fill"
                  :disabled="!isInStock"
                  @click="openWhatsApp('order')"
                >
                  <i class="bi bi-whatsapp me-2"></i>
                  Pesan Sekarang
                </button>
              </div>
              <!-- <div class="d-flex gap-3">
                <button
                  type="button"
                  class="btn btn-outline-main flex-fill"
                  :disabled="!isInStock || loading"
                  @click="addToCart"
                disabled>
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="bi bi-cart-plus me-2"></i>
                  Tambah ke Keranjang
                </button>
                <button
                  type="button"
                  class="btn btn-main flex-fill"
                  :disabled="!isInStock"
                  @click="buyNow"
                  disabled
                >
                  <i class="bi bi-lightning-fill me-2"></i>
                  Beli Sekarang
                </button>
              </div> -->

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

      <!-- Product Not Found -->
      <div v-else class="card border-0 shadow-sm p-4 text-center">
        <div class="text-muted">
          <i class="bi bi-exclamation-triangle display-4 mb-3"></i>
          <p class="mb-0">Produk tidak ditemukan</p>
        </div>
      </div>

      <!-- Product Description -->
      <div v-if="product?.description?.full && !isProductLoading" class="row mt-4">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-0">
              <h5 class="fw-bold mb-0">Deskripsi Produk</h5>
            </div>
            <div class="card-body">
              <div class="gg-prose position-relative" v-html="truncatedDescription"></div>
              
              <!-- Show More/Less Button -->
              <div v-if="product.description.full.length > 300" class="text-center mt-3">
                <button 
                  type="button" 
                  class="btn btn-outline-main btn-sm"
                  @click="toggleDescription"
                >
                  <i class="bi" :class="isDescriptionExpanded ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
                  {{ isDescriptionExpanded ? 'Tampilkan Sedikit' : 'Tampilkan Semua' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Related Products Loading -->
      <div v-if="isRelatedLoading" class="row mt-4">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-0">
              <div class="skeleton skeleton-text" style="width: 150px; height: 24px;"></div>
            </div>
            <div class="card-body">
              <div class="row">
                <div v-for="i in 4" :key="i" class="col-lg-3 col-md-4 col-sm-6 mb-4">
                  <div class="card border-0 shadow-sm h-100">
                    <div class="skeleton" style="height: 200px; border-radius: 0.375rem 0.375rem 0 0;"></div>
                    <div class="card-body">
                      <div class="skeleton skeleton-text mb-2" style="width: 80%; height: 18px;"></div>
                      <div class="skeleton skeleton-text mb-3" style="width: 60%; height: 20px;"></div>
                      <div class="skeleton w-100" style="height: 32px; border-radius: 0.375rem;"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Related Products -->
      <div v-else-if="relatedProducts.length > 0" class="row mt-4">
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

    <!-- Image Modal -->
    <div v-if="showImageModal" class="modal fade show d-block" style="background-color: rgba(0,0,0,0.9);" @click.self="showImageModal = false">
      <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content bg-transparent border-0">
          <div class="modal-header border-0 pb-0">
            <button type="button" class="btn-close btn-close-white" @click="showImageModal = false"></button>
          </div>
          <div class="modal-body text-center p-0 position-relative">
            <!-- Loading Skeleton -->
            <div v-if="modalImageLoading" class="d-flex justify-content-center align-items-center" style="height: 80vh;">
              <div class="spinner-border text-light" style="width: 3rem; height: 3rem;" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>

            <!-- Main Modal Image -->
            <div class="position-relative" :class="{ 'd-none': modalImageLoading }">
              <img 
                :src="getImageUrl(allImages[modalImageIndex]?.url)" 
                :alt="allImages[modalImageIndex]?.alt"
                class="img-fluid modal-image"
                style="max-height: 80vh; max-width: 100%; transition: opacity 0.3s ease;"
                @load="onModalImageLoad"
              >
              
              <!-- Navigation Arrows -->
              <button 
                v-if="allImages.length > 1"
                type="button" 
                class="btn btn-light btn-lg position-absolute top-50 start-0 translate-middle-y ms-3 modal-nav-btn"
                @click="prevModalImage"
              >
                <i class="bi bi-chevron-left"></i>
              </button>
              
              <button 
                v-if="allImages.length > 1"
                type="button" 
                class="btn btn-light btn-lg position-absolute top-50 end-0 translate-middle-y me-3 modal-nav-btn"
                @click="nextModalImage"
              >
                <i class="bi bi-chevron-right"></i>
              </button>
            </div>
            
            <!-- Image Counter -->
            <div v-if="allImages.length > 1" class="mt-3">
              <span class="text-white fs-5">{{ modalImageIndex + 1 }} / {{ allImages.length }}</span>
            </div>

            <!-- Thumbnail Navigation -->
            <div v-if="allImages.length > 1" class="mt-3 px-3">
              <div class="d-flex justify-content-center gap-2 overflow-auto">
                <img
                  v-for="(image, index) in allImages"
                  :key="`modal-thumb-${image.id}`"
                  :src="getImageUrl(image.url)"
                  :alt="image.alt"
                  class="border rounded cursor-pointer modal-thumbnail"
                  :class="{ 'border-primary border-3': modalImageIndex === index, 'border-secondary': modalImageIndex !== index }"
                  style="width: 60px; height: 60px; object-fit: cover; opacity: 0.7; transition: all 0.2s ease;"
                  :style="{ opacity: modalImageIndex === index ? 1 : 0.7 }"
                  @click="modalImageIndex = index; modalImageLoading = true"
                >
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

/* Skeleton Styles */
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

.skeleton-text {
  border-radius: 4px;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Modal Styles */
.modal.show {
  display: block;
}

.btn-close-white {
  filter: invert(1) grayscale(100%) brightness(200%);
}

.modal-image {
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.modal-nav-btn {
  opacity: 0.8;
  transition: all 0.2s ease;
}

.modal-nav-btn:hover {
  opacity: 1;
  transform: scale(1.05);
}

.modal-thumbnail {
  transition: all 0.3s ease;
}

.modal-thumbnail:hover {
  opacity: 1 !important;
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .d-flex.gap-3 {
    flex-direction: column;
  }
  
  .d-flex.gap-3 .btn {
    margin-bottom: 0.5rem;
  }
  
  .modal-dialog {
    margin: 1rem;
  }
}

@media (max-width: 576px) {
  .modal-xl {
    max-width: calc(100vw - 2rem);
  }
}
</style>