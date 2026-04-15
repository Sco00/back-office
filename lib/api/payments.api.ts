import type {
  PaginatedData,
  Payment,
  PaymentFilters,
  CreatePaymentDTO,
} from '@/lib/types/api.types'
import { MOCK_PAYMENTS, paginate } from '@/lib/mock/data'

export const paymentsApi = {
  list: async (filters: PaymentFilters = {}): Promise<PaginatedData<Payment>> => {
    let items = [...MOCK_PAYMENTS]

    if (filters.packageId) {
      items = items.filter((p) => p.package.id === filters.packageId)
    }
    if (filters.accepted !== undefined) {
      items = items.filter((p) => p.accepted === filters.accepted)
    }
    if (filters.refunded !== undefined) {
      items = items.filter((p) => p.refunded === filters.refunded)
    }
    if (filters.currencyId) {
      items = items.filter((p) => p.currency.id === filters.currencyId)
    }
    if (filters.paymentMethodId) {
      items = items.filter((p) => p.paymentMethod.id === filters.paymentMethodId)
    }

    return paginate(items, filters.page, filters.limit)
  },

  getById: async (id: string): Promise<Payment> => {
    const pay = MOCK_PAYMENTS.find((p) => p.id === id)
    if (!pay) throw new Error(`Payment ${id} not found`)
    return pay
  },

  create: async (_dto: CreatePaymentDTO): Promise<Payment> => MOCK_PAYMENTS[0],

  accept: async (_id: string): Promise<void> => {},

  refund: async (_id: string): Promise<void> => {},

  getInvoice: async (_id: string): Promise<{ invoiceUrl: string }> => ({
    invoiceUrl: 'https://example.com/invoice-mock.pdf',
  }),
}
