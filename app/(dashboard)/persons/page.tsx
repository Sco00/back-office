'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Plus, Phone, Eye, Trash2, Users, Package, DollarSign, MessageCircle, Calendar } from 'lucide-react'
import { personsApi } from '@/lib/api/persons.api'
import { dashboardApi } from '@/lib/api/dashboard.api'
import type { Person, PersonFilters } from '@/lib/types/api.types'
import { CreatePersonModal } from '@/components/persons/CreatePersonModal'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Pagination } from '@/components/ui/Pagination'
import { StatsGrid, type StatCard } from '@/components/ui/StatsGrid'
import { FiltersPanel, type FilterField } from '@/components/ui/FiltersPanel'

export default function PersonsPage() {
  const router = useRouter()
  const [filters, setFilters]      = useState<PersonFilters>({ page: 1, limit: 6, hasPackages: true })
  const [showCreate, setShowCreate] = useState(false)
  const [dateFilter, setDateFilter] = useState('')
  const [minColis, setMinColis]     = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['persons', filters],
    queryFn:  () => personsApi.list(filters),
  })

  const { data: dashboard } = useQuery({
    queryKey: ['dashboard'],
    queryFn:  dashboardApi.get,
    staleTime: 5 * 60_000,
  })

  const allPersons = data?.props ?? []
  const total      = data?.total ?? 0
  const totalPages = Math.ceil(total / (filters.limit ?? 6))

  const totalColis    = dashboard?.kpis.totalColis   ?? 0
  const totalClients  = dashboard?.kpis.totalClients ?? total
  const activeClients = dashboard?.repartitionClients.recurrents ?? 0
  const moyParClient  = totalClients > 0 ? (totalColis / totalClients).toFixed(1) : '—'

  const persons = allPersons.filter((p) => {
    const matchDate  = !dateFilter || new Date(p.createdAt) >= new Date(dateFilter)
    const matchColis = !minColis   || p._count.packages >= Number(minColis)
    return matchDate && matchColis
  })

  const setFilter = (key: keyof PersonFilters, value: any) =>
    setFilters((p) => ({ ...p, [key]: value === '' ? undefined : value, page: 1 }))

  const stats: StatCard[] = [
    { label: 'Total Clients',      value: totalClients,  color: 'bg-blue-500/20',   icon: Users },
    { label: 'Clients Récurrents', value: activeClients, color: 'bg-green-500/20',  icon: Users },
    { label: 'Total Colis',        value: totalColis,    color: 'bg-purple-500/20', icon: Package },
    { label: 'Moy. par Client',    value: moyParClient,  color: 'bg-amber-500/20',  icon: DollarSign },
  ]

  const filterFields: FilterField[] = [
    { type: 'date',   label: 'Date de création',                       onChange: (v) => setDateFilter(v) },
    { type: 'number', label: 'Nb Colis Min', placeholder: '0', min: 1, onChange: (v) => setMinColis(v) },
  ]

  const columns: Column<Person>[] = [
    {
      label: 'Client',
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#D16E41] flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-white">{p.firstName.charAt(0)}{p.lastName.charAt(0)}</span>
          </div>
          <p className="text-sm font-medium text-white">{p.firstName} {p.lastName}</p>
        </div>
      ),
    },
    {
      label: 'Contact',
      render: (p) => (
        <div className="flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-sm text-gray-300">{p.mobile}</span>
        </div>
      ),
    },
    {
      label: 'Nb Colis',
      render: (p) => (
        <div className="flex items-center gap-1.5">
          <Package className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-white">{p._count.packages}</span>
        </div>
      ),
    },
    {
      label: 'Total Dépensé',
      render: (p) => (
        <div className="flex items-center gap-1.5">
          <DollarSign className="w-4 h-4 text-green-400" />
          <span className="text-sm font-semibold text-white">
            {p.totalSpent != null && p.totalSpent > 0 ? p.totalSpent.toLocaleString('fr-FR') + ' XOF' : '—'}
          </span>
        </div>
      ),
    },
    {
      label: 'Inscription',
      render: (p) => (
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-300">{new Date(p.createdAt).toLocaleDateString('fr-FR')}</span>
        </div>
      ),
    },
    {
      label: 'Actions', align: 'right',
      render: (p) => (
        <div className="flex items-center justify-end gap-2">
          <a href={`https://wa.me/${p.mobile.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
            className="p-2 text-gray-400 hover:text-green-400 hover:bg-gray-700 rounded-lg transition-colors"
            title="WhatsApp" onClick={(e) => e.stopPropagation()}>
            <MessageCircle className="w-4 h-4" />
          </a>
          <button onClick={() => router.push(`/persons/${p.id}`)} className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors" title="Voir">
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors" title="Supprimer">
            <Trash2 className="w-4 h-4" />
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
            <h1 className="text-2xl font-bold text-white mb-1">Gestion des Clients</h1>
            <p className="text-gray-400">Liste complète des clients et leurs informations</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-[#D16E41] hover:bg-[#E07D52] text-white rounded-lg transition-colors">
            <Plus className="w-5 h-5" /> Nouveau client
          </button>
        </div>
        <StatsGrid stats={stats} />
        <FiltersPanel searchPlaceholder="Rechercher par nom, prénom, téléphone..." onSearch={(v) => setFilter('search', v)} filters={filterFields} cols={2} />
      </div>

      <DataTable columns={columns} rows={persons} isLoading={isLoading} emptyMessage="Aucun client trouvé"
        footer={<Pagination page={filters.page ?? 1} totalPages={totalPages} total={total} label="clients au total" onChange={(p) => setFilters((prev) => ({ ...prev, page: p }))} />}
      />

      <CreatePersonModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  )
}
