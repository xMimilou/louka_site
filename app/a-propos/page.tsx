import type { Metadata } from 'next'
import Nav from '@/components/public/Nav'
import Footer from '@/components/public/Footer'
import CalendlyButton from '@/components/public/CalendlyButton'

export const metadata: Metadata = {
  title: 'À propos — Louka Millon',
  description: 'Freelance en automatisation des workflows. Je construis les systèmes qui vous font gagner du temps, sur-mesure.',
}

const projects = [
  {
    name: 'Workflow n8n — Relance client',
    category: 'Automatisation',
    status: 'En production',
    description: "Workflow n8n de relance client automatisée : séquences personnalisées, déclencheurs sur inactivité, zéro intervention manuelle.",
    stack: ['n8n', 'APIs', 'CRM'],
  },
  {
    name: 'Workflow n8n — Onboarding client',
    category: 'Automatisation',
    status: 'En production',
    description: "Automatisation complète de l'onboarding : dossier Drive créé, accès envoyés, email de bienvenue personnalisé — déclenché dès la signature.",
    stack: ['n8n', 'Google Drive', 'Gmail'],
  },
  {
    name: 'Workflow n8n — Pipeline de vente',
    category: 'Automatisation',
    status: 'En production',
    description: "CRM léger sur Google Sheets avec notifications Telegram à chaque étape clé : nouveau prospect, devis envoyé, relance automatique.",
    stack: ['n8n', 'Google Sheets', 'Telegram'],
  },
]

const values = [
  {
    title: 'Pas de template',
    desc: 'Chaque système est construit sur vos process réels. Pas une solution générique copiée-collée.',
  },
  {
    title: 'Vous repartez autonome',
    desc: 'L\'objectif n\'est pas de créer une dépendance. Vous comprenez et maîtrisez ce qui est livré.',
  },
  {
    title: 'Résultat mesurable',
    desc: 'On définit en amont ce qu\'on va économiser. Si l\'objectif n\'est pas atteint, je continue gratuitement.',
  },
]

export default function APropos() {
  return (
    <>
      <Nav />
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-[1160px] mx-auto">

          {/* Bio */}
          <section className="max-w-[760px] mb-20">
            <p className="font-mono text-xs text-accent tracking-[0.18em] uppercase mb-4">À propos</p>
            <h1
              className="font-syne font-extrabold text-text-primary leading-tight mb-6"
              style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}
            >
              Je construis les systèmes qui vous libèrent du temps.
            </h1>
            <div className="space-y-4 font-dm text-text-muted leading-relaxed">
              <p>
                Je suis Louka Millon, freelance en automatisation des workflows. Je travaille avec des freelances,
                consultants et coachs qui perdent trop de temps sur des tâches répétitives — relances, onboarding,
                CRM, reporting — et qui veulent en sortir.
              </p>
              <p>
                Mon approche : partir de votre process réel, identifier ce qui vous coûte le plus, et construire
                les automatisations qui y répondent exactement. Pas de solution générique, pas de template vendu
                à 100 personnes. Un système taillé pour vous.
              </p>
              <p>
                À la fin du programme, vous repartez avec vos automatisations en place <em>et</em> la capacité
                de les piloter seul. C&apos;est ça, l&apos;objectif.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 mt-8">
              <CalendlyButton className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent text-bg font-dm font-medium text-sm shadow-glow hover:shadow-glow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
                Réserver un audit gratuit →
              </CalendlyButton>
              <a
                href="https://www.linkedin.com/in/louka-millon-426b7a1b7/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-text-primary font-dm font-medium text-sm hover:border-accent hover:shadow-glow hover:-translate-y-0.5 transition-all duration-300"
              >
                LinkedIn →
              </a>
            </div>
          </section>

          {/* Values */}
          <section className="mb-20">
            <p className="font-mono text-xs text-accent tracking-[0.15em] uppercase mb-5">Approche</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {values.map((v) => (
                <div key={v.title} className="bg-surface border border-border rounded-xl p-6">
                  <p className="font-syne font-bold text-text-primary mb-2">{v.title}</p>
                  <p className="font-dm text-text-muted text-sm leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Portfolio */}
          <section>
            <p className="font-mono text-xs text-accent tracking-[0.15em] uppercase mb-3">Automatisations en production</p>
            <h2 className="font-syne font-bold text-text-primary mb-8" style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)' }}>
              Workflows déployés
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((p) => (
                <div key={p.name} className="bg-surface border border-border rounded-xl p-6 flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <p className="font-syne font-semibold text-text-primary text-sm">{p.name}</p>
                      <p className="font-mono text-[10px] text-accent tracking-wide">{p.category}</p>
                    </div>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20 flex-shrink-0">
                      {p.status}
                    </span>
                  </div>
                  <p className="font-dm text-text-muted text-xs leading-relaxed mb-4 flex-1">{p.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.stack.map((t) => (
                      <span key={t} className="font-mono text-[10px] px-2 py-0.5 rounded bg-bg border border-border text-text-muted">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>
      <Footer />
    </>
  )
}
