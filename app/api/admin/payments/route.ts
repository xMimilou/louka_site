import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { parsePayment } from '@/lib/db-parse'
import { requireAuth, unauthorized } from '@/lib/api-auth'

export async function GET() {
  if (!await requireAuth()) return unauthorized()
  const [rows] = await pool.execute(
    `SELECT p.*, c.name AS candidate_name
     FROM payments p
     LEFT JOIN candidates c ON c.id = p.candidate_id
     ORDER BY p.created_at DESC`
  ) as [Record<string, unknown>[], unknown]
  return NextResponse.json(rows.map(parsePayment))
}
