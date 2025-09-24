<template>
  <nav 
    v-if="showBreadcrumb" 
    class="mb-3 py-4" 
    aria-label="breadcrumb"
  >
    <section class="bg-breadcrumb shadow-sm">
      <div class="container">
        <ol class="breadcrumb bg-breadcrumb px-4 py-3 mb-0">
          <li 
            v-for="(crumb, index) in breadcrumbs" 
            :key="index"
            class="breadcrumb-item"
            :class="{ active: crumb.isLast }"
          >
            <NuxtLink 
              v-if="!crumb.isLast"
              :to="crumb.path" 
              class="text-decoration-none text-main hover:text-primary-dark transition-colors"
            >
              <i class="fas fa-home me-1" v-if="crumb.name === 'Beranda'"></i>
              {{ crumb.name }}
            </NuxtLink>
            <span v-else class="text-muted fw-medium">{{ crumb.name }}</span>
          </li>
        </ol>
      </div>
    </section>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

interface BreadcrumbItem {
  name: string
  path: string
  isLast?: boolean
}

interface Props {
  customBreadcrumbs?: BreadcrumbItem[]
  routeNameMap?: Record<string, string>
  excludeRoutes?: string[]
  showHome?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  customBreadcrumbs: undefined,
  routeNameMap: () => ({}),
  excludeRoutes: () => ['/'],
  showHome: true
})

const route = useRoute()

// Default mapping untuk route names
const defaultRouteNameMap: Record<string, string> = {
  blogs: 'Blog Terbaru dan Artikel Menarik',
  products: 'Produk',
  categories: 'Kategori',
  about: 'Tentang Kami',
  contact: 'Kontak Kami',
  cart: 'Keranjang',
  checkout: 'Checkout',
  profile: 'Profil',
  orders: 'Pesanan',
  wishlist: 'Wishlist',
  search: 'Pencarian',
  login: 'Masuk',
  register: 'Daftar',
  'forgot-password': 'Lupa Password'
}

// Fungsi helper untuk ubah slug jadi Title Case
function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Cek apakah breadcrumb harus ditampilkan
const showBreadcrumb = computed(() => {
  return !props.excludeRoutes.includes(route.path)
})

const breadcrumbs = computed(() => {
  if (!showBreadcrumb.value) return []

  if (props.customBreadcrumbs) {
    return props.showHome 
      ? [{ name: 'Beranda', path: '/' }, ...props.customBreadcrumbs]
      : props.customBreadcrumbs
  }

  const pathSegments = route.path.split('/').filter(segment => segment)
  const crumbs: BreadcrumbItem[] = []
  
  if (props.showHome) {
    crumbs.push({ name: 'Beranda', path: '/' })
  }
  
  let currentPath = ''
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`

    const routeNameMap = { ...defaultRouteNameMap, ...props.routeNameMap }

    let name = routeNameMap[segment] || slugToTitle(segment)

    // Kalau segment berupa angka → anggap detail
    if (/^\d+$/.test(segment)) {
      if (route.meta?.breadcrumbTitle) {
        name = route.meta.breadcrumbTitle as string
      } else if (route.meta?.title) {
        name = route.meta.title as string
      } else if (route.params?.title) {
        name = route.params.title as string
      } else {
        const prev = pathSegments[index - 1]
        const contextName = routeNameMap[prev] || slugToTitle(prev)
        name = `Detail ${contextName}`
      }
    }
    
    crumbs.push({
      name,
      path: currentPath,
      isLast: index === pathSegments.length - 1
    })
  })
  
  return crumbs
})
</script>

<style scoped>
:root {
  --main-color: #e62129;
  --main-hover: #c41e24;
  --main-light: rgba(230, 33, 41, 0.1);
}

.text-main {
  color: #e62129 !important;
}

.bg-breadcrumb {
  background-color: #eeeeee !important;
}

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

.transition-colors {
  transition: color 0.2s ease, background-color 0.2s ease;
}

.hover\:text-primary-dark:hover {
  color: var(--main-hover) !important;
}
</style>
