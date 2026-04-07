import type { ReactNode } from 'react'

const stats = [
  { value: '7', label: 'Workflows\nen production' },
  { value: '5h+', label: 'Économisées par semaine\nobjectif garanti' },
  { value: '14j', label: 'De l\'audit\nà la livraison' },
]

const cases = [
  {
    label: 'Mon 1er workflow · Build in public',
    before: 'Relances prospects faites à la main : copier-coller, oublis, 1h30/sem perdue',
    after: 'Séquence n8n : email J+0 auto, relance J+3 si pas de réponse, CRM mis à jour',
    gain: '6h/sem récupérées',
    tools: ['n8n', 'Gmail', 'Google Sheets'],
  },
]

const workflowSteps = [
  { label: 'Nouveau contact\nGoogle Sheets', icon: 'table' },
  { label: 'Email J+0\nenvoyé auto', icon: 'mail' },
  { label: 'Attente\n3 jours', icon: 'clock' },
  { label: 'Pas de réponse\n→ Relance J+3', icon: 'refresh' },
  { label: 'Réponse\n→ CRM mis à jour', icon: 'check' },
]

function WorkflowIcon({ type }: { type: string }) {
  const icons: Record<string, ReactNode> = {
    table: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    ),
    mail: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    clock: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    refresh: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
      </svg>
    ),
    check: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  }
  return <>{icons[type]}</>
}

export default function SocialProof() {
  return (
    <section id="social-proof" className="py-20 px-6 border-y border-border bg-surface" aria-labelledby="proof-title">
      <div className="max-w-[1160px] mx-auto">

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
          {stats.map((stat) => (
            <div key={stat.value} className="text-center">
              <p className="font-syne font-extrabold text-accent mb-1" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
                {stat.value}
              </p>
              <p className="font-dm text-text-muted text-sm leading-snug whitespace-pre-line">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Workflow visual */}
        <div className="mb-16">
          <p className="font-mono text-xs text-accent tracking-[0.15em] uppercase mb-5" id="proof-title">
            Exemple de workflow livré
          </p>
          <div className="bg-bg border border-border rounded-xl p-5 overflow-x-auto">
            <div className="flex items-center gap-2 min-w-max">
              {workflowSteps.map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent flex-shrink-0">
                      <WorkflowIcon type={step.icon} />
                    </div>
                    <p className="font-dm text-[10px] text-text-muted text-center whitespace-pre-line leading-tight max-w-[72px]">
                      {step.label}
                    </p>
                  </div>
                  {i < workflowSteps.length - 1 && (
                    <svg viewBox="0 0 24 8" className="w-8 h-3 text-accent/40 flex-shrink-0 mb-4" fill="none" aria-hidden="true">
                      <path d="M0 4h20M16 1l4 3-4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
            <p className="font-mono text-[10px] text-text-muted mt-4 pt-4 border-t border-border tracking-wide">
              Workflow n8n · Relance prospect automatique · Construit et déployé en 2 jours
            </p>
          </div>
        </div>

        {/* Mini cases */}
        <div>
          <p className="font-mono text-xs text-accent tracking-[0.15em] uppercase mb-5">
            Résultats typiques · exemples indicatifs
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[600px]">
            {cases.map((c, i) => (
              <div key={i} className="bg-bg border border-border rounded-xl p-6">
                <p className="font-mono text-[10px] text-text-muted tracking-wider uppercase mb-4">{c.label}</p>
                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-3 text-sm font-dm">
                    <span className="font-mono text-danger text-xs mt-0.5 flex-shrink-0">✗</span>
                    <span className="text-text-muted">{c.before}</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm font-dm">
                    <span className="font-mono text-success text-xs mt-0.5 flex-shrink-0">✓</span>
                    <span className="text-text-primary">{c.after}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex gap-1.5 flex-wrap">
                    {c.tools.map((t) => (
                      <span key={t} className="font-mono text-[10px] px-2 py-0.5 rounded bg-surface border border-border text-text-muted">
                        {t}
                      </span>
                    ))}
                  </div>
                  <span className="font-syne font-bold text-accent text-sm">{c.gain}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
