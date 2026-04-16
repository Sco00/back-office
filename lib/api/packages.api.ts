import { apiClient } from './client'
import type {
  ApiResponse,
  PaginatedData,
  Package,
  PackageFilters,
  CreatePackageDTO,
  PackageStates,
} from '@/lib/types/api.types'

export const packagesApi = {
  list: async (filters: PackageFilters = {}): Promise<PaginatedData<Package>> => {
    const { data } = await apiClient.get<ApiResponse<PaginatedData<Package>>>('/packages', {
      params: filters,
    })
    return data.data
  },

  getById: async (id: string): Promise<Package> => {
    const { data } = await apiClient.get<ApiResponse<Package>>(`/packages/${id}`)
    return data.data
  },

  create: async (dto: CreatePackageDTO): Promise<Package> => {
    const { data } = await apiClient.post<ApiResponse<Package>>('/packages', dto)
    return data.data
  },

  updateStatus: async (id: string, state: PackageStates): Promise<void> => {
    await apiClient.patch(`/packages/${id}/status`, { state })
  },

  archive: async (id: string): Promise<void> => {
    await apiClient.patch(`/packages/${id}/archive`)
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/packages/${id}`)
  },

  addNature: async (id: string, dto: { natureId: string; quantity: number }): Promise<void> => {
    await apiClient.post(`/packages/${id}/natures`, dto)
  },

  removeNature: async (id: string, natureId: string): Promise<void> => {
    await apiClient.delete(`/packages/${id}/natures/${natureId}`)
  },

  getQuoteUrl: (id: string): string => {
    return `/api/packages/${id}/quote`
  },
}
