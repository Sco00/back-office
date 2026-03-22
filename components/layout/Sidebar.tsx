'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Package, Plane, Users, User,
  DollarSign, ChevronLeft, ChevronRight, LogOut,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { toast } from 'sonner'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard',  href: '/' },
  { icon: Package,         label: 'Colis',      href: '/packages' },
  { icon: Plane,           label: 'Départs GP', href: '/departures' },
  { icon: Users,           label: 'Clients',    href: '/persons' },
  { icon: User,            label: 'Relais',     href: '/relays' },
  { icon: DollarSign,      label: 'Paiements',  href: '/payments' },
]

interface SidebarProps {
  isCollapsed:       boolean
  onCollapsedChange: (v: boolean) => void
}

export function Sidebar({ isCollapsed, onCollapsedChange }: SidebarProps) {
  const pathname = usePathname()
  const router   = useRouter()
  const { user, clearAuth } = useAuthStore()

  const handleLogout = () => {
    clearAuth()
    toast.success('Déconnecté')
    router.push('/login')
  }

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  const initials = user
    ? `${user.person.firstName.charAt(0)}${user.person.lastName.charAt(0)}`
    : 'A'

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-gray-800 border-r border-gray-700 flex flex-col z-50 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#D16E41] flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-semibold text-white">YobbalGP</h1>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive(item.href)
                    ? 'bg-[#D16E41] text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Collapse toggle */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={() => onCollapsedChange(!isCollapsed)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Réduire</span>
            </>
          )}
        </button>
      </div>

      {/* User + Logout */}
      <div className="p-4 border-t border-gray-700 space-y-2">
        {/* Carte utilisateur — avatar toujours visible */}
        <div className={`flex items-center gap-3 px-3 py-2 bg-gray-700 rounded-lg ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-[#D16E41] flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-white">{initials}</span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user ? `${user.person.firstName} ${user.person.lastName}` : 'Admin'}
              </p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          )}
        </div>

        {/* Bouton déconnexion */}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title="Se déconnecter"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm">Se déconnecter</span>}
        </button>
      </div>
    </aside>
  )
}
