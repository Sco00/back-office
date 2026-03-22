import { PackageStates } from '@/lib/types/api.types'

const stateMap: Record<PackageStates, { label: string; cls: string }> = {
  EN_ATTENTE: { label: 'En attente',  cls: 'bg-amber-500/20 text-amber-300 border border-amber-500/30' },
  EN_TRANSIT: { label: 'En transit',  cls: 'bg-blue-500/20  text-blue-300  border border-blue-500/30'  },
  ARRIVE:     { label: 'Arrivé',      cls: 'bg-purple-500/20 text-purple-300 border border-purple-500/30' },
  LIVRE:      { label: 'Livré',       cls: 'bg-green-500/20 text-green-300 border border-green-500/30' },
  RETOURNE:   { label: 'Retourné',    cls: 'bg-red-500/20   text-red-300   border border-red-500/30'   },
}

export function PackageStateBadge({ state }: { state: PackageStates }) {
  const s = stateMap[state] ?? { label: state, cls: 'bg-gray-500/20 text-gray-300 border border-gray-500/30' }
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${s.cls}`}>
      {s.label}
    </span>
  )
}
