'use client'

import { useState } from 'react'
import type { PlatformLink } from '@/lib/types'

interface PlatformsProps {
  platforms: PlatformLink[]
}

function PlatformIcon({ icon }: { icon: string }) {
  const icons: Record<string, React.ReactNode> = {
    malt: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
        <path d="M19.59 3.6L16.8 6.4a6.66 6.66 0 0 0-9.6 0L4.4 3.6A10.61 10.61 0 0 1 19.59 3.6zM3.6 4.41L6.4 7.2a6.66 6.66 0 0 0 0 9.6L3.6 19.59A10.61 10.61 0 0 1 3.6 4.41zM4.41 20.4L7.2 17.6a6.66 6.66 0 0 0 9.6 0l2.79 2.8A10.61 10.61 0 0 1 4.41 20.4zM20.4 19.59L17.6 16.8a6.66 6.66 0 0 0 0-9.6l2.8-2.79a10.61 10.61 0 0 1 0 15.18z" />
      </svg>
    ),
    comeup: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    linkedin: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
    github: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
      </svg>
    ),
    email: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    twitter: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  }
  return <>{icons[icon] || icons['email']}</>
}

export default function Platforms({ platforms }: PlatformsProps) {
  const [copied, setCopied] = useState(false)

  const emailPlatform = platforms.find(p => p.icon === 'email')

  const handleCopyEmail = () => {
    const email = emailPlatform?.label || 'hello@loukamillon.com'
    navigator.clipboard.writeText(email).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const displayPlatforms = platforms.filter(p => p.icon !== 'email').slice(0, 3)

  return (
    <section id="contact" className="py-28 px-6" aria-labelledby="contact-title">
      <div className="max-w-[1160px] mx-auto">
        <div className="mb-12">
          <p className="font-mono text-xs text-accent tracking-[0.15em] uppercase mb-3">Audit gratuit</p>
          <h2
            className="font-syne font-extrabold text-text-primary mb-4"
            style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)' }}
            id="contact-title"
          >
            Réservez votre audit automatisation
          </h2>
          <p className="font-dm text-text-muted text-base leading-relaxed max-w-[540px]">
            45 minutes pour cartographier vos process, identifier vos points de friction et définir les automatisations qui vous feraient gagner le plus de temps. Gratuit, sans engagement.
          </p>
        </div>

        {/* Platform cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {displayPlatforms.map((platform) => (
            <a
              key={platform.id}
              href={platform.url}
              target={platform.url !== '#' ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="bg-surface border border-border rounded-2xl p-7 hover:border-accent hover:shadow-glow hover:-translate-y-1 transition-all duration-300 block"
            >
              <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center mb-4 text-accent">
                <PlatformIcon icon={platform.icon} />
              </div>
              <p className="font-mono text-sm font-medium text-text-primary mb-1">{platform.platform}</p>
              <p className="font-dm text-sm text-text-muted">{platform.label}</p>
            </a>
          ))}
        </div>

        {/* Email copy */}
        {emailPlatform && (
          <div className="text-center">
            <button
              onClick={handleCopyEmail}
              className="font-mono text-sm text-accent hover:underline"
              type="button"
            >
              {copied ? '✓ Copié !' : emailPlatform.label}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
