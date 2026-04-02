'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Loader2, MapPin, Globe, Building2, Navigation } from 'lucide-react'
import { toast } from 'sonner'
import { addressesApi } from '@/lib/api/addresses.api'
import type { AddressType } from '@/lib/types/api.types'

const STEPS = ['Localisation', 'Détails', 'Confirmation']

export function CreateAddressModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const qc = useQueryClient()

  const [step, setStep] = useState(1)

  // Étape 1
  const [country,  setCountry]  = useState('')
  const [region,   setRegion]   = useState('')
  const [city,     setCity]     = useState('')

  // Étape 2
  const [type,      setType]      = useState<AddressType>('SIMPLE')
  const [locality,  setLocality]  = useState('')
  const [latitude,  setLatitude]  = useState('')
  const [longitude, setLongitude] = useState('')

  const canNext = () => {
    if (step === 1) return !!country.trim() && !!region.trim() && !!city.trim()
    if (step === 2) return !!type
    return true
  }

  const mutation = useMutation({
    mutationFn: () => addressesApi.create({
      country:   country.trim(),
      region:    region.trim(),
      city:      city.trim(),
      type,
      locality:  locality.trim() || undefined,
      latitude:  latitude  ? Number(latitude)  : undefined,
      longitude: longitude ? Number(longitude) : undefined,
    }),
    onSuccess: () => {
      toast.success('Adresse créée')
      qc.invalidateQueries({ queryKey: ['addresses'] })
      qc.invalidateQueries({ queryKey: ['ref-addresses'] })
      handleClose()
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message ?? 'Erreur lors de la création')
    },
  })

  const handleClose = () => {
    setStep(1)
    setCountry(''); setRegion(''); setCity('')
    setType('SIMPLE'); setLocality(''); setLatitude(''); setLongitude('')
    onClose()
  }

  if (!isOpen) return null

  const fieldClass = 'w-full px-3 py-2.5 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D16E41] text-sm'
  const labelClass = 'block text-sm font-medium text-gray-300 mb-1.5'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <div
        className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="bg-[#D16E41] p-2 rounded-lg">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Nouvelle adresse</h2>
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

          {/* ── Step 1 : Localisation ── */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-400">Renseignez la localisation géographique de l'adresse.</p>
              <div>
                <label className={labelClass}>
                  <Globe className="w-4 h-4 inline mr-1 text-[#D16E41]" /> Pays *
                </label>
                <input
                  type="text" placeholder="Ex: France"
                  value={country} onChange={(e) => setCountry(e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  <MapPin className="w-4 h-4 inline mr-1 text-blue-400" /> Région *
                </label>
                <input
                  type="text" placeholder="Ex: Île-de-France"
                  value={region} onChange={(e) => setRegion(e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  <Building2 className="w-4 h-4 inline mr-1 text-green-400" /> Ville *
                </label>
                <input
                  type="text" placeholder="Ex: Paris"
                  value={city} onChange={(e) => setCity(e.target.value)}
                  className={fieldClass}
                />
              </div>
            </div>
          )}

          {/* ── Step 2 : Détails ── */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-400">Précisez le type et les informations complémentaires.</p>

              <div>
                <label className={labelClass}>Type *</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['SIMPLE', 'RELAIS'] as AddressType[]).map((t) => (
                    <div
                      key={t}
                      onClick={() => setType(t)}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        type === t ? 'border-[#D16E41] bg-[#D16E41]/10' : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                      }`}
                    >
                      <MapPin className={`w-4 h-4 ${type === t ? 'text-[#D16E41]' : 'text-gray-400'}`} />
                      <span className={`text-sm font-medium ${type === t ? 'text-white' : 'text-gray-300'}`}>
                        {t === 'SIMPLE' ? 'Simple' : 'Point Relais'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelClass}>Localité <span className="text-gray-500 font-normal">(optionnel)</span></label>
                <input
                  type="text" placeholder="Ex: Quartier Plateau"
                  value={locality} onChange={(e) => setLocality(e.target.value)}
                  className={fieldClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    <Navigation className="w-4 h-4 inline mr-1 text-gray-400" /> Latitude <span className="text-gray-500 font-normal">(opt.)</span>
                  </label>
                  <input
                    type="number" step="any" placeholder="48.8566"
                    value={latitude} onChange={(e) => setLatitude(e.target.value)}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    <Navigation className="w-4 h-4 inline mr-1 text-gray-400" /> Longitude <span className="text-gray-500 font-normal">(opt.)</span>
                  </label>
                  <input
                    type="number" step="any" placeholder="2.3522"
                    value={longitude} onChange={(e) => setLongitude(e.target.value)}
                    className={fieldClass}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3 : Confirmation ── */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-400">Vérifiez les informations avant de créer l'adresse.</p>

              <div className="bg-gray-700 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-5 h-5 text-[#D16E41]" />
                  <h3 className="text-white font-semibold">Récapitulatif</h3>
                </div>

                {[
                  { label: 'Pays',      value: country },
                  { label: 'Région',    value: region },
                  { label: 'Ville',     value: city },
                  { label: 'Localité',  value: locality || '—' },
                  { label: 'Type',      value: type === 'SIMPLE' ? 'Simple' : 'Point Relais' },
                  ...(latitude  ? [{ label: 'Latitude',  value: latitude }]  : []),
                  ...(longitude ? [{ label: 'Longitude', value: longitude }] : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{label}</span>
                    <span className="text-white font-medium">{value}</span>
                  </div>
                ))}
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
              Créer l'adresse
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
