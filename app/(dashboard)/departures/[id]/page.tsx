'use client'

import { use, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import {
  MapPin, Calendar, Clock, Truck, CheckCircle,
  Lock, User, DollarSign, Plane, Package, Loader2, ChevronRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { departuresApi } from '@/lib/api/departures.api'
import { DepartureStates, PackageStates, getDepartureState, getPackageState, type DepartureDetail } from '@/lib/types/api.types'
import { BackButton } from '@/components/ui/BackButton'
import { DepartureStateBadge } from '@/components/shared/DepartureStateBadge'
import { PackageStateBadge }   from '@/components/shared/PackageStateBadge'
import { SectionCard } from '@/components/ui/SectionCard'
import { DataTable, type Column } from '@/components/ui/DataTable'

// ─── Étapes du départ ────────────────────────────────────────────────────────

const ALL_DEPARTURE_STATES: { id: DepartureStates; label: string; icon: any }[] = [
  { id: DepartureStates.EN_ATTENTE, label: 'En attente',  icon: Clock      },
  { id: DepartureStates.EN_TRANSIT, label: 'En transit',  icon: Truck      },
  { id: DepartureStates.ARRIVE,     label: 'Arrivé',      icon: CheckCircle },
]

const NEXT_STATE: Record<DepartureStates, DepartureStates | null> = {
  [DepartureStates.EN_ATTENTE]: DepartureStates.EN_TRANSIT,
  [DepartureStates.EN_TRANSIT]: DepartureStates.ARRIVE,
  [DepartureStates.ARRIVE]:     null,
}

const STATE_LABEL: Record<DepartureStates, string> = {
  [DepartureStates.EN_ATTENTE]: 'En attente',
  [DepartureStates.EN_TRANSIT]: 'En transit',
  [DepartureStates.ARRIVE]:     'Arrivé',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DepartureDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router  = useRouter()
  const qc      = useQueryClient()

  const [showConfirm, setShowConfirm] = useState(false)

  const { data: dep, isLoading } = useQuery({
    queryKey: ['departure', id],
    queryFn:  () => departuresApi.getById(id),
  })

  const packages = dep?.packages ?? []

  const updateStateMutation = useMutation({
    mutationFn: (state: DepartureStates) => departuresApi.updateState(id, state),
    onSuccess: () => {
      toast.success('État du départ mis à jour')
      qc.invalidateQueries({ queryKey: ['departure', id] })
      qc.invalidateQueries({ queryKey: ['departures'] })
      qc.invalidateQueries({ queryKey: ['packages'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message ?? 'Erreur lors de la mise à jour')
    },
  })

  const closeMutation = useMutation({
    mutationFn: () => departuresApi.close(id),
    onSuccess: () => {
      toast.success('Départ fermé')
      qc.invalidateQueries({ queryKey: ['departure', id] })
      qc.invalidateQueries({ queryKey: ['departures'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      setShowConfirm(false)
    },
    onError: () => toast.error('Erreur lors de la fermeture'),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-[#D16E41]" />
      </div>
    )
  }

  if (!dep) {
    return <div className="text-center py-16 text-gray-400">Départ introuvable</div>
  }

  const currentState = getDepartureState(dep)
  const nextState    = NEXT_STATE[currentState]
  const sym          = dep.currency?.symbol ?? '€'

  // Statuts triés du plus ancien au plus récent pour la timeline
  const sortedStatuses = [...(dep.statuses ?? [])].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )

  return (
    <div className="p-6">

      {/* ── Header ── */}
      <div className="mb-6">
        <BackButton />

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <MapPin className="w-6 h-6 text-[#D16E41]" />
                {dep.departureAddress?.city} → {dep.destinationAddress?.city}
              </h1>
              <DepartureStateBadge state={currentState} />
              {dep.isClosed && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
                  Fermé
                </span>
              )}
            </div>
            <p className="text-gray-400 text-sm">
              {dep.departureAddress?.country} → {dep.destinationAddress?.country}
              {dep.creator && (
                <> · Créé par <span className="text-[#D16E41]">{dep.creator.email}</span></>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Avancer l'état */}
            {nextState && (
              <button
                onClick={() => updateStateMutation.mutate(nextState)}
                disabled={updateStateMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-[#D16E41] hover:bg-[#E07D52] text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {updateStateMutation.isPending
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <ChevronRight className="w-4 h-4" />
                }
                Passer à "{STATE_LABEL[nextState]}"
              </button>
            )}

            {/* Fermer */}
            {!dep.isClosed && currentState === DepartureStates.EN_ATTENTE && (
              <button
                onClick={() => setShowConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-red-500/20 text-gray-300 hover:text-red-400 border border-gray-600 rounded-lg transition-colors"
              >
                <Lock className="w-4 h-4" />
                Fermer
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Modal confirmation fermeture ── */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-white font-semibold mb-2">Fermer ce départ ?</h3>
            <p className="text-gray-400 text-sm mb-4">
              Plus aucun colis ne pourra y être ajouté.
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowConfirm(false)} className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600">
                Annuler
              </button>
              <button
                onClick={() => closeMutation.mutate()}
                disabled={closeMutation.isPending}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm"
              >
                {closeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Grille principale ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ══ Colonne gauche (2/3) ══ */}
        <div className="lg:col-span-2 space-y-6">

          {/* Timeline des états */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#D16E41]" />
              Progression du départ
            </h2>

            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-700" />
              <div className="space-y-6">
                {ALL_DEPARTURE_STATES.map((step) => {
                  const reached  = sortedStatuses.some((s) => s.state === step.id)
                  const isActive = currentState === step.id
                  const Icon     = step.icon
                  const statusEntry = sortedStatuses.find((s) => s.state === step.id)

                  return (
                    <div key={step.id} className={`relative flex gap-4 ${!reached ? 'opacity-40' : ''}`}>
                      <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isActive ? 'bg-[#D16E41]' : reached ? 'bg-[#D16E41]/50' : 'bg-gray-700 border-2 border-gray-600'
                      }`}>
                        <Icon className={`w-5 h-5 ${reached ? 'text-white' : 'text-gray-500'}`} />
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className={`font-semibold ${reached ? 'text-white' : 'text-gray-500'}`}>
                            {step.label}
                          </h3>
                          {statusEntry ? (
                            <span className="text-xs text-gray-400">
                              {new Date(statusEntry.createdAt).toLocaleDateString('fr-FR')}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-600">En attente</span>
                          )}
                        </div>
                        {!reached && (
                          <p className="text-sm text-gray-600">Ce statut n'a pas encore été atteint</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Liste des colis */}
          <SectionCard
            title="Colis"
            icon={Package}
            badge={<span className="text-xs bg-gray-700 text-gray-300 px-2.5 py-1 rounded-full">{packages.length}</span>}
            padding=""
            overflow
          >
            <DataTable
              columns={[
                { label: 'Référence', render: (pkg) => <span className="text-sm text-[#D16E41] font-medium">{pkg.reference}</span> },
                { label: 'Client',    render: (pkg) => <span className="text-sm text-gray-300">{pkg.person?.firstName} {pkg.person?.lastName}</span> },
                { label: 'Poids',     render: (pkg) => <span className="text-sm text-gray-300">{pkg.weight} kg</span> },
                { label: 'Statut',    render: (pkg) => <PackageStateBadge state={getPackageState(pkg)} /> },
              ]}
              rows={packages}
              emptyMessage="Aucun colis pour ce départ"
              onRowClick={(pkg) => router.push(`/packages/${pkg.id}`)}
            />
          </SectionCard>

          {/* Infos du GP (partenaire) */}
          {dep.person && (
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-[#D16E41]" />
                Voyageur GP
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Nom</p>
                  <p className="text-sm text-white font-medium">
                    {dep.person.firstName} {dep.person.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Téléphone</p>
                  <p className="text-sm text-gray-300">{dep.person.mobile}</p>
                </div>
                {dep.person.personType && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Type</p>
                    <p className="text-sm text-gray-300">{dep.person.personType.name}</p>
                  </div>
                )}
                <div className="md:col-span-2 pt-2">
                  <a
                    href={`https://wa.me/${dep.person.mobile.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm"
                  >
                    Contacter par WhatsApp
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ══ Colonne droite (1/3) ══ */}
        <div className="space-y-6">

          {/* Route & Dates */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Plane className="w-5 h-5 text-[#D16E41]" />
              Itinéraire
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Départ</p>
                <p className="text-sm text-white font-medium">
                  {dep.departureAddress?.city}, {dep.departureAddress?.country}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Destination</p>
                <p className="text-sm text-white font-medium">
                  {dep.destinationAddress?.city}, {dep.destinationAddress?.country}
                </p>
              </div>
              <hr className="border-gray-700" />
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Date de départ
                  </span>
                  <span className="text-xs text-white">
                    {new Date(dep.departureDate).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Arrivée prévue
                  </span>
                  <span className="text-xs text-white">
                    {new Date(dep.arrivalDate).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Deadline colis
                  </span>
                  <span className={`text-xs font-medium ${new Date(dep.deadline) < new Date() ? 'text-red-400' : 'text-amber-400'}`}>
                    {new Date(dep.deadline).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tarifs */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              Tarifs
            </h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 border-b border-gray-700">
                <span className="text-sm text-gray-400">Prix client / kg</span>
                <span className="text-sm font-semibold text-white">{sym} {dep.price.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-700">
                <span className="text-sm text-gray-400">Prix GP / kg</span>
                <span className="text-sm font-semibold text-white">
                  {dep.priceGp > 0 ? `${sym} ${dep.priceGp.toFixed(2)}` : '—'}
                </span>
              </div>
              {dep.insurancePrice != null && dep.insurancePrice > 0 && (
                <div className="flex items-center justify-between py-2 border-b border-gray-700">
                  <span className="text-sm text-gray-400">Assurance / kg</span>
                  <span className="text-sm text-white">{sym} {dep.insurancePrice.toFixed(2)}</span>
                </div>
              )}
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-400">Devise</span>
                <span className="text-sm text-white">{dep.currency?.name} ({dep.currency?.code})</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
