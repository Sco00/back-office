import axios from 'axios'
import { apiClient } from './client'
import type { ApiResponse, LoginResponse, LoginDTO } from '@/lib/types/api.types'

export const authApi = {
  login: async (dto: LoginDTO): Promise<LoginResponse> => {
    const { data } = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', dto)
    return data.data
  },

  refresh: async (refreshToken: string): Promise<{ accessToken: string }> => {
    const { data } = await axios.post<ApiResponse<{ accessToken: string }>>(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
      { refreshToken }
    )
    return data.data
  },
}
