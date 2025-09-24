<script setup lang="ts">

interface StoreLocation {
  id: number
  name: string
  address: string
  phone: string
  latitude?: number
  longitude?: number
}

const menus = [
  { title: "Beranda", path: "/" },
  { title: "Tentang Kami", path: "/about" },
  { title: "Produk", path: "/produk" },
  { title: "Artikel", path: "/blogs" },
  { title: "Kontak Kami", path: "/contact" },
]

const storeLocations: StoreLocation[] = [
  {
    id: 1,
    name: "Samarinda",
    address: "Jl Kemakmuran no 71, Sungai Pindang Dalam, Kota Samarinda, Kalimantan Timur (75242)",
    phone: "081130776712"
  },
  {
    id: 2,
    name: "Kupang",
    address: " Jl. Terusan Timor Raya No.3, Oesapa, Kec. Klp. Lima, Kota Kupang, Nusa Tenggara Tim (85228)",
    phone: "081130757550"
  }
]

const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)
const isMobileSearchOpen = ref(false)
const isLocationModalOpen = ref(false)
const searchQuery = ref('')
const wishlistCount = ref(4)
const cartCount = ref(5)

const selectedLocation = ref<StoreLocation>(storeLocations[1])

// Location functions
const openLocationModal = () => {
  isLocationModalOpen.value = true
  document.body.classList.add('modal-open')
}

const closeLocationModal = () => {
  isLocationModalOpen.value = false
  document.body.classList.remove('modal-open')
}

const selectLocation = (location: StoreLocation) => {
  selectedLocation.value = location
}

const saveSelectedLocation = () => {
  if (process.client) {
    localStorage.setItem('selectedLocation', JSON.stringify(selectedLocation.value))
  }
  closeLocationModal()
}

const detectUserLocation = () => {
  if (process.client && navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude
        const userLng = position.coords.longitude
        
        console.log('User location:', userLat, userLng)
        

        if (userLng > 119) {
          selectedLocation.value = storeLocations.find(loc => loc.name === 'Kupang') || storeLocations[1]
        } else {
          selectedLocation.value = storeLocations.find(loc => loc.name === 'Samarinda') || storeLocations[0]
        }
      },
      (error) => {
        console.log('Location detection error:', error)
        selectedLocation.value = storeLocations[1]
      }
    )
  }
}

// Load saved location from localStorage
const loadSavedLocation = () => {
  if (process.client) {
    const savedLocation = localStorage.getItem('selectedLocation')
    if (savedLocation) {
      try {
        selectedLocation.value = JSON.parse(savedLocation)
      } catch (error) {
        console.error('Error parsing saved location:', error)
        selectedLocation.value = storeLocations[1]
      }
    } else {
      detectUserLocation()
    }
  }
}

const handleScroll = () => {
  isScrolled.value = window.scrollY > 100
}

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
  loadSavedLocation()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.body.classList.remove('mobile-menu-open')
  document.body.classList.remove('modal-open')
})

const route = useRoute()


watch(() => route.path, () => {
  closeMobileMenu()
})
</script>

