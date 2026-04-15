import type { Currency, Nature, PaymentMethod, Address, Role } from '@/lib/types/api.types'
import {
  MOCK_CURRENCIES,
  MOCK_PAYMENT_METHODS,
  MOCK_NATURES,
  MOCK_ROLES,
  MOCK_ADDRESSES,
} from '@/lib/mock/data'

export const referenceApi = {
  currencies: async (): Promise<Currency[]> => MOCK_CURRENCIES,

  paymentMethods: async (): Promise<PaymentMethod[]> => MOCK_PAYMENT_METHODS,

  addresses: async (): Promise<Address[]> => MOCK_ADDRESSES,

  relaisAddresses: async (): Promise<Address[]> =>
    MOCK_ADDRESSES.filter((a) => a.type === 'RELAIS'),

  roles: async (): Promise<Role[]> => MOCK_ROLES,

  natures: async (): Promise<Nature[]> => MOCK_NATURES,
}
