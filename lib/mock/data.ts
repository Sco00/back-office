// ── Données mockées — back-office YobbalGP ────────────────────────────────────
// Utilisées temporairement pendant la génération des maquettes Figma.

import type {
  Currency, PaymentMethod, Nature, Role, PersonType,
  Address, Person, Relay, RelayDetail,
  Departure, DepartureDetail, DepartureStatus,
  Package, PackageStatus, PackageNature, PackageStates,
  Payment, Account,
  PersonDetail,
  AddressDetail,
} from '@/lib/types/api.types'
import { DepartureStates } from '@/lib/types/api.types'
import type { DashboardData } from '@/lib/api/dashboard.api'

// ─── Référentiels ─────────────────────────────────────────────────────────────

export const MOCK_CURRENCIES: Currency[] = [
  { id: 'cur-eur', name: 'Euro',          symbol: '€',   code: 'EUR' },
  { id: 'cur-xof', name: 'Franc CFA',     symbol: 'XOF', code: 'XOF' },
  { id: 'cur-usd', name: 'Dollar US',     symbol: '$',   code: 'USD' },
]

export const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'pm-wave',  name: 'Wave' },
  { id: 'pm-om',    name: 'Orange Money' },
  { id: 'pm-cb',    name: 'Carte Bancaire' },
  { id: 'pm-esp',   name: 'Espèces' },
]

export const MOCK_NATURES: Nature[] = [
  { id: 'nat-01', name: 'Vêtements',    unitPrice: 1500 },
  { id: 'nat-02', name: 'Électronique', unitPrice: 5000 },
  { id: 'nat-03', name: 'Médicaments',  unitPrice: 2000 },
  { id: 'nat-04', name: 'Alimentaire',  unitPrice: 1000 },
  { id: 'nat-05', name: 'Cosmétique',   unitPrice: 1800 },
]

export const MOCK_ROLES: Role[] = [
  { id: 'role-admin', name: 'ADMIN' },
  { id: 'role-agent', name: 'AGENT' },
]

export const MOCK_PERSON_TYPES: PersonType[] = [
  { id: 'pt-client', name: 'CLIENT',      remise: 0 },
  { id: 'pt-gp',     name: 'GP',          remise: 10 },
  { id: 'pt-gest',   name: 'GESTIONNAIRE',remise: 5 },
]

// ─── Adresses ─────────────────────────────────────────────────────────────────

export const MOCK_ADDRESSES: Address[] = [
  { id: 'addr-01', city: 'Paris',     country: 'France',   region: 'Île-de-France',    type: 'SIMPLE', createdAt: '2024-01-05T08:00:00Z' },
  { id: 'addr-02', city: 'Marseille', country: 'France',   region: 'PACA',             type: 'SIMPLE', createdAt: '2024-01-06T08:00:00Z' },
  { id: 'addr-03', city: 'Lyon',      country: 'France',   region: 'Auvergne-Rhône',   type: 'SIMPLE', createdAt: '2024-01-07T08:00:00Z' },
  { id: 'addr-04', city: 'Dakar',     country: 'Sénégal',  region: 'Dakar',            type: 'RELAIS', createdAt: '2024-01-08T08:00:00Z' },
  { id: 'addr-05', city: 'Thiès',     country: 'Sénégal',  region: 'Thiès',            type: 'RELAIS', createdAt: '2024-01-09T08:00:00Z' },
  { id: 'addr-06', city: 'Touba',     country: 'Sénégal',  region: 'Diourbel',         type: 'RELAIS', createdAt: '2024-01-10T08:00:00Z' },
  { id: 'addr-07', city: 'Bordeaux',  country: 'France',   region: 'Nouvelle-Aquitaine',type: 'SIMPLE', createdAt: '2024-02-01T08:00:00Z' },
  { id: 'addr-08', city: 'Saint-Louis',country: 'Sénégal', region: 'Saint-Louis',      type: 'RELAIS', createdAt: '2024-02-02T08:00:00Z' },
]

// ─── Personnes ────────────────────────────────────────────────────────────────

