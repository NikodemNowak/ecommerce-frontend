import axios from 'axios'
import { useAuthStore } from '../stores/auth'
import router from '../router'

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json'
  }
})

// dodaje token do każdego żądania
api.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }
  return config
})

// obsługa błędów 401 - przekieruj do logowania
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const authStore = useAuthStore()
    
    if (error.response?.status === 401) {
      // próba odświeżenia tokena
      if (authStore.refreshToken && !error.config._retry) {
        error.config._retry = true
        try {
          await authStore.refresh()
          error.config.headers.Authorization = `Bearer ${authStore.token}`
          return api(error.config)
        } catch {
          authStore.logout()
          router.push({ name: 'Login' })
        }
      } else {
        authStore.logout()
        router.push({ name: 'Login' })
      }
    }
    return Promise.reject(error)
  }
)

export default api
