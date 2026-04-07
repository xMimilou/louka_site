import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { parseCandidate } from '@/lib/db-parse'
import { requireAuth, unauthorized } from '@/lib/api-auth'

interface Ctx { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Ctx) {
  if (!await requireAuth()) return unauthorized()
  const { id } = await params
  const [rows] = await pool.execute('SELECT * FROM candidates WHERE id = ?', [id]) as [Record<string, unknown>[], unknown]
  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(parseCandidate(rows[0]))
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  if (!await requireAuth()) return unauthorized()
  const { id } = await params
  const body = await req.json()

  await pool.execute(
    `UPDATE candidates SET
      name = ?, email = ?, phone = ?, linkedin_url = ?, headline = ?,
      location = ?, keyword = ?, fit_grade = ?, source = ?,
      notes = ?, status = ?, ai_score = ?, ai_verdict = ?, closer_id = ?
     WHERE id = ?`,
    [
      body.name,
      body.email ?? null,
      body.phone ?? null,
      body.linkedin_url ?? null,
      body.headline ?? null,
      body.location ?? null,
      body.keyword ?? null,
      body.fit_grade ?? null,
      body.source ?? 'manuel',
      body.notes ?? null,
      body.status,
      body.ai_score ?? null,
      body.ai_verdict ?? null,
      body.closer_id ?? null,
      id,
    ]
  )

  const [rows] = await pool.execute('SELECT * FROM candidates WHERE id = ?', [id]) as [Record<string, unknown>[], unknown]
  return NextResponse.json(parseCandidate(rows[0]))
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  if (!await requireAuth()) return unauthorized()
  const { id } = await params
  await pool.execute('DELETE FROM candidates WHERE id = ?', [id])
  return NextResponse.json({ ok: true })
}
