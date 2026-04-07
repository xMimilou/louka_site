import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readdir, unlink, stat } from 'fs/promises'
import { join } from 'path'
import { requireAuth, unauthorized } from '@/lib/api-auth'

const UPLOADS_DIR = join(process.cwd(), 'public', 'uploads')

export async function POST(req: NextRequest) {
  if (!await requireAuth()) return unauthorized()

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  const ext = file.name.split('.').pop()
  const base = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-z0-9]/gi, '-').toLowerCase()
  const uniqueName = `${base}-${Date.now()}.${ext}`

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  await writeFile(join(UPLOADS_DIR, uniqueName), buffer)

  return NextResponse.json({ url: `/uploads/${uniqueName}`, name: file.name })
}

export async function GET() {
  if (!await requireAuth()) return unauthorized()

  try {
    const names = await readdir(UPLOADS_DIR)
    const files = await Promise.all(
      names
        .filter((n) => n !== '.gitkeep')
        .map(async (name) => {
          const s = await stat(join(UPLOADS_DIR, name))
          return { name, size: s.size, created_at: s.birthtime.toISOString() }
        })
    )
    return NextResponse.json(files.sort((a, b) => b.created_at.localeCompare(a.created_at)))
  } catch {
    return NextResponse.json([])
  }
}

export async function DELETE(req: NextRequest) {
  if (!await requireAuth()) return unauthorized()
  const { name } = await req.json()
  if (!name || name.includes('..')) return NextResponse.json({ error: 'Invalid' }, { status: 400 })
  await unlink(join(UPLOADS_DIR, name))
  return NextResponse.json({ ok: true })
}
