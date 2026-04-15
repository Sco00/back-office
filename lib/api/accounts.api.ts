import type { Account, CreateAccountDTO } from '@/lib/types/api.types'
import { MOCK_ACCOUNTS } from '@/lib/mock/data'

export const accountsApi = {
  create: async (_dto: CreateAccountDTO): Promise<Account> => MOCK_ACCOUNTS[0],
}
