'use client'

import { use, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import {
  User, Phone, Package, DollarSign, CheckCircle,
  Clock, Truck, Loader2, MapPin, FileText, Plus, UserCheck, Shield, Eye,
} from 'lucide-react'
import { toast } from 'sonner'
import { personsApi }   from '@/lib/api/persons.api'
import { accountsApi }  from '@/lib/api/accounts.api'
import { referenceApi } from '@/lib/api/reference.api'
import { getPackageState, PackageStates, type PersonDetail, type Package as Pkg } from '@/lib/types/api.types'
import { PackageStateBadge } from '@/components/shared/PackageStateBadge'
import { BackButton }   from '@/components/ui/BackButton'
import { StatsGrid, type StatCard } from '@/components/ui/StatsGrid'
import { SectionCard }  from '@/components/ui/SectionCard'
import { DetailField }  from '@/components/ui/DetailField'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Pagination }   from '@/components/ui/Pagination'

function fmtDate(d: string) { return new Date(d).toLocaleDateString('fr-FR') }
function fmtXof(n: number)  { return Math.round(n).toLocaleString('fr-FR') + ' XOF' }

function typeBadgeStyle(name: string) {
  if (name.toLowerCase().includes('gp'))     return 'bg-[#D16E41]/20 text-[#D16E41] border-[#D16E41]/30'
  if (name.toLowerCase().includes('relais')) return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
  return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
}

const PKG_PAGE_SIZE = 5

