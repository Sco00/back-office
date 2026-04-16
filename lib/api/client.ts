import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'
import { authApi } from './auth.api'

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Injecter le token à chaque requête
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ── Refresh token avec protection contre les appels simultanés ──
let isRefreshing = false
let queue: Array<(token: string) => void> = []

const processQueue = (token: string) => {
  queue.forEach((resolve) => resolve(token))
  queue = []
}

const logout = () => {
  useAuthStore.getState().clearAuth()
  if (typeof window !== 'undefined') window.location.href = '/login'
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }

    const { refreshToken } = useAuthStore.getState()
    if (!refreshToken) {
      logout()
      return Promise.reject(error)
    }

    // Si un refresh est déjà en cours, mettre la requête en file d'attente
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push((token) => {
          original.headers.Authorization = `Bearer ${token}`
          resolve(apiClient(original))
        })
      })
    }

    original._retry = true
    isRefreshing = true

    try {
      const { accessToken } = await authApi.refresh(refreshToken)
      useAuthStore.getState().setAccessToken(accessToken)
      processQueue(accessToken)
      original.headers.Authorization = `Bearer ${accessToken}`
      return apiClient(original)
    } catch {
      queue = []
      logout()
      return Promise.reject(error)
    } finally {
      isRefreshing = false
    }
  }
)
