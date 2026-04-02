'use client'

import { useState } from 'react'
import { Search, Filter } from 'lucide-react'

export type FilterField =
  | { type: 'text';   label: string; placeholder?: string; onChange: (v: string) => void }
  | { type: 'date';   label: string;                        onChange: (v: string) => void }
  | { type: 'number'; label: string; placeholder?: string; min?: number; onChange: (v: string) => void }
  | { type: 'select'; label: string; options: { value: string; label: string }[]; onChange: (v: string) => void }

interface FiltersPanelProps {
  searchPlaceholder: string
  onSearch:          (value: string) => void
  filters?:          FilterField[]
  cols?:             2 | 3 | 4
}

const inputClass = 'w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D16E41]'
const labelClass = 'block text-sm font-medium text-gray-300 mb-2'

export function FiltersPanel({ searchPlaceholder, onSearch, filters, cols = 4 }: FiltersPanelProps) {
  const [show, setShow] = useState(false)

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D16E41]"
          />
        </div>
        {filters && filters.length > 0 && (
          <button
            onClick={() => setShow(!show)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Filter className="w-5 h-5" />
            Filtres
          </button>
        )}
      </div>

      {show && filters && filters.length > 0 && (
        <div className="mt-4 p-4 bg-gray-800 border border-gray-700 rounded-lg">
          <div className={`grid grid-cols-1 md:grid-cols-${cols} gap-4`}>
            {filters.map((f, i) => (
              <div key={i}>
                <label className={labelClass}>{f.label}</label>
                {f.type === 'select' ? (
                  <select onChange={(e) => f.onChange(e.target.value)} className={inputClass}>
                    {f.options.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={f.type}
                    placeholder={'placeholder' in f ? f.placeholder : undefined}
                    min={'min' in f ? f.min : undefined}
                    onChange={(e) => f.onChange(e.target.value)}
                    className={inputClass}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
