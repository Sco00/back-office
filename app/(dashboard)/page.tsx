'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import {
  TrendingUp, Package, Users, DollarSign,
  MapPin, ArrowUpRight, AlertCircle,
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { dashboardApi } from '@/lib/api/dashboard.api'
import type { DerniersColisItem, TopClientItem, StatutsParMoisItem, CaMensuelItem, ColisParRouteItem } from '@/lib/api/dashboard.api'

// ── Helpers ──────────────────────────────────────────────────────────────────

const STATE_LABEL: Record<string, string> = {
  EN_ATTENTE: 'En attente',
  EN_TRANSIT: 'En transit',
  ARRIVE:     'Arrivé',
  LIVRE:      'Livré',
  RETOURNE:   'Retourné',
}

const STATE_BADGE: Record<string, string> = {
  EN_ATTENTE: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  EN_TRANSIT: 'bg-blue-500/20  text-blue-300  border border-blue-500/30',
  ARRIVE:     'bg-purple-500/20 text-purple-300 border border-purple-500/30',
  LIVRE:      'bg-green-500/20 text-green-300  border border-green-500/30',
  RETOURNE:   'bg-red-500/20   text-red-300    border border-red-500/30',
}

const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    borderRadius: '8px',
    color: '#fff',
  },
}

// ── Composants ───────────────────────────────────────────────────────────────

function KPICard({
  icon: Icon, label, value, sub, color,
}: { icon: any; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-gray-600 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {sub && (
          <div className="flex items-center gap-1 text-sm font-medium text-green-400">
            <TrendingUp className="w-4 h-4" />
            {sub}
          </div>
        )}
      </div>
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  )
}

