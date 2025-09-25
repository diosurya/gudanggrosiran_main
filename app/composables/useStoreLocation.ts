// composables/useStoreLocation.ts
export const useStoreLocation = () => {
  const selectedStoreUUID = ref<string | null>(null)
  const selectedStoreData = ref<any>(null)
  
  // Load from localStorage on client side
  const loadStoreData = () => {
    if (process.client) {
      const uuid = localStorage.getItem('selectedStoreUUID')
      const storeData = localStorage.getItem('selectedLocation')
      
      if (uuid && storeData) {
        try {
          selectedStoreUUID.value = uuid
          selectedStoreData.value = JSON.parse(storeData)
        } catch (error) {
          console.error('Error parsing store data:', error)
        }
      }
    }
  }
  
  // Listen for store location changes
  const setupLocationListener = () => {
    if (process.client) {
      const handleLocationChange = (event: CustomEvent) => {
        selectedStoreUUID.value = event.detail.storeUUID
        selectedStoreData.value = event.detail.storeData
      }
      
      window.addEventListener('storeLocationChanged', handleLocationChange as EventListener)
      
      return () => {
        window.removeEventListener('storeLocationChanged', handleLocationChange as EventListener)
      }
    }
  }
  
  // API helper function
  const fetchWithStoreContext = async (url: string, options: RequestInit = {}) => {
    const storeUUID = selectedStoreUUID.value || localStorage.getItem('selectedStoreUUID')
    
    if (!storeUUID) {
      throw new Error('No store selected')
    }
    
    // Add store UUID to headers or query params
    const enhancedOptions = {
      ...options,
      headers: {
        ...options.headers,
        'X-Store-UUID': storeUUID,
      }
    }
    
    // Or add as query parameter
    const separator = url.includes('?') ? '&' : '?'
    const enhancedUrl = `${url}${separator}store_uuid=${storeUUID}`
    
    return fetch(enhancedUrl, enhancedOptions)
  }
  
  onMounted(() => {
    loadStoreData()
    setupLocationListener()
  })
  
  return {
    selectedStoreUUID: readonly(selectedStoreUUID),
    selectedStoreData: readonly(selectedStoreData),
    loadStoreData,
    fetchWithStoreContext
  }
}

// Example usage in any component:
/*
// In your component script:
const { selectedStoreUUID, selectedStoreData, fetchWithStoreContext } = useStoreLocation()

// Watch for store changes
watch(selectedStoreUUID, (newUUID) => {
  if (newUUID) {
    console.log('Store changed to:', newUUID)
    // Refresh your data or make API calls
  }
})

// Make API calls with store context
const fetchProducts = async () => {
  try {
    const response = await fetchWithStoreContext('/api/products')
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Failed to fetch products:', error)
  }
}
*/