<template>
  <div>
    <!-- Topbar -->
    <div class="topbar bg-light py-1 border-bottom" :class="{ 'd-none': isScrolled }">
      <div class="container">
        <div class="row">
          <div class="col-md-6 col-12 text-center text-md-start">
            <span class="small">Super Value Deals - Save more with coupons</span>
          </div>
          <div class="col-md-6 text-end d-none d-md-block">
            <span class="dropdown-toggle cursor-pointer small">
              <i class="bi bi-globe me-1"></i>
              English
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Header - Sticky -->
    <header class="main-header sticky-top bg-white shadow-sm" :class="{ 'scrolled': isScrolled }">
      <div class="container">
        <div class="row align-items-center py-3">
          <!-- Logo -->
          <div class="col-6 col-lg-2">
            <NuxtLink to="/" class="navbar-brand">
              <img 
                class="logo-gg" 
                src="https://raw.githubusercontent.com/diosurya/assets/refs/heads/main/GG-logo.png" 
                alt="Gudang Grosiran"
                :style="{ height: isScrolled ? '35px' : '45px' }"
              />
            </NuxtLink>
          </div>

          <!-- Search Bar - Desktop -->
          <div class="col-lg-6 d-none d-lg-block">
            <form class="search-form">
              <div class="input-group">
                <input
                  v-model="searchQuery"
                  placeholder="Search for products..."
                  class="form-control border-end-0"
                  type="search"
                />
                <button type="submit" class="btn btn-outline-secondary border-start-0">
                  <i class="bi bi-search"></i>
                </button>
              </div>
            </form>
          </div>

          <!-- Header Actions -->
          <div class="col-6 col-lg-4">
            <div class="d-flex align-items-center justify-content-end gap-3">
              <!-- Mobile Search Toggle -->
              <button 
                class="btn btn-link d-lg-none p-0" 
                @click="toggleMobileSearch"
                type="button"
              >
                <i class="bi bi-search fs-5"></i>
              </button>

              <!-- Wishlist -->
              <NuxtLink to="/wishlist" class="header-icon d-none d-sm-block">
                <i class="bi bi-heart position-relative">
                  <span class="badge bg-danger badge-sm">{{ wishlistCount }}</span>
                </i>
              </NuxtLink>

              <!-- Account -->
              <NuxtLink to="/account" class="header-icon d-none d-sm-block">
                <i class="bi bi-person"></i>
              </NuxtLink>

              <!-- Cart -->
              <NuxtLink to="/cart" class="header-icon">
                <i class="bi bi-bag position-relative">
                  <span class="badge bg-success badge-sm">{{ cartCount }}</span>
                </i>
              </NuxtLink>

              <!-- Mobile Menu Toggle -->
              <button 
                class="btn btn-link d-lg-none p-0 ms-2" 
                @click="toggleMobileMenu"
                type="button"
              >
                <i class="bi" :class="isMobileMenuOpen ? 'bi-x-lg' : 'bi-list'" style="font-size: 1.5rem;"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile Search Bar -->
        <div v-if="isMobileSearchOpen" class="row d-lg-none">
          <div class="col-12 pb-3">
            <form class="search-form">
              <div class="input-group">
                <input
                  v-model="searchQuery"
                  placeholder="Search for products..."
                  class="form-control border-end-0"
                  type="search"
                />
                <button type="submit" class="btn btn-outline-secondary border-start-0">
                  <i class="bi bi-search"></i>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </header>

    <!-- Navigation Menu -->
    <nav class="navbar navbar-expand-lg navbar-light bg-white border-top sticky-nav" :class="{ 'd-none': isScrolled }">
      <div class="container">
        <!-- Desktop Menu -->
        <div class="collapse navbar-collapse d-none d-lg-block">
          <ul class="navbar-nav gap-4">
            <li v-for="menu in menus" :key="menu.path" class="nav-item">
              <NuxtLink 
                class="nav-link fw-medium" 
                :to="menu.path"
                :class="{ 'active': route.path === menu.path }"
              >
                {{ menu.title }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Mobile Menu Overlay -->
    <div 
      v-if="isMobileMenuOpen" 
      class="mobile-menu-overlay d-lg-none"
      @click="closeMobileMenu"
    ></div>

    <!-- Mobile Menu Sidebar -->
    <div class="mobile-menu d-lg-none" :class="{ 'open': isMobileMenuOpen }">
      <div class="mobile-menu-header p-3 border-bottom">
        <h5 class="mb-0">Menu</h5>
        <button 
          class="btn btn-link p-0" 
          @click="closeMobileMenu"
          type="button"
        >
          <i class="bi bi-x-lg fs-4"></i>
        </button>
      </div>
      
      <div class="mobile-menu-content">
        <!-- Account Section -->
        <div class="p-3 border-bottom">
          <NuxtLink to="/account" class="d-flex align-items-center text-decoration-none" @click="closeMobileMenu">
            <i class="bi bi-person-circle fs-4 me-3"></i>
            <span>My Account</span>
          </NuxtLink>
        </div>

        <!-- Main Navigation -->
        <ul class="list-unstyled mb-0">
          <li v-for="menu in menus" :key="menu.path">
            <NuxtLink 
              :to="menu.path" 
              class="mobile-menu-link"
              :class="{ 'active': route.path === menu.path }"
              @click="closeMobileMenu"
            >
              {{ menu.title }}
            </NuxtLink>
          </li>
        </ul>

        <!-- Bottom Actions -->
        <div class="mobile-menu-actions p-3 border-top mt-3">
          <NuxtLink to="/wishlist" class="d-flex align-items-center mb-3 text-decoration-none" @click="closeMobileMenu">
            <i class="bi bi-heart fs-5 me-3"></i>
            <span>Wishlist</span>
            <span class="badge bg-primary ms-auto">{{ wishlistCount }}</span>
          </NuxtLink>
          
          <NuxtLink to="/cart" class="d-flex align-items-center text-decoration-none" @click="closeMobileMenu">
            <i class="bi bi-bag fs-5 me-3"></i>
            <span>Shopping Cart</span>
            <span class="badge bg-success ms-auto">{{ cartCount }}</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Menu data
const menus = [
  { title: "Home", path: "/" },
  { title: "Shop", path: "/shop/shop-grid" },
  { title: "Blog", path: "/blogs" },
  { title: "Contact", path: "/contact" },
]

// Reactive states
const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)
const isMobileSearchOpen = ref(false)
const searchQuery = ref('')
const wishlistCount = ref(4)
const cartCount = ref(5)

