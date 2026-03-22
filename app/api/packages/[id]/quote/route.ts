import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const token = request.cookies.get('auth-token')?.value

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/packages/${id}/quote`,
    {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    }
  )

  if (!response.ok) {
    return NextResponse.json({ error: 'Impossible de générer le devis' }, { status: response.status })
  }

  const buffer = await response.arrayBuffer()

  return new NextResponse(buffer, {
    headers: {
      'Content-Type':        'application/pdf',
      'Content-Disposition': `inline; filename="devis-${id}.pdf"`,
    },
  })
}
