import type {
  PaginatedData,
  Package,
  PackageFilters,
  CreatePackageDTO,
  PackageStates,
} from '@/lib/types/api.types'
import { MOCK_PACKAGES, paginate } from '@/lib/mock/data'
import { getPackageState } from '@/lib/types/api.types'

export const packagesApi = {
  list: async (filters: PackageFilters = {}): Promise<PaginatedData<Package>> => {
    let items = [...MOCK_PACKAGES]

    if (filters.state) {
      items = items.filter((p) => getPackageState(p) === filters.state)
    }
    if (filters.search) {
      const q = filters.search.toLowerCase()
      items = items.filter(
        (p) =>
          p.reference.toLowerCase().includes(q) ||
          p.person.firstName.toLowerCase().includes(q) ||
          p.person.lastName.toLowerCase().includes(q),
      )
    }
    if (filters.departureCountry) {
      items = items.filter((p) =>
        p.departureGp.departureAddress.country
          .toLowerCase()
          .includes(filters.departureCountry!.toLowerCase()),
      )
    }
    if (filters.destinationCountry) {
      items = items.filter((p) =>
        p.departureGp.destinationAddress.country
          .toLowerCase()
          .includes(filters.destinationCountry!.toLowerCase()),
      )
    }
    if (filters.unpaidOnly) {
      items = items.filter((p) => p.payments.length === 0)
    }

    return paginate(items, filters.page, filters.limit)
  },

  getById: async (id: string): Promise<Package> => {
    const pkg = MOCK_PACKAGES.find((p) => p.id === id)
    if (!pkg) throw new Error(`Package ${id} not found`)
    return pkg
  },

  create: async (_dto: CreatePackageDTO): Promise<Package> => MOCK_PACKAGES[0],

  updateStatus: async (_id: string, _state: PackageStates): Promise<void> => {},

  archive: async (_id: string): Promise<void> => {},

  delete: async (_id: string): Promise<void> => {},

  addNature: async (_id: string, _dto: { natureId: string; quantity: number }): Promise<void> => {},

  removeNature: async (_id: string, _natureId: string): Promise<void> => {},

  getQuoteUrl: (id: string): string => `/api/packages/${id}/quote`,
}
