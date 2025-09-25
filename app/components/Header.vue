<script setup lang="ts">

interface StoreLocation {
  id: string 
  uuid: string
  name: string
  address: string
  phone: string
  latitude: number
  longitude: number
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
    id: "wdjqwd809dijqwiodj",
    uuid: "550e8400-e29b-41d4-a716-446655440001",
    name: "Samarinda",
    address: "Jl Kemakmuran no 71, Sungai Pindang Dalam, Kota Samarinda, Kalimantan Timur (75242)",
    phone: "081130776712",
    latitude: -0.502106,
    longitude: 117.153709
  },
  {
    id: "wdjqwd809dijqwiedw",
    uuid: "550e8400-e29b-41d4-a716-446655440002",
    name: "Kupang",
    address: "Jl. Terusan Timor Raya No.3, Oesapa, Kec. Klp. Lima, Kota Kupang, Nusa Tenggara Tim (85228)",
    phone: "081130757550",
    latitude: -10.178757,
    longitude: 123.597603
  }
]

const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)
const isMobileSearchOpen = ref(false)
const isLocationModalOpen = ref(false)
const isLocationApprovalModalOpen = ref(false)
const searchQuery = ref('')
const wishlistCount = ref(4)
const cartCount = ref(5)
const userLocationName = ref('')
const detectedLocation = ref<StoreLocation | null>(null)
const userLatitude = ref<number | null>(null)
const userLongitude = ref<number | null>(null)
const mapLoaded = ref(false)

const selectedLocation = ref<StoreLocation>(storeLocations[1])

// Global store UUID composable for use across components
const useSelectedStoreUUID = () => {
  return {
    getStoreUUID: () => selectedLocation.value.uuid,
    getStoreData: () => selectedLocation.value
  }
}

// Location functions
const openLocationModal = () => {
  isLocationModalOpen.value = true
  document.body.classList.add('modal-open')
  // Load map after modal opens
  setTimeout(initializeMap, 300)
}

const closeLocationModal = () => {
  isLocationModalOpen.value = false
  document.body.classList.remove('modal-open')
}

const openLocationApprovalModal = () => {
  isLocationApprovalModalOpen.value = true
  document.body.classList.add('modal-open')
  // Load map after modal opens
  setTimeout(initializeMap, 300)
}

const closeLocationApprovalModal = () => {
  isLocationApprovalModalOpen.value = false
  document.body.classList.remove('modal-open')
}

const selectLocation = (location: StoreLocation) => {
  selectedLocation.value = location
}

const saveSelectedLocation = () => {
  if (process.client) {
    localStorage.setItem('selectedLocation', JSON.stringify(selectedLocation.value))
    localStorage.setItem('selectedStoreUUID', selectedLocation.value.uuid)
    // Emit event for other components to listen
    window.dispatchEvent(new CustomEvent('storeLocationChanged', { 
      detail: { 
        storeUUID: selectedLocation.value.uuid,
        storeData: selectedLocation.value 
      } 
    }))
  }
  closeLocationModal()
}

const approveDetectedLocation = () => {
  if (detectedLocation.value) {
    selectedLocation.value = detectedLocation.value
    if (process.client) {
      localStorage.setItem('selectedLocation', JSON.stringify(selectedLocation.value))
      localStorage.setItem('selectedStoreUUID', selectedLocation.value.uuid)
      localStorage.setItem('locationApproved', 'true')
      // Emit event for other components
      window.dispatchEvent(new CustomEvent('storeLocationChanged', { 
        detail: { 
          storeUUID: selectedLocation.value.uuid,
          storeData: selectedLocation.value 
        } 
      }))
    }
  }
  closeLocationApprovalModal()
}

const rejectDetectedLocation = () => {
  closeLocationApprovalModal()
  // Optionally open manual location selection modal
  setTimeout(() => {
    openLocationModal()
  }, 300)
}

