import CalendlyButton from './CalendlyButton'

const included = [
  'Tous les workflows dont vous avez besoin, construits et déployés',
  'Relances automatiques, CRM, onboarding, pipeline de vente',
  'Sem. 1–4 : je construis tout, vous ne touchez à rien',
  'Sem. 5–12 : appels hebdo, formation, ajustements illimités',
  'Briefing vidéo à chaque livraison',
  'Support Telegram prioritaire inclus',
  "Vous repartez autonome à l'issue des 90 jours",
]

const steps = [
  { n: '1', title: 'Audit gratuit (45 min)', desc: 'On analyse votre process ensemble, je détecte les tâches qui vous bloquent le plus. Gratuit, sans engagement.' },
  { n: '2', title: 'Proposition sur-mesure', desc: 'Sur la base de l\'analyse : les workflows prioritaires, le temps gagné estimé, le prix. Sous 48h.' },
  { n: '3', title: 'Je construis tout', desc: 'Sem. 1 à 4 : tous vos workflows déployés et opérationnels. Vous ne touchez à rien.' },
  { n: '4', title: 'Formation & pilotage', desc: 'Sem. 5 à 12 : appels hebdo, vous apprenez à piloter. Ajustements en temps réel.' },
  { n: '5', title: 'Autonomie totale', desc: 'Vos systèmes tournent seuls. Retainer optionnel à 500€/mois pour la suite.' },
]

export default function Pricing() {
  return (
    <section id="tarifs" className="py-28 px-6" aria-labelledby="tarifs-title">
      <div className="max-w-[1160px] mx-auto">

        <div className="mb-12">
          <p className="font-mono text-xs text-accent tracking-[0.15em] uppercase mb-3">Système 90</p>
          <h2
            className="font-syne font-extrabold text-text-primary mb-4"
            style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)' }}
            id="tarifs-title"
          >
            On identifie ce qui vous coûte du temps. On l&apos;automatise.
          </h2>
          <p className="font-dm text-text-muted text-base leading-relaxed max-w-[580px]">
            Pas de solution générique. On part de votre process réel, on détecte les tâches bloquantes,
            et je construis les automatisations qui vous font gagner le plus de temps, dans les 90 jours.
          </p>
        </div>

        {/* Main offer card */}
        <div className="bg-surface border border-accent shadow-glow rounded-2xl p-8 md:p-10 mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-5">
                <span className="font-mono text-xs text-accent border border-accent/30 rounded px-2 py-0.5">Programme 90 jours</span>
              </div>
              <p className="font-syne font-extrabold text-text-primary text-2xl mb-1">Système 90</p>
              <p className="font-syne font-bold mb-5 text-accent" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
                3 500 – 5 000€
                <span className="font-dm font-normal text-text-muted text-sm ml-3">selon votre situation</span>
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mb-6">
                {included.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm font-dm text-text-muted">
                    <span className="text-accent text-[8px] mt-1.5 flex-shrink-0">◆</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="bg-accent/5 border border-accent/20 rounded-xl px-5 py-3 inline-block">
                <p className="font-dm text-sm text-text-muted">
                  <span className="text-text-primary font-medium">Après les 90 jours :</span> retainer optionnel à{' '}
                  <span className="text-accent font-medium">500€/mois</span> pour la maintenance et les nouvelles automatisations.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end gap-4 flex-shrink-0">
              <CalendlyButton className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-accent text-bg font-dm font-medium text-sm shadow-glow hover:shadow-glow-lg hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap cursor-pointer">
                Réserver l&apos;audit gratuit →
              </CalendlyButton>
              <p className="font-dm text-text-muted text-xs text-right max-w-[220px] leading-relaxed">
                Si le fit n&apos;est pas bon, vous repartez avec une roadmap complète.{' '}
                <span className="text-text-primary">Gratuitement.</span>
              </p>
            </div>
          </div>
        </div>

        <p className="font-dm text-text-muted text-xs mb-20 opacity-60">
          * L&apos;hébergement des automatisations (serveur, outils tiers) n&apos;est pas inclus. Comptez environ 10 à 20&nbsp;€/mois selon la solution choisie.
        </p>

        {/* Process */}
        <div>
          <p className="font-mono text-xs text-accent tracking-[0.15em] uppercase mb-3">Comment ça marche</p>
          <h3 className="font-syne font-bold text-text-primary mb-8" style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)' }}>
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
