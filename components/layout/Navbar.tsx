'use client'

import { usePathname } from 'next/navigation'
import { Bell } from 'lucide-react'

const pageTitles: Record<string, { title: string; description: string }> = {
  '/':            { title: 'Dashboard',       description: "Vue d'ensemble de vos activités" },
  '/packages':    { title: 'Colis',           description: 'Liste complète des colis et expéditions' },
  '/departures':  { title: 'Départs GP',      description: 'Gestion des expéditions groupées' },
  '/persons':     { title: 'Personnes',       description: 'Clients, GPs et contacts' },
  '/relays':      { title: 'Relais',          description: 'Points de collecte et dépôt' },
  '/payments':    { title: 'Paiements',       description: 'Suivi des paiements et factures' },
}

export function Navbar() {
  const pathname = usePathname()

  // Trouver le titre correspondant (support sous-routes comme /packages/[id])
  const key = Object.keys(pageTitles)
    .sort((a, b) => b.length - a.length)
    .find((k) => pathname === k || (k !== '/' && pathname.startsWith(k)))

  const page = key ? pageTitles[key] : { title: 'YobbalGP', description: '' }

  return (
    <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white">{page.title}</h1>
            {page.description && (
              <p className="text-sm text-gray-400">{page.description}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#D16E41] rounded-full" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
