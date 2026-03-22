'use client'

import { use, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, User, Phone, Package, DollarSign, CheckCircle,
  Clock, Truck, Loader2, MapPin, FileText, Plus, UserCheck,
  Shield, Eye,
} from 'lucide-react'
import { toast } from 'sonner'
import { personsApi }   from '@/lib/api/persons.api'
import { accountsApi }  from '@/lib/api/accounts.api'
import { referenceApi } from '@/lib/api/reference.api'
import { getPackageState, PackageStates, type PersonDetail } from '@/lib/types/api.types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR')
}

function fmtXof(n: number) {
  return Math.round(n).toLocaleString('fr-FR') + ' XOF'
}

const STATE_LABEL: Record<PackageStates, string> = {
  [PackageStates.EN_ATTENTE]: 'En attente',
  [PackageStates.EN_TRANSIT]: 'En transit',
  [PackageStates.ARRIVE]:     'Arrivé',
  [PackageStates.LIVRE]:      'Livré',
  [PackageStates.RETOURNE]:   'Retourné',
}

const STATE_STYLE: Record<PackageStates, string> = {
  [PackageStates.EN_ATTENTE]: 'bg-gray-500/20   text-gray-300   border-gray-500/30',
  [PackageStates.EN_TRANSIT]: 'bg-blue-500/20   text-blue-300   border-blue-500/30',
  [PackageStates.ARRIVE]:     'bg-purple-500/20 text-purple-300 border-purple-500/30',
  [PackageStates.LIVRE]:      'bg-green-500/20  text-green-300  border-green-500/30',
  [PackageStates.RETOURNE]:   'bg-amber-500/20  text-amber-300  border-amber-500/30',
}

