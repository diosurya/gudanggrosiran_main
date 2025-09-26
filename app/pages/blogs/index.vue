<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import axios from "axios"
import { useRoute } from "vue-router"
const { $baseAPi, $baseUrlBE, $BASE_URL_BE } = useNuxtApp()

const blogs = ref<any[]>([])
const latestPosts = ref<any[]>([])
const loading = ref(true)
const route = useRoute()
const popularTags = ref<any[]>([])

// Pagination
const currentPage = ref(1)
const totalPages = ref(1)
const totalItems = ref(0)
const perPage = ref(12)

useHead({
  title: "Blog Terbaru dan Artikel Menarik - Gudang Grosiran",
  meta: [
    { name: "description", content: "Blog Terbaru dan Artikel Menarik Gudang Grosiran" },
    { name: "keywords", content: "artikel gudang grosiran, ecommerce, grosir, belanja murah, kualitas premium, belanja partai" },
    { property: "og:title", content: "Blog Terbaru dan Artikel Menarik Gudang Grosiran" },
    { property: "og:description", content: "Blog Terbaru dan Artikel Menarik Gudang Grosiran" },
  ]
})

const fetchBlogs = async (page: number = 1) => {
  loading.value = true
  try {
    const res = await $baseAPi.get(`/v1/blogs?page=${page}&per_page=${perPage.value}`)
    if (res.data.success) {
      blogs.value = res.data.data
      
      // Update pagination info jika API mengembalikan meta data
      if (res.data.meta) {
        currentPage.value = res.data.meta.current_page
        totalPages.value = res.data.meta.last_page
        totalItems.value = res.data.meta.total
        perPage.value = res.data.meta.per_page
      }

      // ambil 3 post terbaru untuk sidebar
      latestPosts.value = blogs.value.slice(0, 3)
    }
  } catch (err) {
    console.error("Gagal ambil blogs:", err)
  } finally {
    loading.value = false
  }
}

const fetchPopularTags = async () => {
  try {
    const res = await $baseAPi.get(`/v1/tags`)
    if (res.data.success) {
      popularTags.value = res.data.data
    }
  } catch (err) {
    console.error("Gagal ambil tags:", err)
  }
}


const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    fetchBlogs(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

onMounted(() => {
  fetchBlogs()
  fetchPopularTags()
})

// Format tanggal
const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short', 
    year: 'numeric'
  })
}

// Format reading time
const formatReadingTime = (readingTime: string | number) => {
  if (!readingTime || readingTime === '0') return '5 min read'
  return `${readingTime} min read`
}

// Truncate text
const truncateText = (text: string, length: number = 150) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

// Get full image URL
const getImageUrl = (imagePath: string | null) => {

  // pastikan imagePath sudah sesuai dengan storage path
  return `${$BASE_URL_BE}/storage/${imagePath}`
}

