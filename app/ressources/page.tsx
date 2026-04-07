import { permanentRedirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import type { Article } from '@/lib/types'
import Link from 'next/link'
import Nav from '@/components/public/Nav'
import Footer from '@/components/public/Footer'

export const metadata = {
  title: 'Ressources gratuites — Louka Millon',
  description: 'Scripts Python, templates n8n, guides et outils gratuits pour automatiser vos processus.',
}

const staticArticles: Article[] = [
  {
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
  },
  {
    id: '2',
    title: 'Veille concurrentielle automatisée',
    slug: 'veille-concurrentielle-n8n',
    excerpt: 'Workflow n8n clé-en-main pour surveiller les sites concurrents et recevoir un digest hebdomadaire par email ou Telegram.',
    content: null,
    category: ['n8n', 'Automatisation'],
    tags: ['RSS', 'Telegram', 'workflow'],
    cover_url: null,
    file_url: '#',
    file_label: 'Télécharger le template',
    ext_link: null,
    ext_label: null,
    status: 'published',
    downloads: 89,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    title: "Architecture d'un bot de trading robuste",
    slug: 'architecture-bot-trading-mt5',
    excerpt: "Les 7 composants critiques d'un Expert Advisor MT5 qui survit en production : gestion du risque, journalisation, fail-safes.",
    content: null,
    category: ['MQL5', 'Finance'],
    tags: ['MT5', 'risk management', 'algo trading'],
    cover_url: null,
    file_url: '#',
    file_label: 'Télécharger le guide PDF',
    ext_link: null,
    ext_label: null,
    status: 'published',
    downloads: 213,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export default async function RessourcesPage() {
  permanentRedirect('/blog')
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
            <p className="font-mono text-xs text-accent tracking-[0.15em] uppercase mb-3 mt-4">Ressources</p>
            <h1
              className="font-syne font-extrabold text-text-primary mb-4"
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
            >
              Outils gratuits
            </h1>
            <p className="font-dm text-text-muted text-base leading-relaxed max-w-[540px]">
              Scripts, guides et templates que j&apos;utilise au quotidien — disponibles gratuitement.
              {articles.length > 0 && ` ${articles.length} ressource${articles.length > 1 ? 's' : ''} disponible${articles.length > 1 ? 's' : ''}.`}
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
                  {article.file_url && (
                    <span className="font-mono text-[11px] text-success bg-success/10 border border-success/30 px-2 py-0.5 rounded-full">
                      Gratuit
                    </span>
                  )}
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
                  {article.downloads > 0 && (
                    <span className="font-mono text-[11px] text-text-muted">
                      {article.downloads} dl
                    </span>
                  )}
                </div>

                <div className="flex gap-3 mt-auto">
                  <Link
                    href={`/ressources/${article.slug}`}
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
