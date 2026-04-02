# Back-Office — Plateforme de gestion logistique GP

Interface d'administration pour la gestion des départs, colis, personnes, paiements, relais et adresses.

## Stack technique

| Couche | Technologie |
|---|---|
| Framework | Next.js 16.2 (App Router) |
| UI | React 19, Tailwind CSS v4, Lucide React |
| State / Cache | TanStack Query v5, Zustand v5 |
| Formulaires | React Hook Form v7 + Zod |
| HTTP | Axios |
| Graphiques | Recharts |
| Notifications | Sonner |
| Langage | TypeScript 5 |

## Modules

- **Dashboard** — statistiques et graphiques de synthèse
- **Départs** — création et suivi des voyages GP (états : EN_ATTENTE → EN_TRANSIT → ARRIVE)
- **Colis** — gestion des envois rattachés à un départ (états : EN_ATTENTE → EN_TRANSIT → ARRIVE → LIVRE / RETOURNE)
- **Personnes** — clients et gérants (types, remises, historique colis)
- **Paiements** — enregistrement, validation et remboursement des règlements
- **Relais** — points de dépôt/retrait associés à une adresse et une personne
- **Adresses** — référentiel géographique (type SIMPLE ou RELAIS)

## Installation

```bash
npm install
```

## Démarrage

```bash
# Développement
npm run dev

# Production
npm run build
npm run start
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000).

## Structure du projet

```
app/
  (dashboard)/          # Pages protégées (layout avec Navbar/Sidebar)
    page.tsx            # Dashboard principal
    departures/         # Liste et détail des départs
    packages/           # Liste et détail des colis
    persons/            # Liste et détail des personnes
    payments/           # Liste des paiements
    relays/             # Liste et détail des relais
    addresses/          # Liste et détail des adresses
components/
  departures/           # Modales et composants spécifiques aux départs
  packages/             # Modales et composants spécifiques aux colis
  payments/             # Modales et composants spécifiques aux paiements
  persons/              # Modales et composants spécifiques aux personnes
  relays/               # Modales et composants spécifiques aux relais
  addresses/            # Modales et composants spécifiques aux adresses
  layout/               # Navbar, Sidebar
  shared/               # Badges d'état, composants partagés
  ui/                   # Composants UI génériques
lib/
  api/                  # Fonctions d'appel API par module (axios)
  types/                # Types et DTOs TypeScript (api.types.ts)
providers/              # QueryProvider (TanStack Query)
stores/                 # Stores Zustand
constants/              # Constantes applicatives
hooks/                  # Hooks personnalisés
```

## Variables d'environnement

Créer un fichier `.env.local` à la racine :

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Lint

```bash
npm run lint
```