const getLocationName = async (latitude: number, longitude: number) => {
  try {
    // Using a free geocoding service (you might want to use Google Maps API in production)
    const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=id`)
    const data = await response.json()
    return data.city || data.locality || data.principalSubdivision || 'Lokasi tidak diketahui'
  } catch (error) {
    console.error('Error getting location name:', error)
    return 'Lokasi tidak diketahui'
  }
}

const detectUserLocation = () => {
  if (process.client && navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLat = position.coords.latitude
        const userLng = position.coords.longitude
        
        // Store user coordinates
        userLatitude.value = userLat
        userLongitude.value = userLng
        
        console.log('User location:', userLat, userLng)
        
        // Get location name
        userLocationName.value = await getLocationName(userLat, userLng)
        
        // Determine nearest store based on distance
        let nearestStore = storeLocations[0]
        let minDistance = calculateDistance(userLat, userLng, nearestStore.latitude, nearestStore.longitude)
        
        storeLocations.forEach(store => {
          const distance = calculateDistance(userLat, userLng, store.latitude, store.longitude)
          if (distance < minDistance) {
            minDistance = distance
            nearestStore = store
          }
        })
        
        detectedLocation.value = nearestStore
        
        // Show approval modal
        openLocationApprovalModal()
      },
      (error) => {
        console.log('Location detection error:', error)
        selectedLocation.value = storeLocations[1]
        
        // Show manual location selection if geolocation fails
        setTimeout(() => {
          openLocationModal()
        }, 1000)
      }
    )
  }
}

// Calculate distance between two points (Haversine formula)
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371 // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Initialize map for both modals
const initializeMap = () => {
  if (!process.client || mapLoaded.value) return
  
  // Load Leaflet dynamically
  const script = document.createElement('script')
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'
  script.onload = () => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'
    document.head.appendChild(link)
    
    setTimeout(() => {
      createMap()
      mapLoaded.value = true
    }, 100)
  }
  document.head.appendChild(script)
}

const createMap = () => {
  const mapContainer = document.getElementById('locationMap')
  if (!mapContainer || !window.L) return
  
  // Clear existing map
  mapContainer.innerHTML = ''
  
  // Determine map center and zoom
  let center, zoom
  if (userLatitude.value && userLongitude.value) {
    center = [userLatitude.value, userLongitude.value]
    zoom = 10
  } else if (detectedLocation.value) {
    center = [detectedLocation.value.latitude, detectedLocation.value.longitude]
    zoom = 12
  } else {
    // Default center (Indonesia)
    center = [-2.5489, 118.0149]
    zoom = 5
  }
  
  const map = window.L.map('locationMap').setView(center, zoom)
  
  // Add OpenStreetMap tiles
  window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map)
  
  // Add user location marker if available
  if (userLatitude.value && userLongitude.value) {
    const userIcon = window.L.divIcon({
      className: 'user-location-marker',
      html: '<div class="user-marker"><i class="bi bi-person-fill"></i></div>',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    })
    
    window.L.marker([userLatitude.value, userLongitude.value], { icon: userIcon })
      .bindPopup('Lokasi Anda')
      .addTo(map)
  }
  
  // Add store location markers
  storeLocations.forEach(store => {
    const isSelected = selectedLocation.value.id === store.id
    const storeIcon = window.L.divIcon({
      className: 'store-location-marker',
      html: `<div class="store-marker ${isSelected ? 'selected' : ''}" data-store-id="${store.id}">
               <i class="bi bi-shop"></i>
             </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    })
    
    const marker = window.L.marker([store.latitude, store.longitude], { icon: storeIcon })
      .bindPopup(`
        <div class="store-popup">
          <h6>${store.name}</h6>
          <p><i class="bi bi-geo-alt"></i> ${store.address}</p>
          <p><i class="bi bi-telephone"></i> ${store.phone}</p>
          <button class="btn btn-sm btn-primary" onclick="selectStoreFromMap('${store.id}')">
            Pilih Toko Ini
          </button>
        </div>
      `)
      .addTo(map)
    
    // Add click event to marker
    marker.on('click', () => {
      selectLocation(store)
      updateMapMarkers()
    })
  })
}

// Global function to select store from map popup
if (process.client) {
  window.selectStoreFromMap = (storeId: string) => {
    const store = storeLocations.find(s => s.id === storeId)
    if (store) {
      selectLocation(store)
      updateMapMarkers()
    }
  }
}

const updateMapMarkers = () => {
  // Update marker styles to reflect selection
  const markers = document.querySelectorAll('.store-marker')
  markers.forEach(marker => {
    const storeId = marker.getAttribute('data-store-id')
    if (storeId === selectedLocation.value.id) {
      marker.classList.add('selected')
    } else {
      marker.classList.remove('selected')
    }
  })
}