// Get visible pages for pagination
const getVisiblePages = () => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = 'https://via.placeholder.com/400x200/e3f2fd/1976d2?text=Blog+Image'
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 mb-5">

    <div class="container mx-auto px-4 py-6">
      <!-- Enhanced Header -->
      <div class="mb-5">
        <div class="row">
          <div class="col-lg-8">
            <h1 class="fw-bold text-dark position-relative">
              Blog Terbaru dan Artikel Menarik
              <!-- <div class="position-absolute start-50 translate-middle-x mt-2 bg-main" style="width: 80px; height: 3px;"></div> -->
            </h1>
            <p class="lead text-muted mb-5">Rekomendasi, solusi dan tips bermanfaat buat Kamu</p>
            <div class="d-flex justify-content-center align-items-center text-muted small">
              <span class="me-3"><i class="fas fa-newspaper me-1"></i>{{ blogs.length }} Artikel</span>
              <span class="me-3"><i class="fas fa-clock me-1"></i>Update Terbaru</span>
              <span><i class="fas fa-eye me-1"></i>Tips & Panduan</span>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-4">
        <!-- Blog Grid Section -->
        <div class="col-lg-8 col-md-7">
          <!-- Loading State -->
          <div v-if="loading" class="row g-4">
            <!-- Skeleton Cards -->
            <div 
              v-for="n in 6" 
              :key="`skeleton-${n}`"
              class="col-lg-6 col-md-12 col-sm-6"
            >
              <div class="card h-100 border-0 shadow-sm">
                <div class="skeleton skeleton-img" style="height: 200px;"></div>
                <div class="card-body">
                  <div class="d-flex justify-content-between mb-2">
                    <div class="skeleton skeleton-text" style="width: 100px; height: 12px;"></div>
                    <div class="skeleton skeleton-text" style="width: 60px; height: 12px;"></div>
                  </div>
                  <div class="skeleton skeleton-text mb-2" style="width: 90%; height: 16px;"></div>
                  <div class="skeleton skeleton-text mb-3" style="width: 80%; height: 16px;"></div>
                  <div class="skeleton skeleton-text mb-2" style="width: 100%; height: 12px;"></div>
                  <div class="skeleton skeleton-text mb-2" style="width: 85%; height: 12px;"></div>
                  <div class="skeleton skeleton-text mb-3" style="width: 70%; height: 12px;"></div>
                  <div class="d-flex justify-content-between align-items-center pt-3 border-top">
                    <div class="skeleton skeleton-btn" style="width: 120px; height: 32px;"></div>
                    <div class="skeleton skeleton-text" style="width: 30px; height: 12px;"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Blog Cards Grid -->
          <div v-else class="row g-4">
            <div 
              v-for="blog in blogs" 
              :key="blog.slug" 
              class="col-lg-6 col-md-12 col-sm-6"
            >
              <div class="card h-100 border-0 shadow-sm hover-lift transition-all">
                <div class="position-relative overflow-hidden">
                  <NuxtLink :to="`/blogs/${blog.slug}`" class="text-decoration-none">
                    <img 
                      :src="getImageUrl(blog.cover_image)" 
                      :alt="blog.title" 
                      class="card-img-top hover-zoom transition-transform"
                      style="height: 200px; object-fit: cover;"
                    />
                  </NuxtLink>
                  <div class="position-absolute top-0 start-0 m-2">
                    <span class="badge bg-main bg-opacity-90 text-white">
                      <i class="fas fa-circle-check me-1"></i>{{ blog.status }}
                    </span>
                  </div>
                  <div class="position-absolute top-0 end-0 m-2">
                    <!-- <span class="badge bg-main bg-opacity-90 text-white">
                      <i class="fas fa-clock me-1"></i>{{ formatReadingTime(blog.reading_time) }}
                    </span> -->
                  </div>
                  <!-- <div class="position-absolute bottom-0 start-0 end-0 bg-gradient-to-t from-dark to-transparent p-3">
                    <div class="d-flex align-items-center text-white small">
                      <i class="fas fa-eye me-1"></i>
                      <span class="me-3">{{ blog.view_count || 0 }} views</span>
                      <i class="fas fa-star me-1"></i>
                      <span>{{ parseFloat(blog.average_rating).toFixed(1) }}</span>
                    </div>
                  </div> -->
                </div>
                
                <div class="card-body d-flex flex-column">
                  <div class="d-flex align-items-center justify-content-between text-muted small mb-2">
                    <div class="d-flex align-items-center">
                      <i class="bi bi-calendar me-2"></i>
                      <span class="me-3">{{ formatDate(blog.created_at) }}</span>
                    </div>
                    <div class="d-flex align-items-center">
                      <span class="badge bg-light text-dark"></span>
                    </div>
                  </div>
                  
                  <NuxtLink :to="`/blogs/${blog.slug}`" class="text-decoration-none">
                    <h5 class="card-title text-dark mb-3 hover-text-main transition-colors line-clamp-2">
                      {{ blog.title }}
                    </h5>
                  </NuxtLink>
                  
                  <p class="card-text text-muted flex-grow-1 line-clamp-3">
                    {{ blog.excerpt }}
                  </p>
                  
                  <div class="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                    <NuxtLink 
                      :to="`/blogs/${blog.slug}`" 
                      class="btn btn-main btn-sm fw-medium hover-shadow-sm transition-all"
                      style="color: #e62129 !important;"
                    >
                      <i class="bi bi-arrow-right-short me-1"></i>
                      Baca Selengkapnya
                    </NuxtLink>
                    <div class="d-flex align-items-center text-muted small">
                      <i class="bi bi-person me-1"></i>
                      <span>{{ blog.author_name }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Enhanced Sidebar -->
        <div class="col-lg-4 col-md-5">
          <div class="sticky-top" style="top: 1rem;">
            
            <!-- Search Box -->
            <!-- <div class="card border-0 shadow-sm mb-4">
              <div class="card-body">
                <h6 class="fw-bold text-dark mb-3">
                  <i class="fas fa-search text-primary me-2"></i>Pencarian
                </h6>
                <div class="input-group">
                  <input 
                    type="text" 
                    class="form-control border-0 bg-light" 
                    placeholder="Cari artikel..."
                  >
                  <button class="btn btn-main text-white" type="button">
                    <i class="fas fa-search"></i>
                  </button>
                </div>
              </div>
            </div> -->

            <!-- Latest Posts -->
            <div class="card border-0 shadow-sm mb-4">
              <div class="card-body bg-white border-0 pb-0">
                <h6 class="fw-bold text-dark mb-0">
                  Latest Posts
                </h6>
              </div>
              <div class="card-body pt-3">
                <div class="d-flex flex-column gap-3">
                  <div 
                    v-for="post in latestPosts" 
                    :key="post.slug" 
                    class="d-flex align-items-start hover-bg-light p-2 rounded transition-colors"
                  >
                    <NuxtLink :to="`/blogs/${post.slug}`" class="text-decoration-none flex-shrink-0 me-3">
                      <img 
                        :src="getImageUrl(post.cover_image)" 
                        class="rounded shadow-sm hover-lift-sm transition-transform"
                        style="width: 60px; height: 45px; object-fit: cover;"
                        :alt="post.title"
                      />
                    </NuxtLink>
                    <div class="flex-grow-1">
                      <p class="text-muted small mb-1">
                        <i class="bi bi-calendar me-2"></i>{{ formatDate(post.created_at) }}
                      </p>
                      <NuxtLink 
                        :to="`/blogs/${post.slug}`" 
                        class="text-decoration-none text-dark small fw-medium hover-text-main transition-colors line-clamp-2"
                      >
                        {{ post.title }}
                      </NuxtLink>
                     
                    </div>
                  </div>
                </div>
              </div>
            </div>

           <!-- Popular Tags -->
            <div class="card border-0 shadow-sm mb-4">
              <div class="card-body bg-white border-0 pb-0">
                <h6 class="fw-bold text-dark mb-0">
                  Popular Tags
                </h6>
              </div>
              <div class="card-body pt-3">
                <div class="d-flex flex-wrap gap-2">
                  <NuxtLink
                    v-for="tag in popularTags"
                    :key="tag.id"
                    :to="`/blogs/tag/${tag.slug}`"
                    class="badge bg-light text-dark border hover-bg-main hover-text-main transition-all cursor-pointer px-3 py-2"
                  >
                    {{ tag.name }}
                  </NuxtLink>
                </div>
              </div>
            </div>


            <!-- Newsletter -->
            <!-- <div class="card border-0 shadow-sm bg-gradient-main text-white">
              <div class="card-body text-center">
                <i class="fas fa-envelope-open fa-2x mb-3 opacity-75"></i>
                <h6 class="fw-bold mb-2">Berlangganan Newsletter</h6>
                <p class="small opacity-90 mb-3">Dapatkan update artikel terbaru langsung ke email Anda</p>
                <div class="input-group mb-3">
                  <input 
                    type="email" 
                    class="form-control border-0" 
                    placeholder="Email Anda"
                  >
                  <button class="btn btn-light text-main fw-medium" type="button">
                    Subscribe
                  </button>
                </div>
              </div>
            </div> -->
          </div>
        </div>

        <!-- Pagination -->
        <div class="row mt-5" v-if="!loading && totalPages > 1">
          <div class="col-12">
            <nav aria-label="Blog pagination">
              <ul class="pagination justify-content-center">
                <!-- Previous Button -->
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <button 
                    class="page-link border-0 text-muted"
                    @click="changePage(currentPage - 1)"
                    :disabled="currentPage === 1"
                  >
                    <i class="fas fa-chevron-left me-1"></i>Previous
                  </button>
                </li>

                <!-- First Page -->
                <li v-if="currentPage > 3" class="page-item">
                  <button class="page-link border-0" @click="changePage(1)">1</button>
                </li>
                <li v-if="currentPage > 4" class="page-item disabled">
                  <span class="page-link border-0 bg-transparent text-muted">...</span>
                </li>

                <!-- Page Numbers -->
                <li 
                  v-for="page in getVisiblePages()" 
                  :key="page"
                  class="page-item"
                  :class="{ active: page === currentPage }"
                >
                  <button 
                    class="page-link border-0"
                    :class="page === currentPage ? 'bg-main text-white' : 'text-muted hover-bg-main hover-text-white'"
                    @click="changePage(page)"
                  >
                    {{ page }}
                  </button>
                </li>

                <!-- Last Page -->
                <li v-if="currentPage < totalPages - 3" class="page-item disabled">
                  <span class="page-link border-0 bg-transparent text-muted">...</span>
                </li>
                <li v-if="currentPage < totalPages - 2" class="page-item">
                  <button class="page-link border-0" @click="changePage(totalPages)">{{ totalPages }}</button>
                </li>

                <!-- Next Button -->
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <button 
                    class="page-link border-0 text-muted"
                    @click="changePage(currentPage + 1)"
                    :disabled="currentPage === totalPages"
                  >
                    Next<i class="fas fa-chevron-right ms-1"></i>
                  </button>
                </li>
              </ul>
            </nav>

            <!-- Pagination Info -->
            <div class="text-center mt-3 text-muted small">
              Menampilkan {{ ((currentPage - 1) * perPage) + 1 }} - {{ Math.min(currentPage * perPage, totalItems) }} dari {{ totalItems }} artikel
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
  --main-hover: #c41e24;
  --main-light: rgba(230, 33, 41, 0.1);
}

