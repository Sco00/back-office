'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface BackButtonProps {
  label?: string
}

export function BackButton({ label = 'Retour à la liste' }: BackButtonProps) {
  const router = useRouter()
  return (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
    >
      <ArrowLeft className="w-5 h-5" />
      <span className="text-sm">{label}</span>
    </button>
  )
}
