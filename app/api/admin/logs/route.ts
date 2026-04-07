import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { parseLog } from '@/lib/db-parse'
import { requireAuth, unauthorized } from '@/lib/api-auth'

export async function GET() {
  if (!await requireAuth()) return unauthorized()
  const [rows] = await pool.execute(
    'SELECT * FROM logs ORDER BY created_at DESC LIMIT 100'
  ) as [Record<string, unknown>[], unknown]
  return NextResponse.json(rows.map(parseLog))
}
