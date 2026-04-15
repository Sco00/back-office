// client.ts — simplifié pour le mode mock (pas de backend)
// Le vrai client axios avec intercepteurs est conservé en commentaire ci-dessous.

import axios from 'axios'

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' },
})
