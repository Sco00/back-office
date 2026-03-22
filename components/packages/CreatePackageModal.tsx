'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  X, Package, User, MapPin, Search, Plane,
  Plus, Trash2, CheckCircle, UserPlus, Calendar, Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { personsApi }    from '@/lib/api/persons.api'
import { departuresApi } from '@/lib/api/departures.api'
import { naturesApi }    from '@/lib/api/natures.api'
import { packagesApi }   from '@/lib/api/packages.api'
import { referenceApi }  from '@/lib/api/reference.api'
import type { Person, Departure, CreatePackagePaymentDTO } from '@/lib/types/api.types'

interface AddedNature { natureId: string; name: string; unitPrice: number; quantity: number }
interface Props { isOpen: boolean; onClose: () => void }

const STEPS = ['Client', 'Trajet', 'Natures', 'Confirmation']

export function CreatePackageModal({ isOpen, onClose }: Props) {
  const qc = useQueryClient()

  const [step, setStep] = useState(1)

  // Étape 1
  const [clientSearch, setClientSearch]     = useState('')
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [showCreate, setShowCreate]         = useState(false)
  const [newClient, setNewClient]           = useState({ firstName: '', lastName: '', mobile: '', personTypeId: '' })

  // Étape 2
  const [depAddrId, setDepAddrId]   = useState('')
  const [destAddrId, setDestAddrId] = useState('')
  const [selectedDep, setSelectedDep] = useState<Departure | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  // Étape 3
  const [addedNatures, setAddedNatures] = useState<AddedNature[]>([])
  const [curNatureId, setCurNatureId]   = useState('')
  const [curQty, setCurQty]             = useState('1')

  // Étape 4 — paiement optionnel
  const [withPayment, setWithPayment]         = useState(false)
  const [payCurrencyId, setPayCurrencyId]     = useState('')
  const [payMethodId, setPayMethodId]         = useState('')
  const [payRemise, setPayRemise]             = useState('')
  const [payRemiseReason, setPayRemiseReason] = useState('')
  const [payInsurance, setPayInsurance]       = useState('')


  // Queries
  const { data: personsData } = useQuery({
    queryKey: ['persons-modal', clientSearch],
    queryFn:  () => personsApi.list({ search: clientSearch || undefined, limit: 50 }),
    enabled:  isOpen && step === 1,
  })
  const { data: personTypes = [] } = useQuery({
    queryKey: ['person-types'],
    queryFn:  personsApi.listTypes,
    enabled:  isOpen && step === 1 && showCreate,
  })
  const { data: allAddresses = [] } = useQuery({
    queryKey: ['ref-addresses'],
    queryFn:  referenceApi.addresses,
    enabled:  isOpen && step === 2,
  })
  const { data: allDepsData } = useQuery({
    queryKey: ['departures-modal'],
    queryFn:  () => departuresApi.list({ limit: 500 }),
    enabled:  isOpen && step === 2,
  })
  const { data: natures = [] } = useQuery({
    queryKey: ['natures'],
    queryFn:  naturesApi.list,
    enabled:  isOpen && step === 3,
  })
  const { data: paymentMethods = [] } = useQuery({
    queryKey: ['payment-methods'],
    queryFn:  referenceApi.paymentMethods,
    enabled:  isOpen && step === 4,
  })
  const { data: currencies = [] } = useQuery({
    queryKey: ['currencies'],
    queryFn:  referenceApi.currencies,
    enabled:  isOpen && step === 4,
  })

  // Données dérivées
  const persons = (personsData?.props ?? []).filter(
    (p) => p.personType?.name !== 'simple' && p.personType?.name !== 'relais'
  )
  const openDeps    = (allDepsData?.props ?? []).filter((d) => !d.isClosed)
  const filteredDeps = openDeps.filter((d) =>
    (!depAddrId  || d.departureAddress.id   === depAddrId) &&
    (!destAddrId || d.destinationAddress.id === destAddrId)
  )

  const weight = addedNatures.reduce((s, n) => s + n.quantity, 0)
  const total  = addedNatures.reduce((s, n) => s + n.unitPrice * n.quantity, 0)

  // Mutations
  const createPersonMutation = useMutation({
    mutationFn: personsApi.create,
    onSuccess: (p) => {
      setSelectedPerson(p); setShowCreate(false)
      setNewClient({ firstName: '', lastName: '', mobile: '', personTypeId: '' })
      toast.success('Client créé')
    },
    onError: () => toast.error('Erreur lors de la création du client'),
  })

  const createPackageMutation = useMutation({
    mutationFn: packagesApi.create,
    onSuccess: () => {
      toast.success('Colis créé avec succès')
      qc.invalidateQueries({ queryKey: ['packages'] })
      handleClose()
    },
    onError: (err: any) => toast.error(err?.response?.data?.error?.message ?? 'Erreur'),
  })

  const handleClose = () => {
    setStep(1); setClientSearch(''); setSelectedPerson(null); setShowCreate(false)
    setNewClient({ firstName: '', lastName: '', mobile: '', personTypeId: '' })
    setDepAddrId(''); setDestAddrId(''); setSelectedDep(null); setHasSearched(false)
    setAddedNatures([]); setCurNatureId(''); setCurQty('1')
    setWithPayment(false); setPayCurrencyId(''); setPayMethodId('')
    setPayRemise(''); setPayRemiseReason(''); setPayInsurance('')
    onClose()
  }

  const handleAddNature = () => {
    const n = natures.find((n) => n.id === curNatureId)
    if (!n || Number(curQty) <= 0) return
    setAddedNatures((p) => [...p, { natureId: n.id, name: n.name, unitPrice: n.unitPrice, quantity: Number(curQty) }])
    setCurNatureId(''); setCurQty('1')
  }

  const canNext = () => {
    if (step === 1) return !!selectedPerson
    if (step === 2) return !!selectedDep
    if (step === 3) return addedNatures.length > 0 && weight > 0
    return false
  }

  if (!isOpen) return null

  const sym = selectedDep?.currency.symbol ?? '€'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="bg-[#D16E41] p-2 rounded-lg"><Package className="w-6 h-6 text-white" /></div>
            <div>
              <h2 className="text-xl font-bold text-white">Créer un nouveau colis</h2>
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

          {/* Step 1 : Client */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                  <User className="w-4 h-4" /> Rechercher un client
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" value={clientSearch} onChange={(e) => setClientSearch(e.target.value)}
                    placeholder="Nom, prénom, téléphone..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D16E41]" />
                </div>
              </div>

              {!showCreate && (
                <>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {persons.length === 0 ? (
                      <div className="text-center py-8">
                        <User className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400">Aucun client trouvé</p>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-gray-400">{persons.length} client(s) trouvé(s)</p>
                        {persons.map((p) => (
                          <div key={p.id} onClick={() => setSelectedPerson(p)}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedPerson?.id === p.id ? 'border-[#D16E41] bg-[#D16E41]/10' : 'border-gray-600 hover:border-gray-500 bg-gray-700'}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-[#D16E41] flex items-center justify-center flex-shrink-0">
                                  <span className="text-sm font-bold text-white">{p.firstName.charAt(0)}{p.lastName.charAt(0)}</span>
                                </div>
                                <div>
                                  <p className="text-white font-medium">{p.firstName} {p.lastName}</p>
                                  <p className="text-sm text-gray-400">{p.mobile}</p>
                                </div>
                              </div>
                              {selectedPerson?.id === p.id && <CheckCircle className="w-5 h-5 text-[#D16E41]" />}
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                  <div className="border-t border-gray-700 pt-4">
                    <button onClick={() => setShowCreate(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 text-white rounded-lg transition-colors">
                      <UserPlus className="w-5 h-5" /> Créer un nouveau client
                    </button>
                  </div>
                </>
              )}

              {showCreate && (
                <div className="space-y-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Nouveau client</h3>
                    <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-1 block">Prénom</label>
                      <input value={newClient.firstName} onChange={(e) => setNewClient({ ...newClient, firstName: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-600 text-white border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D16E41]" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-1 block">Nom</label>
                      <input value={newClient.lastName} onChange={(e) => setNewClient({ ...newClient, lastName: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-600 text-white border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D16E41]" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-1 block">Téléphone</label>
                    <input value={newClient.mobile} onChange={(e) => setNewClient({ ...newClient, mobile: e.target.value })}
                      placeholder="+33 6 12 34 56 78"
                      className="w-full px-3 py-2 bg-gray-600 text-white border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D16E41]" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-1 block">Type</label>
                    <select value={newClient.personTypeId} onChange={(e) => setNewClient({ ...newClient, personTypeId: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-600 text-white border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D16E41]">
                      <option value="">— Sélectionner —</option>
                      {personTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <button
                    onClick={() => createPersonMutation.mutate(newClient)}
                    disabled={!newClient.firstName || !newClient.lastName || !newClient.mobile || !newClient.personTypeId || createPersonMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {createPersonMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    Créer et sélectionner
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 2 : Trajet */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    <MapPin className="w-4 h-4" /> Ville de départ
                  </label>
                  <select value={depAddrId} onChange={(e) => { setDepAddrId(e.target.value); setSelectedDep(null); setHasSearched(false) }}
                    className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D16E41]">
                    <option value="">Sélectionner</option>
                    {allAddresses.filter((a) => a.id !== destAddrId).map((a) => <option key={a.id} value={a.id}>{a.city}, {a.country}</option>)}
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    <MapPin className="w-4 h-4" /> Ville d'arrivée
                  </label>
                  <select value={destAddrId} onChange={(e) => { setDestAddrId(e.target.value); setSelectedDep(null); setHasSearched(false) }}
                    className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D16E41]">
                    <option value="">Sélectionner</option>
                    {allAddresses.filter((a) => a.id !== depAddrId).map((a) => <option key={a.id} value={a.id}>{a.city}, {a.country}</option>)}
                  </select>
                </div>
              </div>

              <button onClick={() => setHasSearched(true)} disabled={!depAddrId || !destAddrId}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#D16E41] hover:bg-[#E07D52] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <Search className="w-5 h-5" /> Rechercher les départs disponibles
              </button>

              {hasSearched && (
                <div className="border-t border-gray-700 pt-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                    <Plane className="w-4 h-4" /> Sélectionner un départ groupé
                  </label>
                  {filteredDeps.length === 0 ? (
                    <div className="text-center py-8 bg-gray-700 rounded-lg">
                      <Plane className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400">Aucun départ disponible pour ce trajet</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {filteredDeps.map((dep) => (
                        <div key={dep.id} onClick={() => setSelectedDep(dep)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedDep?.id === dep.id ? 'border-[#D16E41] bg-[#D16E41]/10' : 'border-gray-600 hover:border-gray-500 bg-gray-700'}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-white font-medium flex items-center gap-2">
                                <Plane className="w-4 h-4 text-[#D16E41]" />
                                {dep.departureAddress.city} → {dep.destinationAddress.city}
                              </h3>
                              <div className="flex gap-4 mt-2">
                                <p className="text-sm text-gray-400 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" /> {new Date(dep.departureDate).toLocaleDateString('fr-FR')}
                                </p>
                                <p className="text-sm text-gray-400">{dep.price} {dep.currency.symbol}/kg</p>
                              </div>
                            </div>
                            {selectedDep?.id === dep.id && <CheckCircle className="w-5 h-5 text-[#D16E41]" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 3 : Natures */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#D16E41]" /> Natures du colis
                </h3>
                <p className="text-sm text-gray-400 mb-4">Ajoutez les natures puis saisissez le poids total.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Nature</label>
                    <select value={curNatureId} onChange={(e) => setCurNatureId(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D16E41]">
                      <option value="">Sélectionner une nature</option>
                      {natures.map((n) => <option key={n.id} value={n.id}>{n.name} — {n.unitPrice} €/unité</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Quantité</label>
                    <input type="number" min="1" value={curQty} onChange={(e) => setCurQty(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D16E41]" />
                  </div>
                </div>

                <button onClick={handleAddNature} disabled={!curNatureId || Number(curQty) <= 0}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <Plus className="w-4 h-4" /> Ajouter une nature
                </button>

                {addedNatures.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {addedNatures.map((n, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{n.name}</p>
                          <p className="text-sm text-gray-400">{n.quantity} × {n.unitPrice} €</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-white font-semibold">{(n.unitPrice * n.quantity).toFixed(2)} €</span>
                          <button onClick={() => setAddedNatures((p) => p.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-300 p-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center justify-between p-3 bg-[#D16E41]/20 border border-[#D16E41]/30 rounded-lg mt-2">
                      <span className="text-white font-semibold">Total</span>
                      <span className="text-white font-bold text-lg">{total.toFixed(2)} €</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-700 pt-4 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">Poids total calculé</span>
                <span className="text-lg font-bold text-white">{weight} kg</span>
              </div>
            </div>
          )}

          {/* Step 4 : Confirmation + Paiement optionnel */}
          {step === 4 && (
            <div className="space-y-4">
              {/* Résumé */}
              <div className="bg-gray-700 rounded-lg p-5 space-y-4">
                <h3 className="text-lg font-semibold text-white">Résumé du colis</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Client</p>
                    <p className="text-white font-medium">{selectedPerson?.firstName} {selectedPerson?.lastName}</p>
                    <p className="text-sm text-gray-400">{selectedPerson?.mobile}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Poids</p>
                    <p className="text-white font-medium">{weight} kg</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Départ</p>
                    <p className="text-white font-medium">{selectedDep?.departureAddress.city}, {selectedDep?.departureAddress.country}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Destination</p>
                    <p className="text-white font-medium">{selectedDep?.destinationAddress.city}, {selectedDep?.destinationAddress.country}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-400">Date de départ</p>
                    <p className="text-white font-medium">
                      {selectedDep ? new Date(selectedDep.departureDate).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                    </p>
                  </div>
                </div>
                <div className="border-t border-gray-600 pt-4">
                  <p className="text-sm text-gray-400 mb-2">Natures</p>
                  <div className="space-y-1">
                    {addedNatures.map((n, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-300">{n.name} × {n.quantity}</span>
                        <span className="text-white font-medium">{(n.unitPrice * n.quantity).toFixed(2)} €</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-3 pt-3 border-t border-gray-600">
                    <span className="text-white font-semibold">Total estimé</span>
                    <span className="text-[#D16E41] font-bold text-lg">{total.toFixed(2)} €</span>
                  </div>
                </div>
              </div>

              {/* Toggle paiement */}
              <div className="border border-gray-600 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setWithPayment((v) => !v)}
                  className="w-full flex items-center justify-between px-5 py-4 bg-gray-700 hover:bg-gray-600 transition-colors"
                >
                  <span className="text-white font-medium">Enregistrer un paiement maintenant</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${withPayment ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-400'}`}>
                    {withPayment ? 'Oui' : 'Non'}
                  </span>
                </button>

                {withPayment && (
                  <div className="p-5 border-t border-gray-600 space-y-4 bg-gray-800">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-300 mb-1 block">Montant</label>
                        <input
                          type="number"
                          value={total.toFixed(2)}
                          readOnly
                          className="w-full px-3 py-2 bg-gray-600 text-gray-300 border border-gray-600 rounded-lg cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-300 mb-1 block">Devise *</label>
                        <select
                          value={payCurrencyId}
                          onChange={(e) => setPayCurrencyId(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D16E41]"
                        >
                          <option value="">— Sélectionner —</option>
                          {currencies.map((c) => (
                            <option key={c.id} value={c.id}>{c.name} ({c.symbol})</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-1 block">Méthode de paiement *</label>
                      <select
                        value={payMethodId}
                        onChange={(e) => setPayMethodId(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D16E41]"
                      >
                        <option value="">— Sélectionner —</option>
                        {paymentMethods.map((m) => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-300 mb-1 block">Remise (€)</label>
                        <input
                          type="number" min="0" step="0.01"
                          value={payRemise}
                          onChange={(e) => setPayRemise(e.target.value)}
                          placeholder="0.00"
                          className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D16E41]"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-300 mb-1 block">Assurance (€)</label>
                        <input
                          type="number" min="0" step="0.01"
                          value={payInsurance}
                          onChange={(e) => setPayInsurance(e.target.value)}
                          placeholder="0.00"
                          className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D16E41]"
                        />
                      </div>
                    </div>
                    {Number(payRemise) > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-300 mb-1 block">Motif de la remise</label>
                        <input
                          type="text"
                          value={payRemiseReason}
                          onChange={(e) => setPayRemiseReason(e.target.value)}
                          placeholder="Raison de la remise..."
                          className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D16E41]"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex gap-3">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
              Retour
            </button>
          )}
          {step < 4 ? (
            <button onClick={() => setStep(step + 1)} disabled={!canNext()}
              className="flex-1 py-3 bg-[#D16E41] hover:bg-[#E07D52] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Suivant
            </button>
          ) : (
            <button
              onClick={() => {
                if (!selectedPerson || !selectedDep || weight <= 0) return
                const payment: CreatePackagePaymentDTO | undefined =
                  withPayment && payMethodId && payCurrencyId
                    ? {
                        amount:          total,
                        currencyId:      payCurrencyId,
                        paymentMethodId: payMethodId,
                        ...(Number(payRemise)   > 0 && { remise:         Number(payRemise) }),
                        ...(payRemiseReason      && { remiseReason:    payRemiseReason }),
                        ...(Number(payInsurance) > 0 && { insurancePrice: Number(payInsurance) }),
                      }
                    : undefined
                createPackageMutation.mutate({
                  personId:       selectedPerson.id,
                  departureGpId:  selectedDep.id,
                  weight,
                  packageNatures: addedNatures.map((n) => ({ natureId: n.natureId, quantity: n.quantity })),
                  payment,
                })
              }}
              disabled={createPackageMutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50">
              {createPackageMutation.isPending && <Loader2 className="w-5 h-5 animate-spin" />}
              {withPayment && payMethodId && payCurrencyId ? 'Créer avec paiement' : 'Créer le colis'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
