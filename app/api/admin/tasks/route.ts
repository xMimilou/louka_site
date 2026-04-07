import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { parseTask } from '@/lib/db-parse'
import { requireAuth, unauthorized } from '@/lib/api-auth'

export async function GET() {
  if (!await requireAuth()) return unauthorized()
  const [rows] = await pool.execute(
    `SELECT t.*, ca.name AS candidate_name, cl.name AS closer_name
     FROM tasks t
     LEFT JOIN candidates ca ON ca.id = t.candidate_id
     LEFT JOIN closers cl ON cl.id = t.closer_id
     WHERE t.done = 0
     ORDER BY t.due_date ASC, t.created_at ASC`
  ) as [Record<string, unknown>[], unknown]
  return NextResponse.json(rows.map(parseTask))
}

export async function POST(req: NextRequest) {
  if (!await requireAuth()) return unauthorized()
  const body = await req.json()
  const id = crypto.randomUUID()
  await pool.execute(
    'INSERT INTO tasks (id, closer_id, candidate_id, title, due_date) VALUES (?, ?, ?, ?, ?)',
    [id, body.closer_id ?? null, body.candidate_id ?? null, body.title, body.due_date ?? null]
  )
  const [rows] = await pool.execute(
    'SELECT t.*, ca.name AS candidate_name, cl.name AS closer_name FROM tasks t LEFT JOIN candidates ca ON ca.id = t.candidate_id LEFT JOIN closers cl ON cl.id = t.closer_id WHERE t.id = ?',
    [id]
  ) as [Record<string, unknown>[], unknown]
  if (!rows.length) return NextResponse.json({ error: 'Insert failed' }, { status: 500 })
  return NextResponse.json(parseTask(rows[0]), { status: 201 })
}
