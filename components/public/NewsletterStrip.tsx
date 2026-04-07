'use client'

import { useState } from 'react'

export default function NewsletterStrip() {
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
        body: JSON.stringify({ email, source: 'newsletter' }),
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
    <section className="py-16 px-6 border-t border-border" aria-labelledby="newsletter-title">
      <div className="max-w-[600px] mx-auto text-center">
        <p className="font-mono text-xs text-accent tracking-[0.15em] uppercase mb-3" id="newsletter-title">
          Pas prêt à échanger ?
        </p>
        <h2
          className="font-syne font-bold text-text-primary mb-3"
          style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)' }}
        >
          1 automatisation concrète par semaine dans ta boîte mail.
        </h2>
        <p className="font-dm text-text-muted text-sm mb-6 leading-relaxed">
          Zéro pitch. Juste des workflows prêts à copier — n8n, Make, Google Sheets.
        </p>

        {status === 'success' ? (
          <p className="font-dm text-success text-sm flex items-center justify-center gap-2">
            <span>✓</span> Inscription confirmée — premier workflow dans ta boîte d&apos;ici 24h.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-[400px] mx-auto">
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
              {status === 'loading' ? '...' : "S'abonner →"}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p className="font-mono text-[10px] text-danger mt-2">Erreur — réessayez.</p>
        )}

        <p className="font-mono text-[10px] text-text-muted/50 mt-3">
          Désabonnement en 1 clic · Aucun spam
        </p>
      </div>
    </section>
  )
}
