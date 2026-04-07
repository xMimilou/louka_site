import type { PlatformLink } from '@/lib/types'
import CalendlyButton from './CalendlyButton'

interface HeroProps {
  platforms: PlatformLink[]
}

export default function Hero({ platforms: _ }: HeroProps) {
  return (
    <header
      id="hero"
      className="relative min-h-screen flex items-center justify-center text-center px-6 pb-20 overflow-hidden"
      style={{ paddingTop: 'calc(var(--bar-height, 0px) + 8rem)' }}
    >
      {/* Dots grid background */}
      <div className="hero-grid absolute inset-0 z-0 pointer-events-none" aria-hidden="true" />

      {/* Radial glow */}
      <div
        className="hero-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] pointer-events-none z-0"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-[760px] mx-auto">
        <p className="font-mono text-xs text-accent tracking-[0.18em] uppercase mb-6">
          Pour freelances · consultants · coachs
        </p>

        <h1 className="font-syne font-extrabold leading-tight mb-5" style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)' }}>
          Vous perdez des heures sur des tâches répétitives.{' '}
          <span className="text-accent hero-accent-glow">
            Je les automatise.
          </span>
        </h1>

        <p className="font-dm text-text-muted leading-relaxed max-w-[560px] mx-auto mb-10" style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)' }}>
          En 14 jours, vos workflows sont construits et déployés.
          Dans les 90 jours, vous êtes autonome — ou je reviens gratuitement.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap justify-center gap-4">
          <CalendlyButton className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent text-bg font-dm font-medium text-sm shadow-glow hover:shadow-glow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
            Réserver mon audit gratuit (45 min) →
          </CalendlyButton>
          <a
            href="#offres"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-text-primary font-dm font-medium text-sm hover:border-accent hover:shadow-glow hover:-translate-y-0.5 transition-all duration-300"
          >
            Découvrir le Système 90 ↓
          </a>
        </div>

        <p className="font-mono text-[10px] text-danger mt-5 tracking-wide flex items-center justify-center gap-2">
          <span>●</span>
          <span>3 places restantes · Prix de lancement 1 497€</span>
        </p>
      </div>
    </header>
  )
}
