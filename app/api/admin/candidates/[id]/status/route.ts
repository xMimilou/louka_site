import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { parseCandidate } from '@/lib/db-parse'
import { requireAuth, unauthorized } from '@/lib/api-auth'

interface Ctx { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Ctx) {
  if (!await requireAuth()) return unauthorized()
  const { id } = await params
  const { status } = await req.json()

  await pool.execute('UPDATE candidates SET status = ? WHERE id = ?', [status, id])

  // Auto-action: create pending payment when moved to 'gagne'
  if (status === 'gagne') {
    const existing = await pool.execute(
      'SELECT id FROM payments WHERE candidate_id = ?',
      [id]
    ) as [Record<string, unknown>[], unknown]
    if ((existing[0] as unknown[]).length === 0) {
      await pool.execute(
        'INSERT INTO payments (id, candidate_id, amount, currency, status) VALUES (?, ?, ?, ?, ?)',
        [crypto.randomUUID(), id, 149700, 'EUR', 'pending']
      )
    }
  }

  // Log the action
  const [rows] = await pool.execute('SELECT name FROM candidates WHERE id = ?', [id]) as [Record<string, unknown>[], unknown]
  const name = rows[0]?.name ?? id
  await pool.execute(
    'INSERT INTO logs (id, level, message) VALUES (?, ?, ?)',
    [crypto.randomUUID(), 'info', `Statut prospect "${name}" → ${status}`]
  )

  const [updated] = await pool.execute('SELECT * FROM candidates WHERE id = ?', [id]) as [Record<string, unknown>[], unknown]
  return NextResponse.json(parseCandidate(updated[0]))
}
