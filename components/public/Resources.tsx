import Link from 'next/link'
import type { Article } from '@/lib/types'

interface ResourcesProps {
  articles: Article[]
}

export default function Resources({ articles }: ResourcesProps) {
  return (
    <section
      id="outils"
      className="py-28 px-6"
      style={{ background: '#0D1117' }}
      aria-labelledby="outils-title"
    >
      <div className="max-w-[1160px] mx-auto">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <p className="font-mono text-xs text-accent tracking-[0.15em] uppercase mb-3">Ressources</p>
            <h2
              className="font-syne font-extrabold text-text-primary mb-3"
              style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)' }}
              id="outils-title"
            >
              Outils gratuits
            </h2>
            <p className="font-dm text-text-muted text-base leading-relaxed max-w-[540px]">
              Scripts, guides et templates que j&apos;utilise au quotidien, disponibles gratuitement.
            </p>
          </div>
          <Link
            href="/ressources"
            className="font-dm text-sm text-accent hover:underline flex-shrink-0"
          >
            Voir tout →
          </Link>
        </div>

        {articles.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                type: 'Template n8n',
                title: 'Séquence de relance prospect automatisée',
                desc: 'Workflow n8n clé-en-main : J+0 à J+10, emails personnalisés depuis Google Sheets. Branchez, ajoutez un contact, le reste se fait seul.',
                tags: ['n8n', 'Gmail', 'Google Sheets'],
                free: true,
              },
              {
                type: 'Template n8n',
                title: 'Veille concurrentielle automatisée',
                desc: 'Workflow n8n pour surveiller les sites et réseaux de vos concurrents. Digest hebdomadaire par email ou Telegram.',
                tags: ['n8n', 'RSS', 'Telegram'],
                free: true,
              },
              {
                type: 'Guide PDF',
                title: 'Cartographier ses process en 1h',
                desc: 'Méthode simple pour identifier vos tâches répétitives, estimer le temps perdu et prioriser les automatisations à fort ROI.',
                tags: ['Process', 'Audit', 'Freelance'],
                free: true,
              },
            ].map((item, i) => (
              <article
                key={i}
                className="bg-surface border border-border rounded-2xl p-6 hover:border-accent hover:shadow-glow hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-accent fill-none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[11px] text-text-muted bg-surface border border-border px-2 py-0.5 rounded-full">
                      {item.type}
                    </span>
                    {item.free && (
                      <span className="font-mono text-[11px] text-success bg-success/10 border border-success/30 px-2 py-0.5 rounded-full">
                        Gratuit
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-syne font-bold text-text-primary text-base leading-snug mb-3">{item.title}</h3>
                <p className="font-dm text-text-muted text-sm leading-relaxed flex-1 mb-5">{item.desc}</p>

                <div className="flex flex-wrap gap-1.5 mb-5">
                  {item.tags.map((tag) => (
                    <span key={tag} className="font-mono text-[11px] px-2 py-0.5 rounded bg-bg border border-border text-text-muted">
                      {tag}
                    </span>
                  ))}
                </div>

                <Link
                  href="/ressources"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-border text-sm font-dm text-text-primary hover:border-accent hover:text-accent transition-all duration-300 w-full justify-center"
                >
                  Accéder à la ressource →
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {articles.map((article) => (
              <article
                key={article.id}
                className="bg-surface border border-border rounded-2xl p-6 hover:border-accent hover:shadow-glow hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    {article.category.slice(0, 2).map((cat) => (
                      <span key={cat} className="font-mono text-[11px] text-text-muted bg-surface border border-border px-2 py-0.5 rounded-full">
                        {cat}
                      </span>
                    ))}
                    {article.file_url && (
                      <span className="font-mono text-[11px] text-success bg-success/10 border border-success/30 px-2 py-0.5 rounded-full">
                        Gratuit
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-syne font-bold text-text-primary text-base leading-snug mb-3">{article.title}</h3>
                {article.excerpt && (
                  <p className="font-dm text-text-muted text-sm leading-relaxed flex-1 mb-5">{article.excerpt}</p>
                )}

                <Link
                  href={`/ressources/${article.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-border text-sm font-dm text-text-primary hover:border-accent hover:text-accent transition-all duration-300 w-full justify-center mt-auto"
                >
                  {article.file_url ? 'Télécharger →' : 'Lire →'}
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
