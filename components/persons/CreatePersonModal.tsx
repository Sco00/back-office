'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { personsApi } from '@/lib/api/persons.api'

const schema = z.object({
  firstName:    z.string().min(1, 'Prénom requis'),
  lastName:     z.string().min(1, 'Nom requis'),
  mobile:       z.string().min(1, 'Mobile requis'),
  personTypeId: z.string().uuid('Type requis'),
})

type FormValues = z.infer<typeof schema>

export function CreatePersonModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const qc = useQueryClient()

  const { data: personTypes = [] } = useQuery({
    queryKey: ['person-types'],
    queryFn:  personsApi.listTypes,
    enabled:  isOpen,
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const mutation = useMutation({
    mutationFn: personsApi.create,
    onSuccess: () => {
      toast.success('Personne créée')
      qc.invalidateQueries({ queryKey: ['persons'] })
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
          <h2 className="text-xl font-semibold text-white">Nouvelle personne</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Prénom *</label>
              <input {...register('firstName')} className={fieldClass} />
              {errors.firstName && <p className={errClass}>{errors.firstName.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Nom *</label>
              <input {...register('lastName')} className={fieldClass} />
              {errors.lastName && <p className={errClass}>{errors.lastName.message}</p>}
            </div>
          </div>
          <div>
            <label className={labelClass}>Mobile *</label>
            <input placeholder="+33 6 12 34 56 78" {...register('mobile')} className={fieldClass} />
            {errors.mobile && <p className={errClass}>{errors.mobile.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Type de personne *</label>
            <select {...register('personTypeId')} className={fieldClass}>
              <option value="">— Sélectionner un type —</option>
              {personTypes.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            {errors.personTypeId && <p className={errClass}>{errors.personTypeId.message}</p>}
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
