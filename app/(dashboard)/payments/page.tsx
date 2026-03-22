'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search, Filter, Plus, RefreshCw,
  ExternalLink, DollarSign, Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { paymentsApi } from '@/lib/api/payments.api'
import type { PaymentFilters } from '@/lib/types/api.types'
import { CreatePaymentModal } from '@/components/payments/CreatePaymentModal'

export default function PaymentsPage() {
  const qc = useQueryClient()
  const [filters, setFilters]       = useState<PaymentFilters>({ page: 1, limit: 20 })
  const [showFilters, setShowFilters] = useState(false)
  const [showCreate, setShowCreate]   = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['payments', filters],
    queryFn:  () => paymentsApi.list(filters),
  })

  const acceptMutation = useMutation({
    mutationFn: (id: string) => paymentsApi.accept(id),
    onSuccess:  () => { toast.success('Paiement accepté'); qc.invalidateQueries({ queryKey: ['payments'] }) },
    onError:    () => toast.error('Erreur'),
  })

  const refundMutation = useMutation({
    mutationFn: (id: string) => paymentsApi.refund(id),
    onSuccess:  () => { toast.success('Paiement remboursé'); qc.invalidateQueries({ queryKey: ['payments'] }) },
    onError:    () => toast.error('Erreur'),
  })

  const openInvoice = async (id: string) => {
    try {
      const { invoiceUrl } = await paymentsApi.getInvoice(id)
      window.open(invoiceUrl, '_blank')
    } catch {
      toast.error('Impossible de récupérer la facture')
    }
  }

  const payments   = data?.props  ?? []
  const total      = data?.total  ?? 0
  const totalPages = Math.ceil(total / (filters.limit ?? 20))

  const setFilter = (key: keyof PaymentFilters, value: any) =>
    setFilters((p) => ({ ...p, [key]: value === '' ? undefined : value, page: 1 }))

  const stats = {
    total:     total,
    acceptes:  payments.filter((p) => p.accepted).length,
    rembourses: payments.filter((p) => p.refunded).length,
    enAttente: payments.filter((p) => !p.accepted && !p.refunded).length,
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Paiements</h1>
            <p className="text-gray-400">Suivi des paiements et factures</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#D16E41] hover:bg-[#E07D52] text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nouveau paiement
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total',      value: stats.total,      color: 'bg-blue-500/20' },
            { label: 'Acceptés',   value: stats.acceptes,   color: 'bg-green-500/20' },
            { label: 'Remboursés', value: stats.rembourses, color: 'bg-amber-500/20' },
            { label: 'En attente', value: stats.enAttente,  color: 'bg-gray-500/20' },
          ].map((s) => (
            <div key={s.label} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className={`${s.color} p-2 rounded-lg`}>
                  <DollarSign className="w-5 h-5 text-white" />
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
              placeholder="ID du colis..."
              onChange={(e) => setFilter('packageId', e.target.value)}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Statut</label>
                <select
                  onChange={(e) => {
                    const v = e.target.value
                    if (v === '') { setFilter('accepted', undefined); setFilter('refunded', undefined) }
                    else if (v === 'accepted') { setFilter('accepted', true); setFilter('refunded', undefined) }
                    else if (v === 'refunded') { setFilter('refunded', true); setFilter('accepted', undefined) }
                    else { setFilter('accepted', false); setFilter('refunded', false) }
                  }}
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D16E41]"
                >
                  <option value="">Tous</option>
                  <option value="accepted">Acceptés</option>
                  <option value="refunded">Remboursés</option>
                  <option value="pending">En attente</option>
                </select>
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
                {['Client', 'Montant', 'Méthode', 'Remise', 'Statut', 'Date', 'Actions'].map((h) => (
                  <th key={h} className={`py-4 px-4 text-xs font-medium text-gray-400 uppercase ${h === 'Actions' ? 'text-right' : 'text-left'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="py-12 text-center"><Loader2 className="w-6 h-6 animate-spin text-[#D16E41] mx-auto" /></td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-gray-500">Aucun paiement trouvé</td></tr>
              ) : (
                payments.map((pay) => (
                  <tr key={pay.id} className="border-b border-gray-700 hover:bg-gray-700/40 transition-colors">
                    <td className="py-4 px-4">
                      <p className="text-sm font-medium text-white">
                        {pay.package?.person?.firstName} {pay.package?.person?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">Colis #{pay.package?.id?.slice(0, 8)}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm font-semibold text-white">
                        {pay.currency?.symbol ?? ''} {pay.amount.toFixed(2)}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-300">{pay.paymentMethod?.name ?? '—'}</span>
                    </td>
                    <td className="py-4 px-4">
                      {pay.remise ? (
                        <span className="text-sm text-amber-400">-{pay.remise}</span>
                      ) : (
                        <span className="text-gray-500 text-sm">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {pay.refunded ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">Remboursé</span>
                      ) : pay.accepted ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">Accepté</span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30">En attente</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-300">
                        {new Date(pay.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        {!pay.refunded && (
                          <button
                            onClick={() => {
                              if (confirm('Rembourser ce paiement ?')) refundMutation.mutate(pay.id)
                            }}
                            className="p-2 text-gray-400 hover:text-amber-400 hover:bg-gray-700 rounded-lg transition-colors"
                            title="Rembourser"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => openInvoice(pay.id)}
                          className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
                          title="Voir la facture"
                        >
                          <ExternalLink className="w-4 h-4" />
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
          <p className="text-sm text-gray-400">{total} paiements au total</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setFilters((p) => ({ ...p, page: Math.max(1, (p.page ?? 1) - 1) }))} disabled={(filters.page ?? 1) <= 1} className="px-3 py-1.5 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-lg text-sm disabled:opacity-40">Précédent</button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setFilters((prev) => ({ ...prev, page: p }))} className={`px-3 py-1.5 rounded-lg text-sm ${filters.page === p ? 'bg-[#D16E41] text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>{p}</button>
            ))}
            <button onClick={() => setFilters((p) => ({ ...p, page: Math.min(totalPages, (p.page ?? 1) + 1) }))} disabled={(filters.page ?? 1) >= totalPages} className="px-3 py-1.5 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-lg text-sm disabled:opacity-40">Suivant</button>
          </div>
        </div>
      </div>

      <CreatePaymentModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  )
}
