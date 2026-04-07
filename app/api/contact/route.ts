import { NextResponse } from 'next/server'

const WEBHOOK_URL = 'https://n8n.spaarple.fr/webhook/6477f7e4-c4df-4ed9-bddc-960078a9d494'

export async function POST(request: Request) {
  const body = await request.json()

  const payload = {
    Nom: body.Nom,
    Email: body.Email,
    Entreprise: body.Entreprise ?? '',
    Contexte: body.Contexte ?? '',
  }

  console.log('[contact] sending to n8n:', payload)

  try {
    const params = new URLSearchParams({
      Nom: payload.Nom,
      Email: payload.Email,
      Entreprise: payload.Entreprise,
      Contexte: payload.Contexte,
    })
    const res = await fetch(`${WEBHOOK_URL}?${params.toString()}`, {
      method: 'GET',
    })
    const text = await res.text()
    console.log('[contact] n8n response:', res.status, text)
  } catch (err) {
    console.error('[contact] fetch error:', err)
    return NextResponse.json({ error: 'fetch failed' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