export const MOCK_PERSONS: Person[] = [
  { id: 'per-01', firstName: 'Amadou',   lastName: 'Diallo',   mobile: '+33 6 12 34 56 78', personType: MOCK_PERSON_TYPES[0], createdAt: '2024-01-10T10:00:00Z', _count: { packages: 12 }, totalSpent: 1_250_000 },
  { id: 'per-02', firstName: 'Fatou',    lastName: 'Sow',      mobile: '+33 6 23 45 67 89', personType: MOCK_PERSON_TYPES[0], createdAt: '2024-01-15T10:00:00Z', _count: { packages: 8  }, totalSpent:   820_000 },
  { id: 'per-03', firstName: 'Moussa',   lastName: 'Ndiaye',   mobile: '+33 7 34 56 78 90', personType: MOCK_PERSON_TYPES[1], createdAt: '2024-01-20T10:00:00Z', _count: { packages: 45 }, totalSpent: 4_320_000 },
  { id: 'per-04', firstName: 'Aissatou', lastName: 'Ba',       mobile: '+33 6 45 67 89 01', personType: MOCK_PERSON_TYPES[0], createdAt: '2024-02-01T10:00:00Z', _count: { packages: 6  }, totalSpent:   600_000 },
  { id: 'per-05', firstName: 'Ibrahim',  lastName: 'Cissé',    mobile: '+33 6 56 78 90 12', personType: MOCK_PERSON_TYPES[1], createdAt: '2024-02-05T10:00:00Z', _count: { packages: 30 }, totalSpent: 2_900_000 },
  { id: 'per-06', firstName: 'Mariama',  lastName: 'Traoré',   mobile: '+33 7 67 89 01 23', personType: MOCK_PERSON_TYPES[0], createdAt: '2024-02-10T10:00:00Z', _count: { packages: 4  }, totalSpent:   380_000 },
  { id: 'per-07', firstName: 'Ousmane',  lastName: 'Fall',     mobile: '+33 6 78 90 12 34', personType: MOCK_PERSON_TYPES[0], createdAt: '2024-02-20T10:00:00Z', _count: { packages: 9  }, totalSpent:   910_000 },
  { id: 'per-08', firstName: 'Rokhaya',  lastName: 'Diop',     mobile: '+33 6 89 01 23 45', personType: MOCK_PERSON_TYPES[0], createdAt: '2024-03-01T10:00:00Z', _count: { packages: 3  }, totalSpent:   290_000 },
  { id: 'per-09', firstName: 'Seydou',   lastName: 'Koné',     mobile: '+33 7 90 12 34 56', personType: MOCK_PERSON_TYPES[2], createdAt: '2024-03-05T10:00:00Z', _count: { packages: 0  }, totalSpent: 0 },
  { id: 'per-10', firstName: 'Coumba',   lastName: 'Sarr',     mobile: '+33 6 01 23 45 67', personType: MOCK_PERSON_TYPES[0], createdAt: '2024-03-10T10:00:00Z', _count: { packages: 15 }, totalSpent: 1_480_000 },
]

// ─── Relais ───────────────────────────────────────────────────────────────────

export const MOCK_RELAYS: Relay[] = [
  { id: 'rel-01', name: 'Relais Dakar Centre',  person: MOCK_PERSONS[2], address: MOCK_ADDRESSES[3], createdAt: '2024-01-25T08:00:00Z' },
  { id: 'rel-02', name: 'Relais Thiès Marché',  person: MOCK_PERSONS[4], address: MOCK_ADDRESSES[4], createdAt: '2024-02-08T08:00:00Z' },
  { id: 'rel-03', name: 'Relais Touba Serigne', person: MOCK_PERSONS[2], address: MOCK_ADDRESSES[5], createdAt: '2024-02-15T08:00:00Z' },
]

// ─── Statuts départ ───────────────────────────────────────────────────────────

const depStatus = (id: string, depId: string, state: DepartureStates, date: string): DepartureStatus =>
  ({ id, departureGpId: depId, state, createdAt: date })

// ─── Départs ─────────────────────────────────────────────────────────────────

