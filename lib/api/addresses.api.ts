import type { PaginatedData, Address, AddressDetail, AddressFilters, CreateAddressDTO } from '@/lib/types/api.types'
import { MOCK_ADDRESSES, MOCK_ADDRESS_DETAILS, paginate } from '@/lib/mock/data'

export const addressesApi = {
  list: async (filters: AddressFilters = {}): Promise<PaginatedData<Address>> => {
    let items = [...MOCK_ADDRESSES]

    if (filters.search) {
      const q = filters.search.toLowerCase()
      items = items.filter(
        (a) =>
          a.city.toLowerCase().includes(q) ||
          a.country.toLowerCase().includes(q) ||
          a.region.toLowerCase().includes(q),
      )
    }
    if (filters.country) {
      items = items.filter((a) =>
        a.country.toLowerCase().includes(filters.country!.toLowerCase()),
      )
    }
    if (filters.city) {
      items = items.filter((a) =>
        a.city.toLowerCase().includes(filters.city!.toLowerCase()),
      )
    }
    if (filters.type) {
      items = items.filter((a) => a.type === filters.type)
    }

    return paginate(items, filters.page, filters.limit)
  },

  getById: async (id: string): Promise<AddressDetail> => {
    const detail = MOCK_ADDRESS_DETAILS.find((a) => a.id === id)
    if (!detail) throw new Error(`Address ${id} not found`)
    return detail
  },

  create: async (_dto: CreateAddressDTO): Promise<Address> => MOCK_ADDRESSES[0],
}
