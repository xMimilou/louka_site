import CalendlyButton from './CalendlyButton'

export default function Guarantee() {
  return (
    <section id="garantie" className="py-16 px-6" aria-labelledby="garantie-title">
      <div className="max-w-[860px] mx-auto">
        <div className="bg-surface border-2 border-accent/30 rounded-2xl p-8 md:p-10 relative overflow-hidden">
          {/* Background accent glow */}
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(3,105,161,0.05) 0%, transparent 70%)' }}
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
            {/* Shield icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-accent fill-none stroke-accent" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-mono text-xs text-accent border border-accent/30 rounded px-2 py-0.5 tracking-wider uppercase">
                  Garantie résultat
                </span>
              </div>
              <h2
                id="garantie-title"
                className="font-syne font-extrabold text-text-primary mb-3"
                style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.6rem)' }}
              >
                5 heures économisées par semaine — ou je travaille gratuitement.
              </h2>
              <p className="font-dm text-text-muted text-sm leading-relaxed mb-4 max-w-[580px]">
                Si vous ne gagnez pas au moins{' '}
                <span className="text-text-primary font-medium">5 heures par semaine</span>{' '}
                sur vos tâches répétitives dans les{' '}
                <span className="text-text-primary font-medium">30 jours après livraison</span>,
                je revois les workflows gratuitement jusqu&apos;à ce qu&apos;on y arrive.
                Sans condition, sans délai.
              </p>
              <div className="flex flex-wrap gap-3 text-xs font-mono text-text-muted">
                <span className="flex items-center gap-1.5">
                  <span className="text-accent">◆</span> Aucune clause en petit caractère
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-accent">◆</span> Révisions illimitées jusqu&apos;à l&apos;objectif
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-accent">◆</span> Vous gardez tout ce qui est livré
                </span>
              </div>
            </div>

            <div className="flex-shrink-0 w-full md:w-auto">
              <CalendlyButton className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-accent text-bg font-dm font-medium text-sm shadow-glow hover:shadow-glow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer whitespace-nowrap">
                Tester la garantie →
              </CalendlyButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
