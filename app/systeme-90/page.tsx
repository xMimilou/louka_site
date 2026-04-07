import type { Metadata } from 'next'
import Nav from '@/components/public/Nav'
import Footer from '@/components/public/Footer'
import CalendlyButton from '@/components/public/CalendlyButton'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Système 90 — Automatisation sur-mesure en 90 jours | Louka Millon',
  description: 'Workflows d\'automatisation construits et déployés en 14 jours. Garanti : 5h/sem économisées ou révisions gratuites jusqu\'à y arriver.',
}

const offer = {
  price: '1 497€',
  tag: 'Recommandé · 3 places restantes',
  features: [
    'Audit de process complet (45 min)',
    'Tous vos workflows construits & déployés (J+0 → J+14)',
    'Briefing vidéo à chaque livraison',
    'Formation pilotage 2h (J+14)',
    'Support Telegram 90 jours',
    'Révisions illimitées si < 5h/sem économisées',
    'Accès & documentation complète',
  ],
}

const steps = [
  { n: '1', title: 'Audit gratuit (45 min)', desc: "On analyse votre process ensemble, je détecte les tâches qui vous bloquent le plus. Gratuit, sans engagement." },
  { n: '2', title: 'Proposition sur-mesure', desc: "Sur la base de l'analyse : les workflows prioritaires, le temps gagné estimé. Sous 48h." },
  { n: '3', title: 'Je construis tout', desc: "J+0 à J+14 : tous vos workflows déployés et opérationnels. Vous ne touchez à rien." },
  { n: '4', title: 'Formation & autonomie', desc: "J+14 : formation pilotage de 2h. Vos systèmes tournent seuls, vous savez les piloter." },
  { n: '5', title: '76 jours de garantie', desc: "J+14 à J+90 : support Telegram, révisions illimitées si l'objectif 5h/sem n'est pas atteint." },
]

const included = [
  'Relances automatiques prospects',
  'CRM Google Sheets automatisé',
  'Onboarding client zéro friction',
  'Facturation & relances de paiement',
  'Reporting hebdo automatique',
  'Alertes Telegram sur vos KPIs',
  'Dashboard pipeline de vente',
  'Tout ce qui vous coûte du temps',
]

export default function Systeme90() {
  return (
    <>
      <Nav />
      <main className="pt-32 pb-20 px-6">

        {/* Hero */}
        <section className="max-w-[860px] mx-auto text-center mb-20">
          <p className="font-mono text-xs text-accent tracking-[0.18em] uppercase mb-4">Programme 90 jours</p>
          <h1
            className="font-syne font-extrabold text-text-primary leading-tight mb-5"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
          >
            Vos workflows construits et déployés.{' '}
            <span className="text-accent">En 14 jours.</span>
          </h1>
          <p className="font-dm text-text-muted leading-relaxed max-w-[600px] mx-auto mb-8" style={{ fontSize: 'clamp(1rem, 1.8vw, 1.15rem)' }}>
            Je construis tout ce qui vous prend du temps, vous formez à le piloter, et vous repartez
            autonome à 90 jours. Garanti : 5h/sem économisées ou révisions gratuites jusqu&apos;à y arriver.
          </p>
          <CalendlyButton className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-accent text-bg font-dm font-medium text-sm shadow-glow hover:shadow-glow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
            Réserver l&apos;audit gratuit (45 min) →
          </CalendlyButton>
        </section>

        {/* Pricing */}
        <section className="max-w-[1160px] mx-auto mb-20" aria-labelledby="pricing-title">
          <p className="font-mono text-xs text-accent tracking-[0.15em] uppercase mb-3 text-center">L&apos;offre</p>
          <h2
            id="pricing-title"
            className="font-syne font-extrabold text-text-primary text-center mb-10"
            style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}
          >
            Système 90 — tout inclus, un seul tarif.
          </h2>
          <div className="max-w-[560px] mx-auto">
            <div className="relative rounded-2xl p-8 bg-surface border-2 border-accent shadow-glow">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 font-mono text-[10px] px-3 py-1 rounded-full bg-accent text-bg tracking-wider uppercase whitespace-nowrap">
                {offer.tag}
              </span>
              <div className="mb-6 text-center">
                <p className="font-mono text-xs text-accent tracking-wider uppercase mb-2">Système 90</p>
                <p
                  className="font-syne font-extrabold text-accent leading-none mb-1"
                  style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)' }}
                >
                  {offer.price}
                </p>
                <p className="font-dm text-text-muted text-xs">Prix de lancement</p>
              </div>
              <ul className="space-y-2 mb-6">
                {offer.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 font-dm text-sm text-text-muted">
                    <span className="text-accent text-[8px] mt-1.5 flex-shrink-0">◆</span>
                    {f}
                  </li>
                ))}
              </ul>
              <CalendlyButton className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-accent text-bg font-dm font-medium text-sm shadow-glow hover:shadow-glow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
                Réserver l&apos;audit gratuit →
              </CalendlyButton>
              <p className="font-dm text-center text-text-muted text-[10px] mt-2">Gratuit · sans engagement</p>
            </div>
          </div>
        </section>

        {/* What's included */}
        <section className="max-w-[1160px] mx-auto mb-20">
          <p className="font-mono text-xs text-accent tracking-[0.15em] uppercase mb-3">Ce qu&apos;on automatise</p>
          <h2 className="font-syne font-bold text-text-primary mb-8" style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)' }}>
            Tout ce qui vous prend du temps, on le construit.
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {included.map((item) => (
              <div key={item} className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3">
                <span className="text-accent text-[8px] flex-shrink-0">◆</span>
                <span className="font-dm text-text-muted text-sm">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Process */}
        <section className="max-w-[1160px] mx-auto mb-20">
          <p className="font-mono text-xs text-accent tracking-[0.15em] uppercase mb-3">Comment ça marche</p>
          <h2 className="font-syne font-bold text-text-primary mb-8" style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)' }}>
            De l&apos;audit à l&apos;autonomie en 90 jours
          </h2>
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
        </section>

        {/* Guarantee */}
        <section className="max-w-[760px] mx-auto mb-20">
          <div className="bg-surface border-2 border-accent/30 rounded-2xl p-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-5">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-accent fill-none stroke-accent" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            </div>
            <span className="font-mono text-xs text-accent border border-accent/30 rounded px-2 py-0.5 tracking-wider uppercase mb-4 inline-block">
              Garantie résultat
            </span>
            <h2 className="font-syne font-extrabold text-text-primary mb-3" style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.5rem)' }}>
              5 heures économisées par semaine — ou je retravaille gratuitement.
            </h2>
            <p className="font-dm text-text-muted text-sm leading-relaxed max-w-[520px] mx-auto mb-6">
              Si vous ne gagnez pas au moins 5 heures par semaine dans les 30 jours après livraison,
              je revois les workflows gratuitement jusqu&apos;à ce qu&apos;on y arrive. Sans condition.
            </p>
            <CalendlyButton className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-accent text-bg font-dm font-medium text-sm shadow-glow hover:shadow-glow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
              Démarrer avec l&apos;audit gratuit →
            </CalendlyButton>
          </div>
        </section>

        <div className="text-center">
          <Link href="/" className="font-dm text-sm text-accent hover:underline">← Retour à l&apos;accueil</Link>
        </div>

      </main>
      <Footer />
    </>
  )
}
