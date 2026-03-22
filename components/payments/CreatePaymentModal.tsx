'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { paymentsApi } from '@/lib/api/payments.api'

const schema = z.object({
  amount:          z.coerce.number().positive('Montant requis'),
  currencyId:      z.string().uuid('Devise requise'),
  paymentMethodId: z.string().uuid('Méthode requise'),
  packageId:       z.string().uuid('Colis requis'),
  linkInvoice:     z.string().optional().or(z.literal('')),
  remise:          z.coerce.number().nonnegative().optional(),
  remiseReason:    z.string().optional(),
  priceRelay:      z.coerce.number().nonnegative().optional(),
  insurancePrice:  z.coerce.number().nonnegative().optional(),
})

type FormValues = z.infer<typeof schema>

export function CreatePaymentModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const qc = useQueryClient()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const mutation = useMutation({
    mutationFn: (values: FormValues) => paymentsApi.create({
      ...values,
      linkInvoice: values.linkInvoice || undefined,
    }),
    onSuccess: () => {
      toast.success('Paiement créé')
      qc.invalidateQueries({ queryKey: ['payments'] })
      reset()
      onClose()
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message ?? 'Erreur lors de la création')
    },
  })

  if (!isOpen) return null

  const fieldClass = 'w-full px-3 py-2.5 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D16E41]'
  const labelClass = 'block text-sm font-medium text-gray-300 mb-1.5'
  const errClass   = 'text-red-400 text-xs mt-1'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Nouveau paiement</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="p-6 space-y-4">
          <div>
            <label className={labelClass}>ID du colis (UUID) *</label>
            <input placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" {...register('packageId')} className={fieldClass} />
            {errors.packageId && <p className={errClass}>{errors.packageId.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Montant *</label>
              <input type="number" step="0.01" placeholder="150.00" {...register('amount')} className={fieldClass} />
              {errors.amount && <p className={errClass}>{errors.amount.message}</p>}
            </div>
            <div>
              <label className={labelClass}>ID Devise (UUID) *</label>
              <input placeholder="uuid..." {...register('currencyId')} className={fieldClass} />
              {errors.currencyId && <p className={errClass}>{errors.currencyId.message}</p>}
            </div>
          </div>
          <div>
            <label className={labelClass}>ID Méthode de paiement (UUID) *</label>
            <input placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" {...register('paymentMethodId')} className={fieldClass} />
            {errors.paymentMethodId && <p className={errClass}>{errors.paymentMethodId.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Remise</label>
              <input type="number" step="0.01" placeholder="0" {...register('remise')} className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Prix relais</label>
              <input type="number" step="0.01" placeholder="0" {...register('priceRelay')} className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Prix assurance</label>
              <input type="number" step="0.01" placeholder="0" {...register('insurancePrice')} className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Raison remise</label>
              <input placeholder="..." {...register('remiseReason')} className={fieldClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Lien facture</label>
            <input type="url" placeholder="https://..." {...register('linkInvoice')} className={fieldClass} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">Annuler</button>
            <button type="submit" disabled={mutation.isPending} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#D16E41] hover:bg-[#E07D52] disabled:opacity-60 text-white rounded-lg transition-colors">
              {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