export const MOCK_DEPARTURES: Departure[] = [
  {
    id: 'dep-01', departureDate: '2025-03-10T06:00:00Z', arrivalDate: '2025-03-14T18:00:00Z',
    deadline: '2025-03-07T23:59:00Z', price: 3500, priceGp: 3000,
    currency: MOCK_CURRENCIES[0], departureAddress: MOCK_ADDRESSES[0], destinationAddress: MOCK_ADDRESSES[3],
    isClosed: false, person: MOCK_PERSONS[2],
    creator: { id: 'acc-admin', email: 'admin@yobbalgp.com' },
    statuses: [
      depStatus('ds-01a', 'dep-01', DepartureStates.EN_ATTENTE, '2025-03-01T08:00:00Z'),
      depStatus('ds-01b', 'dep-01', DepartureStates.EN_TRANSIT, '2025-03-10T08:00:00Z'),
    ],
    createdAt: '2025-03-01T08:00:00Z',
  },
  {
    id: 'dep-02', departureDate: '2025-04-02T06:00:00Z', arrivalDate: '2025-04-06T18:00:00Z',
    deadline: '2025-03-30T23:59:00Z', price: 3200, priceGp: 2800,
    currency: MOCK_CURRENCIES[0], departureAddress: MOCK_ADDRESSES[1], destinationAddress: MOCK_ADDRESSES[3],
    isClosed: false, person: MOCK_PERSONS[4],
    creator: { id: 'acc-admin', email: 'admin@yobbalgp.com' },
    statuses: [
      depStatus('ds-02a', 'dep-02', DepartureStates.EN_ATTENTE, '2025-03-20T08:00:00Z'),
    ],
    createdAt: '2025-03-20T08:00:00Z',
  },
  {
    id: 'dep-03', departureDate: '2025-02-15T06:00:00Z', arrivalDate: '2025-02-19T18:00:00Z',
    deadline: '2025-02-12T23:59:00Z', price: 3800, priceGp: 3200, insurancePrice: 200,
    currency: MOCK_CURRENCIES[0], departureAddress: MOCK_ADDRESSES[2], destinationAddress: MOCK_ADDRESSES[4],
    isClosed: true, person: MOCK_PERSONS[2],
    creator: { id: 'acc-admin', email: 'admin@yobbalgp.com' },
    statuses: [
      depStatus('ds-03a', 'dep-03', DepartureStates.EN_ATTENTE, '2025-02-05T08:00:00Z'),
      depStatus('ds-03b', 'dep-03', DepartureStates.EN_TRANSIT, '2025-02-15T08:00:00Z'),
      depStatus('ds-03c', 'dep-03', DepartureStates.ARRIVE,     '2025-02-19T20:00:00Z'),
    ],
    createdAt: '2025-02-05T08:00:00Z',
  },
  {
    id: 'dep-04', departureDate: '2025-04-20T06:00:00Z', arrivalDate: '2025-04-24T18:00:00Z',
    deadline: '2025-04-17T23:59:00Z', price: 3600, priceGp: 3100,
    currency: MOCK_CURRENCIES[0], departureAddress: MOCK_ADDRESSES[0], destinationAddress: MOCK_ADDRESSES[5],
    isClosed: false, person: MOCK_PERSONS[4],
    creator: { id: 'acc-admin', email: 'admin@yobbalgp.com' },
    statuses: [
      depStatus('ds-04a', 'dep-04', DepartureStates.EN_ATTENTE, '2025-04-05T08:00:00Z'),
    ],
    createdAt: '2025-04-05T08:00:00Z',
  },
  {
    id: 'dep-05', departureDate: '2025-01-20T06:00:00Z', arrivalDate: '2025-01-24T18:00:00Z',
    deadline: '2025-01-17T23:59:00Z', price: 3000, priceGp: 2500,
    currency: MOCK_CURRENCIES[0], departureAddress: MOCK_ADDRESSES[6], destinationAddress: MOCK_ADDRESSES[3],
    isClosed: true, person: MOCK_PERSONS[2],
    creator: { id: 'acc-admin', email: 'admin@yobbalgp.com' },
    statuses: [
      depStatus('ds-05a', 'dep-05', DepartureStates.EN_ATTENTE, '2025-01-10T08:00:00Z'),
      depStatus('ds-05b', 'dep-05', DepartureStates.EN_TRANSIT, '2025-01-20T08:00:00Z'),
      depStatus('ds-05c', 'dep-05', DepartureStates.ARRIVE,     '2025-01-24T20:00:00Z'),
    ],
    createdAt: '2025-01-10T08:00:00Z',
  },
]

// ─── Colis ────────────────────────────────────────────────────────────────────

