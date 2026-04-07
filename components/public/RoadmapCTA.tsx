export default function RoadmapCTA() {
  return (
    <section id="roadmap" className="py-20 px-6" aria-labelledby="roadmap-title">
      <div className="max-w-[680px] mx-auto">
        <div className="bg-surface border border-accent/20 rounded-2xl p-10 text-center relative overflow-hidden">
          {/* Glow */}
          <div
            className="roadmap-glow absolute inset-0 rounded-2xl pointer-events-none"
            aria-hidden="true"
          />

          <span className="inline-block font-mono text-[0.7rem] tracking-[0.12em] uppercase text-accent bg-accent/10 border border-accent/20 rounded-full px-3 py-1 mb-5">
            Guide gratuit
          </span>

          <h2
            id="roadmap-title"
            className="font-syne font-extrabold text-text-primary mb-2"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)' }}
          >
            Roadmap Automatisation
          </h2>
          <p className="font-dm font-medium text-accent mb-6">
            Pour freelances, consultants et coachs
          </p>

          <ul className="text-left inline-flex flex-col gap-2 mb-8">
            {[
              'Identifiez les tâches qui vous coûtent le plus de temps',
              'Priorisez les bonnes automatisations avec une matrice simple',
              'Passez à l\'action en 30 jours',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 font-dm text-sm text-text-muted">
                <span className="text-accent mt-0.5 flex-shrink-0">→</span>
                {item}
              </li>
            ))}
          </ul>

          <a
            href="/Roadmap_Automatisation_Freelances.pdf"
            download
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-accent text-bg font-dm font-medium text-sm shadow-glow hover:shadow-glow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Télécharger le guide gratuit
          </a>

          <p className="font-mono text-[0.7rem] text-text-muted tracking-wider mt-4">
            PDF · 7 pages · Aucune inscription requise
          </p>
        </div>
      </div>
    </section>
  )
}
