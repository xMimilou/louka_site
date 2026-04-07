// components/public/Pricing.tsx
import CalendlyButton from './CalendlyButton'

const buildIncludes = [
  'Audit process complet (45 min)',
  'Tous les workflows construits & déployés',
  'Briefing vidéo à chaque livraison',
]

const followIncludes = [
  'Formation pilotage (2h)',
  'Support Telegram 90 jours',
  'Révisions illimitées si < 5h/sem économisées',
  'Accès & documentation complète',
]

const steps = [
  {
    n: '1',
    title: 'Audit gratuit (45 min)',
    desc: "On analyse votre process ensemble, je détecte les tâches qui vous bloquent le plus. Gratuit, sans engagement.",
  },
  {
    n: '2',
    title: 'Proposition sur-mesure',
    desc: "Sur la base de l'analyse : les workflows prioritaires, le temps gagné estimé. Sous 48h.",
  },
  {
    n: '3',
    title: 'Je construis tout',
    desc: "J+0 à J+14 : tous vos workflows déployés et opérationnels. Vous ne touchez à rien.",
  },
  {
    n: '4',
    title: 'Formation & autonomie',
    desc: "J+14 : formation pilotage de 2h. Vos systèmes tournent seuls, vous savez les piloter.",
  },
  {
    n: '5',
    title: '76 jours de garantie',
    desc: "J+14 à J+90 : support Telegram, révisions illimitées si l'objectif 5h/sem n'est pas atteint.",
  },
]

export default function Pricing() {
  return (
    <section id="tarifs" className="py-28 px-6" aria-labelledby="tarifs-title">
      <div className="max-w-[1160px] mx-auto">

        {/* Header */}
        <div className="mb-12">
          <p className="font-mono text-xs text-accent tracking-[0.15em] uppercase mb-3">Système 90</p>
          <h2
            id="tarifs-title"
            className="font-syne font-extrabold text-text-primary mb-4"
            style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)' }}
          >
            On identifie ce qui vous coûte du temps. On l&apos;automatise.
          </h2>
          <p className="font-dm text-text-muted text-base leading-relaxed max-w-[580px]">
            Pas de solution générique. On part de votre process réel, on détecte les tâches bloquantes,
            et je construis les automatisations qui vous font gagner le plus de temps.
          </p>
        </div>

        {/* Split card */}
        <div className="bg-surface border border-accent shadow-glow rounded-2xl overflow-hidden mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3">

            {/* Left : prix + CTA */}
            <div className="col-span-1 p-8 flex flex-col items-center text-center gap-4 md:border-r border-b md:border-b-0 border-border">
              <p className="font-mono text-[10px] text-accent tracking-[0.15em] uppercase">Système 90</p>
              <p
                className="font-syne font-extrabold text-accent leading-none"
                style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)' }}
              >
                1 497€
              </p>
              <p className="font-dm text-text-muted text-xs">Prix de lancement</p>
              <div className="w-full h-px bg-border" />
              <p className="font-mono text-xs text-danger flex items-center gap-2">
                <span className="text-[8px]">●</span> 3 places restantes
              </p>
              <p className="font-mono text-[10px] text-text-muted">Ferme le 30 avril</p>
              <CalendlyButton className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-accent text-bg font-dm font-medium text-sm shadow-glow hover:shadow-glow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
                Réserver l&apos;audit gratuit →
              </CalendlyButton>
              <p className="font-dm text-text-muted text-[10px]">Gratuit · sans engagement</p>
            </div>

            {/* Right : phases + garantie */}
            <div className="col-span-2 p-8 flex flex-col gap-6">

              {/* Phase Build */}
              <div>
                <p className="font-mono text-[10px] text-accent tracking-[0.12em] uppercase mb-3">
                  J+0 → J+14 · Build
                </p>
                <ul className="flex flex-col gap-2">
                  {buildIncludes.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm font-dm text-text-muted">
                      <span className="text-accent text-[8px] mt-1.5 flex-shrink-0">◆</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="h-px bg-border" />

              {/* Phase Suivi */}
              <div>
                <p className="font-mono text-[10px] text-success tracking-[0.12em] uppercase mb-3">
                  J+14 → J+90 · Suivi &amp; Garantie
                </p>
                <ul className="flex flex-col gap-2">
                  {followIncludes.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm font-dm text-text-muted">
                      <span className="text-success text-[8px] mt-1.5 flex-shrink-0">◆</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Garantie inline */}
              <div className="bg-success/5 border border-success/20 rounded-xl px-5 py-3">
                <p className="font-dm text-sm text-text-muted">
                  <span className="text-text-primary font-medium">Garantie résultat :</span>{' '}
                  5h/sem économisées dans les 30 jours après livraison, ou je reviens sur les
                  workflows gratuitement jusqu&apos;à l&apos;objectif.
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* Process steps */}
        <div>
          <p className="font-mono text-xs text-accent tracking-[0.15em] uppercase mb-3">Comment ça marche</p>
          <h3
            className="font-syne font-bold text-text-primary mb-8"
            style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)' }}
          >
            De l&apos;audit à l&apos;autonomie
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {steps.map((step) => (
              <div key={step.n} className="bg-surface border border-border rounded-xl p-5">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <span className="font-mono text-sm font-bold text-accent">{step.n}</span>
                </div>
                <p className="font-syne font-semibold text-text-primary text-sm mb-2">{step.title}</p>
                <p className="font-dm text-text-muted text-xs leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
