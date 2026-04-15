import type {
  PaginatedData,
  Relay,
  RelayDetail,
  RelayFilters,
  CreateRelayDTO,
} from '@/lib/types/api.types'
import { MOCK_RELAYS, MOCK_RELAY_DETAILS, paginate } from '@/lib/mock/data'

export const relaysApi = {
  list: async (filters: RelayFilters = {}): Promise<PaginatedData<Relay>> => {
    let items = [...MOCK_RELAYS]

    if (filters.search) {
      const q = filters.search.toLowerCase()
      items = items.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.address.city.toLowerCase().includes(q) ||
          r.person.firstName.toLowerCase().includes(q) ||
          r.person.lastName.toLowerCase().includes(q),
      )
    }
    if (filters.country) {
      items = items.filter((r) =>
        r.address.country.toLowerCase().includes(filters.country!.toLowerCase()),
      )
    }
    if (filters.city) {
      items = items.filter((r) =>
        r.address.city.toLowerCase().includes(filters.city!.toLowerCase()),
      )
    }

    return paginate(items, filters.page, filters.limit)
  },

  getById: async (id: string): Promise<RelayDetail> => {
    const detail = MOCK_RELAY_DETAILS.find((r) => r.id === id)
    if (!detail) throw new Error(`Relay ${id} not found`)
    return detail
  },

  create: async (_dto: CreateRelayDTO): Promise<Relay> => MOCK_RELAYS[0],
}
