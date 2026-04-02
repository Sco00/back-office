import { PackageStates } from '@/lib/types/api.types'
import { PACKAGE_STATE_MAP } from '@/constants/package.constants'

export function PackageStateBadge({ state }: { state: PackageStates }) {
  const s = PACKAGE_STATE_MAP[state] ?? { label: state, cls: 'bg-gray-500/20 text-gray-300 border border-gray-500/30' }
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${s.cls}`}>
      {s.label}
    </span>
  )
}
