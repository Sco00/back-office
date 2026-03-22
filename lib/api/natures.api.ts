import { apiClient } from './client'
import type { ApiResponse, Nature } from '@/lib/types/api.types'

export const naturesApi = {
  list: async (): Promise<Nature[]> => {
    const { data } = await apiClient.get<ApiResponse<Nature[]>>('/natures')
    return data.data
  },
}
