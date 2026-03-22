'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { relaysApi } from '@/lib/api/relays.api'
import { personsApi } from '@/lib/api/persons.api'
import { referenceApi } from '@/lib/api/reference.api'

const schema = z.object({
  name:      z.string().min(1, 'Nom requis'),
  personId:  z.string().uuid('Responsable requis'),
  addressId: z.string().uuid('Adresse requise'),
})

type FormValues = z.infer<typeof schema>

export function CreateRelayModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const qc = useQueryClient()

  const { data: personTypes = [] } = useQuery({
    queryKey: ['person-types'],
    queryFn:  personsApi.listTypes,
    enabled:  isOpen,
  })

  const relaisTypeId = personTypes.find((t) => t.name.toLowerCase() === 'relais')?.id

  const { data: relaisPersons = [] } = useQuery({
    queryKey: ['persons', { personTypeId: relaisTypeId }],
    queryFn:  () => personsApi.list({ personTypeId: relaisTypeId, limit: 100 }),
    enabled:  isOpen && !!relaisTypeId,
    select:   (d) => d.props,
  })

  const { data: relaisAddresses = [] } = useQuery({
    queryKey: ['ref', 'addresses', 'relais'],
    queryFn:  referenceApi.relaisAddresses,
    enabled:  isOpen,
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const mutation = useMutation({
    mutationFn: relaysApi.create,
    onSuccess: () => {
      toast.success('Relais créé')
      qc.invalidateQueries({ queryKey: ['relays'] })
      reset()
      onClose()
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message ?? 'Erreur')
    },
  })

  if (!isOpen) return null

  const fieldClass = 'w-full px-3 py-2.5 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D16E41]'
  const labelClass = 'block text-sm font-medium text-gray-300 mb-1.5'
  const errClass   = 'text-red-400 text-xs mt-1'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Nouveau relais</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="p-6 space-y-4">
          <div>
            <label className={labelClass}>Nom du relais *</label>
            <input placeholder="Relais Paris Nord" {...register('name')} className={fieldClass} />
            {errors.name && <p className={errClass}>{errors.name.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Responsable (personne relais) *</label>
            <select {...register('personId')} className={fieldClass}>
              <option value="">— Sélectionner un responsable —</option>
              {relaisPersons.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName} — {p.mobile}
                </option>
              ))}
            </select>
            {errors.personId && <p className={errClass}>{errors.personId.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Adresse du relais *</label>
            <select {...register('addressId')} className={fieldClass}>
              <option value="">— Sélectionner une adresse —</option>
              {relaisAddresses.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.city}, {a.region} — {a.country}
                </option>
              ))}
            </select>
            {errors.addressId && <p className={errClass}>{errors.addressId.message}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">Annuler</button>
            <button type="submit" disabled={mutation.isPending} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#D16E41] hover:bg-[#E07D52] disabled:opacity-60 text-white rounded-lg transition-colors">
              {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
