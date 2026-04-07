import type { PlatformLink } from '@/lib/types'
import CalendlyButton from './CalendlyButton'

interface HeroProps {
  platforms: PlatformLink[]
}

export default function Hero({ platforms: _ }: HeroProps) {
  return (
    <header
      id="hero"
      className="relative min-h-screen flex items-center justify-center text-center px-6 pt-32 pb-20 overflow-hidden"
    >
      {/* Isometric grid background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 800"
          preserveAspectRatio="xMidYMid slice"
          className="w-full h-full opacity-[0.07]"
        >
          <defs>
            <pattern id="isogrid" x="0" y="0" width="80" height="46.19" patternUnits="userSpaceOnUse">
              <line x1="0" y1="23.09" x2="40" y2="0" stroke="#00D4FF" strokeWidth="0.5" />
              <line x1="40" y1="0" x2="80" y2="23.09" stroke="#00D4FF" strokeWidth="0.5" />
              <line x1="80" y1="23.09" x2="40" y2="46.19" stroke="#00D4FF" strokeWidth="0.5" />
              <line x1="40" y1="46.19" x2="0" y2="23.09" stroke="#00D4FF" strokeWidth="0.5" />
              <line x1="0" y1="23.09" x2="80" y2="23.09" stroke="#00D4FF" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="1200" height="800" fill="url(#isogrid)" />
        </svg>
      </div>

      {/* Radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse at center, rgba(0,212,255,0.12) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-[760px] mx-auto">
        <p className="font-mono text-xs text-accent tracking-[0.18em] uppercase mb-6">
          Pour freelances · consultants · coachs
        </p>

        <h1 className="font-syne font-extrabold leading-tight mb-5" style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)' }}>
          Vous perdez des heures sur des tâches répétitives.{' '}
          <span className="text-accent" style={{ textShadow: '0 0 40px rgba(0,212,255,0.5)' }}>
            Je les automatise.
          </span>
        </h1>

        <p className="font-dm text-text-muted leading-relaxed max-w-[560px] mx-auto mb-10" style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)' }}>
          J&apos;analyse votre process avec vous, détecte les tâches qui vous bloquent,
          et construis les automatisations qui vous font gagner un maximum de temps.
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
      </div>
    </header>
  )
}
