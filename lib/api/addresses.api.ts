import { apiClient } from './client'
import type { ApiResponse, PaginatedData, Address, AddressDetail, AddressFilters, CreateAddressDTO } from '@/lib/types/api.types'

export const addressesApi = {
  list: async (filters: AddressFilters = {}): Promise<PaginatedData<Address>> => {
    const { data } = await apiClient.get<ApiResponse<PaginatedData<Address>>>('/addresses', { params: filters })
    return data.data
  },

  getById: async (id: string): Promise<AddressDetail> => {
    const { data } = await apiClient.get<ApiResponse<AddressDetail>>(`/addresses/${id}`)
    return data.data
  },

  create: async (dto: CreateAddressDTO): Promise<Address> => {
    const { data } = await apiClient.post<ApiResponse<Address>>('/addresses', dto)
    return data.data
  },
}