// Load saved location from localStorage
const loadSavedLocation = () => {
  if (process.client) {
    const savedLocation = localStorage.getItem('selectedLocation')
    const locationApproved = localStorage.getItem('locationApproved')
    const savedUUID = localStorage.getItem('selectedStoreUUID')
    
    if (savedLocation && locationApproved && savedUUID) {
      try {
        const parsedLocation = JSON.parse(savedLocation)
        // Verify UUID matches
        if (parsedLocation.uuid === savedUUID) {
          selectedLocation.value = parsedLocation
        } else {
          // UUID mismatch, reset
          localStorage.removeItem('selectedLocation')
          localStorage.removeItem('selectedStoreUUID')
          localStorage.removeItem('locationApproved')
          detectUserLocation()
        }
      } catch (error) {
        console.error('Error parsing saved location:', error)
        selectedLocation.value = storeLocations[1]
      }
    } else {
      // Only detect location if not previously approved
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

// Expose store UUID function globally
if (process.client) {
  window.getSelectedStoreUUID = () => selectedLocation.value.uuid
  window.getSelectedStoreData = () => selectedLocation.value
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

// Provide store data for child components
provide('selectedStore', {
  uuid: computed(() => selectedLocation.value.uuid),
  data: computed(() => selectedLocation.value),
  refresh: loadSavedLocation
})
</script>

<template>
  <div>
    <!-- Topbar -->
    <div class="topbar bg-light py-1 border-bottom" :class="{ 'd-none': isScrolled }">
      <div class="container">
        <div class="row">
          <div class="col-md-6 col-12 text-center text-md-start">
            <span class="small">Gudang Grosiran – <strong>Belanja Grosir, Kualitas Premium</strong></span>
          </div>
          <div class="col-md-6 text-end d-none d-md-block">
            <!-- <span class="dropdown-toggle cursor-pointer small">
              <i class="bi bi-globe me-1"></i>
              English
            </span> -->
          </div>
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
                      <i class="bi bi-shop" style="font-size:20px;color:#333;"></i>
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
              <!-- Social Media Links -->
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
                <i class="text-main bi" :class="isMobileMenuOpen ? 'bi-x-lg' : 'bi-list'" style="font-size: 1.5rem;"></i>
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
      </div>
    </div>

    <!-- Location Approval Modal -->
    <div 
      v-if="isLocationApprovalModalOpen" 
      class="modal-overlay" 
      @click="closeLocationApprovalModal"
    >
      <div class="modal-dialog" @click.stop>
        <div class="modal-content location-approval-modal">
          <div class="modal-header">
            <h6 class="modal-title">
              <i class="bi bi-geo-alt-fill me-2 text-main"></i>
              Konfirmasi Lokasi Anda
            </h6>
          </div>
          <div class="modal-body">
            <!-- Map Container -->
            <div class="map-container mb-3">
              <div id="locationMap" class="location-map"></div>
              <!-- Bouncing Location Pin -->
              <div class="location-pin-overlay">
                <div class="location-pin bounce">
                  <i class="bi bi-geo-alt-fill"></i>
                </div>
              </div>
            </div>
            
            <div class="text-center">
              <span class="mb-1">Alamat Anda saat ini:</span>
              <p class="user-location-text mx-2 mb-3">
                <i class="bi bi-pin-map me-2"></i>
                <strong>{{ userLocationName || 'Mendeteksi lokasi...' }}</strong>
              </p>
              
              <div class="nearest-store-info" v-if="detectedLocation">
                <p class="mb-2">Kami akan mengarahkan Anda ke toko terdekat:</p>
                <div class="store-card">
                  <div class="store-name">
                    <i class="bi bi-shop me-2"></i>
                    <strong>{{ detectedLocation.name }}</strong>
                  </div>
                  <div class="store-address text-muted">
                    {{ detectedLocation.address }}
                  </div>
                  <div class="store-phone text-muted">
                    <i class="bi bi-telephone me-1"></i>
                    {{ detectedLocation.phone }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer justify-content-center">
            <button 
              type="button" 
              class="btn btn-sm btn-outline-main-black me-2" 
              @click="rejectDetectedLocation"
            >
              Pilih Manual
            </button>
            <button 
              type="button" 
              class="btn btn-sm btn-primary" 
              @click="approveDetectedLocation"
            >
              Ya, Benar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Location Manual Selection Modal -->
    <div 
      v-if="isLocationModalOpen" 
      class="modal-overlay" 
      @click="closeLocationModal"
    >
      <div class="modal-dialog modal-lg" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h6 class="modal-title">
              <i class="bi bi-geo-alt-fill me-2"></i>
              Pilih Lokasi Toko
            </h6>
            <button 
              type="button" 
              class="btn-close" 
              @click="closeLocationModal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <!-- Map Container -->
            <div class="map-container mb-4">
              <div id="locationMap" class="location-map"></div>
              <!-- Bouncing Location Pin for selected store -->
              <div class="location-pin-overlay" v-if="selectedLocation">
                <div class="location-pin bounce selected">
                  <i class="bi bi-shop"></i>
                </div>
              </div>
            </div>
            
            <p class="text-muted mx-3 mb-3">Pilih lokasi toko terdekat untuk pengalaman berbelanja yang lebih baik</p>
            
            <div class="location-list mx-3">
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
                  <div class="location-uuid text-muted small">ID: {{ location.uuid }}</div>
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
              class="btn btn-sm btn-outline-main-black" 
              @click="closeLocationModal"
            >
              Batal
            </button>
            <button 
              type="button" 
              class="btn btn-sm btn-primary" 
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

/* Map Styles */
.map-container {
  position: relative;
  height: 175px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.location-map {
  width: 100%;
  height: 100%;
}

/* Bouncing Pin Overlay */
.location-pin-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.location-pin {
  width: 40px;
  height: 40px;
  background: #ff4444;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  box-shadow: 0 4px 12px rgba(255, 68, 68, 0.4);
  position: relative;
}

.location-pin i {
  transform: rotate(45deg);
}

.location-pin.selected {
  background: #28a745;
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
}

/* Bounce Animation */
.location-pin.bounce {
  animation: bouncePin 2s infinite;
}

@keyframes bouncePin {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0) rotate(-45deg);
  }
  40% {
    transform: translateY(-10px) rotate(-45deg);
  }
  60% {
    transform: translateY(-5px) rotate(-45deg);
  }
}

/* Custom Map Markers */
:global(.user-location-marker) {
  background: transparent !important;
  border: none !important;
}

:global(.user-marker) {
  width: 30px;
  height: 30px;
  background: #007bff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.4);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.4);
  }
  50% {
    box-shadow: 0 2px 20px rgba(0, 123, 255, 0.8);
  }
  100% {
    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.4);
  }
}

:global(.store-location-marker) {
  background: transparent !important;
  border: none !important;
}

:global(.store-marker) {
  width: 40px;
  height: 40px;
  background: #e62129;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  box-shadow: 0 3px 10px rgba(230, 33, 41, 0.4);
  transition: all 0.3s ease;
  cursor: pointer;
}

:global(.store-marker:hover) {
  transform: scale(1.1);
  box-shadow: 0 5px 15px rgba(230, 33, 41, 0.6);
}

:global(.store-marker.selected) {
  background: #28a745;
  box-shadow: 0 3px 10px rgba(40, 167, 69, 0.4);
  animation: selectedPulse 1.5s infinite;
}

@keyframes selectedPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* Store Popup Styles */
:global(.store-popup) {
  min-width: 200px;
}

:global(.store-popup h6) {
  margin: 0 0 8px 0;
  color: #e62129;
  font-weight: 600;
}

:global(.store-popup p) {
  margin: 4px 0;
  font-size: 13px;
  line-height: 1.4;
}

:global(.store-popup .btn) {
  margin-top: 8px;
  width: 100%;
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
.btn-sarch {
    background-color: #e62129;
    border-color: #e62129;
    color: #fff;
}

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

.modal-dialog.modal-lg {
  max-width: 800px;
}

.modal-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s ease;
}

/* Location Approval Modal Styles */
.location-icon {
  display: flex;
  justify-content: center;
  align-items: center;
}

.user-location-text {
  color: #333;
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.nearest-store-info {
  background: #fff5f5;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #ffe0e0;
}

.store-card {
  background: white;
  padding: 1rem;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: left;
}

.store-name {
  color: #e62129;
  margin-bottom: 0.5rem;
}

.store-address {
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.store-phone {
  font-size: 0.95rem;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #dee2e6;
}

.modal-title {
  margin: 0;
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
  font-size: 14px;
}

.location-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.location-item {
  display: flex;
  justify-content: space-between;
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
  margin-bottom: 0.25rem;
}

.location-uuid {
  color: #999;
  font-size: 0.75rem;
  font-family: monospace;
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
  display: inline-flex;
  align-items: center;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-outline-secondary:hover {
  background: #6c757d;
  color: white;
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
    padding-top: 80px;
  }
  
  .map-container {
    height: 250px;
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
  
  .modal-dialog.modal-lg {
    width: 98%;
    max-width: none;
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

  .location-approval-modal .modal-body {
    padding: 1.5rem 1rem;
  }

  .store-card {
    padding: 0.75rem;
  }

  .user-location-text {
    font-size: 1rem;
    padding: 0.75rem;
  }
  
  .map-container {
    height: 200px;
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