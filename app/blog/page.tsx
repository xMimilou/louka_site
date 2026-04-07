import { createClient } from '@/lib/supabase-server'
import type { Article } from '@/lib/types'
import Link from 'next/link'
import Nav from '@/components/public/Nav'
import Footer from '@/components/public/Footer'

export const metadata = {
  title: 'Blog — Louka Millon',
  description: 'Automatisations, workflows et outils pour freelances et consultants. 1 article par semaine.',
}

const staticArticles: Article[] = [
  {
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
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export default async function BlogPage() {
  let articles: Article[] = staticArticles

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project.supabase.co') {
      const supabase = await createClient()
      const { data } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })

      if (data && data.length > 0) articles = data
    }
  } catch {
    // Use static fallback
  }

  return (
    <>
      <Nav />
      <main className="min-h-screen pt-24 pb-20 px-6">
        <div className="max-w-[1160px] mx-auto">
          <div className="mb-14">
            <Link href="/" className="font-dm text-sm text-text-muted hover:text-accent transition-colors mb-6 inline-flex items-center gap-2">
              ← Retour à l&apos;accueil
            </Link>
            <p className="font-mono text-xs text-accent tracking-[0.15em] uppercase mb-3 mt-4">Blog</p>
            <h1
              className="font-syne font-extrabold text-text-primary mb-4"
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
            >
              Automatisations en build public
            </h1>
            <p className="font-dm text-text-muted text-base leading-relaxed max-w-[540px]">
              Workflows, outils et leçons apprises — documentés au fil de la construction.
              {articles.length > 0 && ` ${articles.length} article${articles.length > 1 ? 's' : ''} disponible${articles.length > 1 ? 's' : ''}.`}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <article
                key={article.id}
                className="bg-surface border border-border rounded-2xl p-6 hover:border-accent hover:shadow-glow hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                {article.cover_url && (
                  <div className="w-full h-40 rounded-xl overflow-hidden mb-5 bg-bg">
                    <img src={article.cover_url} alt={article.title} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {article.category.slice(0, 3).map((cat) => (
                    <span key={cat} className="font-mono text-[11px] text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-full">
                      {cat}
                    </span>
                  ))}
                </div>

                <h2 className="font-syne font-bold text-text-primary text-base leading-snug mb-3 flex-1">
                  {article.title}
                </h2>

                {article.excerpt && (
                  <p className="font-dm text-text-muted text-sm leading-relaxed mb-5 line-clamp-3">
                    {article.excerpt}
                  </p>
                )}

                <div className="flex items-center justify-between mb-5">
                  <div className="flex flex-wrap gap-1">
                    {article.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="font-mono text-[10px] px-2 py-0.5 rounded bg-bg border border-border text-text-muted">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 mt-auto">
                  <Link
                    href={`/blog/${article.slug}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-surface border border-border text-sm font-dm text-text-primary hover:border-accent hover:text-accent transition-all duration-300"
                  >
                    Lire l&apos;article →
                  </Link>
                  {article.file_url && (
                    <a
                      href={article.file_url}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-bg text-sm font-dm font-medium shadow-glow hover:shadow-glow-lg transition-all duration-300"
                      download
                    >
                      ↓
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
