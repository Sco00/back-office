// ─── Enums ────────────────────────────────────────────────────────────────────

export enum DepartureStates {
  EN_ATTENTE = 'EN_ATTENTE',
  EN_TRANSIT = 'EN_TRANSIT',
  ARRIVE     = 'ARRIVE',
}

export enum PackageStates {
  EN_ATTENTE = 'EN_ATTENTE',
  EN_TRANSIT = 'EN_TRANSIT',
  ARRIVE     = 'ARRIVE',
  LIVRE      = 'LIVRE',
  RETOURNE   = 'RETOURNE',
}

// ─── Réponses API génériques ──────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean
  message: string
  data:    T
}

export interface PaginatedData<T> {
  props: T[]
  total: number
  page:  number
  limit: number
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginResponse {
  accessToken:  string
  refreshToken: string
  user: {
    id:     string
    email:  string
    role:   string
    person: { firstName: string; lastName: string }
  }
}

export interface RefreshResponse {
  accessToken: string
}

// ─── Entités ─────────────────────────────────────────────────────────────────

export interface PersonType {
  id:     string
  name:   string
  remise: number
}

export interface Person {
  id:           string
  firstName:    string
  lastName:     string
  mobile:       string
  personType:   PersonType
  createdAt:    string
  _count:       { packages: number }
  totalSpent?:  number
}

export interface Currency {
  id:     string
  name:   string
  symbol: string
  code:   string
}

export type AddressType = 'SIMPLE' | 'RELAIS'

export interface Address {
  id:        string
  city:      string
  country:   string
  region:    string
  locality?: string
  latitude?: number
  longitude?: number
  type:      AddressType
  createdAt: string
}

export interface AddressDetail extends Address {
  relays: (Relay & { person: Person | null })[]
  departureGpsDepartures:   (Departure & { destinationAddress: Address | null; person: Person | null })[]
  departureGpsDestinations: (Departure & { departureAddress:   Address | null; person: Person | null })[]
}

export interface AddressFilters {
  search?:  string
  country?: string
  region?:  string
  city?:    string
  type?:    AddressType
  page?:    number
  limit?:   number
}

export interface CreateAddressDTO {
  country:   string
  region:    string
  city:      string
  locality?: string
  type:      AddressType
  latitude?: number
  longitude?: number
}

export interface Relay {
  id:        string
  name:      string
  person:    Person
  address:   Address
  createdAt: string
}

export interface Nature {
  id:        string
  name:      string
  unitPrice: number
}

export interface PackageStatus {
  id:        string
  packageId: string
  state:     PackageStates
  createdAt: string
}

export interface PackageNature {
  id:        string
  packageId: string
  natureId:  string
  quantity:  number
  price:     number
  createdAt: string
  nature:    Nature
}

export interface PaymentMethod {
  id:   string
  name: string
}

export interface DepartureStatus {
  id:            string
  departureGpId: string
  state:         DepartureStates
  createdAt:     string
}

export interface Departure {
  id:                  string
  departureDate:       string
  arrivalDate:         string
  deadline:            string
  price:               number
  priceGp:             number
  insurancePrice?:     number
  currency:            Currency
  departureAddress:    Address
  destinationAddress:  Address
  isClosed:            boolean
  person?:             Person
  creator?:            { id: string; email: string }
  statuses:            DepartureStatus[]
  createdAt:           string
}

export const getDepartureState = (dep: Departure): DepartureStates =>
  dep.statuses?.length
    ? [...dep.statuses].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].state
    : DepartureStates.EN_ATTENTE

export interface Package {
  id:          string
  reference:   string
  weight:      number
  isCompleted: boolean
  isArchived:  boolean
  departureGp: Departure
  person:      Person
  relay?:      Relay
  natures:     PackageNature[]
  statuses:    PackageStatus[]
  payments:    Payment[]
  creator:     { id: string; email: string }
  createdAt:   string
}

// Helper pour obtenir le statut courant d'un colis
export const getPackageState = (pkg: Package): PackageStates =>
  pkg.statuses?.length
    ? pkg.statuses[pkg.statuses.length - 1].state
    : PackageStates.EN_ATTENTE

export interface Payment {
  id:              string
  amount:          number
  amountXof:       number
  exchangeRate:    number
  currency:        Currency
  paymentMethod:   PaymentMethod
  package:         Package
  accepted:        boolean
  refunded:        boolean
  remise?:         number
  remiseReason?:   string
  priceRelay?:     number
  insurancePrice?: number
  linkInvoice?:    string
  createdAt:       string
}

export interface Role {
  id:   string
  name: string
}

export interface Account {
  id:        string
  email:     string
  role:      Role
  person:    Person
  createdAt: string
}

export interface PersonDetail extends Person {
  account?: { id: string; email: string; role: Role; createdAt: string } | null
  packages: Package[]
  relays:   Relay[]
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface LoginDTO {
  email:    string
  password: string
}

export interface CreatePackagePaymentDTO {
  amount:          number
  currencyId:      string
  paymentMethodId: string
  remise?:         number
  remiseReason?:   string
  insurancePrice?: number
}

export interface CreatePackageDTO {
  weight:         number
  departureGpId:  string
  personId:       string
  relayId?:       string | null
  packageNatures: { natureId: string; quantity: number }[]
  payment?:       CreatePackagePaymentDTO
}

export interface PackageFilters {
  search?:             string
  state?:              PackageStates
  createdAtFrom?:      string
  departureCountry?:   string
  destinationCountry?: string
  currencyId?:         string
  unpaidOnly?:         boolean
  page?:               number
  limit?:              number
}

export interface CreateDepartureDTO {
  departureDate:        string
  arrivalDate:          string
  deadline:             string
  price:                number
  priceGp:              number
  currencyId:           string
  departureAddressId:   string
  destinationAddressId: string
  personId?:            string
  insurancePrice?:      number
}

export interface DepartureFilters {
  departureCountry?:   string
  destinationCountry?: string
  currencyId?:         string
  isClosed?:           boolean
  departureDateFrom?:  string
  search?:             string
  page?:               number
  limit?:              number
}

export interface CreatePaymentDTO {
  amount:          number
  currencyId:      string
  paymentMethodId: string
  packageId:       string
  linkInvoice?:    string
  remise?:         number
  remiseReason?:   string
  priceRelay?:     number
  insurancePrice?: number
}

export interface PaymentFilters {
  packageId?:       string
  accepted?:        boolean
  refunded?:        boolean
  currencyId?:      string
  paymentMethodId?: string
  createdAtFrom?:   string
  page?:            number
  limit?:           number
}

export interface CreatePersonDTO {
  firstName:    string
  lastName:     string
  mobile:       string
  personTypeId: string
}

export interface PersonFilters {
  search?:       string
  personTypeId?: string
  hasPackages?:  boolean
  page?:         number
  limit?:        number
}

export interface CreateRelayDTO {
  name:      string
  personId:  string
  addressId: string
}

export interface RelayFilters {
  search?:  string
  country?: string
  region?:  string
  city?:    string
  page?:    number
  limit?:   number
}

export interface RelayDetail extends Relay {
  packages: Package[]
  _count:   { packages: number }
}

export interface DepartureDetail extends Departure {
  packages: Package[]
}

export interface CreateAccountDTO {
  email:        string
  password:     string
  roleId:       string
  personId?:    string
  firstName?:   string
  lastName?:    string
  mobile?:      string
  personTypeId?: string
}
