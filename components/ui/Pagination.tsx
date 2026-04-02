'use client'

interface PaginationProps {
  page:       number
  totalPages: number
  total:      number
  label:      string
  onChange:   (page: number) => void
}

export function Pagination({ page, totalPages, total, label, onChange }: PaginationProps) {
  return (
    <div className="flex items-center justify-between px-4 py-4 border-t border-gray-700">
      <p className="text-sm text-gray-400">{total} {label}</p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="px-3 py-1.5 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-lg text-sm transition-colors disabled:opacity-40"
        >
          Précédent
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              page === p ? 'bg-[#D16E41] text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="px-3 py-1.5 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-lg text-sm transition-colors disabled:opacity-40"
        >
          Suivant
        </button>
      </div>
    </div>
  )
}
