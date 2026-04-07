import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { parsePlatformLink } from '@/lib/db-parse'
import { requireAuth, unauthorized } from '@/lib/api-auth'

export async function GET() {
  if (!await requireAuth()) return unauthorized()
  const [rows] = await pool.execute('SELECT * FROM platform_links ORDER BY sort_order') as [Record<string, unknown>[], unknown]
  return NextResponse.json(rows.map(parsePlatformLink))
}

export async function POST(req: NextRequest) {
  if (!await requireAuth()) return unauthorized()
  const body = await req.json()
  const id = crypto.randomUUID()

  await pool.execute(
    'INSERT INTO platform_links (id, platform, label, url, icon, visible, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, body.platform, body.label, body.url, body.icon ?? 'other', body.visible !== false ? 1 : 0, body.sort_order ?? 0]
  )

  const [rows] = await pool.execute('SELECT * FROM platform_links WHERE id = ?', [id]) as [Record<string, unknown>[], unknown]
  return NextResponse.json(parsePlatformLink(rows[0]), { status: 201 })
}
