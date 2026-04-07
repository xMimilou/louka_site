import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { parsePlatformLink } from '@/lib/db-parse'
import { requireAuth, unauthorized } from '@/lib/api-auth'

interface Ctx { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Ctx) {
  if (!await requireAuth()) return unauthorized()
  const { id } = await params
  const body = await req.json()

  await pool.execute(
    'UPDATE platform_links SET platform = ?, label = ?, url = ?, icon = ?, visible = ?, sort_order = ? WHERE id = ?',
    [body.platform, body.label, body.url, body.icon, body.visible !== false ? 1 : 0, body.sort_order ?? 0, id]
  )

  const [rows] = await pool.execute('SELECT * FROM platform_links WHERE id = ?', [id]) as [Record<string, unknown>[], unknown]
  return NextResponse.json(parsePlatformLink(rows[0]))
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  if (!await requireAuth()) return unauthorized()
  const { id } = await params
  await pool.execute('DELETE FROM platform_links WHERE id = ?', [id])
  return NextResponse.json({ ok: true })
}