const pkgNature = (id: string, pkgId: string, nat: Nature, qty: number): PackageNature => ({
  id, packageId: pkgId, natureId: nat.id, quantity: qty,
  price: nat.unitPrice * qty, createdAt: '2025-03-01T08:00:00Z', nature: nat,
})

const pkgStatus = (id: string, pkgId: string, state: PackageStates, date: string): PackageStatus =>
  ({ id, packageId: pkgId, state, createdAt: date })

import { PackageStates as PS } from '@/lib/types/api.types'

export const MOCK_PACKAGES: Package[] = [
  {
    id: 'pkg-01', reference: 'YBG-2025-001', weight: 8.5,
    isCompleted: true, isArchived: false,
    recipientName: 'Cheikh Diallo', recipientPhone: '+221 77 123 45 67',
    departureGp: MOCK_DEPARTURES[0], person: MOCK_PERSONS[0], relay: MOCK_RELAYS[0],
    natures: [pkgNature('pn-01a', 'pkg-01', MOCK_NATURES[0], 3), pkgNature('pn-01b', 'pkg-01', MOCK_NATURES[4], 2)],
    statuses: [pkgStatus('ps-01a', 'pkg-01', PS.EN_ATTENTE, '2025-03-01T09:00:00Z'), pkgStatus('ps-01b', 'pkg-01', PS.EN_TRANSIT, '2025-03-10T09:00:00Z')],
    payments: [], creator: { id: 'acc-admin', email: 'admin@yobbalgp.com' }, createdAt: '2025-03-01T09:00:00Z',
  },
  {
    id: 'pkg-02', reference: 'YBG-2025-002', weight: 12.0,
    isCompleted: true, isArchived: false,
    recipientName: 'Ndèye Sarr', recipientPhone: '+221 78 234 56 78',
    departureGp: MOCK_DEPARTURES[0], person: MOCK_PERSONS[1], relay: MOCK_RELAYS[0],
    natures: [pkgNature('pn-02a', 'pkg-02', MOCK_NATURES[1], 1)],
    statuses: [pkgStatus('ps-02a', 'pkg-02', PS.EN_ATTENTE, '2025-03-02T09:00:00Z'), pkgStatus('ps-02b', 'pkg-02', PS.EN_TRANSIT, '2025-03-10T09:00:00Z'), pkgStatus('ps-02c', 'pkg-02', PS.ARRIVE, '2025-03-14T20:00:00Z')],
    payments: [], creator: { id: 'acc-admin', email: 'admin@yobbalgp.com' }, createdAt: '2025-03-02T09:00:00Z',
  },
  {
    id: 'pkg-03', reference: 'YBG-2025-003', weight: 5.2,
    isCompleted: false, isArchived: false,
    recipientName: 'Mamadou Kouyaté', recipientPhone: '+221 76 345 67 89',
    departureGp: MOCK_DEPARTURES[1], person: MOCK_PERSONS[3], relay: undefined,
    natures: [pkgNature('pn-03a', 'pkg-03', MOCK_NATURES[2], 4)],
    statuses: [pkgStatus('ps-03a', 'pkg-03', PS.EN_ATTENTE, '2025-03-21T09:00:00Z')],
    payments: [], creator: { id: 'acc-admin', email: 'admin@yobbalgp.com' }, createdAt: '2025-03-21T09:00:00Z',
  },
  {
    id: 'pkg-04', reference: 'YBG-2025-004', weight: 18.0,
    isCompleted: true, isArchived: false,
    recipientName: 'Awa Diatta', recipientPhone: '+221 70 456 78 90',
    departureGp: MOCK_DEPARTURES[2], person: MOCK_PERSONS[6], relay: MOCK_RELAYS[1],
    natures: [pkgNature('pn-04a', 'pkg-04', MOCK_NATURES[0], 5), pkgNature('pn-04b', 'pkg-04', MOCK_NATURES[3], 6)],
    statuses: [
      pkgStatus('ps-04a', 'pkg-04', PS.EN_ATTENTE, '2025-02-06T09:00:00Z'),
      pkgStatus('ps-04b', 'pkg-04', PS.EN_TRANSIT, '2025-02-15T09:00:00Z'),
      pkgStatus('ps-04c', 'pkg-04', PS.ARRIVE,     '2025-02-19T21:00:00Z'),
      pkgStatus('ps-04d', 'pkg-04', PS.LIVRE,      '2025-02-20T14:00:00Z'),
    ],
    payments: [], creator: { id: 'acc-admin', email: 'admin@yobbalgp.com' }, createdAt: '2025-02-06T09:00:00Z',
  },
  {
    id: 'pkg-05', reference: 'YBG-2025-005', weight: 3.0,
    isCompleted: true, isArchived: false,
    recipientName: 'Binta Faye', recipientPhone: '+221 77 567 89 01',
    departureGp: MOCK_DEPARTURES[2], person: MOCK_PERSONS[9], relay: MOCK_RELAYS[1],
    natures: [pkgNature('pn-05a', 'pkg-05', MOCK_NATURES[4], 2)],
    statuses: [
      pkgStatus('ps-05a', 'pkg-05', PS.EN_ATTENTE, '2025-02-07T09:00:00Z'),
      pkgStatus('ps-05b', 'pkg-05', PS.EN_TRANSIT, '2025-02-15T09:00:00Z'),
      pkgStatus('ps-05c', 'pkg-05', PS.ARRIVE,     '2025-02-19T21:00:00Z'),
      pkgStatus('ps-05d', 'pkg-05', PS.LIVRE,      '2025-02-21T10:00:00Z'),
    ],
    payments: [], creator: { id: 'acc-admin', email: 'admin@yobbalgp.com' }, createdAt: '2025-02-07T09:00:00Z',
  },
  {
    id: 'pkg-06', reference: 'YBG-2025-006', weight: 7.8,
    isCompleted: false, isArchived: false,
    recipientName: 'Lamine Mbaye', recipientPhone: '+221 78 678 90 12',
    departureGp: MOCK_DEPARTURES[3], person: MOCK_PERSONS[5], relay: MOCK_RELAYS[2],
    natures: [pkgNature('pn-06a', 'pkg-06', MOCK_NATURES[0], 2), pkgNature('pn-06b', 'pkg-06', MOCK_NATURES[1], 1)],
    statuses: [pkgStatus('ps-06a', 'pkg-06', PS.EN_ATTENTE, '2025-04-06T09:00:00Z')],
    payments: [], creator: { id: 'acc-admin', email: 'admin@yobbalgp.com' }, createdAt: '2025-04-06T09:00:00Z',
  },
  {
    id: 'pkg-07', reference: 'YBG-2025-007', weight: 22.5,
    isCompleted: true, isArchived: false,
    recipientName: 'Thierno Baldé', recipientPhone: '+221 76 789 01 23',
    departureGp: MOCK_DEPARTURES[4], person: MOCK_PERSONS[0], relay: MOCK_RELAYS[0],
    natures: [pkgNature('pn-07a', 'pkg-07', MOCK_NATURES[0], 8), pkgNature('pn-07b', 'pkg-07', MOCK_NATURES[2], 3)],
    statuses: [
      pkgStatus('ps-07a', 'pkg-07', PS.EN_ATTENTE, '2025-01-11T09:00:00Z'),
      pkgStatus('ps-07b', 'pkg-07', PS.EN_TRANSIT, '2025-01-20T09:00:00Z'),
      pkgStatus('ps-07c', 'pkg-07', PS.ARRIVE,     '2025-01-24T20:00:00Z'),
      pkgStatus('ps-07d', 'pkg-07', PS.LIVRE,      '2025-01-25T11:00:00Z'),
    ],
    payments: [], creator: { id: 'acc-admin', email: 'admin@yobbalgp.com' }, createdAt: '2025-01-11T09:00:00Z',
  },
  {
    id: 'pkg-08', reference: 'YBG-2025-008', weight: 9.0,
    isCompleted: true, isArchived: false,
    recipientName: 'Sokhna Diop', recipientPhone: '+221 70 890 12 34',
    departureGp: MOCK_DEPARTURES[4], person: MOCK_PERSONS[9], relay: MOCK_RELAYS[0],
    natures: [pkgNature('pn-08a', 'pkg-08', MOCK_NATURES[3], 10)],
    statuses: [
      pkgStatus('ps-08a', 'pkg-08', PS.EN_ATTENTE, '2025-01-12T09:00:00Z'),
      pkgStatus('ps-08b', 'pkg-08', PS.EN_TRANSIT, '2025-01-20T09:00:00Z'),
      pkgStatus('ps-08c', 'pkg-08', PS.ARRIVE,     '2025-01-24T20:00:00Z'),
      pkgStatus('ps-08d', 'pkg-08', PS.RETOURNE,   '2025-01-26T09:00:00Z'),
    ],
    payments: [], creator: { id: 'acc-admin', email: 'admin@yobbalgp.com' }, createdAt: '2025-01-12T09:00:00Z',
  },
  {
    id: 'pkg-09', reference: 'YBG-2025-009', weight: 4.5,
    isCompleted: false, isArchived: false,
    recipientName: 'Adama Sané', recipientPhone: '+221 77 901 23 45',
    departureGp: MOCK_DEPARTURES[1], person: MOCK_PERSONS[7], relay: undefined,
    natures: [pkgNature('pn-09a', 'pkg-09', MOCK_NATURES[4], 3)],
    statuses: [pkgStatus('ps-09a', 'pkg-09', PS.EN_ATTENTE, '2025-03-22T09:00:00Z')],
    payments: [], creator: { id: 'acc-admin', email: 'admin@yobbalgp.com' }, createdAt: '2025-03-22T09:00:00Z',
  },
  {
    id: 'pkg-10', reference: 'YBG-2025-010', weight: 14.0,
    isCompleted: true, isArchived: false,
    recipientName: 'Ibou Gaye', recipientPhone: '+221 78 012 34 56',
    departureGp: MOCK_DEPARTURES[0], person: MOCK_PERSONS[9], relay: MOCK_RELAYS[0],
    natures: [pkgNature('pn-10a', 'pkg-10', MOCK_NATURES[1], 2), pkgNature('pn-10b', 'pkg-10', MOCK_NATURES[0], 4)],
    statuses: [pkgStatus('ps-10a', 'pkg-10', PS.EN_ATTENTE, '2025-03-03T09:00:00Z'), pkgStatus('ps-10b', 'pkg-10', PS.EN_TRANSIT, '2025-03-10T09:00:00Z')],
    payments: [], creator: { id: 'acc-admin', email: 'admin@yobbalgp.com' }, createdAt: '2025-03-03T09:00:00Z',
  },
]

