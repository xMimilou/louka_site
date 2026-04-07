import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { parseWorkflow } from '@/lib/db-parse'
import { requireAuth, unauthorized } from '@/lib/api-auth'

export async function GET() {
  if (!await requireAuth()) return unauthorized()
  const [rows] = await pool.execute('SELECT * FROM workflows ORDER BY sort_order') as [Record<string, unknown>[], unknown]
  return NextResponse.json(rows.map(parseWorkflow))
}

export async function POST(req: NextRequest) {
  if (!await requireAuth()) return unauthorized()
  const body = await req.json()
  const id = crypto.randomUUID()
  const now = new Date().toISOString().replace('T', ' ').replace(/\..+/, '')

  await pool.execute(
    'INSERT INTO workflows (id, title, description, tags, sort_order, visible, coming_soon, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, body.title, body.description ?? null, JSON.stringify(body.tags ?? []), body.sort_order ?? 0, body.visible ? 1 : 0, body.coming_soon ? 1 : 0, now]
  )

  const [rows] = await pool.execute('SELECT * FROM workflows WHERE id = ?', [id]) as [Record<string, unknown>[], unknown]
  return NextResponse.json(parseWorkflow(rows[0]), { status: 201 })
}
