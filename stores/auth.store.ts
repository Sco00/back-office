'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthUser {
  id:     string
  email:  string
  role:   string
  person: { firstName: string; lastName: string }
}

interface AuthStore {
  accessToken:  string | null
  refreshToken: string | null
  user:         AuthUser | null
  setAuth:        (data: { accessToken: string; refreshToken: string; user: AuthUser }) => void
  setAccessToken: (token: string) => void
  clearAuth:      () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      accessToken:  null,
      refreshToken: null,
      user:         null,

      setAuth: (data) => {
        // Stocker le token dans un cookie pour le middleware
        document.cookie = `auth-token=${data.accessToken}; path=/; max-age=${60 * 60 * 24 * 7}`
        set({
          accessToken:  data.accessToken,
          refreshToken: data.refreshToken,
          user:         data.user,
        })
      },

      setAccessToken: (token) => {
        document.cookie = `auth-token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`
        set({ accessToken: token })
      },

      clearAuth: () => {
        document.cookie = 'auth-token=; path=/; max-age=0'
        set({ accessToken: null, refreshToken: null, user: null })
      },
    }),
    { name: 'yobbalgp-auth' }
  )
)
