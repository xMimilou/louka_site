import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { requireAuth, unauthorized } from '@/lib/api-auth'

export async function GET() {
  if (!await requireAuth()) return unauthorized()
  const [rows] = await pool.execute('SELECT `key`, value FROM settings') as [{ key: string; value: string }[], unknown]
  const map: Record<string, string> = {}
  rows.forEach((r) => { map[r.key] = r.value })
  return NextResponse.json(map)
}

export async function POST(req: NextRequest) {
  if (!await requireAuth()) return unauthorized()
  const body: Record<string, string> = await req.json()

  for (const [key, value] of Object.entries(body)) {
    await pool.execute(
      'INSERT INTO settings (`key`, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)',
      [key, value]
    )
  }

  return NextResponse.json({ ok: true })
}
