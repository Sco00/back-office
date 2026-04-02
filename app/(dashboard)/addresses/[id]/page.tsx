'use client'

import { use } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import {
  Globe, Building2, MapPin, Calendar, ArrowLeft,
  User, Eye, Loader2, Pencil, Trash2,
} from 'lucide-react'
import { addressesApi } from '@/lib/api/addresses.api'
import { getDepartureState, DepartureStates, type Departure } from '@/lib/types/api.types'
import { DataTable, type Column } from '@/components/ui/DataTable'

export default function AddressDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }  = use(params)
  const router  = useRouter()

  const { data: address, isLoading } = useQuery({
    queryKey: ['address', id],
    queryFn:  () => addressesApi.getById(id),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#D16E41]" />
      </div>
    )
  }

  if (!address) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Adresse introuvable</p>
      </div>
    )
  }

  const allDepartures = [
    ...address.departureGpsDepartures.map((d) => ({ ...d, role: 'départ' as const })),
    ...address.departureGpsDestinations.map((d) => ({ ...d, role: 'destination' as const })),
  ]

  const departureStateLabel = (dep: Departure) => {
    const s = getDepartureState(dep)
    const map: Record<DepartureStates, { label: string; color: string }> = {
      [DepartureStates.EN_ATTENTE]: { label: 'En attente',  color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
      [DepartureStates.EN_TRANSIT]: { label: 'En transit',  color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
      [DepartureStates.ARRIVE]:     { label: 'Arrivé',      color: 'bg-green-500/20 text-green-300 border-green-500/30' },
    }
    return map[s] ?? { label: s, color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' }
  }

  const depColumns: Column<typeof allDepartures[0]>[] = [
    {
      label: 'Route',
      render: (dep) => (
        <div className="flex items-start gap-1.5">
          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-300">
              {(dep as any).departureAddress?.city ?? address.city}, {(dep as any).departureAddress?.country ?? address.country}
            </p>
            <p className="text-sm text-gray-300">
              → {(dep as any).destinationAddress?.city ?? address.city}, {(dep as any).destinationAddress?.country ?? address.country}
            </p>
          </div>
        </div>
      ),
    },
    {
      label: 'Date départ',
      render: (dep) => (
        <span className="text-sm text-gray-300">
          {new Date(dep.departureDate).toLocaleDateString('fr-FR')}
        </span>
      ),
    },
    {
      label: 'État',
      render: (dep) => {
        const { label, color } = departureStateLabel(dep)
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${color}`}>
            {dep.isClosed ? 'Fermé' : label}
          </span>
        )
      },
    },
    {
      label: 'GP',
      render: (dep) => dep.person
        ? <span className="text-sm text-white">{dep.person.firstName} {dep.person.lastName}</span>
        : <span className="text-gray-500 text-sm">—</span>,
    },
    {
      label: 'Actions', align: 'right',
      render: (dep) => (
        <button
          onClick={() => router.push(`/departures/${dep.id}`)}
          className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
          title="Voir le départ"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Retour */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Retour aux adresses
      </button>

      {/* En-tête */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-[#D16E41]/20 border border-[#D16E41]/30 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-7 h-7 text-[#D16E41]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{address.city}, {address.country}</h1>
              <div className="flex items-center gap-3 mt-2">
                {address.type === 'RELAIS' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    <MapPin className="w-3 h-3" /> Point Relais
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-600/50 text-gray-300 border border-gray-600">
                    Simple
                  </span>
                )}
                <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                  <Calendar className="w-4 h-4" />
                  {new Date(address.createdAt).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors">
              <Pencil className="w-4 h-4" /> Modifier
            </button>
            <button
              disabled={allDepartures.length > 0 || address.relays.length > 0}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-red-500/20 text-gray-300 hover:text-red-400 rounded-lg text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title={allDepartures.length > 0 || address.relays.length > 0 ? 'Adresse utilisée, suppression impossible' : undefined}
            >
              <Trash2 className="w-4 h-4" /> Supprimer
            </button>
          </div>
        </div>
      </div>

      {/* Section 1 — Informations géographiques */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Informations géographiques</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {[
            { icon: Globe,     label: 'Pays',     value: address.country },
            { icon: MapPin,    label: 'Région',   value: address.region },
            { icon: Building2, label: 'Ville',    value: address.city },
            { icon: MapPin,    label: 'Localité', value: address.locality ?? '—' },
            { icon: MapPin,    label: 'Type',     value: address.type === 'RELAIS' ? 'Point Relais' : 'Simple' },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-xs text-gray-500 uppercase mb-1">{item.label}</p>
              <div className="flex items-center gap-2">
                <item.icon className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-white">{item.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2 — Départs GP liés */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">
          Départs GP liés
          <span className="ml-2 px-2 py-0.5 bg-gray-700 text-gray-400 text-xs rounded-full">{allDepartures.length}</span>
        </h2>
        {allDepartures.length === 0 ? (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center text-gray-500">
            Aucun départ lié à cette adresse
          </div>
        ) : (
          <DataTable columns={depColumns} rows={allDepartures} emptyMessage="Aucun départ lié" />
        )}
      </div>

      {/* Section 3 — Relais associé */}
      {address.type === 'RELAIS' && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">
            Relais associé
            <span className="ml-2 px-2 py-0.5 bg-gray-700 text-gray-400 text-xs rounded-full">{address.relays.length}</span>
          </h2>
          {address.relays.length === 0 ? (
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center text-gray-500">
              Aucun relais associé à cette adresse
            </div>
          ) : (
            <div className="space-y-3">
              {address.relays.map((relay) => (
                <div key={relay.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#D16E41]/20 border border-[#D16E41]/30 flex items-center justify-center">
                      <User className="w-5 h-5 text-[#D16E41]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{relay.name}</p>
                      {relay.person && (
                        <p className="text-xs text-gray-400">
                          Responsable : {relay.person.firstName} {relay.person.lastName}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/relays/${relay.id}`)}
                    className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
                    title="Voir le relais"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
