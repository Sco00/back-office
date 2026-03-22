'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import {
  Search, Filter, Plus, Phone, Eye, Trash2, Loader2,
  Users, Package, DollarSign, MessageCircle, Calendar,
} from 'lucide-react'
import { personsApi } from '@/lib/api/persons.api'
import { dashboardApi } from '@/lib/api/dashboard.api'
import type { PersonFilters } from '@/lib/types/api.types'
import { CreatePersonModal } from '@/components/persons/CreatePersonModal'

export default function PersonsPage() {
  const router = useRouter()
  const [filters, setFilters]         = useState<PersonFilters>({ page: 1, limit: 20, hasPackages: true })
  const [showFilters, setShowFilters] = useState(false)
  const [showCreate, setShowCreate]   = useState(false)
  const [dateFilter, setDateFilter]   = useState('')
  const [minColis, setMinColis]       = useState('')

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
  const totalPages = Math.ceil(total / (filters.limit ?? 20))

  const totalColis   = dashboard?.kpis.totalColis   ?? 0
  const totalClients = dashboard?.kpis.totalClients ?? total
  const activeClients = dashboard?.repartitionClients.recurrents ?? 0
  const moyParClient  = totalClients > 0 ? (totalColis / totalClients).toFixed(1) : '—'

  const persons = allPersons.filter((p) => {
    const matchDate  = !dateFilter || new Date(p.createdAt) >= new Date(dateFilter)
    const matchColis = !minColis   || p._count.packages >= Number(minColis)
    return matchDate && matchColis
  })

  const setFilter = (key: keyof PersonFilters, value: any) =>
    setFilters((p) => ({ ...p, [key]: value || undefined, page: 1 }))

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Gestion des Clients</h1>
            <p className="text-gray-400">Liste complète des clients et leurs informations</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#D16E41] hover:bg-[#E07D52] text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nouveau client
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Clients</p>
                <p className="text-xl font-bold text-white">{totalClients}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-500/20 p-2 rounded-lg">
                <Users className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Clients Récurrents</p>
                <p className="text-xl font-bold text-white">{activeClients}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-500/20 p-2 rounded-lg">
                <Package className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Colis</p>
                <p className="text-xl font-bold text-white">{totalColis}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500/20 p-2 rounded-lg">
                <DollarSign className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Moy. par Client</p>
                <p className="text-xl font-bold text-white">{moyParClient}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, prénom, téléphone..."
              onChange={(e) => setFilter('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D16E41]"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Filter className="w-5 h-5" />
            Filtres
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-800 border border-gray-700 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Date de création</label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D16E41]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nb Colis Min</label>
                <input
                  type="number"
                  min="1"
                  placeholder="0"
                  value={minColis}
                  onChange={(e) => setMinColis(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D16E41]"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-4 px-4 text-xs font-medium text-gray-400 uppercase">Client</th>
                <th className="text-left py-4 px-4 text-xs font-medium text-gray-400 uppercase">Contact</th>
                <th className="text-left py-4 px-4 text-xs font-medium text-gray-400 uppercase">Nb Colis</th>
                <th className="text-left py-4 px-4 text-xs font-medium text-gray-400 uppercase">Total Dépensé</th>
                <th className="text-left py-4 px-4 text-xs font-medium text-gray-400 uppercase">Inscription</th>
                <th className="text-right py-4 px-4 text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-[#D16E41] mx-auto" />
                  </td>
                </tr>
              ) : persons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">Aucun client trouvé</td>
                </tr>
              ) : (
                persons.map((p) => (
                  <tr key={p.id} className="border-b border-gray-700 hover:bg-gray-700/40 transition-colors">
                    {/* Client */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#D16E41] flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-white">
                            {p.firstName.charAt(0)}{p.lastName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{p.firstName} {p.lastName}</p>
                          <p className="text-xs text-gray-500">ID: {p.id.slice(0, 8)}…</p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-sm text-gray-300">{p.mobile}</span>
                      </div>
                    </td>

                    {/* Nb Colis */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-white">{p._count.packages}</span>
                      </div>
                    </td>

                    {/* Total Dépensé */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <span className="text-sm font-semibold text-white">—</span>
                      </div>
                    </td>

                    {/* Inscription */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-300">
                          {new Date(p.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`https://wa.me/${p.mobile.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-green-400 hover:bg-gray-700 rounded-lg transition-colors"
                          title="WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => router.push(`/persons/${p.id}`)}
                          className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
                          title="Voir"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-4 border-t border-gray-700">
          <p className="text-sm text-gray-400">Affichage de {persons.length} sur {total} clients</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilters((p) => ({ ...p, page: Math.max(1, (p.page ?? 1) - 1) }))}
              disabled={(filters.page ?? 1) <= 1}
              className="px-3 py-1.5 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-lg text-sm disabled:opacity-40 transition-colors"
            >
              Précédent
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setFilters((prev) => ({ ...prev, page: p }))}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  filters.page === p ? 'bg-[#D16E41] text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setFilters((p) => ({ ...p, page: Math.min(totalPages, (p.page ?? 1) + 1) }))}
              disabled={(filters.page ?? 1) >= totalPages}
              className="px-3 py-1.5 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-lg text-sm disabled:opacity-40 transition-colors"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>

      <CreatePersonModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  )
}
