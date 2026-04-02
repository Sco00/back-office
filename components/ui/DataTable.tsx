'use client'

import { Loader2 } from 'lucide-react'

export interface Column<T> {
  label:   string
  align?:  'left' | 'right'
  render:  (row: T) => React.ReactNode
}

interface DataTableProps<T extends { id: string }> {
  columns:      Column<T>[]
  rows:         T[]
  isLoading?:   boolean
  emptyMessage?: string
  onRowClick?:  (row: T) => void
  footer?:      React.ReactNode
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  isLoading   = false,
  emptyMessage = 'Aucun résultat',
  onRowClick,
  footer,
}: DataTableProps<T>) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              {columns.map((col) => (
                <th
                  key={col.label}
                  className={`py-4 px-4 text-xs font-medium text-gray-400 uppercase ${
                    col.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-[#D16E41] mx-auto" />
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className={`border-b border-gray-700 transition-colors ${
                    onRowClick
                      ? 'hover:bg-gray-700/40 cursor-pointer'
                      : 'hover:bg-gray-700/40'
                  }`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col, i) => (
                    <td
                      key={i}
                      className={`py-4 px-4 ${col.align === 'right' ? 'text-right' : ''}`}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {footer}
    </div>
  )
}
