import type { ReactNode } from 'react'

interface DetailFieldProps {
  label:   string
  value:   ReactNode
  mono?:   boolean
}

export function DetailField({ label, value, mono = false }: DetailFieldProps) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className={`text-sm text-white ${mono ? 'font-mono' : ''}`}>
        {value ?? <span className="text-gray-500">—</span>}
      </p>
    </div>
  )
}
