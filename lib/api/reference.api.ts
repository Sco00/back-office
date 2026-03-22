import { apiClient } from './client'
import type { ApiResponse, Currency, PaymentMethod, Address, Role } from '@/lib/types/api.types'

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
    const { data } = await apiClient.get<ApiResponse<Address[]>>('/ref/addresses')
    return data.data
  },

  relaisAddresses: async (): Promise<Address[]> => {
    const { data } = await apiClient.get<ApiResponse<Address[]>>('/ref/addresses', { params: { type: 'RELAIS' } })
    return data.data
  },

  roles: async (): Promise<Role[]> => {
    const { data } = await apiClient.get<ApiResponse<Role[]>>('/ref/roles')
    return data.data
  },
}
