import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/providers/QueryProvider'
import { Toaster } from 'sonner'

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'YobbalGP — Back Office',
  description: 'Gestion des colis et expéditions',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${geist.variable} h-full`}>
      <body className="h-full bg-gray-900 text-white antialiased" suppressHydrationWarning>
        <QueryProvider>
          {children}
          <Toaster theme="dark" richColors position="top-right" />
        </QueryProvider>
      </body>
    </html>
  )
}
