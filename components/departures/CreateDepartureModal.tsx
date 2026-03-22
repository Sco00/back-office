'use client'

import { useState, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  X, Plane, MapPin, Calendar, DollarSign,
  User, CheckCircle, Loader2, AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { departuresApi } from '@/lib/api/departures.api'
import { personsApi }    from '@/lib/api/persons.api'
import { referenceApi }  from '@/lib/api/reference.api'

interface Props { isOpen: boolean; onClose: () => void }

const STEPS = ['Route', 'Dates', 'Tarif', 'Confirmation']

function addDays(date: Date, n: number) {
  const d = new Date(date); d.setDate(d.getDate() + n); return d
}
function toInput(d: Date) {
  return d.toISOString().split('T')[0]
}
function fromInput(s: string) {
  return new Date(s + 'T00:00:00')
}

export function CreateDepartureModal({ isOpen, onClose }: Props) {
  const qc = useQueryClient()

  const [step, setStep] = useState(1)

  // Étape 1 — Route
  const [depAddrId,  setDepAddrId]  = useState('')
  const [destAddrId, setDestAddrId] = useState('')

  // Étape 2 — Dates
  const [departureDate, setDepartureDate] = useState('')
  const [deadline,      setDeadline]      = useState('')
  const [arrivalDate,   setArrivalDate]   = useState('')

  // Étape 3 — Tarif
  const [price,          setPrice]         = useState('')
  const [priceGp,        setPriceGp]       = useState('')
  const [currencyId,     setCurrencyId]    = useState('')
  const [insurancePrice, setInsurance]     = useState('')

  // Étape 4 — Partenaire
  const [partnerId,    setPartnerId]    = useState('')
  const [partnerSearch, setPartnerSearch] = useState('')

  // ── Queries ──────────────────────────────────────────────────────────────
  const { data: allAddresses = [] } = useQuery({
    queryKey: ['ref-addresses'],
    queryFn:  referenceApi.addresses,
    enabled:  isOpen,
  })

  const { data: currencies = [] } = useQuery({
    queryKey: ['ref-currencies'],
    queryFn:  referenceApi.currencies,
    enabled:  isOpen && step === 3,
  })

  const { data: personsData } = useQuery({
    queryKey: ['persons-partner', partnerSearch],
    queryFn:  () => personsApi.list({ search: partnerSearch || undefined, limit: 100 }),
    enabled:  isOpen && step === 4,
  })

  // ── Données dérivées ──────────────────────────────────────────────────────
  const depAddress  = allAddresses.find((a) => a.id === depAddrId)
  const destAddress = allAddresses.find((a) => a.id === destAddrId)

  const partners = useMemo(
    () => (personsData?.props ?? []).filter((p) => p.personType?.name === 'partner'),
    [personsData]
  )
  const selectedPartner = partners.find((p) => p.id === partnerId)

  const currency = currencies.find((c) => c.id === currencyId)

  // ── Validation dates ──────────────────────────────────────────────────────
  const today = new Date(); today.setHours(0, 0, 0, 0)

  const dateErrors = useMemo(() => {
    if (!departureDate) return []
    const errs: string[] = []
    const dep = fromInput(departureDate)

    if (dep < addDays(today, 3))
      errs.push('La date de départ doit être au minimum 3 jours après aujourd\'hui')

    if (deadline) {
      const dl = fromInput(deadline)
      if (dl < addDays(today, 1))
        errs.push('La deadline doit être au minimum 1 jour après aujourd\'hui')
      if (dep < addDays(dl, 2))
        errs.push('La date de départ doit être au minimum 2 jours après la deadline')
    }

    if (arrivalDate) {
      const arr = fromInput(arrivalDate)
      if (arr <= dep)
        errs.push("La date d'arrivée doit être après la date de départ")
    }

    return errs
  }, [departureDate, deadline, arrivalDate])

  // Valeurs finales calculées
  const depDateObj    = departureDate ? fromInput(departureDate) : null
  const deadlineFinal = deadline     ? deadline     : (depDateObj ? toInput(addDays(depDateObj, -2)) : '')
  const arrivalFinal  = arrivalDate  ? arrivalDate  : (depDateObj ? toInput(addDays(depDateObj, 2))  : '')

  // ── Min dates pour les inputs ─────────────────────────────────────────────
  const minDepartureDate = toInput(addDays(today, 3))
  const minDeadline      = toInput(addDays(today, 1))
  const minArrival       = departureDate ? toInput(addDays(fromInput(departureDate), 1)) : ''

  // ── canNext ───────────────────────────────────────────────────────────────
  const canNext = () => {
    if (step === 1) return !!depAddrId && !!destAddrId
    if (step === 2) return !!departureDate && dateErrors.length === 0
    if (step === 3) return Number(price) > 0 && Number(priceGp) >= 0 && priceGp !== '' && !!currencyId
    return true
  }

  // ── Mutation ──────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: () => departuresApi.create({
      departureDate:        departureDate,
      deadline:             deadlineFinal,
      arrivalDate:          arrivalFinal,
      price:                Number(price),
      priceGp:              Number(priceGp),
      currencyId,
      departureAddressId:   depAddrId,
      destinationAddressId: destAddrId,
      personId:             partnerId || undefined,
      insurancePrice:       insurancePrice ? Number(insurancePrice) : undefined,
    }),
    onSuccess: () => {
      toast.success('Départ créé avec succès')
      qc.invalidateQueries({ queryKey: ['departures'] })
      handleClose()
    },
    onError: (err: any) => {
      const fields = err?.response?.data?.error?.fields
      if (fields?.length) {
        toast.error(`Champ invalide — ${fields[0].field}: ${fields[0].message}`)
      } else {
        toast.error(err?.response?.data?.error?.message ?? 'Erreur')
      }
    },
  })

  const handleClose = () => {
    setStep(1)
    setDepAddrId(''); setDestAddrId('')
    setDepartureDate(''); setDeadline(''); setArrivalDate('')
    setPrice(''); setPriceGp(''); setCurrencyId(''); setInsurance('')
    setPartnerId(''); setPartnerSearch('')
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
            <div className="bg-[#D16E41] p-2 rounded-lg"><Plane className="w-6 h-6 text-white" /></div>
            <div>
              <h2 className="text-xl font-bold text-white">Nouveau départ GP</h2>
              <p className="text-sm text-gray-400">Étape {step} sur 4 — {STEPS[step - 1]}</p>
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
            <div className="h-full bg-[#D16E41] transition-all duration-300" style={{ width: `${(step / 4) * 100}%` }} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* ── Step 1 : Route ── */}
          {step === 1 && (
            <div className="space-y-6">
              <p className="text-sm text-gray-400">Sélectionnez la ville de départ et la ville de destination.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    <MapPin className="w-4 h-4 inline mr-1 text-green-400" /> Ville de départ *
                  </label>
                  <select
                    value={depAddrId}
                    onChange={(e) => setDepAddrId(e.target.value)}
                    className={fieldClass}
                  >
                    <option value="">Sélectionner</option>
                    {allAddresses.filter((a) => a.id !== destAddrId).map((a) => (
                      <option key={a.id} value={a.id}>{a.city}, {a.country}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>
                    <MapPin className="w-4 h-4 inline mr-1 text-red-400" /> Ville de destination *
                  </label>
                  <select
                    value={destAddrId}
                    onChange={(e) => setDestAddrId(e.target.value)}
                    className={fieldClass}
                  >
                    <option value="">Sélectionner</option>
                    {allAddresses.filter((a) => a.id !== depAddrId).map((a) => (
                      <option key={a.id} value={a.id}>{a.city}, {a.country}</option>
                    ))}
                  </select>
                </div>
              </div>

              {depAddress && destAddress && (
                <div className="flex items-center gap-3 p-4 bg-gray-700 rounded-lg">
                  <MapPin className="w-4 h-4 text-green-400 shrink-0" />
                  <span className="text-white font-medium">{depAddress.city}, {depAddress.country}</span>
                  <span className="text-gray-400">→</span>
                  <MapPin className="w-4 h-4 text-red-400 shrink-0" />
                  <span className="text-white font-medium">{destAddress.city}, {destAddress.country}</span>
                </div>
              )}
            </div>
          )}

          {/* ── Step 2 : Dates ── */}
          {step === 2 && (
            <div className="space-y-5">
              <p className="text-sm text-gray-400">
                Seule la date de départ est obligatoire. La deadline et la date d'arrivée seront calculées automatiquement si non renseignées.
              </p>

              <div>
                <label className={labelClass}>
                  <Calendar className="w-4 h-4 inline mr-1" /> Date de départ *
                </label>
                <input
                  type="date"
                  value={departureDate}
                  min={minDepartureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className={fieldClass}
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 3 jours à partir d'aujourd'hui</p>
              </div>

              <div>
                <label className={labelClass}>
                  <Calendar className="w-4 h-4 inline mr-1" /> Deadline <span className="text-gray-500 font-normal">(optionnel)</span>
                </label>
                <input
                  type="date"
                  value={deadline}
                  min={minDeadline}
                  max={departureDate ? toInput(addDays(fromInput(departureDate), -2)) : ''}
                  onChange={(e) => setDeadline(e.target.value)}
                  className={fieldClass}
                />
                {departureDate && !deadline && (
                  <p className="text-xs text-gray-500 mt-1">
                    Calculée automatiquement : <span className="text-[#D16E41]">{deadlineFinal}</span>
                  </p>
                )}
              </div>

              <div>
                <label className={labelClass}>
                  <Calendar className="w-4 h-4 inline mr-1" /> Date d'arrivée <span className="text-gray-500 font-normal">(optionnel)</span>
                </label>
                <input
                  type="date"
                  value={arrivalDate}
                  min={minArrival}
                  onChange={(e) => setArrivalDate(e.target.value)}
                  className={fieldClass}
                />
                {departureDate && !arrivalDate && (
                  <p className="text-xs text-gray-500 mt-1">
                    Calculée automatiquement : <span className="text-[#D16E41]">{arrivalFinal}</span>
                  </p>
                )}
              </div>

              {dateErrors.length > 0 && (
                <div className="space-y-1">
                  {dateErrors.map((e, i) => (
                    <div key={i} className="flex items-start gap-2 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{e}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Step 3 : Tarif ── */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-400">Définissez les tarifs et la devise pour ce départ.</p>

              <div>
                <label className={labelClass}>Devise *</label>
                <select value={currencyId} onChange={(e) => setCurrencyId(e.target.value)} className={fieldClass}>
                  <option value="">Sélectionner une devise</option>
                  {currencies.map((c) => (
                    <option key={c.id} value={c.id}>{c.code} — {c.name} ({c.symbol})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    <DollarSign className="w-4 h-4 inline mr-1" /> Prix/kg client *
                  </label>
                  <input
                    type="number" step="0.01" min="0" placeholder="8.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    <DollarSign className="w-4 h-4 inline mr-1" /> Prix GP *
                  </label>
                  <input
                    type="number" step="0.01" min="0" placeholder="5.00"
                    value={priceGp}
                    onChange={(e) => setPriceGp(e.target.value)}
                    className={fieldClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  Prix assurance <span className="text-gray-500 font-normal">(optionnel)</span>
                </label>
                <input
                  type="number" step="0.01" min="0" placeholder="0.00"
                  value={insurancePrice}
                  onChange={(e) => setInsurance(e.target.value)}
                  className={fieldClass}
                />
              </div>

              {price && priceGp && currency && (
                <div className="p-4 bg-gray-700 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Prix client</span>
                    <span className="text-white font-medium">{price} {currency.symbol}/kg</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Prix GP</span>
                    <span className="text-white font-medium">{priceGp} {currency.symbol}</span>
                  </div>
                  {insurancePrice && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Assurance</span>
                      <span className="text-white font-medium">{insurancePrice} {currency.symbol}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Step 4 : Partenaire + Confirmation ── */}
          {step === 4 && (
            <div className="space-y-6">
              {/* Partenaire */}
              <div>
                <label className={labelClass}>
                  <User className="w-4 h-4 inline mr-1" /> Partenaire GP <span className="text-gray-500 font-normal">(optionnel)</span>
                </label>
                {Number(priceGp) === 0 ? (
                  <div className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-400 italic">
                    Pas de partenaire — prix GP à 0
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder="Rechercher un partenaire..."
                      value={partnerSearch}
                      onChange={(e) => { setPartnerSearch(e.target.value); setPartnerId('') }}
                      className={`${fieldClass} mb-2`}
                    />
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      <div
                        onClick={() => { setPartnerId(''); setPartnerSearch('') }}
                        className={`p-3 rounded-lg border cursor-pointer transition-all text-sm ${!partnerId ? 'border-[#D16E41] bg-[#D16E41]/10' : 'border-gray-600 hover:border-gray-500 bg-gray-700'}`}
                      >
                        <span className="text-gray-400 italic">Aucun partenaire</span>
                        {!partnerId && <CheckCircle className="w-4 h-4 text-[#D16E41] inline ml-2" />}
                      </div>
                      {partners.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => { setPartnerId(p.id); setPartnerSearch('') }}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${partnerId === p.id ? 'border-[#D16E41] bg-[#D16E41]/10' : 'border-gray-600 hover:border-gray-500 bg-gray-700'}`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white text-sm font-medium">{p.firstName} {p.lastName}</p>
                              <p className="text-gray-400 text-xs">{p.mobile}</p>
                            </div>
                            {partnerId === p.id && <CheckCircle className="w-4 h-4 text-[#D16E41]" />}
                          </div>
                        </div>
                      ))}
                      {partners.length === 0 && personsData && (
                        <p className="text-sm text-gray-500 text-center py-2">Aucun partenaire trouvé</p>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Confirmation */}
              <div className="bg-gray-700 rounded-lg p-5 space-y-4">
                <h3 className="text-white font-semibold">Résumé du départ</h3>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Route</span>
                    <span className="text-white font-medium">
                      {depAddress?.city} → {destAddress?.city}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Date de départ</span>
                    <span className="text-white">{new Date(departureDate + 'T00:00:00').toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Deadline</span>
                    <span className="text-white">{deadlineFinal ? new Date(deadlineFinal + 'T00:00:00').toLocaleDateString('fr-FR') : '—'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Date d'arrivée</span>
                    <span className="text-white">{arrivalFinal ? new Date(arrivalFinal + 'T00:00:00').toLocaleDateString('fr-FR') : '—'}</span>
                  </div>
                  <div className="border-t border-gray-600 pt-2 mt-2 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Prix/kg client</span>
                      <span className="text-white font-medium">{price} {currency?.symbol}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Prix GP</span>
                      <span className="text-white font-medium">{priceGp} {currency?.symbol}</span>
                    </div>
                    {insurancePrice && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Assurance</span>
                        <span className="text-white">{insurancePrice} {currency?.symbol}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Partenaire</span>
                      <span className="text-white">
                        {selectedPartner ? `${selectedPartner.firstName} ${selectedPartner.lastName}` : 'Non assigné'}
                      </span>
                    </div>
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
          {step < 4 ? (
            <button
              onClick={() => { if (step === 3 && Number(priceGp) === 0) { setPartnerId(''); setPartnerSearch('') } setStep(step + 1) }}
              disabled={!canNext()}
              className="flex-1 py-3 bg-[#D16E41] hover:bg-[#E07D52] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          ) : (
            <button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {createMutation.isPending && <Loader2 className="w-5 h-5 animate-spin" />}
              Créer le départ
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