// ─── Paiements ────────────────────────────────────────────────────────────────

export const MOCK_PAYMENTS: Payment[] = [
  {
    id: 'pay-01', amount: 29750, amountXof: 19_500_000, exchangeRate: 655.957,
    currency: MOCK_CURRENCIES[0], paymentMethod: MOCK_PAYMENT_METHODS[0],
    package: MOCK_PACKAGES[0], accepted: true, refunded: false,
    remise: 5, remiseReason: 'Client fidèle', priceRelay: 1500,
    createdAt: '2025-03-01T10:00:00Z',
  },
  {
    id: 'pay-02', amount: 42000, amountXof: 27_550_140, exchangeRate: 655.957,
    currency: MOCK_CURRENCIES[0], paymentMethod: MOCK_PAYMENT_METHODS[1],
    package: MOCK_PACKAGES[1], accepted: true, refunded: false,
    createdAt: '2025-03-02T10:00:00Z',
  },
  {
    id: 'pay-03', amount: 18200, amountXof: 11_938_417, exchangeRate: 655.957,
    currency: MOCK_CURRENCIES[0], paymentMethod: MOCK_PAYMENT_METHODS[2],
    package: MOCK_PACKAGES[3], accepted: true, refunded: false,
    insurancePrice: 200, createdAt: '2025-02-06T10:00:00Z',
  },
  {
    id: 'pay-04', amount: 10500, amountXof: 6_887_549, exchangeRate: 655.957,
    currency: MOCK_CURRENCIES[0], paymentMethod: MOCK_PAYMENT_METHODS[0],
    package: MOCK_PACKAGES[4], accepted: true, refunded: false,
    createdAt: '2025-02-07T10:00:00Z',
  },
  {
    id: 'pay-05', amount: 78750, amountXof: 51_656_618, exchangeRate: 655.957,
    currency: MOCK_CURRENCIES[0], paymentMethod: MOCK_PAYMENT_METHODS[3],
    package: MOCK_PACKAGES[6], accepted: true, refunded: false,
    remise: 10, remiseReason: 'GP partenaire', createdAt: '2025-01-11T10:00:00Z',
  },
  {
    id: 'pay-06', amount: 31500, amountXof: 20_662_646, exchangeRate: 655.957,
    currency: MOCK_CURRENCIES[0], paymentMethod: MOCK_PAYMENT_METHODS[0],
    package: MOCK_PACKAGES[7], accepted: false, refunded: false,
    createdAt: '2025-01-12T10:00:00Z',
  },
  {
    id: 'pay-07', amount: 15750, amountXof: 10_331_323, exchangeRate: 655.957,
    currency: MOCK_CURRENCIES[0], paymentMethod: MOCK_PAYMENT_METHODS[1],
    package: MOCK_PACKAGES[2], accepted: false, refunded: false,
    createdAt: '2025-03-21T10:00:00Z',
  },
  {
    id: 'pay-08', amount: 27300, amountXof: 17_907_726, exchangeRate: 655.957,
    currency: MOCK_CURRENCIES[0], paymentMethod: MOCK_PAYMENT_METHODS[2],
    package: MOCK_PACKAGES[9], accepted: true, refunded: false,
    createdAt: '2025-03-03T10:00:00Z',
  },
]

