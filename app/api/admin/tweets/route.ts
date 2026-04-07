import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { parseTweet } from '@/lib/db-parse'
import { requireAuth, unauthorized } from '@/lib/api-auth'

export async function GET() {
  if (!await requireAuth()) return unauthorized()
  const [rows] = await pool.execute('SELECT * FROM tweets ORDER BY created_at DESC LIMIT 100') as [Record<string, unknown>[], unknown]
  return NextResponse.json(rows.map(parseTweet))
}

export async function POST(req: NextRequest) {
  if (!await requireAuth()) return unauthorized()
  const body = await req.json()
  const id = crypto.randomUUID()
  const scheduled = body.scheduled_at
    ? new Date(body.scheduled_at).toISOString().replace('T', ' ').slice(0, 19)
    : null
  await pool.execute(
    'INSERT INTO tweets (id, content, scheduled_at, published) VALUES (?, ?, ?, ?)',
    [id, body.content, scheduled, 0]
  )
  const [rows] = await pool.execute('SELECT * FROM tweets WHERE id = ?', [id]) as [Record<string, unknown>[], unknown]
  return NextResponse.json(parseTweet(rows[0]), { status: 201 })
}
