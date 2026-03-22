import { apiClient } from './client'
import type {
  ApiResponse,
  PaginatedData,
  Payment,
  PaymentFilters,
  CreatePaymentDTO,
} from '@/lib/types/api.types'

export const paymentsApi = {
  list: async (filters: PaymentFilters = {}): Promise<PaginatedData<Payment>> => {
    const { data } = await apiClient.get<ApiResponse<PaginatedData<Payment>>>('/payments', {
      params: filters,
    })
    return data.data
  },

  getById: async (id: string): Promise<Payment> => {
    const { data } = await apiClient.get<ApiResponse<Payment>>(`/payments/${id}`)
    return data.data
  },

  create: async (dto: CreatePaymentDTO): Promise<Payment> => {
    const { data } = await apiClient.post<ApiResponse<Payment>>('/payments', dto)
    return data.data
  },

  accept: async (id: string): Promise<void> => {
    await apiClient.patch(`/payments/${id}/accept`)
  },

  refund: async (id: string): Promise<void> => {
    await apiClient.patch(`/payments/${id}/refund`)
  },

  getInvoice: async (id: string): Promise<{ invoiceUrl: string }> => {
    const { data } = await apiClient.get<ApiResponse<{ invoiceUrl: string }>>(`/payments/${id}/invoice`)
    return data.data
  },
}
