import { apiClient } from './client'
import type {
  ApiResponse,
  PaginatedData,
  Person,
  PersonDetail,
  PersonType,
  PersonFilters,
  CreatePersonDTO,
} from '@/lib/types/api.types'

export const personsApi = {
  listTypes: async (): Promise<PersonType[]> => {
    const { data } = await apiClient.get<ApiResponse<PersonType[]>>('/persons/types')
    return data.data
  },

  list: async (filters: PersonFilters = {}): Promise<PaginatedData<Person>> => {
    const { data } = await apiClient.get<ApiResponse<PaginatedData<Person>>>('/persons', {
      params: filters,
    })
    return data.data
  },

  getById: async (id: string): Promise<PersonDetail> => {
    const { data } = await apiClient.get<ApiResponse<PersonDetail>>(`/persons/${id}`)
    return data.data
  },

  create: async (dto: CreatePersonDTO): Promise<Person> => {
    const { data } = await apiClient.post<ApiResponse<Person>>('/persons', dto)
    return data.data
  },
}
