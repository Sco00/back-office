import { NextRequest, NextResponse } from 'next/server'

// Auth temporairement désactivée pour la génération de maquettes Figma
export function middleware(_request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
}
