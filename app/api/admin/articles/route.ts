import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { parseArticle } from '@/lib/db-parse'
import { requireAuth, unauthorized } from '@/lib/api-auth'

export async function GET(req: NextRequest) {
  if (!await requireAuth()) return unauthorized()

  const status = req.nextUrl.searchParams.get('status')
  const query = status && status !== 'all'
    ? 'SELECT * FROM articles WHERE status = ? ORDER BY created_at DESC'
    : 'SELECT * FROM articles ORDER BY created_at DESC'
  const params = status && status !== 'all' ? [status] : []

  const [rows] = await pool.execute(query, params) as [Record<string, unknown>[], unknown]
  return NextResponse.json(rows.map(parseArticle))
}

export async function POST(req: NextRequest) {
  if (!await requireAuth()) return unauthorized()

  const body = await req.json()
  const now = new Date().toISOString().replace('T', ' ').replace(/\..+/, '')
  const id = crypto.randomUUID()

  await pool.execute(
    `INSERT INTO articles (id, title, slug, excerpt, content, category, tags, cover_url, file_url, file_label, ext_link, ext_label, status, downloads, published_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
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
      now,
    ]
  )

  const [rows] = await pool.execute('SELECT * FROM articles WHERE id = ?', [id]) as [Record<string, unknown>[], unknown]
  return NextResponse.json(parseArticle(rows[0]), { status: 201 })
}
