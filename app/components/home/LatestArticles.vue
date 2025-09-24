<script setup lang="ts">
import { ref, onMounted } from "vue"

const { $baseAPi, $BASE_URL_BE } = useNuxtApp()

const latestArticles = ref<any[]>([])
const loading = ref(true)
const error = ref("")

const fetchLatestArticles = async () => {
  loading.value = true
  try {
    const res = await $baseAPi.get("/v1/blogs?per_page=3")
    if (res.data.success) {
      latestArticles.value = res.data.data
    } else {
      error.value = res.data.message || "Gagal ambil artikel"
    }
  } catch (err) {
    console.error("Gagal fetch artikel:", err)
    error.value = "Terjadi kesalahan saat mengambil artikel"
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchLatestArticles()
})

const formatDate = (dateString: string) => {
  if (!dateString) return "-"
  const date = new Date(dateString)
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  })
}

const getImageUrl = (imagePath: string | null) => {
  return imagePath
    ? `${$BASE_URL_BE}/storage/${imagePath}`
    : "https://via.placeholder.com/600x400/e3f2fd/1976d2?text=Blog+Image"
}
</script>

<template>
  <div class="latest-articles container my-5">
    <h2 class="section-title mb-4 text-center">Artikel Terbaru</h2>

    <!-- Skeleton Loading -->
    <div v-if="loading" class="row g-4">
      <div v-for="n in 3" :key="n" class="col-md-4">
        <div class="article-skeleton">
          <div class="skeleton-img"></div>
          <div class="skeleton-line skeleton-title mt-3"></div>
          <div class="skeleton-line skeleton-desc mt-2"></div>
          <div class="skeleton-line skeleton-desc w-75"></div>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center text-danger">
      {{ error }}
    </div>

    <!-- Article List -->
    <div v-else class="row g-4">
      <div v-for="article in latestArticles" :key="article.slug" class="col-md-4">
        <div class="article-card h-100">
          <div class="article-img-wrapper">
            <NuxtLink :to="`/blogs/${article.slug}`">
              <img
                :src="getImageUrl(article.cover_image)"
                :alt="article.title"
                class="article-img"
              />
            </NuxtLink>
            <div class="article-date">
              {{ formatDate(article.created_at) }}
            </div>
          </div>

          <div class="article-body">
            <h5 class="article-title">
              <NuxtLink :to="`/blogs/${article.slug}`" class="text-dark text-decoration-none">
                {{ article.title }}
              </NuxtLink>
            </h5>

            <p v-if="article.excerpt" class="article-excerpt">
              {{ article.excerpt }}
            </p>

            <NuxtLink :to="`/blogs/${article.slug}`" class="btn btn-outline-main btn-sm mt-auto">
              Baca Selengkapnya
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.section-title {
  font-weight: 700;
  font-size: 1.5rem;
  color: #333;
}

/* Artikel Card */
.article-card {
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  overflow: hidden;
  transition: all 0.3s ease;
}
.article-card:hover {
  box-shadow: 0 6px 18px rgba(0,0,0,0.1);
  transform: translateY(-4px);
}

.article-img-wrapper {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}
.article-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform .3s ease;
}
.article-card:hover .article-img {
  transform: scale(1.05);
}

.article-date {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(255,255,255,0.9);
  color: #333;
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.article-body {
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
}

.article-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}
.article-title a:hover {
  color: var(--bs-primary);
}

.article-excerpt {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 1rem;
  flex-grow: 1;
}

.article-skeleton {
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  padding: 0.5rem;
}
.skeleton-img {
  width: 100%;
  height: 200px;
  border-radius: 0.5rem;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}
.skeleton-line {
  height: 14px;
  border-radius: 4px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}
.skeleton-title { width: 80%; height: 16px; }
.skeleton-desc { width: 100%; height: 12px; }

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
