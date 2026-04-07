import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { requireAuth, unauthorized } from '@/lib/api-auth'

interface Ctx { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Ctx) {
  if (!await requireAuth()) return unauthorized()
  const { id } = await params
  const { done } = await req.json()
  await pool.execute('UPDATE tasks SET done = ? WHERE id = ?', [done ? 1 : 0, id])
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  if (!await requireAuth()) return unauthorized()
  const { id } = await params
  await pool.execute('DELETE FROM tasks WHERE id = ?', [id])
  return NextResponse.json({ ok: true })
}
