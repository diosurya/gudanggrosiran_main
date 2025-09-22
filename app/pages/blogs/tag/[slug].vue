<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useRoute } from "vue-router"
const { $baseAPi, $BASE_URL_BE } = useNuxtApp()

const blogs = ref<any[]>([])
const latestPosts = ref<any[]>([])
const loading = ref(true)
const route = useRoute()
const popularTags = ref<any[]>([])

const slug = ref<string>(route.params.slug as string)

useHead({
  title: `Artikel dengan tag ${slug.value} - Gudang Grosiran`,
  meta: [
    { name: "description", content: "Artikel berdasarkan tag yang dipilih" },
    { name: "keywords", content: "blog, artikel, tag" },
    { property: "og:title", content: `Artikel dengan tag ${slug.value}` },
    { property: "og:description", content: "Artikel berdasarkan tag yang dipilih" },
  ]
})

const fetchBlogsByTag = async () => {
  loading.value = true
  try {
    const res = await $baseAPi.get(`/v1/blogs/tag/${slug.value}`)
    if (res.data.success) {
      blogs.value = res.data.data
      latestPosts.value = blogs.value.slice(0, 3)
    }
  } catch (err) {
    console.error("Gagal ambil blogs by tag:", err)
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

// Truncate text
const truncateText = (text: string, length: number = 150) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

// Get full image URL
const getImageUrl = (imagePath: string | null) => {
  return `${$BASE_URL_BE}/storage/${imagePath}`
}

onMounted(() => {
  fetchBlogsByTag()
  fetchPopularTags()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 mb-5">
    <div class="container mx-auto px-4 py-6">
      <!-- Header -->
      <div class="mb-5">
        <!-- <h4 class="fw-bold text-dark">
          Artikel dengan tag: <span class="text-main">{{ slug }}</span>
        </h4> -->
        <h6 class="fw-bold text-muted mb-5">Rekomendasi artikel terkait <span class="text-main">{{ slug }}</span></h6>
      </div>

      <div class="row g-4">
        <!-- Blog Grid -->
        <div class="col-lg-8 col-md-7">
          <!-- Skeleton Loading -->
          <div v-if="loading" class="row g-4">
            <div v-for="n in 4" :key="n" class="col-lg-6 col-md-12 col-sm-6">
              <div class="card h-100 border-0 shadow-sm">
                <div class="skeleton skeleton-img" style="height: 200px;"></div>
                <div class="card-body">
                  <p class="skeleton skeleton-text mb-2" style="width: 50%; height: 12px;"></p>
                  <p class="skeleton skeleton-text mb-3" style="width: 80%; height: 18px;"></p>
                  <p class="skeleton skeleton-text mb-2" style="width: 100%; height: 12px;"></p>
                  <p class="skeleton skeleton-text mb-2" style="width: 90%; height: 12px;"></p>
                  <div class="skeleton skeleton-btn mt-3" style="width: 120px; height: 32px;"></div>
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="blogs.length === 0" class="alert alert-info">
            Belum ada artikel untuk tag ini.
          </div>

          <div v-else class="row g-4">
            <div v-for="blog in blogs" :key="blog.slug" class="col-lg-6 col-md-12 col-sm-6">
              <div class="card h-100 border-0 shadow-sm hover-lift transition-all">
                <NuxtLink :to="`/blogs/${blog.slug}`" class="text-decoration-none">
                  <img
                    :src="getImageUrl(blog.cover_image)"
                    :alt="blog.title"
                    class="card-img-top"
                    style="height: 200px; object-fit: cover;"
                  />
                </NuxtLink>
                <div class="card-body d-flex flex-column">
                  <p class="text-muted small mb-2">
                    <i class="bi bi-calendar me-1"></i>{{ formatDate(blog.created_at) }}
                  </p>
                  <NuxtLink :to="`/blogs/${blog.slug}`" class="text-decoration-none">
                    <h5 class="card-title text-dark mb-2 line-clamp-2">{{ blog.title }}</h5>
                  </NuxtLink>
                  <p class="card-text text-muted flex-grow-1 line-clamp-3">
                    {{ truncateText(blog.excerpt, 120) }}
                  </p>
                  <div class="mt-auto pt-3 border-top">
                    <NuxtLink :to="`/blogs/${blog.slug}`" class="btn btn-main btn-sm" style="color: #e62129 !important;">
                      Baca Selengkapnya
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="col-lg-4 col-md-5">
          <div class="sticky-top" style="top: 1rem;">
            <!-- Latest Posts -->
            <div class="card border-0 shadow-sm mb-4">
              <div class="card-body">
                <h6 class="fw-bold text-dark mb-3">Latest Posts</h6>
                <div class="d-flex flex-column gap-3">
                  <div v-for="post in latestPosts" :key="post.slug" class="d-flex align-items-start">
                    <NuxtLink :to="`/blogs/${post.slug}`" class="me-3">
                      <img
                        :src="getImageUrl(post.cover_image)"
                        class="rounded"
                        style="width: 60px; height: 45px; object-fit: cover;"
                      />
                    </NuxtLink>
                    <div>
                      <p class="text-muted small mb-1">{{ formatDate(post.created_at) }}</p>
                      <NuxtLink :to="`/blogs/${post.slug}`" class="text-dark small fw-medium">
                        {{ post.title }}
                      </NuxtLink>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Popular Tags -->
            <div class="card border-0 shadow-sm mb-4">
              <div class="card-body">
                <h6 class="fw-bold text-dark mb-3">Popular Tags</h6>
                <div class="d-flex flex-wrap gap-2">
                  <NuxtLink
                    v-for="tag in popularTags"
                    :key="tag.id"
                    :to="`/blogs/tag/${tag.slug}`"
                    class="badge bg-light text-dark border px-3 py-2"
                  >
                    {{ tag.name }}
                  </NuxtLink>
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