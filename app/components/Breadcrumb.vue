<template>
  <!-- Hanya tampil jika bukan halaman home -->
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
  // Untuk override breadcrumb custom jika diperlukan
  customBreadcrumbs?: BreadcrumbItem[]
  // Mapping custom untuk nama route
  routeNameMap?: Record<string, string>
  // Halaman yang tidak menampilkan breadcrumb (default: home)
  excludeRoutes?: string[]
  // Apakah menampilkan home sebagai first breadcrumb
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
  'blogs': 'Blog Terbaru dan Artikel Menarik',
  'products': 'Produk',
  'categories': 'Kategori',
  'about': 'Tentang Kami',
  'contact': 'Kontak',
  'cart': 'Keranjang',
  'checkout': 'Checkout',
  'profile': 'Profil',
  'orders': 'Pesanan',
  'wishlist': 'Wishlist',
  'search': 'Pencarian',
  'login': 'Masuk',
  'register': 'Daftar',
  'forgot-password': 'Lupa Password'
}

// Cek apakah breadcrumb harus ditampilkan
const showBreadcrumb = computed(() => {
  return !props.excludeRoutes.includes(route.path)
})

const breadcrumbs = computed(() => {
  // Jika tidak perlu tampil breadcrumb, return empty array
  if (!showBreadcrumb.value) {
    return []
  }

  // Jika ada custom breadcrumbs, gunakan itu
  if (props.customBreadcrumbs) {
    return props.showHome 
      ? [{ name: 'Beranda', path: '/' }, ...props.customBreadcrumbs]
      : props.customBreadcrumbs
  }

  // Generate breadcrumbs dari route path
  const pathSegments = route.path.split('/').filter(segment => segment)
  const crumbs: BreadcrumbItem[] = []
  
  // Tambahkan home jika showHome true
  if (props.showHome) {
    crumbs.push({ name: 'Beranda', path: '/' })
  }
  
  let currentPath = ''
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`
    
    // Merge default mapping dengan custom mapping
    const routeNameMap = { ...defaultRouteNameMap, ...props.routeNameMap }
    
    // Customize nama breadcrumb berdasarkan segment
    let name = routeNameMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
    
    // Jika segment adalah number (ID), gunakan title dari route meta atau params
    if (/^\d+$/.test(segment)) {
      if (route.meta?.breadcrumbTitle) {
        name = route.meta.breadcrumbTitle as string
      } else if (route.meta?.title) {
        name = route.meta.title as string
      } else if (route.params?.title) {
        name = route.params.title as string
      } else {
        // Ambil context dari segment sebelumnya
        const previousSegment = pathSegments[index - 1]
        const contextName = routeNameMap[previousSegment] || previousSegment
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

.transition-colors {
  transition: color 0.2s ease, background-color 0.2s ease;
}

.hover\:text-primary-dark:hover {
  color: var(--main-hover) !important;
}
</style>