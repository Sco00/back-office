'use client'

import type { ComponentType } from 'react'

export interface StatCard {
  label: string
  value: number | string
  color: string
  icon:  ComponentType<{ className?: string }>
}

interface StatsGridProps {
  stats: StatCard[]
  cols?: 2 | 3 | 4
}

const colsClass: Record<number, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-4',
}

export function StatsGrid({ stats, cols = 4 }: StatsGridProps) {
  return (
    <div className={`grid ${colsClass[cols]} gap-4 mb-6`}>
      {stats.map((s) => (
        <div key={s.label} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className={`${s.color} p-2 rounded-lg`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">{s.label}</p>
              <p className="text-xl font-bold text-white">{s.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