export default function PersonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router  = useRouter()
  const qc      = useQueryClient()

  const [pkgStateFilter, setPkgStateFilter] = useState<PackageStates | ''>('')
  const [pkgPage, setPkgPage]               = useState(1)
  const [showAccountForm, setShowAccountForm] = useState(false)
  const [accEmail,    setAccEmail]    = useState('')
  const [accPassword, setAccPassword] = useState('')
  const [accRoleId,   setAccRoleId]   = useState('')

  const { data: person, isLoading } = useQuery({
    queryKey: ['person', id],
    queryFn:  () => personsApi.getById(id),
  })

  const { data: roles = [] } = useQuery({
    queryKey: ['ref-roles'],
    queryFn:  referenceApi.roles,
    enabled:  showAccountForm,
  })

  const createAccountMutation = useMutation({
    mutationFn: () => accountsApi.create({ email: accEmail, password: accPassword, roleId: accRoleId, personId: id }),
    onSuccess: () => {
      toast.success('Compte créé avec succès')
      qc.invalidateQueries({ queryKey: ['person', id] })
      setShowAccountForm(false)
      setAccEmail(''); setAccPassword(''); setAccRoleId('')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message ?? 'Erreur lors de la création du compte')
    },
  })

  if (isLoading) return <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-[#D16E41]" /></div>
  if (!person)   return <div className="text-center py-16 text-gray-400">Client introuvable</div>

  const allPackages  = person.packages ?? []
  const filteredPkgs = pkgStateFilter ? allPackages.filter((p) => getPackageState(p) === pkgStateFilter) : allPackages
  const totalPkgPages = Math.ceil(filteredPkgs.length / PKG_PAGE_SIZE)
  const pagedPackages = filteredPkgs.slice((pkgPage - 1) * PKG_PAGE_SIZE, pkgPage * PKG_PAGE_SIZE)

  const allPayments      = allPackages.flatMap((p) => p.payments ?? [])
  const acceptedPayments = allPayments.filter((p) => p.accepted && !p.refunded)
  const totalXof         = acceptedPayments.reduce((s, p) => s + (p.amountXof ?? 0), 0)
  const nbEnCours        = allPackages.filter((p) => { const s = getPackageState(p); return s === PackageStates.EN_TRANSIT || s === PackageStates.ARRIVE }).length
  const nbLivres         = allPackages.filter((p) => getPackageState(p) === PackageStates.LIVRE).length
  const isRelais         = person.personType?.name?.toLowerCase().includes('relais')
  const hasRelay         = isRelais && (person.relays?.length ?? 0) > 0

  const stats: StatCard[] = [
    { label: 'Total colis', value: allPackages.length, color: 'bg-[#D16E41]/10',  icon: Package },
    { label: 'Payé (XOF)',  value: fmtXof(totalXof),  color: 'bg-green-500/10',   icon: DollarSign },
    { label: 'En cours',    value: nbEnCours,           color: 'bg-blue-500/10',   icon: Truck },
    { label: 'Livrés',      value: nbLivres,            color: 'bg-purple-500/10', icon: CheckCircle },
  ]

  const pkgColumns: Column<Pkg>[] = [
    { label: 'Référence', render: (pkg) => <span className="font-mono text-xs text-[#D16E41]">#{pkg.reference}</span> },
    {
      label: 'Départ GP',
      render: (pkg) => {
        const dep = pkg.departureGp
        return <span className="text-gray-300 text-xs">{dep ? `${dep.departureAddress?.city} → ${dep.destinationAddress?.city}` : '—'}</span>
      },
    },
    { label: 'Statut',   render: (pkg) => <PackageStateBadge state={getPackageState(pkg)} /> },
    {
      label: 'Natures',
      render: (pkg) => <span className="text-gray-400 text-xs">{pkg.natures?.map((n) => `${n.nature.name} ×${n.quantity}`).join(', ') || '—'}</span>,
    },
    {
      label: 'Montant',
      render: (pkg) => {
        const payment = pkg.payments?.find((p) => p.accepted && !p.refunded)
        return <span className="text-white text-xs font-medium">{payment ? fmtXof(payment.amountXof) : '—'}</span>
      },
    },
    { label: 'Date', render: (pkg) => <span className="text-gray-400 text-xs">{fmtDate(pkg.createdAt)}</span> },
    {
      label: '', align: 'right',
      render: (pkg) => (
        <button onClick={() => router.push(`/packages/${pkg.id}`)} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors">
          <Eye className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ]

  type Payment = (typeof allPayments)[number]

  const payColumns: Column<Payment>[] = [
    { label: 'Montant',     render: (pay) => <span className="text-white font-medium">{pay.amount.toFixed(2)}</span> },
    { label: 'Devise',      render: (pay) => <span className="text-gray-300">{pay.currency?.code}</span> },
    { label: 'Montant XOF', render: (pay) => <span className="text-gray-300">{fmtXof(pay.amountXof)}</span> },
    { label: 'Méthode',     render: (pay) => <span className="text-gray-400 text-xs">{pay.paymentMethod?.name}</span> },
    {
      label: 'Statut',
      render: (pay) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
          pay.refunded ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
            : pay.accepted ? 'bg-green-500/20 text-green-300 border-green-500/30'
            : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
        }`}>
          {pay.refunded ? 'Remboursé' : pay.accepted ? 'Accepté' : 'En attente'}
        </span>
      ),
    },
    { label: 'Date',    render: (pay) => <span className="text-gray-400 text-xs">{fmtDate(pay.createdAt)}</span> },
    {
      label: 'Facture',
      render: (pay) => pay.linkInvoice ? (
        <a href={pay.linkInvoice} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
          <FileText className="w-3.5 h-3.5" /> Voir
        </a>
      ) : <span className="text-gray-600 text-xs">—</span>,
    },
  ]

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <BackButton />
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="text-2xl font-bold text-white">{person.firstName} {person.lastName}</h1>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${typeBadgeStyle(person.personType?.name ?? '')}`}>
                {person.personType?.name?.toUpperCase()}
              </span>
              {person.account ? (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-300 border border-green-500/30">
                  <UserCheck className="w-3 h-3" /> Compte actif
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-400 border border-gray-500/30">Sans compte</span>
              )}
            </div>
            <div className="flex items-center gap-3 text-gray-400 text-sm">
              <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{person.mobile}</span>
              <span>·</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Inscrit le {fmtDate(person.createdAt)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {!person.account && (
              <button onClick={() => setShowAccountForm(true)} className="flex items-center gap-2 px-4 py-2 bg-[#D16E41] hover:bg-[#E07D52] text-white rounded-lg text-sm transition-colors">
                <Shield className="w-4 h-4" /> Créer un compte
              </button>
            )}
            <button onClick={() => router.push('/packages')} className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors">
              <Plus className="w-4 h-4" /> Nouveau colis
            </button>
          </div>
        </div>
      </div>

      {/* Modal création compte */}
      {showAccountForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-sm w-full mx-4 space-y-4">
            <h3 className="text-white font-semibold flex items-center gap-2"><Shield className="w-5 h-5 text-[#D16E41]" />Créer un compte pour {person.firstName}</h3>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Email *</label>
              <input type="email" value={accEmail} onChange={(e) => setAccEmail(e.target.value)} placeholder="email@exemple.com"
                className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D16E41]" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Mot de passe *</label>
              <input type="password" value={accPassword} onChange={(e) => setAccPassword(e.target.value)} placeholder="••••••••"
                className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D16E41]" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Rôle *</label>
              <select value={accRoleId} onChange={(e) => setAccRoleId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D16E41]">
                <option value="">Sélectionner</option>
                {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <button onClick={() => { setShowAccountForm(false); setAccEmail(''); setAccPassword(''); setAccRoleId('') }}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600">Annuler</button>
              <button onClick={() => createAccountMutation.mutate()} disabled={!accEmail || !accPassword || !accRoleId || createAccountMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-[#D16E41] hover:bg-[#E07D52] text-white rounded-lg text-sm disabled:opacity-50">
                {createAccountMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />} Créer
              </button>
            </div>
          </div>
        </div>
      )}

      <StatsGrid stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche */}
        <div className="lg:col-span-2 space-y-6">
          <SectionCard
            title="Historique des colis"
            icon={Package}
            action={
              <select value={pkgStateFilter}
                onChange={(e) => { setPkgStateFilter(e.target.value as PackageStates | ''); setPkgPage(1) }}
                className="px-3 py-1.5 bg-gray-700 text-white border border-gray-600 rounded-lg text-sm focus:outline-none">
                <option value="">Tous les statuts</option>
                {Object.values(PackageStates).map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            }
            padding=""
            overflow
          >
            <DataTable
              columns={pkgColumns}
              rows={pagedPackages}
              emptyMessage="Aucun colis"
              footer={totalPkgPages > 1
                ? <Pagination page={pkgPage} totalPages={totalPkgPages} total={filteredPkgs.length} label="colis" onChange={setPkgPage} />
                : undefined
              }
            />
          </SectionCard>

          <SectionCard title="Historique des paiements" icon={DollarSign} iconColor="text-green-400" padding="" overflow>
            <DataTable columns={payColumns} rows={allPayments} emptyMessage="Aucun paiement" />
          </SectionCard>
        </div>

        {/* Colonne droite */}
        <div className="space-y-6">
          <SectionCard title="Informations" icon={User}>
            <div className="space-y-3">
              <DetailField label="Prénom" value={person.firstName} />
              <DetailField label="Nom"    value={person.lastName} />
              <DetailField label="Mobile" value={person.mobile} />
              <DetailField label="Type"   value={
                <>
                  {person.personType?.name?.toUpperCase()}
                  {(person.personType?.remise ?? 0) > 0 && (
                    <span className="ml-2 text-xs text-[#D16E41]">— {person.personType.remise}% de remise</span>
                  )}
                </>
              } />
              {person.account && (
                <div className="pt-2 border-t border-gray-700">
                  <DetailField label="Email du compte" value={person.account.email} />
                  <p className="text-xs text-gray-500 mt-1">Rôle : <span className="text-gray-300">{person.account.role?.name}</span></p>
                </div>
              )}
            </div>
          </SectionCard>

          {isRelais && (
            <SectionCard title="Relais associé" icon={MapPin} iconColor="text-purple-400">
              {!hasRelay ? (
                <p className="text-gray-500 text-sm">Aucun relais configuré</p>
              ) : (
                person.relays.map((relay) => (
                  <div key={relay.id} className="space-y-1">
                    <p className="text-sm font-medium text-white">{relay.name}</p>
                    {relay.address && <p className="text-xs text-gray-400">{relay.address.city}, {relay.address.country}</p>}
                  </div>
                ))
              )}
            </SectionCard>
          )}

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <a href={`https://wa.me/${person.mobile.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm font-medium">
              Contacter par WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