// Relier les paiements aux colis
MOCK_PACKAGES[0].payments  = [MOCK_PAYMENTS[0]]
MOCK_PACKAGES[1].payments  = [MOCK_PAYMENTS[1]]
MOCK_PACKAGES[3].payments  = [MOCK_PAYMENTS[2]]
MOCK_PACKAGES[4].payments  = [MOCK_PAYMENTS[3]]
MOCK_PACKAGES[6].payments  = [MOCK_PAYMENTS[4]]
MOCK_PACKAGES[7].payments  = [MOCK_PAYMENTS[5]]
MOCK_PACKAGES[2].payments  = [MOCK_PAYMENTS[6]]
MOCK_PACKAGES[9].payments  = [MOCK_PAYMENTS[7]]

// ─── Détails étendus ──────────────────────────────────────────────────────────

export const MOCK_RELAY_DETAILS: RelayDetail[] = MOCK_RELAYS.map((r, i) => ({
  ...r,
  packages: MOCK_PACKAGES.filter((p) => p.relay?.id === r.id),
  _count: { packages: MOCK_PACKAGES.filter((p) => p.relay?.id === r.id).length },
}))

export const MOCK_DEPARTURE_DETAILS: DepartureDetail[] = MOCK_DEPARTURES.map((d) => ({
  ...d,
  packages: MOCK_PACKAGES.filter((p) => p.departureGp.id === d.id),
}))

