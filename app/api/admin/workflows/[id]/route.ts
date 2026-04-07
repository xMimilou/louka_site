import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { parseWorkflow } from '@/lib/db-parse'
import { requireAuth, unauthorized } from '@/lib/api-auth'

interface Ctx { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Ctx) {
  if (!await requireAuth()) return unauthorized()
  const { id } = await params
  const body = await req.json()

  await pool.execute(
    'UPDATE workflows SET title = ?, description = ?, tags = ?, sort_order = ?, visible = ?, coming_soon = ? WHERE id = ?',
    [body.title, body.description ?? null, JSON.stringify(body.tags ?? []), body.sort_order ?? 0, body.visible ? 1 : 0, body.coming_soon ? 1 : 0, id]
  )

  const [rows] = await pool.execute('SELECT * FROM workflows WHERE id = ?', [id]) as [Record<string, unknown>[], unknown]
  return NextResponse.json(parseWorkflow(rows[0]))
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  if (!await requireAuth()) return unauthorized()
  const { id } = await params
  await pool.execute('DELETE FROM workflows WHERE id = ?', [id])
  return NextResponse.json({ ok: true })
}