.text-main {
  color: #e62129 !important;
}

.bg-main {
  background-color: #e62129 !important;
}

.bg-breadcrumb {
  background-color: #eeeeee !important;
}

.btn-main {
  background-color: var(--main-color);
  border-color: var(--main-color);
  color: white;
}

.btn-main:hover {
  background-color: var(--main-hover);
  border-color: var(--main-hover);
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(230, 33, 41, 0.3);
}

.hover-text-main:hover {
  color: var(--main-color) !important;
}

.hover-bg-main:hover {
  background-color: var(--main-color) !important;
}

.bg-gradient-main {
  background: linear-gradient(135deg, var(--main-color), #c41e24);
}

.hover-text-main:hover {
  color: #e62129 !important;
}

/* Skeleton Loading Styles */
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

.skeleton-img {
  border-radius: 0.375rem 0.375rem 0 0;
}

.skeleton-text {
  border-radius: 4px;
}

.skeleton-btn {
  border-radius: 6px;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Enhanced Pagination Styles */
.pagination .page-link {
  padding: 0.5rem 0.75rem;
  margin: 0 0.125rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  border: 1px solid #dee2e6;
}

.pagination .page-link:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  background-color: var(--main-light);
  border-color: var(--main-color);
  color: var(--main-color);
}

.pagination .page-item.active .page-link {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(230, 33, 41, 0.3);
  background-color: var(--main-color);
  border-color: var(--main-color);
}

.pagination .page-item.disabled .page-link {
  background-color: transparent;
  border-color: transparent;
  color: #6c757d;
}

.pagination .page-item.disabled .page-link:hover {
  transform: none;
  box-shadow: none;
  background-color: transparent;
}

/* Custom CSS untuk efek hover dan animasi */
.hover-lift {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.15) !important;
}

