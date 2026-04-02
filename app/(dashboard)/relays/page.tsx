'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Plus, MapPin, Phone, User, Eye, Package, Building2, Globe } from 'lucide-react'
import { relaysApi } from '@/lib/api/relays.api'
import type { Relay, RelayFilters } from '@/lib/types/api.types'
import { CreateRelayModal } from '@/components/relays/CreateRelayModal'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Pagination } from '@/components/ui/Pagination'
import { StatsGrid, type StatCard } from '@/components/ui/StatsGrid'
import { FiltersPanel, type FilterField } from '@/components/ui/FiltersPanel'

export default function RelaysPage() {
  const router = useRouter()
  const [filters, setFilters]      = useState<RelayFilters>({ page: 1, limit: 6 })
  const [showCreate, setShowCreate] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['relays', filters],
    queryFn:  () => relaysApi.list(filters),
  })

  const relays     = data?.props  ?? []
  const total      = data?.total  ?? 0
  const totalPages = Math.ceil(total / (filters.limit ?? 6))

  const totalColis  = relays.reduce((sum, r) => sum + ((r as any)._count?.packages ?? 0), 0)
  const paysCovered = new Set(relays.map((r) => r.address?.country).filter(Boolean)).size
  const avecColis   = relays.filter((r) => ((r as any)._count?.packages ?? 0) > 0).length

  const setFilter = (key: keyof RelayFilters, value: any) =>
    setFilters((p) => ({ ...p, [key]: value === '' ? undefined : value, page: 1 }))

  const stats: StatCard[] = [
    { label: 'Total Relais',  value: total,       color: 'bg-blue-500/20',   icon: Building2 },
    { label: 'Total Colis',   value: totalColis,  color: 'bg-purple-500/20', icon: Package },
    { label: 'Pays couverts', value: paysCovered, color: 'bg-green-500/20',  icon: Globe },
    { label: 'Avec colis',    value: avecColis,   color: 'bg-amber-500/20',  icon: MapPin },
  ]

  const filterFields: FilterField[] = [
    { type: 'text', label: 'Pays',   placeholder: 'France, Sénégal...',  onChange: (v) => setFilter('country', v) },
    { type: 'text', label: 'Région', placeholder: 'Île-de-France...',    onChange: (v) => setFilter('region', v) },
    { type: 'text', label: 'Ville',  placeholder: 'Paris, Dakar...',     onChange: (v) => setFilter('city', v) },
  ]

  const columns: Column<Relay>[] = [
    {
      label: 'Relais',
      render: (relay) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#D16E41]/20 border border-[#D16E41]/30 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-[#D16E41]" />
          </div>
          <p className="text-sm font-medium text-white">{relay.name}</p>
        </div>
      ),
    },
    {
      label: 'Responsable',
      render: (relay) => (
        <>
          <p className="text-sm font-medium text-white">{relay.person?.firstName} {relay.person?.lastName}</p>
          {relay.person?.mobile && (
            <div className="flex items-center gap-1 mt-0.5">
              <Phone className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-400">{relay.person.mobile}</span>
            </div>
          )}
        </>
      ),
    },
    {
      label: 'Adresse',
      render: (relay) => relay.address ? (
        <div className="flex items-start gap-1.5">
          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-300">{relay.address.city}</p>
            <p className="text-xs text-gray-500">{relay.address.region} — {relay.address.country}</p>
          </div>
        </div>
      ) : <span className="text-gray-500 text-sm">—</span>,
    },
    {
      label: 'Colis',
      render: (relay) => (
        <div className="flex items-center gap-1.5">
          <Package className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-white font-medium">{(relay as any)._count?.packages ?? '—'}</span>
        </div>
      ),
    },
    { label: 'Créé le', render: (relay) => <span className="text-sm text-gray-300">{new Date(relay.createdAt).toLocaleDateString('fr-FR')}</span> },
    {
      label: 'Actions', align: 'right',
      render: (relay) => (
        <div className="flex items-center justify-end">
          <button onClick={() => router.push(`/relays/${relay.id}`)} className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors" title="Voir">
            <Eye className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Relais</h1>
            <p className="text-gray-400">Points de collecte et dépôt</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-[#D16E41] hover:bg-[#E07D52] text-white rounded-lg transition-colors">
            <Plus className="w-5 h-5" /> Nouveau relais
          </button>
        </div>
        <StatsGrid stats={stats} />
        <FiltersPanel searchPlaceholder="Rechercher par responsable (prénom, nom)..." onSearch={(v) => setFilter('search', v)} filters={filterFields} cols={3} />
      </div>

      <DataTable columns={columns} rows={relays} isLoading={isLoading} emptyMessage="Aucun relais trouvé"
        footer={<Pagination page={filters.page ?? 1} totalPages={totalPages} total={total} label="relais au total" onChange={(p) => setFilters((prev) => ({ ...prev, page: p }))} />}
      />

      <CreateRelayModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  )
}