export const MOCK_PERSON_DETAILS: PersonDetail[] = MOCK_PERSONS.map((p) => ({
  ...p,
  account: p.id === 'per-09' ? { id: 'acc-gest', email: 'seydou@yobbalgp.com', role: MOCK_ROLES[1], createdAt: '2024-03-05T08:00:00Z' } : null,
  packages: MOCK_PACKAGES.filter((pkg) => pkg.person.id === p.id),
  relays:   MOCK_RELAYS.filter((r) => r.person.id === p.id),
}))

export const MOCK_ADDRESS_DETAILS: AddressDetail[] = MOCK_ADDRESSES.map((a) => ({
  ...a,
  relays: MOCK_RELAYS.filter((r) => r.address.id === a.id).map((r) => ({ ...r, person: r.person })),
  departureGpsDepartures: MOCK_DEPARTURES
    .filter((d) => d.departureAddress.id === a.id)
    .map((d) => ({ ...d, destinationAddress: d.destinationAddress ?? null, person: d.person ?? null })) as AddressDetail['departureGpsDepartures'],
  departureGpsDestinations: MOCK_DEPARTURES
    .filter((d) => d.destinationAddress.id === a.id)
    .map((d) => ({ ...d, departureAddress: d.departureAddress ?? null, person: d.person ?? null })) as AddressDetail['departureGpsDestinations'],
}))

// ─── Comptes ──────────────────────────────────────────────────────────────────

