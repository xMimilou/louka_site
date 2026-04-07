import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { parseCloser } from '@/lib/db-parse'
import { requireAuth, unauthorized } from '@/lib/api-auth'

export async function GET() {
  if (!await requireAuth()) return unauthorized()
  const [rows] = await pool.execute('SELECT * FROM closers ORDER BY created_at') as [Record<string, unknown>[], unknown]
  return NextResponse.json(rows.map(parseCloser))
}

export async function POST(req: NextRequest) {
  if (!await requireAuth()) return unauthorized()
  const { name, email } = await req.json()
  const id = crypto.randomUUID()
  await pool.execute('INSERT INTO closers (id, name, email) VALUES (?, ?, ?)', [id, name, email ?? null])
  const [rows] = await pool.execute('SELECT * FROM closers WHERE id = ?', [id]) as [Record<string, unknown>[], unknown]
  if (!rows.length) return NextResponse.json({ error: 'Insert failed' }, { status: 500 })
  return NextResponse.json(parseCloser(rows[0]), { status: 201 })
}
