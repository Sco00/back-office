import { apiClient } from './client'
import type { ApiResponse, Account, CreateAccountDTO } from '@/lib/types/api.types'

export const accountsApi = {
  create: async (dto: CreateAccountDTO): Promise<Account> => {
    const { data } = await apiClient.post<ApiResponse<Account>>('/accounts', dto)
    return data.data
  },
}
