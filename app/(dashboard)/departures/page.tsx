'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Plus, Eye, Lock, MapPin, Calendar, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { departuresApi } from '@/lib/api/departures.api'
import type { Departure, DepartureFilters } from '@/lib/types/api.types'
import { DEPARTURE_STATUS_OPTIONS } from '@/constants/departure.constants'
import { CreateDepartureModal } from '@/components/departures/CreateDepartureModal'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Pagination } from '@/components/ui/Pagination'
import { StatsGrid, type StatCard } from '@/components/ui/StatsGrid'
import { FiltersPanel, type FilterField } from '@/components/ui/FiltersPanel'

export default function DeparturesPage() {
  const qc     = useQueryClient()
  const router = useRouter()
  const [filters, setFilters]      = useState<DepartureFilters>({ page: 1, limit: 6 })
  const [showCreate, setShowCreate] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['departures', filters],
    queryFn:  () => departuresApi.list(filters),
  })

  const closeMutation = useMutation({
    mutationFn: (id: string) => departuresApi.close(id),
    onSuccess:  () => { toast.success('Départ fermé'); qc.invalidateQueries({ queryKey: ['departures'] }); qc.invalidateQueries({ queryKey: ['dashboard'] }) },
    onError:    () => toast.error('Erreur lors de la fermeture'),
  })

  const { data: openStats }   = useQuery({ queryKey: ['departures-count', 'open'],   queryFn: () => departuresApi.list({ isClosed: false, limit: 1, page: 1 }) })
  const { data: closedStats } = useQuery({ queryKey: ['departures-count', 'closed'], queryFn: () => departuresApi.list({ isClosed: true,  limit: 1, page: 1 }) })

  const departures = data?.props  ?? []
  const total      = data?.total  ?? 0
  const totalPages = Math.ceil(total / (filters.limit ?? 6))

  const setFilter = (key: keyof DepartureFilters, value: any) =>
    setFilters((p) => ({ ...p, [key]: value === '' ? undefined : value, page: 1 }))

  const stats: StatCard[] = [
    { label: 'Total Départs', value: total,                      color: 'bg-purple-500/20', icon: Truck },
    { label: 'Ouverts',       value: openStats?.total   ?? '…',  color: 'bg-green-500/20',  icon: Truck },
    { label: 'Fermés',        value: closedStats?.total ?? '…',  color: 'bg-gray-500/20',   icon: Truck },
    { label: 'Cette page',    value: departures.length,          color: 'bg-blue-500/20',   icon: Truck },
  ]

  const filterFields: FilterField[] = [
    {
      type: 'select', label: 'Statut',
      options: DEPARTURE_STATUS_OPTIONS,
      onChange: (v) => setFilter('isClosed', v === '' ? undefined : v === 'true'),
    },
    { type: 'text', label: 'Pays de départ',  placeholder: 'France...',   onChange: (v) => setFilter('departureCountry', v) },
    { type: 'text', label: 'Pays destination', placeholder: 'Sénégal...', onChange: (v) => setFilter('destinationCountry', v) },
    { type: 'date', label: 'Date départ (depuis)',                          onChange: (v) => setFilter('departureDateFrom', v) },
  ]

  const columns: Column<Departure>[] = [
    {
      label: 'Route',
      render: (dep) => (
        <div className="flex items-start gap-1.5">
          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-300">{dep.departureAddress?.city}, {dep.departureAddress?.country}</p>
            <p className="text-sm text-gray-300">→ {dep.destinationAddress?.city}, {dep.destinationAddress?.country}</p>
          </div>
        </div>
      ),
    },
    {
      label: 'Date départ',
      render: (dep) => (
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-300">{new Date(dep.departureDate).toLocaleDateString('fr-FR')}</span>
        </div>
      ),
    },
    { label: 'Arrivée prévue', render: (dep) => <span className="text-sm text-gray-300">{new Date(dep.arrivalDate).toLocaleDateString('fr-FR')}</span> },
    { label: 'Deadline',       render: (dep) => <span className="text-sm text-gray-300">{new Date(dep.deadline).toLocaleDateString('fr-FR')}</span> },
    {
      label: 'GP',
      render: (dep) => dep.person
        ? <p className="text-sm text-white">{dep.person.firstName} {dep.person.lastName}</p>
        : <span className="text-gray-500 text-sm">—</span>,
    },
    {
      label: 'Statut',
      render: (dep) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${dep.isClosed ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' : 'bg-green-500/20 text-green-300 border-green-500/30'}`}>
          {dep.isClosed ? 'Fermé' : 'Ouvert'}
        </span>
      ),
    },
    {
      label: 'Actions', align: 'right',
      render: (dep) => (
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => router.push(`/departures/${dep.id}`)} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-xs transition-colors">
            <Eye className="w-3.5 h-3.5" /> Voir
          </button>
          {!dep.isClosed && (
            <button onClick={() => { if (confirm('Fermer ce départ ?')) closeMutation.mutate(dep.id) }} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-red-500/20 text-gray-300 hover:text-red-400 rounded-lg text-xs transition-colors">
              <Lock className="w-3.5 h-3.5" /> Fermer
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Départs Groupés</h1>
            <p className="text-gray-400">Gestion des expéditions groupées</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-[#D16E41] hover:bg-[#E07D52] text-white rounded-lg transition-colors">
            <Plus className="w-5 h-5" /> Nouveau départ GP
          </button>
        </div>
        <StatsGrid stats={stats} />
        <FiltersPanel searchPlaceholder="Rechercher par nom du client..." onSearch={(v) => setFilter('search', v)} filters={filterFields} />
      </div>

      <DataTable columns={columns} rows={departures} isLoading={isLoading} emptyMessage="Aucun départ trouvé"
        footer={<Pagination page={filters.page ?? 1} totalPages={totalPages} total={total} label="départs au total" onChange={(p) => setFilters((prev) => ({ ...prev, page: p }))} />}
      />

      <CreateDepartureModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  )
}
