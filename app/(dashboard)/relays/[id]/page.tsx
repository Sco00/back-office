'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft, MapPin, User, Calendar, Package, CheckCircle2,
  RotateCcw, Loader2, Phone, Mail, ChevronLeft, ChevronRight,
  Box, TrendingUp,
} from 'lucide-react'
import { toast } from 'sonner'
import { relaysApi } from '@/lib/api/relays.api'
import { packagesApi } from '@/lib/api/packages.api'
import { PackageStates, getPackageState } from '@/lib/types/api.types'
import type { Package } from '@/lib/types/api.types'

const STATE_LABELS: Record<PackageStates, string> = {
  [PackageStates.EN_ATTENTE]: 'En attente',
  [PackageStates.EN_TRANSIT]: 'En transit',
  [PackageStates.ARRIVE]:     'Arrivé',
  [PackageStates.LIVRE]:      'Livré',
  [PackageStates.RETOURNE]:   'Retourné',
}

const STATE_COLORS: Record<PackageStates, string> = {
  [PackageStates.EN_ATTENTE]: 'bg-yellow-500/20 text-yellow-400',
  [PackageStates.EN_TRANSIT]: 'bg-blue-500/20 text-blue-400',
  [PackageStates.ARRIVE]:     'bg-purple-500/20 text-purple-400',
  [PackageStates.LIVRE]:      'bg-green-500/20 text-green-400',
  [PackageStates.RETOURNE]:   'bg-red-500/20 text-red-400',
}

const HISTORY_PER_PAGE = 10

