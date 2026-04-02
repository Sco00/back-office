import { DepartureStates } from '@/lib/types/api.types'
import { DEPARTURE_STATE_MAP } from '@/constants/departure.constants'

export function DepartureStateBadge({ state }: { state: DepartureStates }) {
  const s = DEPARTURE_STATE_MAP[state]
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${s.cls}`}>
      {s.label}
    </span>
  )
}
