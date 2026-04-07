// components/public/EmailCapture.tsx
'use client'

import { useState } from 'react'

export default function EmailCapture() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    try {
      const res = await fetch('/api/email-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setStatus('success')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="py-16 px-6" aria-labelledby="email-capture-title">
      <div className="max-w-[700px] mx-auto">
        <div className="bg-surface border border-border rounded-2xl p-8 grid grid-cols-1 md:grid-cols-[90px_1fr] gap-8 items-center">

          {/* PDF mock */}
          <div
            className="hidden md:flex w-[90px] flex-shrink-0 flex-col items-center bg-bg border border-border rounded-lg p-3 text-center"
            style={{ boxShadow: '4px 4px 0 #0369A1' }}
            aria-hidden="true"
          >
            <p className="font-mono text-[8px] text-accent tracking-wider mb-2">PDF GRATUIT</p>
            <div className="h-1 w-full bg-border rounded mb-1" />
            <div className="h-1 bg-border rounded mb-1" style={{ width: '70%' }} />
            <div className="h-1 bg-border rounded mb-3" style={{ width: '85%' }} />
            <p className="font-syne font-bold text-[10px] text-accent leading-tight">
              5 Workflows<br />Freelance
            </p>
          </div>

          {/* Form */}
          <div>
            <p className="font-mono text-[10px] text-accent tracking-[0.15em] uppercase mb-2" id="email-capture-title">
              Méthode gratuite
            </p>
            <h2
              className="font-syne font-bold text-text-primary mb-2"
              style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}
            >
              Les 5 workflows qui font gagner le plus de temps
            </h2>
            <p className="font-dm text-text-muted text-sm mb-4 leading-relaxed">
              Relances, onboarding, CRM — les automatisations que je déploie en priorité pour chaque client.
            </p>

            {status === 'success' ? (
              <p className="font-dm text-success text-sm flex items-center gap-2">
                <span>✓</span> PDF en route — vérifie ta boîte mail.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ton@email.com"
                  className="flex-1 bg-bg border border-border rounded-lg px-4 py-2.5 text-text-primary text-sm font-dm focus:border-accent focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="px-5 py-2.5 rounded-lg bg-accent text-bg font-dm font-medium text-sm shadow-glow hover:shadow-glow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 whitespace-nowrap cursor-pointer"
                >
                  {status === 'loading' ? '...' : 'Recevoir →'}
                </button>
              </form>
            )}

            {status === 'error' && (
              <p className="font-mono text-[10px] text-danger mt-2">Erreur — réessayez.</p>
            )}

            <p className="font-mono text-[10px] text-text-muted/50 mt-2">
              Aucun spam · PDF envoyé immédiatement
            </p>
          </div>

        </div>
      </div>
    </section>
  )
}
