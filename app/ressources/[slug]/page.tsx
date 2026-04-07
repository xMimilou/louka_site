import pool from '@/lib/db'
import type { Article } from '@/lib/types'
import { parseArticle } from '@/lib/db-parse'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Nav from '@/components/public/Nav'
import Footer from '@/components/public/Footer'
import ArticleBody from './ArticleBody'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  return {
    title: `${slug} — Ressources Louka Millon`,
    robots: 'index, follow',
  }
}

function estimateReadingTime(content: Record<string, unknown> | null): number {
  if (!content) return 1
  const text = JSON.stringify(content)
  const words = text.split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const staticArticle: Article = {
  id: '1',
  title: "Screener d'actions sur Yahoo Finance",
  slug: 'screener-actions-yahoo-finance',
  excerpt: 'Script Python qui filtre les entreprises sur des critères fondamentaux (P/E, croissance, ROE) et exporte un rapport CSV.',
  content: null,
  category: ['Python', 'Finance'],
  tags: ['yfinance', 'pandas', 'screener'],
  cover_url: null,
  file_url: '#',
  file_label: 'Télécharger le script',
  ext_link: null,
  ext_label: null,
  status: 'published',
  downloads: 142,
  published_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params
  let article: Article | null = null

  try {
    const [rows] = await pool.execute(
      'SELECT * FROM articles WHERE slug = ? AND status = ? LIMIT 1',
      [slug, 'published']
    ) as [Record<string, unknown>[], unknown]
    if (rows.length > 0) article = parseArticle(rows[0])
  } catch {
    // fall back to static
  }

  if (!article && slug === staticArticle.slug) {
    article = staticArticle
  }

  if (!article) {
    notFound()
  }

  const readTime = estimateReadingTime(article.content)

  return (
    <>
      <Nav />
      <main className="min-h-screen pt-24 pb-20 px-6">
        <div className="max-w-[860px] mx-auto">
          {/* Back link */}
          <Link
            href="/ressources"
            className="font-dm text-sm text-text-muted hover:text-accent transition-colors mb-8 inline-flex items-center gap-2"
          >
            ← Retour aux ressources
          </Link>

          {/* Cover image */}
          {article.cover_url && (
            <div className="w-full h-64 rounded-2xl overflow-hidden mb-8 mt-6">
              <img src={article.cover_url} alt={article.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Category chips */}
          <div className="flex flex-wrap gap-2 mb-6 mt-6">
            {article.category.map((cat) => (
              <span
                key={cat}
                className="font-mono text-xs text-accent bg-accent/10 border border-accent/20 px-3 py-1 rounded-full"
              >
                {cat}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1
            className="font-syne font-extrabold text-text-primary leading-tight mb-4"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}
          >
            {article.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-4 text-text-muted font-dm text-sm mb-8 flex-wrap">
            {article.published_at && (
              <time dateTime={article.published_at}>{formatDate(article.published_at)}</time>
            )}
            <span>·</span>
            <span>{readTime} min de lecture</span>
            {article.downloads > 0 && (
              <>
                <span>·</span>
                <span>{article.downloads} téléchargements</span>
              </>
            )}
          </div>

          {/* Excerpt */}
          {article.excerpt && (
            <p className="font-dm text-text-muted text-lg leading-relaxed mb-10 border-l-2 border-accent pl-5">
              {article.excerpt}
            </p>
          )}

          {/* Article body */}
          {article.content ? (
            <ArticleBody content={article.content} />
          ) : (
            <div className="prose prose-invert max-w-none">
              <p className="font-dm text-text-muted leading-relaxed">
                Le contenu de cet article sera bientôt disponible.
              </p>
            </div>
          )}

          {/* Download box */}
          {article.file_url && (
            <div className="mt-12 bg-surface border border-accent/30 rounded-2xl p-6 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h3 className="font-syne font-bold text-text-primary mb-1">
                  {article.file_label || 'Télécharger la ressource'}
                </h3>
                <p className="font-dm text-text-muted text-sm">
                  {article.downloads} personnes ont déjà téléchargé ce fichier.
                </p>
              </div>
              <a
                href={article.file_url}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent text-bg font-dm font-medium text-sm shadow-glow hover:shadow-glow-lg transition-all duration-300 flex-shrink-0"
                download
              >
                ↓ Télécharger
              </a>
            </div>
          )}

          {/* External link */}
          {article.ext_link && (
            <div className="mt-6 bg-surface border border-border rounded-2xl p-6 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h3 className="font-syne font-bold text-text-primary mb-1">
                  {article.ext_label || 'Ressource externe'}
                </h3>
              </div>
              <a
                href={article.ext_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-accent text-accent font-dm font-medium text-sm hover:bg-accent/10 transition-all duration-300 flex-shrink-0"
              >
                Voir →
              </a>
            </div>
          )}

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span key={tag} className="font-mono text-xs px-3 py-1 rounded-full bg-surface border border-border text-text-muted">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
