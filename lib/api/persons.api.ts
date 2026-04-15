import type {
  PaginatedData,
  Person,
  PersonDetail,
  PersonType,
  PersonFilters,
  CreatePersonDTO,
} from '@/lib/types/api.types'
import { MOCK_PERSONS, MOCK_PERSON_TYPES, MOCK_PERSON_DETAILS, paginate } from '@/lib/mock/data'

export const personsApi = {
  listTypes: async (): Promise<PersonType[]> => MOCK_PERSON_TYPES,

  list: async (filters: PersonFilters = {}): Promise<PaginatedData<Person>> => {
    let items = [...MOCK_PERSONS]

    if (filters.search) {
      const q = filters.search.toLowerCase()
      items = items.filter(
        (p) =>
          p.firstName.toLowerCase().includes(q) ||
          p.lastName.toLowerCase().includes(q) ||
          p.mobile.includes(q),
      )
    }
    if (filters.personTypeId) {
      items = items.filter((p) => p.personType.id === filters.personTypeId)
    }
    if (filters.hasPackages) {
      items = items.filter((p) => p._count.packages > 0)
    }

    return paginate(items, filters.page, filters.limit)
  },

  getById: async (id: string): Promise<PersonDetail> => {
    const detail = MOCK_PERSON_DETAILS.find((p) => p.id === id)
    if (!detail) throw new Error(`Person ${id} not found`)
    return detail
  },

  create: async (_dto: CreatePersonDTO): Promise<Person> => MOCK_PERSONS[0],
}
