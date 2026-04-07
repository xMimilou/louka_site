import type { ReactNode } from 'react'
import type { Workflow } from '@/lib/types'

const workflowIcons: Record<number, ReactNode> = {
  0: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-accent fill-none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16v2H4zM4 10h16v2H4zM4 16h10v2H4z" />
    </svg>
  ),
  1: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-accent fill-none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  2: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-accent fill-none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.16 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.11 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16z" />
    </svg>
  ),
  3: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-accent fill-none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  4: (
    <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-accent fill-none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
    </svg>
  ),
}

interface ServicesProps {
  workflows: Workflow[]
}

export default function Services({ workflows }: ServicesProps) {
  const problems = [
    { before: 'Relances prospects faites à la main', after: 'Séquences automatiques J+0 à J+10' },
    { before: 'Comptes-rendus rédigés après chaque appel', after: 'Résumé généré et envoyé automatiquement' },
    { before: 'Onboarding client : 2h de config à chaque fois', after: 'Parcours déclenché à la signature, zéro intervention' },
    { before: 'Factures créées une par une dans le CRM', after: 'Générées et envoyées dès validation' },
    { before: 'Reporting hebdo assemblé à la main', after: 'Dashboard mis à jour en temps réel' },
  ]

  return (
    <section id="offres" className="py-28 px-6" aria-labelledby="offres-title">
      <div className="max-w-[1160px] mx-auto">
        <div className="mb-12">
          <p className="font-mono text-xs text-accent tracking-[0.15em] uppercase mb-3">Le problème</p>
          <h2 className="font-syne font-extrabold text-text-primary mb-4" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)' }} id="offres-title">
            Vous perdez combien d&apos;heures par semaine sur des tâches que vous pourriez ne plus faire ?
          </h2>
          <p className="font-dm text-text-muted text-base leading-relaxed max-w-[580px]">
            Relances manuelles, suivi client, onboarding, admin répétitif : chaque heure passée sur ces tâches
            est une heure de moins sur ce qui fait vraiment avancer votre business.
          </p>
        </div>

        {/* Before / After */}
        <div className="bg-surface border border-border rounded-2xl p-8 mb-10">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-6">
            <p className="font-mono text-xs text-accent tracking-[0.15em] uppercase">Avant → Après</p>
            <p className="font-mono text-xs text-text-muted tracking-[0.1em]">Exemples · votre cas sera différent</p>
          </div>
          <div className="space-y-3 mb-6">
            {problems.map((problem, i) => (
              <div key={i} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-sm font-dm">
                <span className="text-text-muted bg-bg border border-border rounded-lg px-3 py-2">{problem.before}</span>
                <span className="text-accent font-mono font-bold">→</span>
                <span className="text-text-primary bg-accent/5 border border-accent/20 rounded-lg px-3 py-2">{problem.after}</span>
              </div>
            ))}
          </div>
          <p className="font-dm text-text-muted text-xs border-t border-border pt-5">
            Chaque système est construit à partir de <span className="text-text-primary">votre process réel</span>.
            Pas un template, pas une solution générique. On part de ce que vous faites aujourd&apos;hui et on automatise ce qui vous coûte le plus de temps.
          </p>
        </div>

        {/* Workflows */}
        <div className="mb-10">
          <p className="font-mono text-xs text-accent tracking-[0.15em] uppercase mb-3">Offert · Sans engagement</p>
          <p className="font-dm text-text-muted text-sm mb-2 max-w-[580px]">
            Une roadmap complète, des workflows prêts à l&apos;emploi, les outils adaptés à votre situation.
            Que vous travailliez avec moi ou non, c&apos;est à vous, gratuitement.
          </p>
          <p className="font-mono text-xs text-accent/70 tracking-[0.12em] mb-6">
            Ce que d&apos;autres facturent entre 150€ et 800€, offert ici.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {workflows.map((wf, i) => (
              <div
                key={wf.id}
                className={`relative bg-surface border rounded-xl p-5 transition-all duration-300 ${
                  wf.coming_soon
                    ? 'border-border opacity-60'
                    : 'border-border hover:border-accent hover:shadow-glow'
                }`}
              >
                {wf.coming_soon && (
                  <span className="absolute top-3 right-3 font-mono text-[10px] px-2 py-0.5 rounded-full bg-surface border border-border text-text-muted">
                    Bientôt
                  </span>
                )}
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  {workflowIcons[i] ?? workflowIcons[0]}
                </div>
                <p className="font-syne font-semibold text-text-primary text-sm mb-2">{wf.title}</p>
                <p className="font-dm text-text-muted text-xs leading-relaxed mb-3">{wf.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {wf.tags.map((tag) => (
                    <span key={tag} className="font-mono text-[10px] px-2 py-0.5 rounded bg-bg border border-border text-text-muted">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Solution statement */}
        <div className="bg-surface border border-accent/20 rounded-2xl p-8 text-center">
          <p className="font-mono text-xs text-accent tracking-[0.15em] uppercase mb-3">Ce que je fais vraiment</p>
          <p className="font-syne font-bold text-text-primary text-xl mb-3">
            Je construis ce qu&apos;aucun template ne peut faire : un système taillé pour votre business.
          </p>
          <p className="font-dm text-text-muted text-sm max-w-[580px] mx-auto">
            On part de votre process réel. J&apos;identifie ce qui vous coûte le plus de temps,
            je construis les automatisations qui y répondent exactement, et je vous forme à les piloter.
          </p>
        </div>
      </div>
    </section>
  )
}
