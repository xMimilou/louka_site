import pool from '@/lib/db'
import type { Article } from '@/lib/types'
import { parseArticle } from '@/lib/db-parse'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Nav from '@/components/public/Nav'
import Footer from '@/components/public/Footer'
import ArticleBody from '../../ressources/[slug]/ArticleBody'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  return {
    title: `${slug} — Blog Louka Millon`,
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
  title: "Mon 1er workflow en production — relance prospect automatique",
  slug: 'workflow-relance-prospect-automatique',
  excerpt: 'Build in public : comment j\'ai automatisé mes relances LinkedIn + email avec n8n et Google Sheets. Architecture, erreurs, résultats.',
  content: null,
  category: ['n8n', 'Automatisation'],
  tags: ['relance', 'prospection', 'workflow'],
  cover_url: null,
  file_url: null,
  file_label: null,
  ext_link: null,
  ext_label: null,
  status: 'published',
  downloads: 0,
  published_at: '2026-04-07T00:00:00.000Z',
  created_at: '2026-04-07T00:00:00.000Z',
  updated_at: '2026-04-07T00:00:00.000Z',
}

export default async function BlogArticlePage({ params }: PageProps) {
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
          <Link
            href="/blog"
            className="font-dm text-sm text-text-muted hover:text-accent transition-colors mb-8 inline-flex items-center gap-2"
          >
            ← Retour au blog
          </Link>

          {article.cover_url && (
            <div className="w-full h-64 rounded-2xl overflow-hidden mb-8 mt-6">
              <img src={article.cover_url} alt={article.title} className="w-full h-full object-cover" loading="lazy" />
            </div>
          )}

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

          <h1
            className="font-syne font-extrabold text-text-primary leading-tight mb-4"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}
          >
            {article.title}
          </h1>

          <div className="flex items-center gap-4 text-text-muted font-dm text-sm mb-8 flex-wrap">
            {article.published_at && (
              <time dateTime={article.published_at}>{formatDate(article.published_at)}</time>
            )}
            <span>·</span>
            <span>{readTime} min de lecture</span>
          </div>

          {article.excerpt && (
            <p className="font-dm text-text-muted text-lg leading-relaxed mb-10 border-l-2 border-accent pl-5">
              {article.excerpt}
            </p>
          )}

          {article.content ? (
            <ArticleBody content={article.content} />
          ) : (
            <div className="prose prose-invert max-w-none">
              <p className="font-dm text-text-muted leading-relaxed">
                Le contenu de cet article sera bientôt disponible.
              </p>
            </div>
          )}

          {article.file_url && (
            <div className="mt-12 bg-surface border border-accent/30 rounded-2xl p-6 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h3 className="font-syne font-bold text-text-primary mb-1">
                  {article.file_label || 'Télécharger la ressource'}
                </h3>
                {article.downloads > 0 && (
                  <p className="font-dm text-text-muted text-sm">
                    {article.downloads} personnes ont déjà téléchargé ce fichier.
                  </p>
                )}
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
