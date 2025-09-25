// plugins/store-location.client.ts
export default defineNuxtPlugin(() => {
  // Global store location state
  const storeState = reactive({
    uuid: null as string | null,
    data: null as any
  })
  
  // Load initial data from localStorage
  const loadInitialData = () => {
    if (process.client) {
      const uuid = localStorage.getItem('selectedStoreUUID')
      const data = localStorage.getItem('selectedLocation')
      
      if (uuid && data) {
        try {
          storeState.uuid = uuid
          storeState.data = JSON.parse(data)
        } catch (error) {
          console.error('Error loading store data:', error)
        }
      }
    }
  }
  
  // Listen for store changes
  const setupListener = () => {
    if (process.client) {
      window.addEventListener('storeLocationChanged', (event: CustomEvent) => {
        storeState.uuid = event.detail.storeUUID
        storeState.data = event.detail.storeData
      })
    }
  }
  
  // Initialize
  loadInitialData()
  setupListener()
  
  // Provide global access
  return {
    provide: {
      store: {
        get uuid() { return storeState.uuid },
        get data() { return storeState.data },
        refresh: loadInitialData,
        
        // Helper for API calls
        apiCall: async (url: string, options: RequestInit = {}) => {
          const storeUUID = storeState.uuid
          if (!storeUUID) {
            throw new Error('No store selected')
          }
          
          const enhancedOptions = {
            ...options,
            headers: {
              ...options.headers,
              'X-Store-UUID': storeUUID,
              'Content-Type': 'application/json'
            }
          }
          
          return $fetch(url, enhancedOptions)
        }
      }
    }
  }
})

// Usage in components:
/*
// Access via useNuxtApp()
const { $store } = useNuxtApp()

// Watch for changes
watch(() => $store.uuid, (newUUID) => {
  console.log('Store UUID changed:', newUUID)
})

// Make API calls
const fetchData = async () => {
  try {
    const data = await $store.apiCall('/api/products')
    return data
  } catch (error) {
    console.error('API call failed:', error)
  }
}
*/