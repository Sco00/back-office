import type {
  PaginatedData,
  Departure,
  DepartureDetail,
  DepartureFilters,
  CreateDepartureDTO,
  DepartureStates,
} from '@/lib/types/api.types'
import { MOCK_DEPARTURES, MOCK_DEPARTURE_DETAILS, paginate } from '@/lib/mock/data'
import { getDepartureState } from '@/lib/types/api.types'

export const departuresApi = {
  list: async (filters: DepartureFilters = {}): Promise<PaginatedData<Departure>> => {
    let items = [...MOCK_DEPARTURES]

    if (filters.departureCountry) {
      items = items.filter((d) =>
        d.departureAddress.country.toLowerCase().includes(filters.departureCountry!.toLowerCase()),
      )
    }
    if (filters.destinationCountry) {
      items = items.filter((d) =>
        d.destinationAddress.country.toLowerCase().includes(filters.destinationCountry!.toLowerCase()),
      )
    }
    if (filters.isClosed !== undefined) {
      items = items.filter((d) => d.isClosed === filters.isClosed)
    }
    if (filters.search) {
      const q = filters.search.toLowerCase()
      items = items.filter(
        (d) =>
          d.departureAddress.city.toLowerCase().includes(q) ||
          d.destinationAddress.city.toLowerCase().includes(q),
      )
    }

    return paginate(items, filters.page, filters.limit)
  },

  getById: async (id: string): Promise<DepartureDetail> => {
    const detail = MOCK_DEPARTURE_DETAILS.find((d) => d.id === id)
    if (!detail) throw new Error(`Departure ${id} not found`)
    return detail
  },

  create: async (_dto: CreateDepartureDTO): Promise<Departure> => MOCK_DEPARTURES[0],

  close: async (_id: string): Promise<void> => {},

  updateState: async (_id: string, _state: DepartureStates): Promise<void> => {},
}
