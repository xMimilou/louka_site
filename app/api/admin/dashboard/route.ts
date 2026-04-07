import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { requireAuth, unauthorized } from '@/lib/api-auth'

export async function GET() {
  if (!await requireAuth()) return unauthorized()

  const [[candidatesRow]] = await pool.execute('SELECT COUNT(*) AS n FROM candidates') as [Record<string, unknown>[], unknown]
  const [[fitARow]] = await pool.execute("SELECT COUNT(*) AS n FROM candidates WHERE fit_grade = 'A'") as [Record<string, unknown>[], unknown]
  const [[fitBRow]] = await pool.execute("SELECT COUNT(*) AS n FROM candidates WHERE fit_grade = 'B'") as [Record<string, unknown>[], unknown]
  const [[wonRow]] = await pool.execute("SELECT COUNT(*) AS n FROM candidates WHERE status = 'gagne'") as [Record<string, unknown>[], unknown]
  const [[revenueRow]] = await pool.execute("SELECT COALESCE(SUM(amount),0) AS total FROM payments WHERE status = 'paid'") as [Record<string, unknown>[], unknown]
  const [[articlesRow]] = await pool.execute("SELECT COUNT(*) AS n FROM articles WHERE status = 'published'") as [Record<string, unknown>[], unknown]
  const [[tweetsRow]] = await pool.execute('SELECT COUNT(*) AS n FROM tweets WHERE published = 1') as [Record<string, unknown>[], unknown]
  const [[pendingRow]] = await pool.execute("SELECT COUNT(*) AS n FROM payments WHERE status = 'pending'") as [Record<string, unknown>[], unknown]

  const [recentCandidates] = await pool.execute(
    'SELECT id, name, fit_grade, status, created_at FROM candidates ORDER BY created_at DESC LIMIT 5'
  ) as [Record<string, unknown>[], unknown]

  const [funnel] = await pool.execute(
    'SELECT status, COUNT(*) AS n FROM candidates GROUP BY status'
  ) as [Record<string, unknown>[], unknown]

  return NextResponse.json({
    candidates: Number((candidatesRow as Record<string, unknown>).n),
    fit_a: Number((fitARow as Record<string, unknown>).n),
    fit_b: Number((fitBRow as Record<string, unknown>).n),
    won: Number((wonRow as Record<string, unknown>).n),
    revenue_cents: Number((revenueRow as Record<string, unknown>).total),
    articles_published: Number((articlesRow as Record<string, unknown>).n),
    tweets_published: Number((tweetsRow as Record<string, unknown>).n),
    payments_pending: Number((pendingRow as Record<string, unknown>).n),
    recent_candidates: (recentCandidates as Record<string, unknown>[]).map((r) => ({
      ...r,
      created_at: String(r.created_at),
    })),
    funnel: (funnel as Record<string, unknown>[]).reduce((acc, r) => {
      acc[r.status as string] = Number(r.n)
      return acc
    }, {} as Record<string, number>),
  })
}
