import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { parseTweet } from '@/lib/db-parse'
import { requireAuth, unauthorized } from '@/lib/api-auth'

interface Ctx { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Ctx) {
  if (!await requireAuth()) return unauthorized()
  const { id } = await params
  const body = await req.json()

  if (body.published !== undefined) {
    await pool.execute('UPDATE tweets SET published = ? WHERE id = ?', [body.published ? 1 : 0, id])
  } else {
    const scheduled = body.scheduled_at
      ? new Date(body.scheduled_at).toISOString().replace('T', ' ').slice(0, 19)
      : null
    await pool.execute(
      'UPDATE tweets SET content = ?, scheduled_at = ? WHERE id = ?',
      [body.content, scheduled, id]
    )
  }

  const [rows] = await pool.execute('SELECT * FROM tweets WHERE id = ?', [id]) as [Record<string, unknown>[], unknown]
  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(parseTweet(rows[0]))
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  if (!await requireAuth()) return unauthorized()
  const { id } = await params
  await pool.execute('DELETE FROM tweets WHERE id = ?', [id])
  return NextResponse.json({ ok: true })
}
