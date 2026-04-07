// components/public/Footer.tsx
import Link from 'next/link'
import type { PlatformLink } from '@/lib/types'

interface FooterProps {
  platforms?: PlatformLink[]
}

export default function Footer({ platforms = [] }: FooterProps) {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border py-10 px-6">
      <div className="max-w-[1160px] mx-auto flex flex-col gap-6">

        {/* Platforms */}
        {platforms.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {platforms.map((p) => (
              <a
                key={p.id}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-dm text-xs text-text-muted hover:text-text-primary transition-colors"
              >
                {p.label}
              </a>
            ))}
          </div>
        )}

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-accent text-sm font-medium">[L.M]</span>
            <span className="text-text-muted text-xs font-dm">
              © {year} Louka Millon · Tous droits réservés
            </span>
          </div>

          <nav
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
            aria-label="Liens de pied de page"
          >
            <a
              href="#tarifs"
              className="text-text-muted text-xs font-dm hover:text-text-primary transition-colors"
            >
              Offre
            </a>
            <Link
              href="/systeme-90"
              className="text-text-muted text-xs font-dm hover:text-text-primary transition-colors"
            >
              Système 90
            </Link>
            <Link
              href="/ressources"
              className="text-text-muted text-xs font-dm hover:text-text-primary transition-colors"
            >
              Ressources
            </Link>
            <Link
              href="/a-propos"
              className="text-text-muted text-xs font-dm hover:text-text-primary transition-colors"
            >
              À propos
            </Link>
            <span className="hidden md:block text-border">|</span>
            <Link
              href="/mentions-legales"
              className="text-text-muted text-xs font-dm hover:text-text-primary transition-colors"
            >
              Mentions légales
            </Link>
            <Link
              href="/cgv"
              className="text-text-muted text-xs font-dm hover:text-text-primary transition-colors"
            >
              CGV
            </Link>
          </nav>
        </div>

      </div>
    </footer>
  )
}
