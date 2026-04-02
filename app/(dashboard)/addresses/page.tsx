'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Plus, Eye, MapPin, Globe, Building2 } from 'lucide-react'
import { addressesApi } from '@/lib/api/addresses.api'
import type { Address, AddressFilters, AddressType } from '@/lib/types/api.types'
import { ADDRESS_TYPE_OPTIONS } from '@/constants/filters.constants'
import { CreateAddressModal } from '@/components/addresses/CreateAddressModal'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Pagination } from '@/components/ui/Pagination'
import { StatsGrid, type StatCard } from '@/components/ui/StatsGrid'
import { FiltersPanel, type FilterField } from '@/components/ui/FiltersPanel'

export default function AddressesPage() {
  const router = useRouter()
  const [filters, setFilters]      = useState<AddressFilters>({ page: 1, limit: 6 })
  const [showCreate, setShowCreate] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['addresses', filters],
    queryFn:  () => addressesApi.list(filters),
  })

  const addresses  = data?.props ?? []
  const total      = data?.total ?? 0
  const totalPages = Math.ceil(total / (filters.limit ?? 6))

  const setFilter = (key: keyof AddressFilters, value: any) =>
    setFilters((p) => ({ ...p, [key]: value === '' ? undefined : value, page: 1 }))

  const countries = [...new Set(addresses.map((a) => a.country))].length
  const cities    = [...new Set(addresses.map((a) => a.city))].length
  const topPays   = (() => {
    const count: Record<string, number> = {}
    addresses.forEach((a) => { count[a.country] = (count[a.country] ?? 0) + 1 })
    return Object.entries(count).sort((x, y) => y[1] - x[1])[0]?.[0] ?? '—'
  })()

  const stats: StatCard[] = [
    { label: 'Total Adresses', value: total,    color: 'bg-[#D16E41]/20', icon: MapPin },
    { label: 'Pays',           value: countries, color: 'bg-blue-500/20',  icon: Globe },
    { label: 'Villes',         value: cities,    color: 'bg-green-500/20', icon: Building2 },
    { label: 'Top Pays',       value: topPays,   color: 'bg-purple-500/20', icon: Globe },
  ]

  const filterFields: FilterField[] = [
    { type: 'text',   label: 'Pays',   placeholder: 'France, Sénégal...',  onChange: (v) => setFilter('country', v) },
    { type: 'text',   label: 'Région', placeholder: 'Île-de-France...',    onChange: (v) => setFilter('region', v) },
    { type: 'text',   label: 'Ville',  placeholder: 'Paris, Dakar...',     onChange: (v) => setFilter('city', v) },
    {
      type: 'select', label: 'Type',
      options: ADDRESS_TYPE_OPTIONS,
      onChange: (v) => setFilter('type', v as AddressType || undefined),
    },
  ]

  const columns: Column<Address>[] = [
    {
      label: 'Pays',
      render: (a) => (
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#D16E41] flex-shrink-0" />
          <span className="text-sm font-medium text-white">{a.country}</span>
        </div>
      ),
    },
    { label: 'Région',   render: (a) => <span className="text-sm text-gray-300">{a.region}</span> },
    {
      label: 'Ville',
      render: (a) => (
        <div className="flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-300">{a.city}</span>
        </div>
      ),
    },
    { label: 'Localité', render: (a) => <span className="text-sm text-gray-400">{a.locality ?? '—'}</span> },
    {
      label: 'Type',
      render: (a) => a.type === 'RELAIS' ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
          <MapPin className="w-3 h-3" /> Point Relais
        </span>
      ) : (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-600/50 text-gray-300 border border-gray-600">
          Simple
        </span>
      ),
    },
    {
      label: 'Date création',
      render: (a) => <span className="text-sm text-gray-300">{new Date(a.createdAt).toLocaleDateString('fr-FR')}</span>,
    },
    {
      label: 'Actions', align: 'right',
      render: (a) => (
        <div className="flex items-center justify-end">
          <button onClick={() => router.push(`/addresses/${a.id}`)} className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors" title="Voir">
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
            <h1 className="text-2xl font-bold text-white mb-1">Adresses</h1>
            <p className="text-gray-400">Gestion des adresses et points de collecte</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-[#D16E41] hover:bg-[#E07D52] text-white rounded-lg transition-colors">
            <Plus className="w-5 h-5" /> Nouvelle adresse
          </button>
        </div>
        <StatsGrid stats={stats} />
        <FiltersPanel
          searchPlaceholder="Rechercher par pays, région, ville, localité..."
          onSearch={(v) => setFilter('search', v)}
          filters={filterFields}
        />
      </div>

      <DataTable
        columns={columns}
        rows={addresses}
        isLoading={isLoading}
        emptyMessage="Aucune adresse trouvée"
        footer={
          <Pagination
            page={filters.page ?? 1}
            totalPages={totalPages}
            total={total}
            label={`adresse${total > 1 ? 's' : ''} au total`}
            onChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
          />
        }
      />

      <CreateAddressModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  )
}
