'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import {
  Search, Filter, Plus, Eye, Trash2,
  MapPin, Calendar, Package, Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { packagesApi } from '@/lib/api/packages.api'
import { PackageStateBadge } from '@/components/shared/PackageStateBadge'
import { PackageStates, getPackageState, type PackageFilters } from '@/lib/types/api.types'
import { CreatePackageModal } from '@/components/packages/CreatePackageModal'

const STATE_OPTIONS = [
  { value: '',                    label: 'Tous les statuts' },
  { value: PackageStates.EN_ATTENTE, label: 'En attente' },
  { value: PackageStates.EN_TRANSIT, label: 'En transit' },
  { value: PackageStates.ARRIVE,     label: 'Arrivé' },
  { value: PackageStates.LIVRE,      label: 'Livré' },
  { value: PackageStates.RETOURNE,   label: 'Retourné' },
]

export default function PackagesPage() {
  const router      = useRouter()
  const qc          = useQueryClient()
  const [filters, setFilters]       = useState<PackageFilters>({ page: 1, limit: 10 })
  const [showFilters, setShowFilters] = useState(false)
  const [showCreate, setShowCreate]   = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['packages', filters],
    queryFn:  () => packagesApi.list(filters),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => packagesApi.delete(id),
    onSuccess:  () => { toast.success('Colis supprimé'); qc.invalidateQueries({ queryKey: ['packages'] }) },
    onError:    () => toast.error('Erreur lors de la suppression'),
  })

  const packages  = data?.props ?? []
  const total     = data?.total ?? 0
  const totalPages = Math.ceil(total / (filters.limit ?? 10))

  const setFilter = (key: keyof PackageFilters, value: any) =>
    setFilters((prev) => ({ ...prev, [key]: value || undefined, page: 1 }))

  const statCounts = {
    total:     total,
    enAttente: packages.filter((p) => getPackageState(p) === PackageStates.EN_ATTENTE).length,
    enTransit: packages.filter((p) => getPackageState(p) === PackageStates.EN_TRANSIT).length,
    livres:    packages.filter((p) => getPackageState(p) === PackageStates.LIVRE).length,
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Gestion des Colis</h1>
            <p className="text-gray-400">Liste complète des colis et expéditions</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#D16E41] hover:bg-[#E07D52] text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nouveau colis
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Colis',  value: statCounts.total,     color: 'bg-blue-500/20' },
            { label: 'En attente',   value: statCounts.enAttente,  color: 'bg-amber-500/20' },
            { label: 'En transit',   value: statCounts.enTransit,  color: 'bg-blue-500/20' },
            { label: 'Livrés',       value: statCounts.livres,     color: 'bg-green-500/20' },
          ].map((s) => (
            <div key={s.label} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className={`${s.color} p-2 rounded-lg`}>
                  <Package className="w-5 h-5 text-white" />
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
              placeholder="Référence, nom du client..."
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
                  onChange={(e) => setFilter('state', e.target.value as PackageStates)}
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D16E41]"
                >
                  {STATE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Pays de départ</label>
                <input
                  type="text"
                  placeholder="France, USA..."
                  onChange={(e) => setFilter('departureCountry', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D16E41]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Pays de destination</label>
                <input
                  type="text"
                  placeholder="Sénégal..."
                  onChange={(e) => setFilter('destinationCountry', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D16E41]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Date création (depuis)</label>
                <input
                  type="date"
                  onChange={(e) => setFilter('createdAtFrom', e.target.value)}
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
                {['Client', 'Route', 'Poids', 'Natures', 'Départ prévu', 'Statut', 'Actions'].map((h) => (
                  <th key={h} className={`py-4 px-4 text-xs font-medium text-gray-400 uppercase ${h === 'Actions' ? 'text-right' : 'text-left'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-[#D16E41] mx-auto" />
                  </td>
                </tr>
              ) : packages.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">Aucun colis trouvé</td>
                </tr>
              ) : (
                packages.map((pkg) => (
                  <tr key={pkg.id} className="border-b border-gray-700 hover:bg-gray-700/40 transition-colors">
                    <td className="py-4 px-4">
                      <p className="text-sm font-medium text-white">
                        {pkg.person.firstName} {pkg.person.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(pkg.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-300">{pkg.departureGp.departureAddress?.city}, {pkg.departureGp.departureAddress?.country}</p>
                          <p className="text-sm text-gray-300">→ {pkg.departureGp.destinationAddress?.city}, {pkg.departureGp.destinationAddress?.country}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm font-medium text-white">{pkg.weight} kg</span>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-300 max-w-[140px] truncate">
                        {pkg.natures.map((n) => n.nature.name).join(', ') || '—'}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-300">
                          {new Date(pkg.departureGp.departureDate).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <PackageStateBadge state={getPackageState(pkg)} />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => router.push(`/packages/${pkg.id}`)}
                          className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
                          title="Voir le détail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Supprimer ce colis ?')) deleteMutation.mutate(pkg.id)
                          }}
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
          <p className="text-sm text-gray-400">
            {total} colis au total
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilters((p) => ({ ...p, page: Math.max(1, (p.page ?? 1) - 1) }))}
              disabled={(filters.page ?? 1) <= 1}
              className="px-3 py-1.5 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-lg text-sm transition-colors disabled:opacity-40"
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
              className="px-3 py-1.5 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-lg text-sm transition-colors disabled:opacity-40"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>

      <CreatePackageModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  )
}
