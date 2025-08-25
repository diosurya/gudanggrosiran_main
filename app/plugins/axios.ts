import axios from "axios"

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const api = axios.create({
    baseURL: config.public.apiBase || "http://localhost:8000/api",
    headers: {
      "Content-Type": "application/json"
    }
  })

  return {
    provide: {
      api
    }
  }
})
