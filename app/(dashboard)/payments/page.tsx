'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, RefreshCw, ExternalLink, DollarSign, Loader2, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { paymentsApi } from '@/lib/api/payments.api'
import { referenceApi } from '@/lib/api/reference.api'
import type { Payment, PaymentFilters } from '@/lib/types/api.types'
import { BOOLEAN_OPTIONS } from '@/constants/filters.constants'
import { CreatePaymentModal } from '@/components/payments/CreatePaymentModal'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { Pagination } from '@/components/ui/Pagination'
import { StatsGrid, type StatCard } from '@/components/ui/StatsGrid'
import { FiltersPanel, type FilterField } from '@/components/ui/FiltersPanel'

export default function PaymentsPage() {
  const qc = useQueryClient()
  const [filters, setFilters]      = useState<PaymentFilters>({ page: 1, limit: 6 })
  const [showCreate, setShowCreate] = useState(false)

  const { data: paymentMethods = [] } = useQuery({
    queryKey: ['ref-payment-methods'],
    queryFn:  referenceApi.paymentMethods,
  })

  const { data, isLoading } = useQuery({
    queryKey: ['payments', filters],
    queryFn:  () => paymentsApi.list(filters),
  })

  const refundMutation = useMutation({
    mutationFn: (id: string) => paymentsApi.refund(id),
    onSuccess:  () => { toast.success('Paiement remboursé'); qc.invalidateQueries({ queryKey: ['payments'] }); qc.invalidateQueries({ queryKey: ['dashboard'] }) },
    onError:    () => toast.error('Erreur'),
  })

  const invoiceMutation = useMutation({
    mutationFn: (id: string) => paymentsApi.getInvoice(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['payments'] }),
    onError:    () => toast.error('Erreur lors de la génération de la facture'),
  })

  const { data: acceptedStats } = useQuery({ queryKey: ['payments-count', 'accepted'], queryFn: () => paymentsApi.list({ accepted: true,  limit: 1, page: 1 }) })
  const { data: refundedStats } = useQuery({ queryKey: ['payments-count', 'refunded'], queryFn: () => paymentsApi.list({ refunded: true,  limit: 1, page: 1 }) })
  const { data: pendingStats }  = useQuery({ queryKey: ['payments-count', 'pending'],  queryFn: () => paymentsApi.list({ accepted: false, limit: 1, page: 1 }) })

  const payments   = data?.props  ?? []
  const total      = data?.total  ?? 0
  const totalPages = Math.ceil(total / (filters.limit ?? 6))

  const setFilter = (key: keyof PaymentFilters, value: any) =>
    setFilters((p) => ({ ...p, [key]: value === '' ? undefined : value, page: 1 }))

  const stats: StatCard[] = [
    { label: 'Total',      value: total,                         color: 'bg-blue-500/20',  icon: DollarSign },
    { label: 'Acceptés',   value: acceptedStats?.total ?? '…',   color: 'bg-green-500/20', icon: DollarSign },
    { label: 'Remboursés', value: refundedStats?.total ?? '…',   color: 'bg-amber-500/20', icon: DollarSign },
    { label: 'En attente', value: pendingStats?.total  ?? '…',   color: 'bg-gray-500/20',  icon: DollarSign },
  ]

  const filterFields: FilterField[] = [
    {
      type: 'select', label: 'Méthode',
      options: [{ value: '', label: 'Toutes' }, ...paymentMethods.map((m) => ({ value: m.id, label: m.name }))],
      onChange: (v) => setFilter('paymentMethodId', v || undefined),
    },
    {
      type: 'select', label: 'Accepté',
      options: BOOLEAN_OPTIONS,
      onChange: (v) => setFilter('accepted', v === '' ? undefined : v === 'true'),
    },
    {
      type: 'select', label: 'Remboursé',
      options: BOOLEAN_OPTIONS,
      onChange: (v) => setFilter('refunded', v === '' ? undefined : v === 'true'),
    },
    { type: 'date', label: 'À partir du', onChange: (v) => setFilter('createdAtFrom', v || undefined) },
  ]

  const columns: Column<Payment>[] = [
    {
      label: 'Client',
      render: (pay) => (
        <>
          <p className="text-sm font-medium text-white">{pay.package?.person?.firstName} {pay.package?.person?.lastName}</p>
          <p className="text-xs text-gray-500">Colis #{pay.package?.id?.slice(0, 8)}</p>
        </>
      ),
    },
    { label: 'Montant', render: (pay) => <p className="text-sm font-semibold text-white">{pay.currency?.symbol ?? ''} {pay.amount.toFixed(2)}</p> },
    { label: 'Méthode', render: (pay) => <span className="text-sm text-gray-300">{pay.paymentMethod?.name ?? '—'}</span> },
    {
      label: 'Remise',
      render: (pay) => pay.remise
        ? <span className="text-sm text-amber-400">-{pay.remise}</span>
        : <span className="text-gray-500 text-sm">—</span>,
    },
    {
      label: 'Statut',
      render: (pay) => pay.refunded ? (
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">Remboursé</span>
      ) : pay.accepted ? (
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">Accepté</span>
      ) : (
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30">En attente</span>
      ),
    },
    { label: 'Date', render: (pay) => <span className="text-sm text-gray-300">{new Date(pay.createdAt).toLocaleDateString('fr-FR')}</span> },
    {
      label: 'Actions', align: 'right',
      render: (pay) => (
        <div className="flex items-center justify-end gap-2">
          {!pay.refunded && (
            <button onClick={() => { if (confirm('Rembourser ce paiement ?')) refundMutation.mutate(pay.id) }}
              className="p-2 text-gray-400 hover:text-amber-400 hover:bg-gray-700 rounded-lg transition-colors" title="Rembourser">
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          {pay.linkInvoice ? (
            <a href={pay.linkInvoice} target="_blank" rel="noreferrer"
              className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors" title="Voir la facture">
              <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <button onClick={() => invoiceMutation.mutate(pay.id)}
              disabled={invoiceMutation.isPending && invoiceMutation.variables === pay.id}
              className="p-2 text-gray-400 hover:text-green-400 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50" title="Générer la facture">
              {invoiceMutation.isPending && invoiceMutation.variables === pay.id
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <FileText className="w-4 h-4" />}
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Paiements</h1>
            <p className="text-gray-400">Suivi des paiements et factures</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-[#D16E41] hover:bg-[#E07D52] text-white rounded-lg transition-colors">
            <Plus className="w-5 h-5" /> Nouveau paiement
          </button>
        </div>
        <StatsGrid stats={stats} />
        <FiltersPanel searchPlaceholder="ID du colis..." onSearch={(v) => setFilter('packageId', v)} filters={filterFields} />
      </div>

      <DataTable columns={columns} rows={payments} isLoading={isLoading} emptyMessage="Aucun paiement trouvé"
        footer={<Pagination page={filters.page ?? 1} totalPages={totalPages} total={total} label="paiements au total" onChange={(p) => setFilters((prev) => ({ ...prev, page: p }))} />}
      />

      <CreatePaymentModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  )
}
