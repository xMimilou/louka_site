import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { parseArticle } from '@/lib/db-parse'
import { requireAuth, unauthorized } from '@/lib/api-auth'

interface Ctx { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Ctx) {
  if (!await requireAuth()) return unauthorized()
  const { id } = await params
  const [rows] = await pool.execute('SELECT * FROM articles WHERE id = ?', [id]) as [Record<string, unknown>[], unknown]
  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(parseArticle(rows[0]))
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  if (!await requireAuth()) return unauthorized()
  const { id } = await params
  const body = await req.json()
  const now = new Date().toISOString().replace('T', ' ').replace(/\..+/, '')

  await pool.execute(
    `UPDATE articles SET
      title = ?, slug = ?, excerpt = ?, content = ?, category = ?, tags = ?,
      cover_url = ?, file_url = ?, file_label = ?, ext_link = ?, ext_label = ?,
      status = ?, downloads = ?, published_at = ?, updated_at = ?
     WHERE id = ?`,
    [
      body.title,
      body.slug,
      body.excerpt ?? null,
      body.content ? JSON.stringify(body.content) : null,
      JSON.stringify(body.category ?? []),
      JSON.stringify(body.tags ?? []),
      body.cover_url ?? null,
      body.file_url ?? null,
      body.file_label ?? null,
      body.ext_link ?? null,
      body.ext_label ?? null,
      body.status ?? 'draft',
      body.downloads ?? 0,
      body.published_at ? body.published_at.replace('T', ' ').replace(/\..+/, '') : null,
      now,
      id,
    ]
  )

  const [rows] = await pool.execute('SELECT * FROM articles WHERE id = ?', [id]) as [Record<string, unknown>[], unknown]
  return NextResponse.json(parseArticle(rows[0]))
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  if (!await requireAuth()) return unauthorized()
  const { id } = await params
  await pool.execute('DELETE FROM articles WHERE id = ?', [id])
  return NextResponse.json({ ok: true })
}
