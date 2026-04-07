import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { parsePayment } from '@/lib/db-parse'
import { requireAuth, unauthorized } from '@/lib/api-auth'

interface Ctx { params: Promise<{ id: string }> }

export async function PUT(_req: NextRequest, { params }: Ctx) {
  if (!await requireAuth()) return unauthorized()
  const { id } = await params
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
  await pool.execute(
    "UPDATE payments SET status = 'paid', paid_at = ? WHERE id = ?",
    [now, id]
  )
  await pool.execute(
    'INSERT INTO logs (id, level, message) VALUES (?, ?, ?)',
    [crypto.randomUUID(), 'info', `Paiement ${id} marqué comme payé`]
  )
  const [rows] = await pool.execute(
    'SELECT p.*, c.name AS candidate_name FROM payments p LEFT JOIN candidates c ON c.id = p.candidate_id WHERE p.id = ?',
    [id]
  ) as [Record<string, unknown>[], unknown]
  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(parsePayment(rows[0]))
}
