import { apiClient } from './client'
import type {
  ApiResponse,
  PaginatedData,
  Departure,
  DepartureDetail,
  DepartureFilters,
  CreateDepartureDTO,
  DepartureStates,
} from '@/lib/types/api.types'

export const departuresApi = {
  list: async (filters: DepartureFilters = {}): Promise<PaginatedData<Departure>> => {
    const { data } = await apiClient.get<ApiResponse<PaginatedData<Departure>>>('/departures', {
      params: filters,
    })
    return data.data
  },

  getById: async (id: string): Promise<DepartureDetail> => {
    const { data } = await apiClient.get<ApiResponse<DepartureDetail>>(`/departures/${id}`)
    return data.data
  },

  create: async (dto: CreateDepartureDTO): Promise<Departure> => {
    const { data } = await apiClient.post<ApiResponse<Departure>>('/departures', dto)
    return data.data
  },

  close: async (id: string): Promise<void> => {
    await apiClient.patch(`/departures/${id}/close`)
  },

  updateState: async (id: string, state: DepartureStates): Promise<void> => {
    await apiClient.patch(`/departures/${id}/state`, { state })
  },
}
