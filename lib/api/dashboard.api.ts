import { apiClient } from './client'
import type { ApiResponse } from '@/lib/types/api.types'

export interface DashboardKpis {
  totalColis:      number
  totalKg:         number
  totalClients:    number
  chiffreAffaires: number
}

export interface CaMensuelItem      { mois: string; ca: number }
export interface ColisParRouteItem  { departureCity: string; departureCountry: string; destinationCity: string; destinationCountry: string; nbColis: number; ca: number }
export interface RepartitionClients { nouveaux: number; recurrents: number }
export interface StatutsParMoisItem { mois: string; EN_ATTENTE: number; EN_TRANSIT: number; ARRIVE: number; LIVRE: number; RETOURNE: number }
export interface TopClientItem      { id: string; firstName: string; lastName: string; nbColis: number; totalCa: number }
export interface DerniersColisItem  { id: string; reference: string; weight: number; createdAt: string; firstName: string; lastName: string; departureCity: string; destinationCity: string; currentState: string; amount: number | null }

export interface DashboardData {
  kpis:               DashboardKpis
  caMensuel:          CaMensuelItem[]
  colisParRoute:      ColisParRouteItem[]
  repartitionClients: RepartitionClients
  statutsParMois:     StatutsParMoisItem[]
  derniersColis:      DerniersColisItem[]
  topClients:         TopClientItem[]
}

export const dashboardApi = {
  get: async (): Promise<DashboardData> => {
    const { data } = await apiClient.get<ApiResponse<DashboardData>>('/dashboard')
    return data.data
  },
}