.hover-lift-sm:hover {
  transform: translateY(-2px);
}

.hover-zoom {
  transition: transform 0.4s ease;
}

.hover-zoom:hover {
  transform: scale(1.05);
}

.hover-bg-light:hover {
  background-color: var(--bs-gray-100) !important;
}

.hover-shadow-sm:hover {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
}

.transition-all {
  transition: all 0.3s ease;
}

.transition-colors {
  transition: color 0.2s ease, background-color 0.2s ease;
}

.transition-transform {
  transition: transform 0.3s ease;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.cursor-pointer {
  cursor: pointer;
}

/* Breadcrumb custom styling */
.breadcrumb {
  --bs-breadcrumb-divider: '›';
  background-color: white;
  border-radius: 0.5rem;
}

.breadcrumb-item + .breadcrumb-item::before {
  color: var(--bs-gray-400);
  margin: 0 0.5rem;
}

.breadcrumb-item a:hover {
  color: var(--main-color) !important;
}

/* Custom gradient overlay */
.bg-gradient-to-t {
  background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, transparent 100%);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .display-4 {
    font-size: 2rem;
  }
  
  .sticky-top {
    position: relative !important;
    top: auto !important;
  }

  .pagination {
    flex-wrap: wrap;
    justify-content: center !important;
  }
  
  .pagination .page-link {
    padding: 0.375rem 0.5rem;
    font-size: 0.875rem;
    margin: 0.125rem;
  }
}

