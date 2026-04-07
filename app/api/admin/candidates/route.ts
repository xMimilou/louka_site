import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { parseCandidate } from '@/lib/db-parse'
import { requireAuth, unauthorized } from '@/lib/api-auth'

export async function GET(req: NextRequest) {
  if (!await requireAuth()) return unauthorized()

  const { searchParams } = req.nextUrl
  const status = searchParams.get('status')
  const fit = searchParams.get('fit')
  const q = searchParams.get('q')

  let query = 'SELECT * FROM candidates WHERE 1=1'
  const params: unknown[] = []

  if (status && status !== 'all') {
    query += ' AND status = ?'
    params.push(status)
  }
  if (fit && fit !== 'all') {
    query += ' AND fit_grade = ?'
    params.push(fit)
  }
  if (q) {
    query += ' AND (name LIKE ? OR headline LIKE ? OR notes LIKE ? OR keyword LIKE ?)'
    const like = `%${q}%`
    params.push(like, like, like, like)
  }

  query += ' ORDER BY created_at DESC LIMIT 300'

  const [rows] = await pool.execute(query, params) as [Record<string, unknown>[], unknown]
  return NextResponse.json(rows.map(parseCandidate))
}

export async function POST(req: NextRequest) {
  if (!await requireAuth()) return unauthorized()

  const body = await req.json()
  const id = crypto.randomUUID()
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19)

  await pool.execute(
    `INSERT INTO candidates (id, name, email, phone, linkedin_url, headline, location, keyword, fit_grade, source, notes, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
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
      body.status ?? 'recu',
      now,
    ]
  )

  const [rows] = await pool.execute('SELECT * FROM candidates WHERE id = ?', [id]) as [Record<string, unknown>[], unknown]
  return NextResponse.json(parseCandidate(rows[0]), { status: 201 })
}
