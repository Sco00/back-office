'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import {
  Search, Filter, Plus, MapPin, Phone, Loader2, User, Eye, Package,
} from 'lucide-react'
import { relaysApi } from '@/lib/api/relays.api'
import type { RelayFilters } from '@/lib/types/api.types'
import { CreateRelayModal } from '@/components/relays/CreateRelayModal'

export default function RelaysPage() {
  const router = useRouter()
  const [filters, setFilters]       = useState<RelayFilters>({ page: 1, limit: 20 })
  const [showFilters, setShowFilters] = useState(false)
  const [showCreate, setShowCreate]   = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['relays', filters],
    queryFn:  () => relaysApi.list(filters),
  })

  const relays     = data?.props  ?? []
  const total      = data?.total  ?? 0
  const totalPages = Math.ceil(total / (filters.limit ?? 20))

  const setFilter = (key: keyof RelayFilters, value: any) =>
    setFilters((p) => ({ ...p, [key]: value || undefined, page: 1 }))

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Relais</h1>
            <p className="text-gray-400">Points de collecte et dépôt</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#D16E41] hover:bg-[#E07D52] text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nouveau relais
          </button>
        </div>

        {/* Search + Filters toggle */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par responsable (prénom, nom)..."
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

        {/* Filters panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-800 border border-gray-700 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Pays</label>
                <input
                  type="text"
                  placeholder="France, Sénégal..."
                  onChange={(e) => setFilter('country', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D16E41]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Région</label>
                <input
                  type="text"
                  placeholder="Île-de-France..."
                  onChange={(e) => setFilter('region', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D16E41]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Ville</label>
                <input
                  type="text"
                  placeholder="Paris, Dakar..."
                  onChange={(e) => setFilter('city', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D16E41]"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tableau */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-4 px-4 text-xs font-medium text-gray-400 uppercase">Relais</th>
                <th className="text-left py-4 px-4 text-xs font-medium text-gray-400 uppercase">Responsable</th>
                <th className="text-left py-4 px-4 text-xs font-medium text-gray-400 uppercase">Adresse</th>
                <th className="text-left py-4 px-4 text-xs font-medium text-gray-400 uppercase">Colis</th>
                <th className="text-left py-4 px-4 text-xs font-medium text-gray-400 uppercase">Créé le</th>
                <th className="text-right py-4 px-4 text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="py-12 text-center"><Loader2 className="w-6 h-6 animate-spin text-[#D16E41] mx-auto" /></td></tr>
              ) : relays.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-gray-500">Aucun relais trouvé</td></tr>
              ) : (
                relays.map((relay) => (
                  <tr key={relay.id} className="border-b border-gray-700 hover:bg-gray-700/40 transition-colors">
                    {/* Relais */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#D16E41]/20 border border-[#D16E41]/30 flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-[#D16E41]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{relay.name}</p>
                          <p className="text-xs text-gray-500">ID: {relay.id.slice(0, 8)}…</p>
                        </div>
                      </div>
                    </td>

                    {/* Responsable */}
                    <td className="py-4 px-4">
                      <p className="text-sm font-medium text-white">
                        {relay.person?.firstName} {relay.person?.lastName}
                      </p>
                      {relay.person?.mobile && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400">{relay.person.mobile}</span>
                        </div>
                      )}
                    </td>

                    {/* Adresse */}
                    <td className="py-4 px-4">
                      {relay.address ? (
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-gray-300">{relay.address.city}</p>
                            <p className="text-xs text-gray-500">{relay.address.region} — {relay.address.country}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">—</span>
                      )}
                    </td>

                    {/* Colis */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-white font-medium">
                          {(relay as any)._count?.packages ?? '—'}
                        </span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-300">
                        {new Date(relay.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => router.push(`/relays/${relay.id}`)}
                          className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
                          title="Voir"
                        >
                          <Eye className="w-4 h-4" />
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
          <p className="text-sm text-gray-400">{total} relais au total</p>
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

      <CreateRelayModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  )
}