<template>
  <div>
    <!-- Topbar -->
    <div class="topbar bg-light py-1 border-bottom" :class="{ 'd-none': isScrolled }">
      <div class="container">
        <div class="row">
          <div class="col-md-12 col-12 text-center text-md-start">
            <span class="small">Gudang Grosiran - Belanja Grosir, Kualitas Premium</span>
          </div>
          <!-- <div class="col-md-6 text-end d-none d-md-block"> -->
            <!-- <span class="dropdown-toggle cursor-pointer small">
              <i class="bi bi-globe me-1"></i>
              English
            </span> -->
          <!-- </div> -->
        </div>
      </div>
    </div>

    <!-- Main Header - Fixed Position -->
    <header class="main-header bg-white shadow-sm" :class="{ 'scrolled': isScrolled }">
      <div class="container">
        <div class="row align-items-center py-3">
          <!-- Logo -->
          <div class="col-4 col-lg-2">
            <NuxtLink to="/" class="navbar-brand">
              <img 
                class="logo-gg" 
                src="https://raw.githubusercontent.com/diosurya/assets/refs/heads/main/GG-logo.png" 
                alt="Gudang Grosiran"
                :style="{ height: isScrolled ? '35px' : '45px' }"
              />
            </NuxtLink>
          </div>
          <div class="col-4 col-lg-2">
           <div class="location-box">
                <button class="btn btn-sm location-button" @click="openLocationModal">
                    <span class="location-arrow">
                      <i class="bi bi-shop" style="font-size: 20px; color:#333;"></i>
                    </span>
                    <span class="locat-name">{{ selectedLocation.name }}</span>
                    <i class="fa-solid fa-angle-down"></i>
                </button>
            </div>
          </div>
          <!-- Search Bar - Desktop -->
          <div class="col-lg-6 d-none d-lg-block">
            <form class="search-form">
              <div class="input-group">
                <input
                  v-model="searchQuery"
                  placeholder="Cari produk"
                  class="form-control border-end-0"
                  type="search"
                />
                <button type="submit" class="btn btn-outline-secondary border-start-0 btn-sarch">
                  <i class="bi bi-search"></i>
                </button>
              </div>
            </form>
          </div>

          <!-- Header Actions -->
          <div class="col-4 col-lg-2">
            <div class="d-flex align-items-center justify-content-end gap-3">
              <!-- Mobile Search Toggle -->
              <a href="#" class="text-black social-header fs-5"><i class="bi bi-facebook"></i></a>
              <a href="#" class="text-black social-header fs-5"><i class="bi bi-instagram"></i></a>
              <a href="#" class="text-black social-header fs-5"><i class="bi bi-twitter"></i></a>
              <a href="#" class="text-black social-header fs-5"><i class="bi bi-linkedin"></i></a>

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
    <nav class="navbar navbar-expand-lg navbar-light bg-white border-top hide-mobile" :class="{ 'nav-hidden': isScrolled }">
      <div class="container">
        <!-- Desktop Menu -->
        <div class="collapse navbar-collapse d-none d-lg-block">
          <ul class="navbar-nav gap-4">
            <li v-for="menu in menus" :key="menu.path" class="nav-item">
              <NuxtLink 
                class="nav-link fw-medium text-decoration-none" 
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
          
          <NuxtLink to="#" class="d-flex align-items-center text-decoration-none" @click="closeMobileMenu">
            <i class="bi bi-bag fs-5 me-3"></i>
            <span>Shopping Cart</span>
            <span class="badge bg-success ms-auto">{{ cartCount }}</span>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Location Modal -->
    <div 
      v-if="isLocationModalOpen" 
      class="modal-overlay" 
      @click="closeLocationModal"
    >
      <div class="modal-dialog" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-geo-alt-fill me-2"></i>
              Pilih Lokasi Toko
            </h5>
            <button 
              type="button" 
              class="btn-close" 
              @click="closeLocationModal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <p class="text-muted mb-3">Pilih lokasi toko terdekat untuk pengalaman berbelanja yang lebih baik</p>
            
            <div class="location-list">
              <div 
                v-for="location in storeLocations" 
                :key="location.id"
                class="location-item"
                :class="{ 'active': selectedLocation.id === location.id }"
                @click="selectLocation(location)"
              >
                <div class="location-info">
                  <div class="location-name">{{ location.name }}</div>
                  <div class="location-address">{{ location.address }}</div>
                  <div class="location-phone">{{ location.phone }}</div>
                </div>
                <div class="location-check" v-if="selectedLocation.id === location.id">
                  <i class="bi bi-check-circle-fill text-success"></i>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button 
              type="button" 
              class="btn btn-secondary" 
              @click="closeLocationModal"
            >
              Batal
            </button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="saveSelectedLocation"
            >
              Simpan Lokasi
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>



<style scoped>

.main-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  transition: all 0.3s ease;
  z-index: 1030;
}

.main-header.scrolled {
  padding: 0.5rem 0;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
}

.topbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  transition: all 0.3s ease;
  z-index: 1029;
}

.main-header:not(.scrolled) {
  top: 42px;
}

/* Navigation positioning */
.navbar {
  position: fixed;
  top: 120px;
  left: 0;
  right: 0;
  z-index: 1028;
  transition: all 0.3s ease;
}

.navbar.nav-hidden {
  transform: translateY(-100%);
  opacity: 0;
  visibility: hidden;
}

.main-header.scrolled + .navbar {
  top: 70px;
}

:global(body) {
  padding-top: 160px;
}

/* Logo transition */
.logo-gg {
  transition: height 0.3s ease;
  max-height: 45px;
  width: auto;
}

/* Location button styling */
.location-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  background: white;
  color: #333;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.location-button:hover {
  border-color: #e62129;
  color: #e62129;
}

.locat-name {
  font-weight: 500;
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
  color: #e62129;
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

/* Navigation links */
.nav-link {
  color: #333 !important;
  transition: color 0.2s ease;
  position: relative;
}

.nav-link:hover,
.nav-link.active {
  color: #e62129 !important;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 30px;
  height: 2px;
  background: #e62129;
}

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
  color: #e62129;
  padding-left: 2rem;
}

.mobile-menu-actions {
  background: #f8f9fa;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  animation: fadeIn 0.3s ease forwards;
}

.modal-dialog {
  max-width: 500px;
  width: 90%;
  margin: 1rem;
}

.modal-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #dee2e6;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  color: #000;
}

.btn-close::before {
  content: "×";
}

.modal-body {
  padding: 1.5rem;
}

.location-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.location-item {
  display: flex;
  justify-content: between;
  align-items: center;
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.location-item:hover {
  border-color: #e62129;
  background: #f8f9fa;
}

.location-item.active {
  border-color: #e62129;
  background: #fff5f5;
}

.location-info {
  flex: 1;
}

.location-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
}

.location-address {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.location-phone {
  color: #888;
  font-size: 0.85rem;
}

.location-check {
  font-size: 1.25rem;
  margin-left: 1rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #dee2e6;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-primary {
  background: #e62129;
  color: white;
}

.btn-primary:hover {
  background: #c71e24;
}


:global(body.modal-open) {
  overflow: hidden;
}

:global(body.mobile-menu-open) {
  overflow: hidden;
}

/* Animations */
@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
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

  :global(body) {
    padding-top: 80px; /* Reduced padding for mobile */
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

  .modal-dialog {
    width: 95%;
  }

  .location-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .location-check {
    align-self: flex-end;
    margin-left: 0;
    margin-top: -1.5rem;
  }
}

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