/* Loading skeleton responsive */
@media (max-width: 576px) {
  .skeleton-img {
    height: 150px !important;
  }
  
  .col-lg-6 {
    margin-bottom: 1rem;
  }
}

/* Custom scroll behavior */
html {
  scroll-behavior: smooth;
}

/* Enhanced card hover effects */
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1) !important;
}

.card {
  transition: all 0.3s ease;
  border: 1px solid rgba(0,0,0,0.05);
}

/* Newsletter card enhancement */
.bg-gradient-main {
  position: relative;
  overflow: hidden;
}

.bg-gradient-main::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="2" fill="rgba(255,255,255,0.1)"/></svg>') repeat;
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* Loading state enhancements */
.skeleton {
  position: relative;
  overflow: hidden;
}

.skeleton::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}


.hover-lift:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.15) !important;
}

.hover-lift-sm:hover {
  transform: translateY(-2px);
}

.hover-zoom {
  transition: transform 0.4s ease;
}

.hover-zoom:hover {
  transform: scale(1.05);
}

.hover-text-primary:hover {
  color: var(--bs-primary) !important;
}

.hover-bg-light:hover {
  background-color: var(--bs-gray-100) !important;
}

.hover-bg-primary:hover {
  background-color: var(--bs-primary) !important;
}

.hover-shadow-sm:hover {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
}

.transition-all {
  transition: all 0.3s ease;
}

.transition-colors {
  transition: color 0.2s ease, background-color 0.2s ease;
}

.transition-transform {
  transition: transform 0.3s ease;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.bg-gradient-primary {
  background: linear-gradient(135deg, var(--bs-primary), var(--bs-purple));
}

.cursor-pointer {
  cursor: pointer;
}

/* Breadcrumb custom styling */
.breadcrumb {
  --bs-breadcrumb-divider: '›';
}

.breadcrumb-item + .breadcrumb-item::before {
  color: var(--bs-gray-400);
  margin: 0 0.5rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .display-4 {
    font-size: 2rem;
  }
  
  .sticky-top {
    position: relative !important;
    top: auto !important;
  }
}

/* Custom gradient overlay */
.bg-gradient-to-t {
  background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, transparent 100%);
}

.from-dark {
  --tw-gradient-from: #000;
}

.to-transparent {
  --tw-gradient-to: transparent;
}
</style>