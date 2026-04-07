import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { parseProject } from '@/lib/db-parse'
import { requireAuth, unauthorized } from '@/lib/api-auth'

interface Ctx { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Ctx) {
  if (!await requireAuth()) return unauthorized()
  const { id } = await params
  const body = await req.json()

  await pool.execute(
    `UPDATE projects SET
      name = ?, category = ?, status = ?, description = ?, stack = ?,
      link_url = ?, link_label = ?, github_url = ?, image_url = ?,
      featured = ?, sort_order = ?, visible = ?, side_project = ?
     WHERE id = ?`,
    [
      body.name, body.category ?? '', body.status ?? 'En développement',
      body.description ?? null, JSON.stringify(body.stack ?? []),
      body.link_url ?? null, body.link_label ?? null,
      body.github_url ?? null, body.image_url ?? null,
      body.featured ? 1 : 0, body.sort_order ?? 0,
      body.visible !== false ? 1 : 0, body.side_project ? 1 : 0,
      id,
    ]
  )

  const [rows] = await pool.execute('SELECT * FROM projects WHERE id = ?', [id]) as [Record<string, unknown>[], unknown]
  return NextResponse.json(parseProject(rows[0]))
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  if (!await requireAuth()) return unauthorized()
  const { id } = await params
  await pool.execute('DELETE FROM projects WHERE id = ?', [id])
  return NextResponse.json({ ok: true })
}
