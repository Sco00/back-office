'use client'

import { use, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import {
  FileText, MapPin, Calendar, Package as PackageIcon,
  Trash2, Loader2, User, DollarSign, Plane, Truck,
  CheckCircle, Clock, X, RefreshCw, MessageSquare,
  Copy, Weight, Box, AlertCircle, Plus,
} from 'lucide-react'
import { toast } from 'sonner'
import { packagesApi }   from '@/lib/api/packages.api'
import { paymentsApi }   from '@/lib/api/payments.api'
import { referenceApi }  from '@/lib/api/reference.api'
import { PackageStateBadge } from '@/components/shared/PackageStateBadge'
import { PackageStates, DepartureStates, getPackageState, getDepartureState, type Package } from '@/lib/types/api.types'
import { BackButton }    from '@/components/ui/BackButton'
import { SectionCard }   from '@/components/ui/SectionCard'
import { DetailField }   from '@/components/ui/DetailField'
import { StatsGrid, type StatCard } from '@/components/ui/StatsGrid'
import { DataTable, type Column }   from '@/components/ui/DataTable'

const ALL_STATES: { id: PackageStates; label: string; icon: any }[] = [
  { id: PackageStates.EN_ATTENTE, label: 'En attente',  icon: Clock  },
  { id: PackageStates.EN_TRANSIT, label: 'En transit',  icon: Truck  },
  { id: PackageStates.ARRIVE,     label: 'Arrivé',      icon: MapPin },
  { id: PackageStates.LIVRE,      label: 'Livré',       icon: CheckCircle },
  { id: PackageStates.RETOURNE,   label: 'Retourné',    icon: RefreshCw },
]

export default function PackageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router  = useRouter()
  const qc      = useQueryClient()

  const [showStatusModal, setShowStatusModal] = useState(false)
  const [selectedStatus, setSelectedStatus]   = useState<PackageStates | ''>('')
  const [showAddNature, setShowAddNature]     = useState(false)
  const [addNatureId, setAddNatureId]         = useState('')
  const [addNatureQty, setAddNatureQty]       = useState('1')

  const [showAddPayment, setShowAddPayment]   = useState(false)
  const [payAmount, setPayAmount]             = useState('')
  const [payCurrencyId, setPayCurrencyId]     = useState('')
  const [payMethodId, setPayMethodId]         = useState('')
  const [payRemise, setPayRemise]             = useState('')
  const [payRemiseReason, setPayRemiseReason] = useState('')
  const [payPriceRelay, setPayPriceRelay]     = useState('')
  const [payInsurance, setPayInsurance]       = useState('')

  const { data: pkg, isLoading } = useQuery({
    queryKey: ['package', id],
    queryFn:  () => packagesApi.getById(id),
  })

  const statusMutation = useMutation({
    mutationFn: (state: PackageStates) => packagesApi.updateStatus(id, state),
    onSuccess: () => {
      toast.success('Statut mis à jour')
      qc.invalidateQueries({ queryKey: ['packages'] }); qc.invalidateQueries({ queryKey: ['package', id] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      setShowStatusModal(false)
      setSelectedStatus('')
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  })

  const { data: natures = [] } = useQuery({
    queryKey: ['natures'],
    queryFn:  referenceApi.natures,
    enabled:  showAddNature,
  })

  const { data: currencies = [] } = useQuery({
    queryKey: ['ref-currencies'],
    queryFn:  referenceApi.currencies,
    enabled:  showAddPayment,
  })

  const { data: paymentMethods = [] } = useQuery({
    queryKey: ['ref-payment-methods'],
    queryFn:  referenceApi.paymentMethods,
    enabled:  showAddPayment,
  })

  const addPaymentMutation = useMutation({
    mutationFn: () => paymentsApi.create({
      packageId:       id,
      amount:          Number(payAmount),
      currencyId:      payCurrencyId,
      paymentMethodId: payMethodId,
      remise:          payRemise       ? Number(payRemise)       : undefined,
      remiseReason:    payRemiseReason || undefined,
      priceRelay:      payPriceRelay   ? Number(payPriceRelay)   : undefined,
      insurancePrice:  payInsurance    ? Number(payInsurance)    : undefined,
    }),
    onSuccess: () => {
      toast.success('Paiement enregistré')
      qc.invalidateQueries({ queryKey: ['packages'] })
      qc.invalidateQueries({ queryKey: ['package', id] })
      qc.invalidateQueries({ queryKey: ['payments'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      setShowAddPayment(false)
      setPayAmount(''); setPayCurrencyId(''); setPayMethodId('')
      setPayRemise(''); setPayRemiseReason(''); setPayPriceRelay(''); setPayInsurance('')
    },
    onError: () => toast.error('Erreur lors de l\'enregistrement'),
  })

  const removeNatureMutation = useMutation({
    mutationFn: (natureId: string) => packagesApi.removeNature(id, natureId),
    onSuccess: () => { toast.success('Nature retirée'); qc.invalidateQueries({ queryKey: ['packages'] }) },
    onError:   () => toast.error('Erreur'),
  })

  const addNatureMutation = useMutation({
    mutationFn: ({ natureId, quantity }: { natureId: string; quantity: number }) =>
      packagesApi.addNature(id, { natureId, quantity }),
    onSuccess: () => {
      toast.success('Nature ajoutée')
      qc.invalidateQueries({ queryKey: ['packages'] }); qc.invalidateQueries({ queryKey: ['package', id] })
      setShowAddNature(false)
      setAddNatureId('')
      setAddNatureQty('1')
    },
    onError: () => toast.error('Erreur lors de l\'ajout'),
  })

  const openQuote = () => window.open(`/api/packages/${id}/quote`, '_blank')

  const acceptedPayment = pkg?.payments?.find((p) => p.accepted && !p.refunded)

  const invoiceMutation = useMutation({
    mutationFn: () => paymentsApi.getInvoice(acceptedPayment!.id),
    onSuccess:  ({ invoiceUrl }) => {
      qc.invalidateQueries({ queryKey: ['package', id] })
      window.open(invoiceUrl, '_blank')
    },
    onError: () => toast.error('Erreur lors de la génération de la facture'),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#D16E41]" />
      </div>
    )
  }

  if (!pkg) {
    return <div className="text-center py-16 text-gray-400">Colis introuvable</div>
  }

  const currentState    = getPackageState(pkg)
  const canChangeStatus = currentState === PackageStates.ARRIVE
  const latestPayment   = pkg.payments?.[pkg.payments.length - 1]
  const canAddNature    = new Date(pkg.departureGp.deadline) > new Date()
  const sym             = pkg.departureGp.currency?.symbol ?? '€'
  const naturesTotal    = pkg.natures.reduce((sum, pn) => sum + (pn.price ?? 0), 0)
  const netTotal        = latestPayment ? (latestPayment.amount - (latestPayment.remise ?? 0)) : naturesTotal

  const charStats: StatCard[] = [
    { label: 'Poids',   value: `${pkg.weight} kg`,             color: 'bg-blue-500/20',   icon: Weight },
    { label: 'Natures', value: pkg.natures.length,             color: 'bg-purple-500/20', icon: PackageIcon },
    { label: 'Archivé', value: pkg.isArchived ? 'Oui' : 'Non', color: pkg.isArchived ? 'bg-amber-500/20' : 'bg-green-500/20', icon: AlertCircle },
  ]

  type PackageNature = (typeof pkg.natures)[number]
  const natureColumns: Column<PackageNature>[] = [
    { label: 'Nature',    render: (pn) => <span className="text-sm font-medium text-white">{pn.nature.name}</span> },
    { label: 'Quantité',  render: (pn) => <span className="text-sm text-white font-medium">{pn.quantity}</span> },
    { label: 'Prix unit.', render: (pn) => <span className="text-sm text-white font-medium">{pn.price?.toFixed(2) ?? '—'}</span> },
    {
      label: 'Actions', align: 'right',
      render: (pn) => (
        <button
          onClick={() => removeNatureMutation.mutate(pn.nature.id)}
          disabled={removeNatureMutation.isPending}
          className="p-1.5 text-red-400 hover:bg-red-500/20 rounded transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ]

  return (
    <div className="p-6">
      {/* ── Header ── */}
      <div className="mb-6">
        <BackButton />

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-2xl font-bold text-white">Colis #{pkg.reference}</h1>
              <PackageStateBadge state={currentState} />
              {latestPayment?.accepted && !latestPayment?.refunded && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
                  Payé
                </span>
              )}
            </div>
            <p className="text-gray-400 text-sm">
              Créé le{' '}
              <span className="text-white">{new Date(pkg.createdAt).toLocaleDateString('fr-FR')}</span>
              {' '}par{' '}
              <span className="text-[#D16E41]">{pkg.creator?.email}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openQuote}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FileText className="w-4 h-4" />
              Devis PDF
            </button>
            {acceptedPayment?.linkInvoice && (
              <a
                href={acceptedPayment.linkInvoice}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <FileText className="w-4 h-4" />
                Facture PDF
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ══ Colonne gauche (2/3) ══ */}
        <div className="lg:col-span-2 space-y-6">

          {/* Caractéristiques */}
          <SectionCard title="Caractéristiques du Colis" icon={Box} iconColor="text-[#D16E41]">
            <StatsGrid stats={charStats} cols={3} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              <DetailField label="Créé par" value={pkg.creator?.email ?? '—'} />
              <div>
                <p className="text-xs text-gray-500 mb-1">Numéro de référence</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-white font-mono font-medium">{pkg.reference}</p>
                  <button
                    onClick={() => { navigator.clipboard.writeText(pkg.reference); toast.success('Copié !') }}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors"
                    title="Copier la référence"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Natures du Colis */}
          <SectionCard
            title="Natures du Colis"
            icon={PackageIcon}
            iconColor="text-[#D16E41]"
            action={canAddNature ? (
              <button
                onClick={() => setShowAddNature((v) => !v)}
                className="flex items-center gap-2 px-4 py-2 bg-[#D16E41] hover:bg-[#E07D52] text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </button>
            ) : undefined}
            padding=""
            overflow
          >
            {/* Formulaire d'ajout inline */}
            {showAddNature && (
              <div className="m-4 p-4 bg-gray-700 rounded-lg border border-gray-600 space-y-3">
                <h3 className="text-sm font-semibold text-white">Nouvelle nature</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="text-xs text-gray-400 mb-1 block">Nature</label>
                    <select
                      value={addNatureId}
                      onChange={(e) => setAddNatureId(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 text-white border border-gray-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D16E41]"
                    >
                      <option value="">Sélectionner</option>
                      {natures.map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.name} — {n.unitPrice === 0 ? `au poids (${sym} ${pkg.departureGp.price}/kg)` : `${sym} ${n.unitPrice}/unité`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Quantité</label>
                    <input
                      type="number"
                      min="1"
                      value={addNatureQty}
                      onChange={(e) => setAddNatureQty(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 text-white border border-gray-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D16E41]"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => { setShowAddNature(false); setAddNatureId(''); setAddNatureQty('1') }}
                    className="px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-500 text-gray-300 rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => {
                      if (!addNatureId || Number(addNatureQty) <= 0) return
                      addNatureMutation.mutate({ natureId: addNatureId, quantity: Number(addNatureQty) })
                    }}
                    disabled={!addNatureId || Number(addNatureQty) <= 0 || addNatureMutation.isPending}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[#D16E41] hover:bg-[#E07D52] text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {addNatureMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Confirmer
                  </button>
                </div>
              </div>
            )}

            <DataTable
              columns={natureColumns}
              rows={pkg.natures}
              emptyMessage="Aucune nature associée"
            />

            <div className="flex items-center gap-3 p-4 border-t border-gray-700">
              <button
                onClick={openQuote}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500/20 text-white border border-blue-500/30 hover:bg-blue-500/30 rounded-lg transition-colors"
              >
                <FileText className="w-5 h-5" />
                Générer un devis
              </button>
              {acceptedPayment && !acceptedPayment.linkInvoice && (
                <button
                  onClick={() => invoiceMutation.mutate()}
                  disabled={invoiceMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {invoiceMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                  Générer une facture
                </button>
              )}
            </div>
          </SectionCard>

          {/* Suivi du Colis — Timeline */}
          <SectionCard
            title="Suivi du Colis"
            icon={MapPin}
            iconColor="text-[#D16E41]"
            action={
              <button
                onClick={() => setShowStatusModal(true)}
                disabled={!canChangeStatus}
                title={!canChangeStatus ? 'Modification possible uniquement quand le colis est arrivé' : undefined}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-white border border-blue-500/30 hover:bg-blue-500/30 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <RefreshCw className="w-4 h-4" />
                Changer statut
              </button>
            }
          >
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-700" />
              <div className="space-y-6">
                {(pkg.statuses ?? []).map((status, idx, arr) => {
                  const info     = ALL_STATES.find((s) => s.id === status.state)
                  const Icon     = info?.icon ?? PackageIcon
                  const isActive = idx === arr.length - 1
                  return (
                    <div key={status.id} className="relative flex gap-4">
                      <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-[#D16E41]' : 'bg-[#D16E41]/50'}`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-white">{info?.label ?? status.state}</h3>
                          <span className="text-xs text-gray-400">
                            {new Date(status.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* Statuts futurs (non encore atteints) */}
                {ALL_STATES.filter((s) => !(pkg.statuses ?? []).some((st) => st.state === s.id)).map((status, idx) => {
                  const Icon = status.icon
                  return (
                    <div key={`future-${idx}`} className="relative flex gap-4 opacity-40">
                      <div className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-700 border-2 border-gray-600">
                        <Icon className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-500">{status.label}</h3>
                          <span className="text-xs text-gray-600">En attente</span>
                        </div>
                        <p className="text-sm text-gray-600">Ce statut n'a pas encore été atteint</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </SectionCard>
        </div>

        {/* ══ Colonne droite (1/3) ══ */}
        <div className="space-y-6">

          {/* Client */}
          <SectionCard title="Client" icon={User} iconColor="text-[#D16E41]">
            <div className="space-y-3">
              <DetailField label="Nom" value={`${pkg.person.firstName} ${pkg.person.lastName}`} />
              <DetailField label="Téléphone" value={pkg.person.mobile} />
              {pkg.person.personType && (
                <DetailField label="Type" value={pkg.person.personType.name} />
              )}
              <div className="pt-3">
                <a
                  href={`https://wa.me/${pkg.person.mobile.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  <MessageSquare className="w-5 h-5" />
                  Contacter par WhatsApp
                </a>
              </div>
            </div>
          </SectionCard>

          {/* Paiement */}
          <SectionCard
            title="Paiement"
            icon={DollarSign}
            iconColor="text-green-400"
            action={!latestPayment && !showAddPayment ? (
              <button
                onClick={() => {
                  setPayAmount(naturesTotal.toFixed(2))
                  setPayRemise(String(pkg.person.personType?.remise ?? 0))
                  setShowAddPayment(true)
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Ajouter paiement
              </button>
            ) : undefined}
          >
            {/* Formulaire d'ajout de paiement */}
            {showAddPayment && (
              <div className="mb-4 p-4 bg-gray-700 rounded-lg border border-gray-600 space-y-3">
                <h3 className="text-sm font-semibold text-white">Nouveau paiement</h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Montant *</label>
                    <input
                      type="number" readOnly
                      value={payAmount}
                      className="w-full px-3 py-2 bg-gray-600/50 text-gray-300 border border-gray-600 rounded-lg text-sm cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Devise *</label>
                    <select
                      value={payCurrencyId}
                      onChange={(e) => setPayCurrencyId(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-600 text-white border border-gray-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Sélectionner</option>
                      {currencies.map((c) => (
                        <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Méthode de paiement *</label>
                  <select
                    value={payMethodId}
                    onChange={(e) => setPayMethodId(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600 text-white border border-gray-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Sélectionner</option>
                    {paymentMethods.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Remise ({sym})</label>
                    <input
                      type="number" readOnly
                      value={payRemise}
                      className="w-full px-3 py-2 bg-gray-600/50 text-gray-300 border border-gray-600 rounded-lg text-sm cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Assurance ({sym})</label>
                    <input
                      type="number" min="0" step="0.01"
                      value={payInsurance}
                      onChange={(e) => setPayInsurance(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 bg-gray-600 text-white border border-gray-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                {Number(payRemise) > 0 && (
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Raison de la remise</label>
                    <input
                      type="text"
                      value={payRemiseReason}
                      onChange={(e) => setPayRemiseReason(e.target.value)}
                      placeholder="Ex : client fidèle, promotion..."
                      className="w-full px-3 py-2 bg-gray-600 text-white border border-gray-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                )}

                {pkg.relay && (
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Prix relais ({sym})</label>
                    <input
                      type="number" min="0" step="0.01"
                      value={payPriceRelay}
                      onChange={(e) => setPayPriceRelay(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 bg-gray-600 text-white border border-gray-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                )}

                <div className="flex gap-2 justify-end pt-1">
                  <button
                    onClick={() => { setShowAddPayment(false); setPayAmount(''); setPayCurrencyId(''); setPayMethodId(''); setPayRemise(''); setPayRemiseReason(''); setPayPriceRelay(''); setPayInsurance('') }}
                    className="px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-500 text-gray-300 rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => addPaymentMutation.mutate()}
                    disabled={!payAmount || !payCurrencyId || !payMethodId || addPaymentMutation.isPending}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {addPaymentMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Enregistrer
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {pkg.natures.map((pn) => (
                <div key={pn.id} className="flex items-center justify-between py-2 border-b border-gray-700">
                  <span className="text-sm text-gray-400">{pn.nature.name} × {pn.quantity}</span>
                  <span className="text-sm text-white font-medium">€ {pn.price.toFixed(2)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between py-2 border-b border-gray-700">
                <span className="text-sm text-gray-400">Sous-total</span>
                <span className="text-sm text-white font-medium">€ {naturesTotal.toFixed(2)}</span>
              </div>
              {latestPayment?.remise ? (
                <div className="flex items-center justify-between py-2 border-b border-gray-700">
                  <span className="text-sm text-gray-400">Remise</span>
                  <span className="text-sm text-amber-400">- € {latestPayment.remise}</span>
                </div>
              ) : null}
              <div className="flex items-center justify-between py-3 bg-[#D16E41]/10 rounded-lg px-3">
                <span className="text-sm font-semibold text-white">Total</span>
                <div className="text-right">
                  <span className="text-lg font-bold text-white">€ {netTotal.toFixed(2)}</span>
                  {latestPayment?.currency && latestPayment.currency.symbol !== sym && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {latestPayment.currency.symbol} {(latestPayment.amount - (latestPayment.remise ?? 0)).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
              <div className="pt-3 space-y-2 border-t border-gray-700">
                <DetailField label="Méthode" value={latestPayment?.paymentMethod?.name ?? '—'} />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Statut</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    latestPayment?.refunded
                      ? 'bg-amber-500/20 text-amber-300'
                      : latestPayment?.accepted
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {latestPayment?.refunded ? 'Remboursé' : latestPayment?.accepted ? 'Payé' : 'En attente'}
                  </span>
                </div>
                <DetailField label="Date" value={latestPayment ? new Date(latestPayment.createdAt).toLocaleDateString('fr-FR') : '—'} />
              </div>
            </div>
          </SectionCard>

          {/* Route & Transport */}
          <SectionCard title="Route & Transport" icon={Plane} iconColor="text-[#D16E41]">
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-2">Route</p>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-gray-300">{pkg.departureGp.departureAddress?.city}, {pkg.departureGp.departureAddress?.country}</span>
                  <span className="text-xs text-gray-600">→</span>
                  <MapPin className="w-3 h-3 text-red-400" />
                  <span className="text-xs text-gray-300">{pkg.departureGp.destinationAddress?.city}, {pkg.departureGp.destinationAddress?.country}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-700 space-y-1">
                <p className="text-xs text-gray-500 mb-2">Départ groupé</p>
                <DetailField label="Date départ"    value={new Date(pkg.departureGp.departureDate).toLocaleDateString('fr-FR')} />
                <DetailField label="Arrivée prévue" value={new Date(pkg.departureGp.arrivalDate).toLocaleDateString('fr-FR')} />
                <DetailField label="Deadline"       value={new Date(pkg.departureGp.deadline).toLocaleDateString('fr-FR')} />
                <DetailField label="Prix/kg"        value={`${pkg.departureGp.currency?.symbol} ${pkg.departureGp.price}`} />
              </div>

              {pkg.departureGp.person && (
                <div className="pt-3 border-t border-gray-700">
                  <DetailField label="GP responsable" value={`${pkg.departureGp.person.firstName} ${pkg.departureGp.person.lastName}`} />
                </div>
              )}
            </div>
          </SectionCard>

          {/* Relais de livraison */}
          {pkg.relay && (
            <SectionCard title="Point Relais de Livraison" icon={MapPin} iconColor="text-blue-400">
              <div className="space-y-3">
                <DetailField label="Relais" value={pkg.relay.name} />
                {pkg.relay.person && (
                  <>
                    <DetailField label="Contact" value={`${pkg.relay.person.firstName} ${pkg.relay.person.lastName}`} />
                    <DetailField label="Mobile"  value={pkg.relay.person.mobile} />
                  </>
                )}
                {pkg.relay.address && (
                  <DetailField
                    label="Adresse"
                    value={[pkg.relay.address.locality, `${pkg.relay.address.city}, ${pkg.relay.address.country}`].filter(Boolean).join(' — ')}
                  />
                )}
              </div>
            </SectionCard>
          )}

          {/* Dates */}
          <SectionCard title="Dates" icon={Calendar} iconColor="text-blue-400">
            <DetailField label="Créé le" value={new Date(pkg.createdAt).toLocaleDateString('fr-FR')} />
          </SectionCard>
        </div>
      </div>

      {/* ── Modal changement de statut ── */}
      {showStatusModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowStatusModal(false)}
        >
          <div
            className="bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Modifier le statut</h2>
              <button
                onClick={() => setShowStatusModal(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <PackageIcon className="w-5 h-5 text-[#D16E41]" />
                <p className="text-sm text-gray-400">
                  Statut actuel :{' '}
                  <span className="text-white font-medium">
                    {ALL_STATES.find((s) => s.id === currentState)?.label ?? currentState}
                  </span>
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Nouveau statut</label>
                <select
                  className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D16E41]"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as PackageStates)}
                >
                  <option value="">Sélectionnez un statut</option>
                  {ALL_STATES.filter((s) => s.id === PackageStates.LIVRE || s.id === PackageStates.RETOURNE).map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => selectedStatus && statusMutation.mutate(selectedStatus as PackageStates)}
                disabled={!selectedStatus || statusMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-[#D16E41] hover:bg-[#E07D52] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {statusMutation.isPending
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <CheckCircle className="w-4 h-4" />
                }
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