export default function RelayDetailPage() {
  const { id }   = useParams<{ id: string }>()
  const router   = useRouter()
  const qc       = useQueryClient()

  const [historyPage, setHistoryPage]     = useState(1)
  const [historyState, setHistoryState]   = useState<PackageStates | ''>('')

  const { data: relay, isLoading } = useQuery({
    queryKey: ['relay', id],
    queryFn:  () => relaysApi.getById(id),
  })

  const statusMutation = useMutation({
    mutationFn: ({ pkgId, state }: { pkgId: string; state: PackageStates }) =>
      packagesApi.updateStatus(pkgId, state),
    onSuccess: () => {
      toast.success('Statut mis à jour')
      qc.invalidateQueries({ queryKey: ['relay', id] })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message ?? 'Erreur')
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#D16E41]" />
      </div>
    )
  }

  if (!relay) {
    return (
      <div className="text-center py-20 text-gray-400">Relais introuvable</div>
    )
  }

  const allPackages   = relay.packages ?? []
  const arrivePackages = allPackages.filter((p) => getPackageState(p) === PackageStates.ARRIVE)
  const totalColis    = allPackages.length
  const totalLivre    = allPackages.filter((p) => getPackageState(p) === PackageStates.LIVRE).length
  const totalRetourne = allPackages.filter((p) => getPackageState(p) === PackageStates.RETOURNE).length

  // History with filter + pagination
  const filteredHistory = historyState
    ? allPackages.filter((p) => getPackageState(p) === historyState)
    : allPackages

  const historyTotalPages = Math.ceil(filteredHistory.length / HISTORY_PER_PAGE)
  const historySlice      = filteredHistory.slice(
    (historyPage - 1) * HISTORY_PER_PAGE,
    historyPage * HISTORY_PER_PAGE,
  )

  const { address, person } = relay

  return (
    <div>
      {/* Back + Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-[#D16E41]/20 border border-[#D16E41]/30 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-8 h-8 text-[#D16E41]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{relay.name}</h1>
              <p className="text-gray-400 mt-0.5">
                {address.city}, {address.region} — {address.country}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                <Calendar className="w-3 h-3 inline mr-1" />
                Créé le {new Date(relay.createdAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push(`/persons/${person.id}`)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors"
          >
            <User className="w-4 h-4" />
            Voir le responsable
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/20 p-2 rounded-lg">
              <Box className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total colis</p>
              <p className="text-xl font-bold text-white">{totalColis}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500/20 p-2 rounded-lg">
              <Package className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">En attente</p>
              <p className="text-xl font-bold text-white">{arrivePackages.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-500/20 p-2 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Livrés</p>
              <p className="text-xl font-bold text-white">{totalLivre}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-500/20 p-2 rounded-lg">
              <RotateCcw className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Retournés</p>
              <p className="text-xl font-bold text-white">{totalRetourne}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: packages + history */}
        <div className="lg:col-span-2 space-y-6">

          {/* Section: colis ARRIVE */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-700 flex items-center gap-2">
              <Package className="w-4 h-4 text-purple-400" />
              <h2 className="font-semibold text-white">Colis au relais</h2>
              <span className="ml-auto text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
                {arrivePackages.length}
              </span>
            </div>

            {arrivePackages.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Aucun colis en attente</p>
            ) : (
              <div className="divide-y divide-gray-700">
                {arrivePackages.map((pkg) => (
                  <div key={pkg.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {pkg.reference}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {pkg.person?.firstName} {pkg.person?.lastName}
                        {' · '}
                        {pkg.weight} kg
                      </p>
                      <p className="text-xs text-gray-500">
                        Arrivé le {new Date(pkg.statuses[pkg.statuses.length - 1]?.createdAt ?? pkg.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => statusMutation.mutate({ pkgId: pkg.id, state: PackageStates.LIVRE })}
                        disabled={statusMutation.isPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Livré
                      </button>
                      <button
                        onClick={() => statusMutation.mutate({ pkgId: pkg.id, state: PackageStates.RETOURNE })}
                        disabled={statusMutation.isPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Retourné
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: historique */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-700 flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gray-400" />
                <h2 className="font-semibold text-white">Historique des colis</h2>
              </div>
              <select
                value={historyState}
                onChange={(e) => { setHistoryState(e.target.value as PackageStates | ''); setHistoryPage(1) }}
                className="ml-auto px-3 py-1.5 bg-gray-700 text-gray-300 border border-gray-600 rounded-lg text-xs"
              >
                <option value="">Tous les statuts</option>
                {Object.values(PackageStates).map((s) => (
                  <option key={s} value={s}>{STATE_LABELS[s]}</option>
                ))}
              </select>
            </div>

            {historySlice.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Aucun colis</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase">Référence</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase">Client</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase">Poids</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase">Statut</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historySlice.map((pkg) => {
                        const state = getPackageState(pkg)
                        return (
                          <tr key={pkg.id} className="border-b border-gray-700 hover:bg-gray-700/40 transition-colors">
                            <td className="py-3 px-4">
                              <span
                                className="text-sm text-[#D16E41] hover:underline cursor-pointer"
                                onClick={() => router.push(`/packages/${pkg.id}`)}
                              >
                                {pkg.reference}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-300">
                              {pkg.person?.firstName} {pkg.person?.lastName}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-300">{pkg.weight} kg</td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATE_COLORS[state]}`}>
                                {STATE_LABELS[state]}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-400">
                              {new Date(pkg.createdAt).toLocaleDateString('fr-FR')}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {historyTotalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-gray-700">
                    <p className="text-xs text-gray-400">
                      {filteredHistory.length} colis · page {historyPage}/{historyTotalPages}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                        disabled={historyPage <= 1}
                        className="p-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg disabled:opacity-40 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setHistoryPage((p) => Math.min(historyTotalPages, p + 1))}
                        disabled={historyPage >= historyTotalPages}
                        className="p-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg disabled:opacity-40 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right: info cards */}
        <div className="space-y-4">

          {/* Relay info */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 space-y-4">
            <h3 className="font-semibold text-white">Informations du relais</h3>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-400 text-xs uppercase mb-1">Nom</p>
                <p className="text-white">{relay.name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase mb-1">Pays</p>
                <p className="text-white">{address.country}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase mb-1">Région</p>
                <p className="text-white">{address.region}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase mb-1">Ville</p>
                <p className="text-white">{address.city}</p>
              </div>
              {address.locality && (
                <div>
                  <p className="text-gray-400 text-xs uppercase mb-1">Localité</p>
                  <p className="text-white">{address.locality}</p>
                </div>
              )}
              {address.latitude != null && address.longitude != null && (
                <div>
                  <p className="text-gray-400 text-xs uppercase mb-1">GPS</p>
                  <p className="text-white font-mono text-xs">
                    {address.latitude.toFixed(5)}, {address.longitude.toFixed(5)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Responsable info */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 space-y-4">
            <h3 className="font-semibold text-white">Responsable</h3>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#D16E41] flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-white">
                  {person.firstName.charAt(0)}{person.lastName.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">
                  {person.firstName} {person.lastName}
                </p>
                <p className="text-xs text-gray-400">{person.personType?.name}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-300">
                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span>{person.mobile}</span>
              </div>
            </div>

            <button
              onClick={() => router.push(`/persons/${person.id}`)}
              className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors"
            >
              Voir le profil
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
