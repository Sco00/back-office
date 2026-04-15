import type { LoginResponse, LoginDTO } from '@/lib/types/api.types'

export const authApi = {
  login: async (_dto: LoginDTO): Promise<LoginResponse> => ({
    accessToken:  'mock-access-token',
    refreshToken: 'mock-refresh-token',
    user: {
      id:     'acc-admin',
      email:  'admin@yobbalgp.com',
      role:   'ADMIN',
      person: { firstName: 'Seydou', lastName: 'Koné' },
    },
  }),

  refresh: async (_refreshToken: string): Promise<{ accessToken: string }> => ({
    accessToken: 'mock-access-token',
  }),
}
