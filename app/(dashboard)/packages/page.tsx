'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Plus, Eye, Trash2, MapPin, Calendar, Package } from 'lucide-react'
import { toast } from 'sonner'
import { packagesApi } from '@/lib/api/packages.api'
import { PackageStateBadge } from '@/components/shared/PackageStateBadge'
import { PackageStates, getPackageState, type Package as Pkg, type PackageFilters } from '@/lib/types/api.types'
import { PACKAGE_STATE_OPTIONS } from '@/constants/package.constants'
import { CreatePackageModal } from '@/components/packages/CreatePackageModal'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Pagination } from '@/components/ui/Pagination'
import { StatsGrid, type StatCard } from '@/components/ui/StatsGrid'
import { FiltersPanel, type FilterField } from '@/components/ui/FiltersPanel'

export default function PackagesPage() {
  const router = useRouter()
  const qc     = useQueryClient()
  const [filters, setFilters]      = useState<PackageFilters>({ page: 1, limit: 6 })
  const [showCreate, setShowCreate] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['packages', filters],
    queryFn:  () => packagesApi.list(filters),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => packagesApi.delete(id),
    onSuccess:  () => { toast.success('Colis supprimé'); qc.invalidateQueries({ queryKey: ['packages'] }); qc.invalidateQueries({ queryKey: ['dashboard'] }) },
    onError:    () => toast.error('Erreur lors de la suppression'),
  })

  const { data: enAttenteStats } = useQuery({ queryKey: ['packages-count', PackageStates.EN_ATTENTE], queryFn: () => packagesApi.list({ state: PackageStates.EN_ATTENTE, limit: 1, page: 1 }) })
  const { data: enTransitStats } = useQuery({ queryKey: ['packages-count', PackageStates.EN_TRANSIT], queryFn: () => packagesApi.list({ state: PackageStates.EN_TRANSIT, limit: 1, page: 1 }) })
  const { data: livresStats }    = useQuery({ queryKey: ['packages-count', PackageStates.LIVRE],      queryFn: () => packagesApi.list({ state: PackageStates.LIVRE,      limit: 1, page: 1 }) })

  const packages   = data?.props ?? []
  const total      = data?.total ?? 0
  const totalPages = Math.ceil(total / (filters.limit ?? 6))

  const setFilter = (key: keyof PackageFilters, value: any) =>
    setFilters((prev) => ({ ...prev, [key]: value === '' ? undefined : value, page: 1 }))

  const stats: StatCard[] = [
    { label: 'Total Colis', value: total,                         color: 'bg-blue-500/20',  icon: Package },
    { label: 'En attente',  value: enAttenteStats?.total ?? '…',  color: 'bg-amber-500/20', icon: Package },
    { label: 'En transit',  value: enTransitStats?.total ?? '…',  color: 'bg-blue-500/20',  icon: Package },
    { label: 'Livrés',      value: livresStats?.total    ?? '…',  color: 'bg-green-500/20', icon: Package },
  ]

  const filterFields: FilterField[] = [
    {
      type: 'select', label: 'Statut',
      options: PACKAGE_STATE_OPTIONS,
      onChange: (v) => setFilter('state', v as PackageStates),
    },
    { type: 'text', label: 'Pays de départ',      placeholder: 'France, USA...', onChange: (v) => setFilter('departureCountry', v) },
    { type: 'text', label: 'Pays de destination', placeholder: 'Sénégal...',     onChange: (v) => setFilter('destinationCountry', v) },
    { type: 'date', label: 'Date création (depuis)',                              onChange: (v) => setFilter('createdAtFrom', v) },
  ]

  const columns: Column<Pkg>[] = [
    {
      label: 'Client',
      render: (pkg) => (
        <>
          <p className="text-sm font-medium text-white">{pkg.person.firstName} {pkg.person.lastName}</p>
          <p className="text-xs text-gray-500">{new Date(pkg.createdAt).toLocaleDateString('fr-FR')}</p>
        </>
      ),
    },
    {
      label: 'Route',
      render: (pkg) => (
        <div className="flex items-start gap-1.5">
          <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-300">{pkg.departureGp.departureAddress?.city}, {pkg.departureGp.departureAddress?.country}</p>
            <p className="text-sm text-gray-300">→ {pkg.departureGp.destinationAddress?.city}, {pkg.departureGp.destinationAddress?.country}</p>
          </div>
        </div>
      ),
    },
    { label: 'Poids',   render: (pkg) => <span className="text-sm font-medium text-white">{pkg.weight} kg</span> },
    { label: 'Natures', render: (pkg) => <p className="text-sm text-gray-300 max-w-[140px] truncate">{pkg.natures.map((n) => n.nature.name).join(', ') || '—'}</p> },
    {
      label: 'Départ prévu',
      render: (pkg) => (
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-300">{new Date(pkg.departureGp.departureDate).toLocaleDateString('fr-FR')}</span>
        </div>
      ),
    },
    { label: 'Statut', render: (pkg) => <PackageStateBadge state={getPackageState(pkg)} /> },
    {
      label: 'Actions', align: 'right',
      render: (pkg) => (
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => router.push(`/packages/${pkg.id}`)} className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors" title="Voir le détail">
            <Eye className="w-4 h-4" />
          </button>
          <button onClick={() => { if (confirm('Supprimer ce colis ?')) deleteMutation.mutate(pkg.id) }} className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors" title="Supprimer">
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
            <h1 className="text-2xl font-bold text-white mb-1">Gestion des Colis</h1>
            <p className="text-gray-400">Liste complète des colis et expéditions</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-[#D16E41] hover:bg-[#E07D52] text-white rounded-lg transition-colors">
            <Plus className="w-5 h-5" /> Nouveau colis
          </button>
        </div>
        <StatsGrid stats={stats} />
        <FiltersPanel searchPlaceholder="Référence, nom du client..." onSearch={(v) => setFilter('search', v)} filters={filterFields} />
      </div>

      <DataTable columns={columns} rows={packages} isLoading={isLoading} emptyMessage="Aucun colis trouvé"
        footer={<Pagination page={filters.page ?? 1} totalPages={totalPages} total={total} label="colis au total" onChange={(p) => setFilters((prev) => ({ ...prev, page: p }))} />}
      />

      <CreatePackageModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  )
}
