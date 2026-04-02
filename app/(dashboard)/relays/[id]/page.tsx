'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  MapPin, User, Calendar, Package, CheckCircle2,
  RotateCcw, Loader2, Phone, Box, TrendingUp,
} from 'lucide-react'
import { toast } from 'sonner'
import { relaysApi }    from '@/lib/api/relays.api'
import { packagesApi }  from '@/lib/api/packages.api'
import { PackageStates, getPackageState } from '@/lib/types/api.types'
import type { Package as Pkg } from '@/lib/types/api.types'
import { PackageStateBadge } from '@/components/shared/PackageStateBadge'
import { BackButton }   from '@/components/ui/BackButton'
import { StatsGrid, type StatCard }   from '@/components/ui/StatsGrid'
import { SectionCard }  from '@/components/ui/SectionCard'
import { DetailField }  from '@/components/ui/DetailField'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Pagination }   from '@/components/ui/Pagination'

const HISTORY_PER_PAGE = 10

export default function RelayDetailPage() {
  const { id }   = useParams<{ id: string }>()
  const router   = useRouter()
  const qc       = useQueryClient()

  const [historyPage, setHistoryPage]   = useState(1)
  const [historyState, setHistoryState] = useState<PackageStates | ''>('')

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

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-[#D16E41]" /></div>
  if (!relay)    return <div className="text-center py-20 text-gray-400">Relais introuvable</div>

  const allPackages    = relay.packages ?? []
  const arrivePackages = allPackages.filter((p) => getPackageState(p) === PackageStates.ARRIVE)
  const totalLivre     = allPackages.filter((p) => getPackageState(p) === PackageStates.LIVRE).length
  const totalRetourne  = allPackages.filter((p) => getPackageState(p) === PackageStates.RETOURNE).length

  const filteredHistory   = historyState ? allPackages.filter((p) => getPackageState(p) === historyState) : allPackages
  const historyTotalPages = Math.ceil(filteredHistory.length / HISTORY_PER_PAGE)
  const historySlice      = filteredHistory.slice((historyPage - 1) * HISTORY_PER_PAGE, historyPage * HISTORY_PER_PAGE)

  const { address, person } = relay

  const stats: StatCard[] = [
    { label: 'Total colis',  value: allPackages.length,    color: 'bg-blue-500/20',   icon: Box },
    { label: 'En attente',   value: arrivePackages.length, color: 'bg-purple-500/20', icon: Package },
    { label: 'Livrés',       value: totalLivre,            color: 'bg-green-500/20',  icon: CheckCircle2 },
    { label: 'Retournés',    value: totalRetourne,         color: 'bg-red-500/20',    icon: RotateCcw },
  ]

  const historyColumns: Column<Pkg>[] = [
    {
      label: 'Référence',
      render: (pkg) => (
        <span className="text-sm text-[#D16E41] hover:underline cursor-pointer" onClick={() => router.push(`/packages/${pkg.id}`)}>
          {pkg.reference}
        </span>
      ),
    },
    { label: 'Client',  render: (pkg) => <span className="text-sm text-gray-300">{pkg.person?.firstName} {pkg.person?.lastName}</span> },
    { label: 'Poids',   render: (pkg) => <span className="text-sm text-gray-300">{pkg.weight} kg</span> },
    { label: 'Statut',  render: (pkg) => <PackageStateBadge state={getPackageState(pkg)} /> },
    { label: 'Date',    render: (pkg) => <span className="text-sm text-gray-400">{new Date(pkg.createdAt).toLocaleDateString('fr-FR')}</span> },
  ]

  return (
    <div>
      <div className="mb-6">
        <BackButton />
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-[#D16E41]/20 border border-[#D16E41]/30 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-8 h-8 text-[#D16E41]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{relay.name}</h1>
              <p className="text-gray-400 mt-0.5">{address.city}, {address.region} — {address.country}</p>
              <p className="text-xs text-gray-500 mt-1">
                <Calendar className="w-3 h-3 inline mr-1" />
                Créé le {new Date(relay.createdAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
          <button onClick={() => router.push(`/persons/${person.id}`)} className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors">
            <User className="w-4 h-4" /> Voir le responsable
          </button>
        </div>
      </div>

      <StatsGrid stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche */}
        <div className="lg:col-span-2 space-y-6">

          {/* Colis ARRIVE */}
          <SectionCard
            title="Colis au relais"
            icon={Package}
            iconColor="text-purple-400"
            badge={<span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">{arrivePackages.length}</span>}
            padding=""
            overflow
          >
            {arrivePackages.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Aucun colis en attente</p>
            ) : (
              <div className="divide-y divide-gray-700">
                {arrivePackages.map((pkg) => (
                  <div key={pkg.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{pkg.reference}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{pkg.person?.firstName} {pkg.person?.lastName} · {pkg.weight} kg</p>
                      <p className="text-xs text-gray-500">Arrivé le {new Date(pkg.statuses[pkg.statuses.length - 1]?.createdAt ?? pkg.createdAt).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => statusMutation.mutate({ pkgId: pkg.id, state: PackageStates.LIVRE })} disabled={statusMutation.isPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-xs font-medium transition-colors disabled:opacity-50">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Livré
                      </button>
                      <button onClick={() => statusMutation.mutate({ pkgId: pkg.id, state: PackageStates.RETOURNE })} disabled={statusMutation.isPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs font-medium transition-colors disabled:opacity-50">
                        <RotateCcw className="w-3.5 h-3.5" /> Retourné
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Historique */}
          <SectionCard
            title="Historique des colis"
            icon={TrendingUp}
            iconColor="text-gray-400"
            action={
              <select
                value={historyState}
                onChange={(e) => { setHistoryState(e.target.value as PackageStates | ''); setHistoryPage(1) }}
                className="px-3 py-1.5 bg-gray-700 text-gray-300 border border-gray-600 rounded-lg text-xs"
              >
                <option value="">Tous les statuts</option>
                {Object.values(PackageStates).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            }
            padding=""
            overflow
          >
            <DataTable
              columns={historyColumns}
              rows={historySlice}
              emptyMessage="Aucun colis"
              footer={historyTotalPages > 1
                ? <Pagination page={historyPage} totalPages={historyTotalPages} total={filteredHistory.length} label="colis" onChange={setHistoryPage} />
                : undefined
              }
            />
          </SectionCard>
        </div>

        {/* Colonne droite */}
        <div className="space-y-4">
          <SectionCard title="Informations du relais" icon={MapPin}>
            <div className="space-y-3">
              <DetailField label="Nom"      value={relay.name} />
              <DetailField label="Pays"     value={address.country} />
              <DetailField label="Région"   value={address.region} />
              <DetailField label="Ville"    value={address.city} />
              {address.locality && <DetailField label="Localité" value={address.locality} />}
              {address.latitude != null && address.longitude != null && (
                <DetailField label="GPS" mono value={`${address.latitude.toFixed(5)}, ${address.longitude.toFixed(5)}`} />
              )}
            </div>
          </SectionCard>

          <SectionCard title="Responsable" icon={User}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#D16E41] flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-white">{person.firstName.charAt(0)}{person.lastName.charAt(0)}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">{person.firstName} {person.lastName}</p>
                <p className="text-xs text-gray-400">{person.personType?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-300 text-sm mb-4">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>{person.mobile}</span>
            </div>
            <button onClick={() => router.push(`/persons/${person.id}`)} className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors">
              Voir le profil
            </button>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
