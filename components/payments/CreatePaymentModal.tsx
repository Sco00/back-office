'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  X, Loader2, Search, Package, CheckCircle,
  DollarSign, CreditCard, ClipboardCheck,
} from 'lucide-react'
import { toast } from 'sonner'
import { paymentsApi }  from '@/lib/api/payments.api'
import { packagesApi }  from '@/lib/api/packages.api'
import { referenceApi } from '@/lib/api/reference.api'
import { getPackageState, PackageStates, type Package as Pkg } from '@/lib/types/api.types'

const STEPS = ['Colis', 'Paiement', 'Confirmation']

export function CreatePaymentModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const qc = useQueryClient()

  const [step, setStep] = useState(1)

  // Étape 1
  const [search, setSearch]           = useState('')
  const [selectedPkg, setSelectedPkg] = useState<Pkg | null>(null)

  // Étape 2
  const [paymentMethodId, setPaymentMethodId] = useState('')
  const [amount, setAmount]                   = useState('')
  const [remise, setRemise]                   = useState('')
  const [remiseReason, setRemiseReason]       = useState('')
  const [priceRelay, setPriceRelay]           = useState('')
  const [insurancePrice, setInsurancePrice]   = useState('')

  // ── Queries ────────────────────────────────────────────────────────────────

  const { data: unpaidData, isFetching: loadingList } = useQuery({
    queryKey: ['packages-unpaid', search],
    queryFn:  () => packagesApi.list({ search: search || undefined, unpaidOnly: true, limit: 20 }),
    enabled:  isOpen && step === 1,
    select:   (d) => d.props,
  })

  const { data: paymentMethods = [] } = useQuery({
    queryKey: ['ref-payment-methods'],
    queryFn:  referenceApi.paymentMethods,
    enabled:  isOpen && step === 2,
  })

  const unpaidPackages = unpaidData ?? []
  const selectedMethod = paymentMethods.find((m) => m.id === paymentMethodId)
  const currency       = selectedPkg?.departureGp?.currency

  // ── Validation ─────────────────────────────────────────────────────────────

  const canNext = () => {
    if (step === 1) return !!selectedPkg
    if (step === 2) return !!paymentMethodId && Number(amount) > 0
    return true
  }

  // ── Mutation ───────────────────────────────────────────────────────────────

  const mutation = useMutation({
    mutationFn: () => paymentsApi.create({
      packageId:       selectedPkg!.id,
      paymentMethodId,
      currencyId:      currency?.id ?? '',
      amount:          Number(amount),
      remise:          remise         ? Number(remise)         : undefined,
      remiseReason:    remiseReason   || undefined,
      priceRelay:      priceRelay     ? Number(priceRelay)     : undefined,
      insurancePrice:  insurancePrice ? Number(insurancePrice) : undefined,
    }),
    onSuccess: () => {
      toast.success('Paiement enregistré')
      qc.invalidateQueries({ queryKey: ['payments'] })
      qc.invalidateQueries({ queryKey: ['packages'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      handleClose()
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message ?? 'Erreur lors de la création')
    },
  })

  const handleClose = () => {
    setStep(1)
    setSearch(''); setSelectedPkg(null)
    setPaymentMethodId(''); setAmount(''); setRemise('')
    setRemiseReason(''); setPriceRelay(''); setInsurancePrice('')
    onClose()
  }

  if (!isOpen) return null

  const fieldClass = 'w-full px-3 py-2.5 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D16E41] text-sm'
  const labelClass = 'block text-sm font-medium text-gray-300 mb-1.5'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <div
        className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="bg-[#D16E41] p-2 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Nouveau paiement</h2>
              <p className="text-sm text-gray-400">Étape {step} sur 3 — {STEPS[step - 1]}</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-white hover:bg-gray-700 p-2 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 pt-4">
          <div className="flex justify-between mb-2">
            {STEPS.map((t, i) => (
              <span key={t} className={`text-xs font-medium ${step >= i + 1 ? 'text-[#D16E41]' : 'text-gray-500'}`}>{t}</span>
            ))}
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-[#D16E41] transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* ── Step 1 : Sélection du colis ── */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-400">Sélectionnez un colis non payé. Vous pouvez filtrer par référence.</p>

              {/* Barre de recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par référence..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D16E41] text-sm"
                />
                {loadingList && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                )}
              </div>

              {/* Liste des colis */}
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {unpaidPackages.length === 0 && !loadingList ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Aucun colis non payé trouvé</p>
                  </div>
                ) : (
                  unpaidPackages.map((pkg) => (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPkg(pkg)}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedPkg?.id === pkg.id
                          ? 'border-[#D16E41] bg-[#D16E41]/10'
                          : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gray-600 flex items-center justify-center flex-shrink-0">
                          <Package className="w-4 h-4 text-gray-300" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{pkg.reference}</p>
                          <p className="text-xs text-gray-400">
                            {pkg.person?.firstName} {pkg.person?.lastName}
                            {' · '}{pkg.weight} kg
                            {pkg.departureGp?.currency && <> · {pkg.departureGp.currency.code}</>}
                          </p>
                        </div>
                      </div>
                      {selectedPkg?.id === pkg.id && (
                        <CheckCircle className="w-5 h-5 text-[#D16E41] flex-shrink-0" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ── Step 2 : Paiement ── */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-400">
                Renseignez les informations de paiement pour <span className="text-white font-medium">{selectedPkg?.reference}</span>.
              </p>

              <div>
                <label className={labelClass}>
                  <CreditCard className="w-4 h-4 inline mr-1" /> Méthode de paiement *
                </label>
                <select value={paymentMethodId} onChange={(e) => setPaymentMethodId(e.target.value)} className={fieldClass}>
                  <option value="">Sélectionner une méthode</option>
                  {paymentMethods.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>
                  <DollarSign className="w-4 h-4 inline mr-1" /> Montant *
                  {currency && <span className="ml-1 text-gray-400 font-normal">({currency.code})</span>}
                </label>
                <input
                  type="number" step="0.01" min="0" placeholder="0.00"
                  value={amount} onChange={(e) => setAmount(e.target.value)}
                  className={fieldClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Remise</label>
                  <input
                    type="number" step="0.01" min="0" placeholder="0.00"
                    value={remise} onChange={(e) => setRemise(e.target.value)}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Raison remise</label>
                  <input
                    type="text" placeholder="..."
                    value={remiseReason} onChange={(e) => setRemiseReason(e.target.value)}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Prix relais</label>
                  <input
                    type="number" step="0.01" min="0" placeholder="0.00"
                    value={priceRelay} onChange={(e) => setPriceRelay(e.target.value)}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Prix assurance</label>
                  <input
                    type="number" step="0.01" min="0" placeholder="0.00"
                    value={insurancePrice} onChange={(e) => setInsurancePrice(e.target.value)}
                    className={fieldClass}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3 : Confirmation ── */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-400">Vérifiez les informations avant de confirmer.</p>

              <div className="bg-gray-700 rounded-xl p-5 space-y-3">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-[#D16E41]" />
                  Récapitulatif
                </h3>

                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Colis</span>
                    <span className="text-white font-medium">{selectedPkg?.reference}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Client</span>
                    <span className="text-white">
                      {selectedPkg?.person?.firstName} {selectedPkg?.person?.lastName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Poids</span>
                    <span className="text-white">{selectedPkg?.weight} kg</span>
                  </div>

                  <div className="border-t border-gray-600 pt-2 mt-2 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Méthode</span>
                      <span className="text-white">{selectedMethod?.name}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Montant</span>
                      <span className="text-white font-semibold">{Number(amount).toLocaleString('fr-FR')} {currency?.code}</span>
                    </div>
                    {remise && Number(remise) > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Remise</span>
                        <span className="text-amber-400">−{Number(remise).toLocaleString('fr-FR')} {currency?.code}</span>
                      </div>
                    )}
                    {remiseReason && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Raison remise</span>
                        <span className="text-white">{remiseReason}</span>
                      </div>
                    )}
                    {priceRelay && Number(priceRelay) > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Prix relais</span>
                        <span className="text-white">{Number(priceRelay).toLocaleString('fr-FR')} {currency?.code}</span>
                      </div>
                    )}
                    {insurancePrice && Number(insurancePrice) > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Assurance</span>
                        <span className="text-white">{Number(insurancePrice).toLocaleString('fr-FR')} {currency?.code}</span>
                      </div>
                    )}
                    {remise && Number(remise) > 0 && (
                      <div className="flex items-center justify-between text-sm font-semibold border-t border-gray-600 pt-2">
                        <span className="text-gray-300">Net à payer</span>
                        <span className="text-green-400">
                          {(Number(amount) - Number(remise)).toLocaleString('fr-FR')} {currency?.code}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Retour
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canNext()}
              className="flex-1 py-3 bg-[#D16E41] hover:bg-[#E07D52] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          ) : (
            <button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {mutation.isPending && <Loader2 className="w-5 h-5 animate-spin" />}
              Confirmer le paiement
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