// Handle scroll for sticky effect
const handleScroll = () => {
  isScrolled.value = window.scrollY > 100
}

// Mobile menu functions
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  if (isMobileMenuOpen.value) {
    document.body.classList.add('mobile-menu-open')
  } else {
    document.body.classList.remove('mobile-menu-open')
  }
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
  document.body.classList.remove('mobile-menu-open')
}

const toggleMobileSearch = () => {
  isMobileSearchOpen.value = !isMobileSearchOpen.value
}

// Lifecycle
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.body.classList.remove('mobile-menu-open')
})

// Get current route
const route = useRoute()

// Close mobile menu on route change
watch(() => route.path, () => {
  closeMobileMenu()
})
</script>

<style scoped>
/* Topbar transition */
.topbar {
  transition: all 0.3s ease;
}

/* Sticky header */
.main-header {
  transition: all 0.3s ease;
  z-index: 1030;
}

.main-header.scrolled {
  padding: 0.5rem 0;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
}

.sticky-nav {
  position: sticky;
  top: 0;
  z-index: 1029;
  transition: all 0.3s ease;
}

/* Logo transition */
.logo-gg {
  transition: height 0.3s ease;
  max-height: 45px;
  width: auto;
}

/* Header icons */
.header-icon {
  color: #333;
  font-size: 1.25rem;
  text-decoration: none;
  position: relative;
  transition: color 0.2s ease;
}

.header-icon:hover {
  color: #007bff;
}

/* Badge styling */
.badge-sm {
  position: absolute;
  top: -8px;
  right: -8px;
  font-size: 0.65rem;
  padding: 0.25em 0.4em;
  border-radius: 50%;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Search form */
.search-form .form-control {
  border-radius: 25px 0 0 25px;
}

.search-form .btn {
  border-radius: 0 25px 25px 0;
}

/* Navigation links */
.nav-link {
  color: #333 !important;
  transition: color 0.2s ease;
  position: relative;
}

.nav-link:hover,
.nav-link.active {
  color: #007bff !important;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 2px;
  background: #007bff;
}

/* Mobile Menu */
.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1040;
  opacity: 0;
  animation: fadeIn 0.3s ease forwards;
}

.mobile-menu {
  position: fixed;
  top: 0;
  right: -300px;
  width: 300px;
  height: 100%;
  background: white;
  z-index: 1041;
  transition: right 0.3s ease;
  box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.mobile-menu.open {
  right: 0;
}

.mobile-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
}

.mobile-menu-content {
  flex: 1;
  overflow-y: auto;
}

.mobile-menu-link {
  display: block;
  padding: 1rem 1.5rem;
  color: #333;
  text-decoration: none;
  border-bottom: 1px solid #eee;
  transition: all 0.2s ease;
}

.mobile-menu-link:hover,
.mobile-menu-link.active {
  background: #f8f9fa;
  color: #007bff;
  padding-left: 2rem;
}

.mobile-menu-actions {
  background: #f8f9fa;
}

/* Prevent body scroll when mobile menu is open */
:global(body.mobile-menu-open) {
  overflow: hidden;
}

/* Animations */
@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

/* Responsive adjustments */
@media (max-width: 991px) {
  .main-header .container .row {
    padding: 0.75rem 0;
  }
  
  .main-header.scrolled .container .row {
    padding: 0.5rem 0;
  }
}

@media (max-width: 575px) {
  .mobile-menu {
    width: 280px;
    right: -280px;
  }
  
  .logo-gg {
    max-height: 35px;
  }
  
  .main-header.scrolled .logo-gg {
    max-height: 30px;
  }
}

/* Custom scrollbar for mobile menu */
.mobile-menu-content::-webkit-scrollbar {
  width: 4px;
}

.mobile-menu-content::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.mobile-menu-content::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 2px;
}

.mobile-menu-content::-webkit-scrollbar-thumb:hover {
  background: #999;
}
</style>