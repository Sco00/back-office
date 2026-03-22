import { apiClient } from './client'
import type {
  ApiResponse,
  PaginatedData,
  Relay,
  RelayDetail,
  RelayFilters,
  CreateRelayDTO,
} from '@/lib/types/api.types'

export const relaysApi = {
  list: async (filters: RelayFilters = {}): Promise<PaginatedData<Relay>> => {
    const { data } = await apiClient.get<ApiResponse<PaginatedData<Relay>>>('/relays', {
      params: filters,
    })
    return data.data
  },

  getById: async (id: string): Promise<RelayDetail> => {
    const { data } = await apiClient.get<ApiResponse<RelayDetail>>(`/relays/${id}`)
    return data.data
  },

  create: async (dto: CreateRelayDTO): Promise<Relay> => {
    const { data } = await apiClient.post<ApiResponse<Relay>>('/relays', dto)
    return data.data
  },
}