function StateBadge({ state }: { state: PackageStates }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${STATE_STYLE[state]}`}>
      {STATE_LABEL[state]}
    </span>
  )
}

function typeBadgeStyle(name: string) {
  if (name.toLowerCase().includes('gp'))     return 'bg-[#D16E41]/20 text-[#D16E41] border-[#D16E41]/30'
  if (name.toLowerCase().includes('relais')) return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
  return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const PKG_PAGE_SIZE = 5

export default function PersonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router  = useRouter()
  const qc      = useQueryClient()

  const [pkgStateFilter, setPkgStateFilter] = useState<PackageStates | ''>('')
  const [pkgPage, setPkgPage]               = useState(1)

  // Compte inline
  const [showAccountForm, setShowAccountForm] = useState(false)
  const [accEmail,    setAccEmail]    = useState('')
  const [accPassword, setAccPassword] = useState('')
  const [accRoleId,   setAccRoleId]   = useState('')

  const { data: person, isLoading } = useQuery({
    queryKey: ['person', id],
    queryFn:  () => personsApi.getById(id),
  })

  const { data: roles = [] } = useQuery({
    queryKey: ['ref-roles'],
    queryFn:  referenceApi.roles,
    enabled:  showAccountForm,
  })

  const createAccountMutation = useMutation({
    mutationFn: () => accountsApi.create({
      email:    accEmail,
      password: accPassword,
      roleId:   accRoleId,
      personId: id,
    }),
    onSuccess: () => {
      toast.success('Compte créé avec succès')
      qc.invalidateQueries({ queryKey: ['person', id] })
      setShowAccountForm(false)
      setAccEmail(''); setAccPassword(''); setAccRoleId('')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error?.message ?? 'Erreur lors de la création du compte')
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-[#D16E41]" />
      </div>
    )
  }

  if (!person) {
    return <div className="text-center py-16 text-gray-400">Client introuvable</div>
  }

  // ── Données dérivées ────────────────────────────────────────────────────────

  const allPackages = person.packages ?? []

  const filteredPackages = pkgStateFilter
    ? allPackages.filter((p) => getPackageState(p) === pkgStateFilter)
    : allPackages

  const totalPkgPages  = Math.ceil(filteredPackages.length / PKG_PAGE_SIZE)
  const pagedPackages  = filteredPackages.slice((pkgPage - 1) * PKG_PAGE_SIZE, pkgPage * PKG_PAGE_SIZE)

  const allPayments    = allPackages.flatMap((p) => p.payments ?? [])
  const acceptedPayments = allPayments.filter((p) => p.accepted && !p.refunded)
  const totalXof       = acceptedPayments.reduce((s, p) => s + (p.amountXof ?? 0), 0)

  const nbEnCours = allPackages.filter((p) => {
    const s = getPackageState(p)
    return s === PackageStates.EN_TRANSIT || s === PackageStates.ARRIVE
  }).length

  const nbLivres = allPackages.filter((p) => getPackageState(p) === PackageStates.LIVRE).length

  const isRelais  = person.personType?.name?.toLowerCase().includes('relais')
  const hasRelay  = isRelais && (person.relays?.length ?? 0) > 0

  return (
    <div className="p-6">

      {/* ── Header ── */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Retour à la liste</span>
        </button>

        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="text-2xl font-bold text-white">
                {person.firstName} {person.lastName}
              </h1>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${typeBadgeStyle(person.personType?.name ?? '')}`}>
                {person.personType?.name?.toUpperCase()}
              </span>
              {person.account ? (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-300 border border-green-500/30">
                  <UserCheck className="w-3 h-3" /> Compte actif
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-400 border border-gray-500/30">
                  Sans compte
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-gray-400 text-sm">
              <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{person.mobile}</span>
              <span>·</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Inscrit le {fmtDate(person.createdAt)}</span>
            </div>
          </div>

          {/* Actions header */}
          <div className="flex items-center gap-2 flex-wrap">
            {!person.account && (
              <button
                onClick={() => setShowAccountForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#D16E41] hover:bg-[#E07D52] text-white rounded-lg text-sm transition-colors"
              >
                <Shield className="w-4 h-4" />
                Créer un compte
              </button>
            )}
            <button
              onClick={() => router.push('/packages')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nouveau colis
            </button>
          </div>
        </div>
      </div>

      {/* ── Modal création compte ── */}
      {showAccountForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-sm w-full mx-4 space-y-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#D16E41]" />
              Créer un compte pour {person.firstName}
            </h3>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Email *</label>
              <input
                type="email"
                value={accEmail}
                onChange={(e) => setAccEmail(e.target.value)}
                placeholder="email@exemple.com"
                className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D16E41]"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Mot de passe *</label>
              <input
                type="password"
                value={accPassword}
                onChange={(e) => setAccPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D16E41]"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Rôle *</label>
              <select
                value={accRoleId}
                onChange={(e) => setAccRoleId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D16E41]"
              >
                <option value="">Sélectionner</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <button
                onClick={() => { setShowAccountForm(false); setAccEmail(''); setAccPassword(''); setAccRoleId('') }}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600"
              >
                Annuler
              </button>
              <button
                onClick={() => createAccountMutation.mutate()}
                disabled={!accEmail || !accPassword || !accRoleId || createAccountMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-[#D16E41] hover:bg-[#E07D52] text-white rounded-lg text-sm disabled:opacity-50"
              >
                {createAccountMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Créer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total colis',    value: allPackages.length,  icon: Package,     color: 'text-[#D16E41]',  bg: 'bg-[#D16E41]/10' },
          { label: 'Payé (XOF)',     value: fmtXof(totalXof),    icon: DollarSign,  color: 'text-green-400',  bg: 'bg-green-500/10'  },
          { label: 'En cours',       value: nbEnCours,           icon: Truck,       color: 'text-blue-400',   bg: 'bg-blue-500/10'   },
          { label: 'Livrés',         value: nbLivres,            icon: CheckCircle, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        ].map((s) => (
          <div key={s.label} className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className={`${s.bg} p-2 rounded-lg`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-gray-400 text-xs">{s.label}</p>
                <p className="text-lg font-bold text-white">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Grille principale ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ══ Colonne gauche (2/3) ══ */}
        <div className="lg:col-span-2 space-y-6">

          {/* Section colis */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-[#D16E41]" />
                Historique des colis
              </h2>
              <select
                value={pkgStateFilter}
                onChange={(e) => { setPkgStateFilter(e.target.value as PackageStates | ''); setPkgPage(1) }}
                className="px-3 py-1.5 bg-gray-700 text-white border border-gray-600 rounded-lg text-sm focus:outline-none"
              >
                <option value="">Tous les statuts</option>
                {Object.entries(STATE_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            {filteredPackages.length === 0 ? (
              <p className="text-gray-500 text-sm py-4">Aucun colis</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        {['Référence', 'Départ GP', 'Statut', 'Natures', 'Montant', 'Date'].map((h) => (
                          <th key={h} className="py-2 px-3 text-left text-xs font-medium text-gray-400 uppercase">{h}</th>
                        ))}
                        <th className="py-2 px-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {pagedPackages.map((pkg) => {
                        const state   = getPackageState(pkg)
                        const payment = pkg.payments?.find((p) => p.accepted && !p.refunded)
                        const dep     = pkg.departureGp
                        return (
                          <tr key={pkg.id} className="hover:bg-gray-700/40 transition-colors">
                            <td className="py-3 px-3 font-mono text-xs text-[#D16E41]">#{pkg.reference}</td>
                            <td className="py-3 px-3 text-gray-300 text-xs">
                              {dep ? `${dep.departureAddress?.city} → ${dep.destinationAddress?.city}` : '—'}
                            </td>
                            <td className="py-3 px-3"><StateBadge state={state} /></td>
                            <td className="py-3 px-3 text-gray-400 text-xs">
                              {pkg.natures?.map((n) => `${n.nature.name} ×${n.quantity}`).join(', ') || '—'}
                            </td>
                            <td className="py-3 px-3 text-white text-xs font-medium">
                              {payment ? fmtXof(payment.amountXof) : '—'}
                            </td>
                            <td className="py-3 px-3 text-gray-400 text-xs">{fmtDate(pkg.createdAt)}</td>
                            <td className="py-3 px-3">
                              <button
                                onClick={() => router.push(`/packages/${pkg.id}`)}
                                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {totalPkgPages > 1 && (
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
                    <p className="text-xs text-gray-400">{filteredPackages.length} colis</p>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setPkgPage((p) => Math.max(1, p - 1))}
                        disabled={pkgPage === 1}
                        className="px-2.5 py-1 bg-gray-700 text-gray-300 rounded text-xs hover:bg-gray-600 disabled:opacity-40"
                      >Préc.</button>
                      {Array.from({ length: totalPkgPages }, (_, i) => i + 1).map((p) => (
                        <button
                          key={p}
                          onClick={() => setPkgPage(p)}
                          className={`px-2.5 py-1 rounded text-xs ${pkgPage === p ? 'bg-[#D16E41] text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        >{p}</button>
                      ))}
                      <button
                        onClick={() => setPkgPage((p) => Math.min(totalPkgPages, p + 1))}
                        disabled={pkgPage === totalPkgPages}
                        className="px-2.5 py-1 bg-gray-700 text-gray-300 rounded text-xs hover:bg-gray-600 disabled:opacity-40"
                      >Suiv.</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Section paiements */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              Historique des paiements
            </h2>

            {allPayments.length === 0 ? (
              <p className="text-gray-500 text-sm py-4">Aucun paiement</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      {['Montant', 'Devise', 'Montant XOF', 'Méthode', 'Statut', 'Date', 'Facture'].map((h) => (
                        <th key={h} className="py-2 px-3 text-left text-xs font-medium text-gray-400 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {allPayments.map((pay) => (
                      <tr key={pay.id} className="hover:bg-gray-700/40 transition-colors">
                        <td className="py-3 px-3 text-white font-medium">{pay.amount.toFixed(2)}</td>
                        <td className="py-3 px-3 text-gray-300">{pay.currency?.code}</td>
                        <td className="py-3 px-3 text-gray-300">{fmtXof(pay.amountXof)}</td>
                        <td className="py-3 px-3 text-gray-400 text-xs">{pay.paymentMethod?.name}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                            pay.refunded
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : pay.accepted
                              ? 'bg-green-500/20 text-green-300 border-green-500/30'
                              : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                          }`}>
                            {pay.refunded ? 'Remboursé' : pay.accepted ? 'Accepté' : 'En attente'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-gray-400 text-xs">{fmtDate(pay.createdAt)}</td>
                        <td className="py-3 px-3">
                          {pay.linkInvoice ? (
                            <a
                              href={pay.linkInvoice}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              Voir
                            </a>
                          ) : (
                            <span className="text-gray-600 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ══ Colonne droite (1/3) ══ */}
        <div className="space-y-6">

          {/* Infos personnelles */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#D16E41]" />
              Informations
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Prénom</p>
                <p className="text-sm text-white">{person.firstName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Nom</p>
                <p className="text-sm text-white">{person.lastName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Mobile</p>
                <p className="text-sm text-white">{person.mobile}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Type</p>
                <p className="text-sm text-white">
                  {person.personType?.name?.toUpperCase()}
                  {(person.personType?.remise ?? 0) > 0 && (
                    <span className="ml-2 text-xs text-[#D16E41]">— {person.personType.remise}% de remise</span>
                  )}
                </p>
              </div>
              {person.account && (
                <div className="pt-2 border-t border-gray-700">
                  <p className="text-xs text-gray-500 mb-0.5">Email du compte</p>
                  <p className="text-sm text-white">{person.account.email}</p>
                  <p className="text-xs text-gray-500 mt-1">Rôle : <span className="text-gray-300">{person.account.role?.name}</span></p>
                </div>
              )}
            </div>
          </div>

          {/* Relais (si type RELAIS) */}
          {isRelais && (
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-400" />
                Relais associé
              </h2>
              {!hasRelay ? (
                <p className="text-gray-500 text-sm">Aucun relais configuré</p>
              ) : (
                person.relays.map((relay) => (
                  <div key={relay.id} className="space-y-2">
                    <p className="text-sm font-medium text-white">{relay.name}</p>
                    {relay.address && (
                      <p className="text-xs text-gray-400">
                        {relay.address.city}, {relay.address.country}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Contact WhatsApp */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <a
              href={`https://wa.me/${person.mobile.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Contacter par WhatsApp
            </a>
          </div>

        </div>
      </div>
    </div>
  )
}
