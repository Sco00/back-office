'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import {
  Search, Filter, Plus, Eye, Lock, MapPin,
  Calendar, Package, Loader2, Truck,
} from 'lucide-react'
import { toast } from 'sonner'
import { departuresApi } from '@/lib/api/departures.api'
import type { DepartureFilters } from '@/lib/types/api.types'
import { CreateDepartureModal } from '@/components/departures/CreateDepartureModal'

export default function DeparturesPage() {
  const qc     = useQueryClient()
  const router = useRouter()
  const [filters, setFilters]       = useState<DepartureFilters>({ page: 1, limit: 10 })
  const [showFilters, setShowFilters] = useState(false)
  const [showCreate, setShowCreate]   = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['departures', filters],
    queryFn:  () => departuresApi.list(filters),
  })

  const closeMutation = useMutation({
    mutationFn: (id: string) => departuresApi.close(id),
    onSuccess:  () => { toast.success('Départ fermé'); qc.invalidateQueries({ queryKey: ['departures'] }) },
    onError:    () => toast.error('Erreur lors de la fermeture'),
  })

  const departures = data?.props  ?? []
  const total      = data?.total  ?? 0
  const totalPages = Math.ceil(total / (filters.limit ?? 10))

  const setFilter = (key: keyof DepartureFilters, value: any) =>
    setFilters((p) => ({ ...p, [key]: value || undefined, page: 1 }))

  const stats = {
    total:   total,
    ouverts: departures.filter((d) => !d.isClosed).length,
    fermes:  departures.filter((d) => d.isClosed).length,
    colis:   0,
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Départs Groupés</h1>
            <p className="text-gray-400">Gestion des expéditions groupées</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#D16E41] hover:bg-[#E07D52] text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nouveau départ GP
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Départs', value: stats.total,   color: 'bg-purple-500/20' },
            { label: 'Ouverts',       value: stats.ouverts, color: 'bg-green-500/20' },
            { label: 'Fermés',        value: stats.fermes,  color: 'bg-gray-500/20' },
            { label: 'Cette page',    value: departures.length, color: 'bg-blue-500/20' },
          ].map((s) => (
            <div key={s.label} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className={`${s.color} p-2 rounded-lg`}>
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">{s.label}</p>
                  <p className="text-xl font-bold text-white">{s.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recherche + Filtres */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom du client..."
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

        {showFilters && (
          <div className="mt-4 p-4 bg-gray-800 border border-gray-700 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Statut</label>
                <select
                  onChange={(e) => {
                    const v = e.target.value
                    setFilter('isClosed', v === '' ? undefined : v === 'true')
                  }}
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D16E41]"
                >
                  <option value="">Tous</option>
                  <option value="false">Ouverts</option>
                  <option value="true">Fermés</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Pays de départ</label>
                <input
                  type="text"
                  placeholder="France..."
                  onChange={(e) => setFilter('departureCountry', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D16E41]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Pays destination</label>
                <input
                  type="text"
                  placeholder="Sénégal..."
                  onChange={(e) => setFilter('destinationCountry', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D16E41]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Date départ (depuis)</label>
                <input
                  type="date"
                  onChange={(e) => setFilter('departureDateFrom', e.target.value)}
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
                {['Route', 'Date départ', 'Arrivée prévue', 'Deadline', 'GP', 'Statut', 'Actions'].map((h) => (
                  <th key={h} className={`py-4 px-4 text-xs font-medium text-gray-400 uppercase ${h === 'Actions' ? 'text-right' : 'text-left'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="py-12 text-center"><Loader2 className="w-6 h-6 animate-spin text-[#D16E41] mx-auto" /></td></tr>
              ) : departures.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-gray-500">Aucun départ trouvé</td></tr>
              ) : (
                departures.map((dep) => (
                  <tr key={dep.id} className="border-b border-gray-700 hover:bg-gray-700/40 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-300">{dep.departureAddress?.city}, {dep.departureAddress?.country}</p>
                          <p className="text-sm text-gray-300">→ {dep.destinationAddress?.city}, {dep.destinationAddress?.country}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-300">{new Date(dep.departureDate).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-300">{new Date(dep.arrivalDate).toLocaleDateString('fr-FR')}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-300">{new Date(dep.deadline).toLocaleDateString('fr-FR')}</span>
                    </td>
                    <td className="py-4 px-4">
                      {dep.person ? (
                        <p className="text-sm text-white">{dep.person.firstName} {dep.person.lastName}</p>
                      ) : (
                        <span className="text-gray-500 text-sm">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        dep.isClosed
                          ? 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                          : 'bg-green-500/20 text-green-300 border-green-500/30'
                      }`}>
                        {dep.isClosed ? 'Fermé' : 'Ouvert'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => router.push(`/departures/${dep.id}`)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-xs transition-colors"
                          title="Voir les détails"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Voir
                        </button>
                        {!dep.isClosed && (
                          <button
                            onClick={() => {
                              if (confirm('Fermer ce départ ?')) closeMutation.mutate(dep.id)
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-red-500/20 text-gray-300 hover:text-red-400 rounded-lg text-xs transition-colors"
                            title="Fermer le départ"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            Fermer
                          </button>
                        )}
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
          <p className="text-sm text-gray-400">{total} départs au total</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilters((p) => ({ ...p, page: Math.max(1, (p.page ?? 1) - 1) }))}
              disabled={(filters.page ?? 1) <= 1}
              className="px-3 py-1.5 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-lg text-sm transition-colors disabled:opacity-40"
            >Précédent</button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setFilters((prev) => ({ ...prev, page: p }))}
                className={`px-3 py-1.5 rounded-lg text-sm ${filters.page === p ? 'bg-[#D16E41] text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
              >{p}</button>
            ))}
            <button
              onClick={() => setFilters((p) => ({ ...p, page: Math.min(totalPages, (p.page ?? 1) + 1) }))}
              disabled={(filters.page ?? 1) >= totalPages}
              className="px-3 py-1.5 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-lg text-sm transition-colors disabled:opacity-40"
            >Suivant</button>
          </div>
        </div>
      </div>

      <CreateDepartureModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  )
}
