<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useRoute } from "vue-router"

const route = useRoute()
const { $baseAPi, $baseUrlBE, $BASE_URL_BE } = useNuxtApp()


// ---- Helpers
const getImageUrl = (imagePath: string | null) => {

  // pastikan imagePath sudah sesuai dengan storage path
  return `${$BASE_URL_BE}/storage/${imagePath}`
}

// ---- API calls pakai axios
const apiDetail = (slug: string | string[]) =>
  $baseAPi.get(`/v1/blogs/${slug}`).then(res => res.data)

const apiList = () =>
  $baseAPi.get("/v1/blogs").then(res => res.data)

// ---- SSR/SSG fetch (SEO aman)
const { data: detailRes } = await useAsyncData(
  () => `blog-${route.params.slug}`,
  () => apiDetail(route.params.slug)
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
    const freshDetail = await apiDetail(route.params.slug)
    if (freshDetail?.success) post.value = freshDetail.data

    const freshList = await apiList()
    if (freshList?.success)
      latest.value = (freshList.data || freshList.data?.data || []).slice(0, 5)
  } catch (e) {
    console.error(e)
  }
})


// ---- SEO
useHead(() => {
  const title = post.value?.meta_title || post.value?.title || "Gudang Grosiran - Blog"
  const desc = post.value?.meta_description || post.value?.excerpt || ""
  const img = post.value?.image_cover
  const url = `https://gudanggrosiran.com/blogs/${post.value?.slug || route.params.slug}`

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
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
  
      <div class="container mx-auto px-4 py-6">
        <div class="mb-5">
          <div class="row">
            <!-- Main -->
            <div class="col-lg-8">
              <div v-if="!post" class="card border-0 shadow-sm p-4">Memuat konten…</div>

              <article v-else class="card border-0 shadow-sm overflow-hidden">
                <!-- Cover -->
                <img 
                  :src="getImageUrl(post.cover_image)" 
                  :alt="post.title" 
                  class="img-fluid w-100" style="max-height: 420px; object-fit: cover;">
                <div class="card-body">
                  <!-- Title & Meta -->
                  <h1 class="h3 fw-bold mb-2">{{ post.title }}</h1>
                  <div class="text-muted small mb-3">
                    <i class="bi bi-calendar me-2"></i>{{ post.created_at }}
                    <span class="mx-2">•</span>
                    <i class="bi bi-person me-2"></i>{{ post.author_name || 'General' }}
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
                  <h6 class="fw-bold mb-0">Latest Posts</h6>
                </div>
                <div class="card-body">
                  <div v-for="item in latest" :key="item.id" class="d-flex align-items-start mb-3">
                    <NuxtLink :to="`/blogs/${item.slug}`" class="me-3 flex-shrink-0">
                      <img
                        :src="getImageUrl(item.cover_image)"
                        :alt="item.title"
                        class="rounded"
                        style="width: 72px; height: 54px; object-fit: cover;"
                      />
                    </NuxtLink>
                    <div class="flex-grow-1">
                      <NuxtLink :to="`/blogs/${item.slug}`" class="text-decoration-none text-dark fw-medium">
                        <div class="line-clamp-2">{{ item.title }}</div>
                      </NuxtLink>
                      <div class="text-muted small mt-1">
                        <i class="bi bi-calendar me-2"></i>{{ item.created_at }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tags -->
              <div class="card border-0 shadow-sm">
                <div class="card-header bg-white border-0">
                  <h6 class="fw-bold mb-0">Popular Tags</h6>
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
  </div>
</template>

<style scoped>
:root { --main-color:#e62129; }
.line-clamp-2{
  display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
}
.gg-prose :where(h1,h2,h3){margin-top:1.25rem;margin-bottom:.75rem}
.gg-prose p{margin-bottom:1rem; line-height:1.8}
.gg-prose img{max-width:100%; height:auto; border-radius:.5rem; margin:1rem 0}
.gg-prose ul, .gg-prose ol{padding-left:1.25rem; margin: .5rem 0 1rem}
.gg-prose blockquote{border-left:4px solid var(--main-color); padding-left:1rem; color:#6c757d}
.breadcrumb{--bs-breadcrumb-divider:'›'}
</style>
