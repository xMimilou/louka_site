import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { parseProject } from '@/lib/db-parse'
import { requireAuth, unauthorized } from '@/lib/api-auth'

export async function GET() {
  if (!await requireAuth()) return unauthorized()
  const [rows] = await pool.execute('SELECT * FROM projects ORDER BY sort_order') as [Record<string, unknown>[], unknown]
  return NextResponse.json(rows.map(parseProject))
}

export async function POST(req: NextRequest) {
  if (!await requireAuth()) return unauthorized()
  const body = await req.json()
  const id = crypto.randomUUID()
  const now = new Date().toISOString().replace('T', ' ').replace(/\..+/, '')

  await pool.execute(
    `INSERT INTO projects (id, name, category, status, description, stack, link_url, link_label, github_url, image_url, featured, sort_order, visible, side_project, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, body.name, body.category ?? '', body.status ?? 'En développement',
      body.description ?? null, JSON.stringify(body.stack ?? []),
      body.link_url ?? null, body.link_label ?? null,
      body.github_url ?? null, body.image_url ?? null,
      body.featured ? 1 : 0, body.sort_order ?? 0,
      body.visible !== false ? 1 : 0, body.side_project ? 1 : 0, now,
    ]
  )

  const [rows] = await pool.execute('SELECT * FROM projects WHERE id = ?', [id]) as [Record<string, unknown>[], unknown]
  return NextResponse.json(parseProject(rows[0]), { status: 201 })
}