// ── Page principale ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn:  dashboardApi.get,
    refetchInterval: 60_000,
  })

  if (isLoading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-xl border border-gray-700 h-36" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-xl border border-gray-700 h-80" />
          ))}
        </div>
      </div>
    )
  }

  const { kpis, caMensuel, colisParRoute, repartitionClients, statutsParMois, derniersColis, topClients } = data

  // Données pour les graphiques
  const caData: CaMensuelItem[]        = caMensuel
  const routeData: ColisParRouteItem[] = colisParRoute.slice(0, 5).map(r => ({
    ...r,
    route: `${r.departureCity}-${r.destinationCity}`,
  })) as any
  const pieData = [
    { name: 'Nouveaux clients',    value: repartitionClients.nouveaux,   color: '#D16E41' },
    { name: 'Clients récurrents',  value: repartitionClients.recurrents, color: '#3b82f6' },
  ]
  const statusData: StatutsParMoisItem[] = statutsParMois

  return (
    <div className="space-y-8">

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          icon={DollarSign} color="bg-[#D16E41]"
          label="Chiffre d'affaires (XOF)"
          value={kpis.chiffreAffaires.toLocaleString('fr-FR')}
        />
        <KPICard
          icon={Package} color="bg-blue-500"
          label="Colis traités"
          value={kpis.totalColis.toLocaleString('fr-FR')}
        />
        <KPICard
          icon={AlertCircle} color="bg-green-500"
          label="Kg transportés"
          value={`${kpis.totalKg.toLocaleString('fr-FR')} kg`}
        />
        <KPICard
          icon={Users} color="bg-purple-500"
          label="Clients"
          value={kpis.totalClients.toLocaleString('fr-FR')}
        />
      </div>

      {/* ── Graphiques ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* CA Mensuel */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Chiffre d'affaires mensuel (XOF)</h2>
          {caData.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-gray-500 text-sm">Aucune donnée</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={caData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="mois" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <Tooltip {...TOOLTIP_STYLE} formatter={(v: any) => v.toLocaleString('fr-FR')} />
                <Line type="monotone" dataKey="ca" name="CA" stroke="#D16E41" strokeWidth={3} dot={{ fill: '#D16E41', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Routes principales */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Routes principales (Colis)</h2>
          {routeData.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-gray-500 text-sm">Aucune donnée</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={routeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="route" stroke="#9ca3af" angle={-15} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="nbColis" name="Colis" fill="#D16E41" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Répartition clients */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Répartition des clients</h2>
          {pieData.every(d => d.value === 0) ? (
            <div className="flex items-center justify-center h-[300px] text-gray-500 text-sm">Aucune donnée</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    labelLine={false}
                    label={({ percent }: { percent?: number }) => percent != null ? `${(percent * 100).toFixed(0)}%` : ''}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip {...TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-2">
                {pieData.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-gray-300">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Évolution des statuts */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Évolution des statuts</h2>
          {statusData.length === 0 ? (
            <div className="flex items-center justify-center h-[300px] text-gray-500 text-sm">Aucune donnée</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="mois" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
                <Bar dataKey="EN_TRANSIT" name="En transit"  fill="#D16E41" radius={[4, 4, 0, 0]} />
                <Bar dataKey="LIVRE"      name="Livrés"      fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="EN_ATTENTE" name="En attente"  fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ARRIVE"     name="Arrivés"     fill="#a855f7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="RETOURNE"   name="Retournés"   fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Tableaux ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Derniers colis */}
        <div className="lg:col-span-2 bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Derniers colis</h2>
            <Link href="/packages" className="text-[#D16E41] text-sm font-medium hover:text-[#E07D52] flex items-center gap-1">
              Voir tout <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  {['Référence', 'Client', 'Route', 'Poids', 'Statut', 'Montant'].map(h => (
                    <th key={h} className="text-left py-3 px-2 text-xs font-medium text-gray-400 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {derniersColis.length === 0 ? (
                  <tr><td colSpan={6} className="py-8 text-center text-gray-500 text-sm">Aucun colis</td></tr>
                ) : derniersColis.map((colis: DerniersColisItem) => (
                  <tr key={colis.id} className="border-b border-gray-700 hover:bg-gray-700/40 transition-colors">
                    <td className="py-3 px-2">
                      <span className="font-mono text-sm font-medium text-gray-200">#{colis.reference}</span>
                    </td>
                    <td className="py-3 px-2 text-sm text-gray-300">{colis.firstName} {colis.lastName}</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1 text-sm text-gray-300">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        {colis.departureCity} → {colis.destinationCity}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-sm text-gray-300">{colis.weight} kg</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATE_BADGE[colis.currentState] ?? 'bg-gray-500/20 text-gray-400'}`}>
                        {STATE_LABEL[colis.currentState] ?? colis.currentState}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right text-sm font-medium text-white">
                      {colis.amount != null ? colis.amount.toLocaleString('fr-FR') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top clients */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Top clients</h2>
          {topClients.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucun client</p>
          ) : (
            <div className="space-y-4">
              {topClients.map((client: TopClientItem, index: number) => (
                <div key={client.id} className="flex items-center justify-between pb-4 border-b border-gray-700 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#D16E41]/20 flex items-center justify-center border border-[#D16E41]/30 flex-shrink-0">
                      <span className="text-sm font-bold text-[#D16E41]">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{client.firstName} {client.lastName}</p>
                      <p className="text-xs text-gray-400">{client.nbColis} colis</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">{client.totalCa.toLocaleString('fr-FR')}</p>
                    <p className="text-xs text-green-400">XOF</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Activité récente ── */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Activité récente</h2>
        <div className="space-y-4">
          {derniersColis.map((colis: DerniersColisItem, i: number) => (
            <div key={i} className="flex items-start gap-4 pb-4 border-b border-gray-700 last:border-0">
              <div className="bg-blue-500/10 text-blue-400 p-2 rounded-lg flex-shrink-0">
                <Package className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">Colis créé</p>
                <p className="text-sm text-gray-400 mt-0.5">
                  #{colis.reference} — {colis.firstName} {colis.lastName} · {colis.departureCity} → {colis.destinationCity} · {colis.weight} kg
                </p>
              </div>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {new Date(colis.createdAt).toLocaleDateString('fr-FR')}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