export const MOCK_ACCOUNTS: Account[] = [
  { id: 'acc-admin', email: 'admin@yobbalgp.com', role: MOCK_ROLES[0], person: MOCK_PERSONS[8], createdAt: '2024-01-01T00:00:00Z' },
  { id: 'acc-gest',  email: 'seydou@yobbalgp.com', role: MOCK_ROLES[1], person: MOCK_PERSONS[8], createdAt: '2024-03-05T08:00:00Z' },
]

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const MOCK_DASHBOARD: DashboardData = {
  kpis: {
    totalColis:      MOCK_PACKAGES.length,
    totalKg:         MOCK_PACKAGES.reduce((s, p) => s + p.weight, 0),
    totalClients:    MOCK_PERSONS.filter((p) => p.personType.name === 'CLIENT').length,
    chiffreAffaires: MOCK_PAYMENTS.filter((p) => p.accepted).reduce((s, p) => s + p.amountXof, 0),
  },
  caMensuel: [
    { mois: 'Oct',  ca: 45_200_000 },
    { mois: 'Nov',  ca: 62_800_000 },
    { mois: 'Déc',  ca: 78_400_000 },
    { mois: 'Jan',  ca: 72_150_000 },
    { mois: 'Fév',  ca: 58_600_000 },
    { mois: 'Mar',  ca: 91_300_000 },
    { mois: 'Avr',  ca: 48_700_000 },
  ],
  colisParRoute: [
    { departureCity: 'Paris',     departureCountry: 'France', destinationCity: 'Dakar',  destinationCountry: 'Sénégal', nbColis: 42, ca: 138_250_000 },
    { departureCity: 'Marseille', departureCountry: 'France', destinationCity: 'Dakar',  destinationCountry: 'Sénégal', nbColis: 28, ca:  89_600_000 },
    { departureCity: 'Lyon',      departureCountry: 'France', destinationCity: 'Thiès',  destinationCountry: 'Sénégal', nbColis: 18, ca:  57_800_000 },
    { departureCity: 'Bordeaux',  departureCountry: 'France', destinationCity: 'Dakar',  destinationCountry: 'Sénégal', nbColis: 12, ca:  38_400_000 },
    { departureCity: 'Paris',     departureCountry: 'France', destinationCity: 'Touba',  destinationCountry: 'Sénégal', nbColis:  9, ca:  28_800_000 },
  ],
  repartitionClients: { nouveaux: 34, recurrents: 89 },
  statutsParMois: [
    { mois: 'Jan', EN_ATTENTE: 12, EN_TRANSIT: 8,  ARRIVE: 6,  LIVRE: 18, RETOURNE: 2 },
    { mois: 'Fév', EN_ATTENTE: 15, EN_TRANSIT: 10, ARRIVE: 8,  LIVRE: 22, RETOURNE: 1 },
    { mois: 'Mar', EN_ATTENTE: 20, EN_TRANSIT: 14, ARRIVE: 11, LIVRE: 30, RETOURNE: 3 },
    { mois: 'Avr', EN_ATTENTE: 18, EN_TRANSIT: 9,  ARRIVE: 5,  LIVRE: 12, RETOURNE: 1 },
  ],
  derniersColis: MOCK_PACKAGES.slice(0, 8).map((p) => ({
    id:              p.id,
    reference:       p.reference,
    weight:          p.weight,
    createdAt:       p.createdAt,
    firstName:       p.person.firstName,
    lastName:        p.person.lastName,
    departureCity:   p.departureGp.departureAddress.city,
    destinationCity: p.departureGp.destinationAddress.city,
    currentState:    p.statuses[p.statuses.length - 1]?.state ?? 'EN_ATTENTE',
    amount:          p.payments[0]?.amount ?? null,
  })),
  topClients: [
    { id: 'per-10', firstName: 'Coumba',   lastName: 'Sarr',   nbColis: 15, totalCa: 1_480_000 },
    { id: 'per-01', firstName: 'Amadou',   lastName: 'Diallo', nbColis: 12, totalCa: 1_250_000 },
    { id: 'per-07', firstName: 'Ousmane',  lastName: 'Fall',   nbColis:  9, totalCa:   910_000 },
    { id: 'per-02', firstName: 'Fatou',    lastName: 'Sow',    nbColis:  8, totalCa:   820_000 },
    { id: 'per-04', firstName: 'Aissatou', lastName: 'Ba',     nbColis:  6, totalCa:   600_000 },
  ],
}

// ─── Helper pagination ────────────────────────────────────────────────────────

export function paginate<T>(items: T[], page = 1, limit = 10) {
  const start = (page - 1) * limit
  return {
    props: items.slice(start, start + limit),
    total: items.length,
    page,
    limit,
  }
}
