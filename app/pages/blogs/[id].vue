<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useRoute } from "vue-router"

const route = useRoute()

// ---- Helpers
function getImageUrl(item: any) {
  if (!item) return "https://via.placeholder.com/900x480/e3f2fd/1976d2?text=Blog"
  const raw =
    item.image_url ||
    item.cover_image ||
    item.images?.find((i: any) => i.is_cover === "1")?.path ||
    item.images?.[0]?.path ||
    null
  if (!raw) return "https://via.placeholder.com/900x480/e3f2fd/1976d2?text=Blog"
  return String(raw).startsWith("http")
    ? raw
    : `https://be.gudanggrosiran.com${raw}`
}

const apiDetail = (id: string | string[]) =>
  $fetch(`https://be.gudanggrosiran.com/api/blogs/${id}`)
const apiList = () => $fetch("https://be.gudanggrosiran.com/api/blogs")

// ---- SSR/SSG fetch (SEO aman)
const { data: detailRes } = await useAsyncData(
  () => `blog-${route.params.id}`,
  () => apiDetail(route.params.id)
)
const post = ref<any>(detailRes.value?.data || null)

// Sidebar (latest posts)
const { data: listRes } = await useAsyncData("latest-blogs", () => apiList())
const latest = ref<any[]>(
  (listRes.value?.data || listRes.value?.data?.data || []).slice(0, 5)
)

// Client refresh (biar dinamis saat BE update)
onMounted(async () => {
  try {
    const freshDetail = await apiDetail(route.params.id)
    if (freshDetail?.success) post.value = freshDetail.data

    const freshList = await apiList()
    if (freshList?.success)
      latest.value = (freshList.data || freshList.data?.data || []).slice(0, 5)
  } catch (e) {
    console.error(e)
  }
})

// Cover image computed
const coverUrl = computed(() => getImageUrl(post.value))

// ---- SEO
useHead(() => {
  const title = post.value?.meta_title || post.value?.title || "Gudang Grosiran - Blog"
  const desc = post.value?.meta_description || post.value?.excerpt || ""
  const img = coverUrl.value
  const url = `https://gudanggrosiran.com/blogs/${post.value?.slug || route.params.id}`

  return {
    title,
    meta: [
      { name: "description", content: desc },
      { name: "keywords", content: post.value?.meta_keywords || "" },
      { property: "og:title", content: post.value?.og_title || title },
      { property: "og:description", content: post.value?.og_description || desc },
      { property: "og:image", content: img },
      { property: "og:type", content: "article" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: desc },
      { name: "twitter:image", content: img }
    ],
    link: [{ rel: "canonical", href: post.value?.canonical_url || url }]
  }
})

// dummy tags kalau API belum ada
const tags = computed<string[]>(() =>
  (post.value?.tags && post.value.tags.length)
    ? post.value.tags.map((t: any) => t.name || t)
    : ["Tips", "Rekomendasi", "Lifestyle"]
)
</script>

<template>
  <div class="min-h-screen bg-light">
    <div class="container py-4">
      <div class="row g-4">
        <!-- Main -->
        <div class="col-lg-8">
          <div v-if="!post" class="card border-0 shadow-sm p-4">Memuat konten…</div>

          <article v-else class="card border-0 shadow-sm overflow-hidden">
            <!-- Cover -->
            <img :src="coverUrl" :alt="post.title" class="img-fluid w-100" style="max-height: 420px; object-fit: cover;">
            <div class="card-body">
              <!-- Title & Meta -->
              <h1 class="h3 fw-bold mb-2">{{ post.title }}</h1>
              <div class="text-muted small mb-3">
                <i class="fas fa-calendar-alt me-1"></i>{{ post.created_at }}
                <span class="mx-2">•</span>
                <i class="fas fa-folder me-1"></i>{{ post.category_name || 'General' }}
                <span class="mx-2" v-if="post.reading_time && post.reading_time !== '0'">•</span>
                <span v-if="post.reading_time && post.reading_time !== '0'">
                  <i class="fas fa-clock me-1"></i>{{ post.reading_time }} min read
                </span>
              </div>

              <!-- Content -->
              <div class="gg-prose" v-html="post.content"></div>
            </div>
          </article>
        </div>

        <!-- Sidebar -->
        <aside class="col-lg-4">
          <!-- Latest Posts -->
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-white border-0">
              <h6 class="fw-bold mb-0"><i class="fas fa-fire text-danger me-2"></i>Latest Posts</h6>
            </div>
            <div class="card-body">
              <div v-for="item in latest" :key="item.id" class="d-flex align-items-start mb-3">
                <NuxtLink :to="`/blogs/${item.slug || item.id}`" class="me-3 flex-shrink-0">
                  <img
                    :src="getImageUrl(item)"
                    :alt="item.title"
                    class="rounded"
                    style="width: 72px; height: 54px; object-fit: cover;"
                    @error="$event.target.src='https://via.placeholder.com/72x54/e3f2fd/1976d2?text=Blog'"
                  />
                </NuxtLink>
                <div class="flex-grow-1">
                  <NuxtLink :to="`/blogs/${item.slug || item.id}`" class="text-decoration-none text-dark fw-medium">
                    <div class="line-clamp-2">{{ item.title }}</div>
                  </NuxtLink>
                  <div class="text-muted small mt-1">
                    <i class="fas fa-clock me-1"></i>{{ item.created_at }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tags -->
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-0">
              <h6 class="fw-bold mb-0"><i class="fas fa-tags text-success me-2"></i>Popular Tags</h6>
            </div>
            <div class="card-body">
              <div class="d-flex flex-wrap gap-2">
                <span
                  v-for="tag in tags"
                  :key="tag"
                  class="badge bg-light text-dark border px-3 py-2"
                >#{{ tag }}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* warna utama sama seperti list */
:root { --main-color:#e62129; }
.line-clamp-2{
  display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
}
/* teks konten biar rapi saat v-html */
.gg-prose :where(h1,h2,h3){margin-top:1.25rem;margin-bottom:.75rem}
.gg-prose p{margin-bottom:1rem; line-height:1.8}
.gg-prose img{max-width:100%; height:auto; border-radius:.5rem; margin:1rem 0}
.gg-prose ul, .gg-prose ol{padding-left:1.25rem; margin: .5rem 0 1rem}
.gg-prose blockquote{border-left:4px solid var(--main-color); padding-left:1rem; color:#6c757d}
.breadcrumb{--bs-breadcrumb-divider:'›'}
</style>
