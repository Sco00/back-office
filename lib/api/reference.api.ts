import { apiClient } from './client'
import type { ApiResponse, Currency, Nature, PaymentMethod, Address, Role } from '@/lib/types/api.types'

export const referenceApi = {
  currencies: async (): Promise<Currency[]> => {
    const { data } = await apiClient.get<ApiResponse<Currency[]>>('/ref/currencies')
    return data.data
  },

  paymentMethods: async (): Promise<PaymentMethod[]> => {
    const { data } = await apiClient.get<ApiResponse<PaymentMethod[]>>('/ref/payment-methods')
    return data.data
  },

  addresses: async (): Promise<Address[]> => {
    const { data } = await apiClient.get<ApiResponse<{ props: Address[] }>>('/addresses', { params: { limit: 100 } })
    return data.data.props
  },

  relaisAddresses: async (): Promise<Address[]> => {
    const { data } = await apiClient.get<ApiResponse<{ props: Address[] }>>('/addresses', { params: { type: 'RELAIS', limit: 100 } })
    return data.data.props
  },

  roles: async (): Promise<Role[]> => {
    const { data } = await apiClient.get<ApiResponse<Role[]>>('/ref/roles')
    return data.data
  },

  natures: async (): Promise<Nature[]> => {
    const { data } = await apiClient.get<ApiResponse<Nature[]>>('/ref/natures')
    return data.data
  },
}
