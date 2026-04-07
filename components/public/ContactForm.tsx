'use client'

import { useState } from 'react'

const WEBHOOK_URL = 'https://n8n.spaarple.fr/webhook/nouveau-lead'

export default function ContactForm() {
  const [form, setForm] = useState({ nom: '', email: '', activite: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: form.nom,
          email: form.email,
          activite: form.activite,
          message: form.message,
          source: 'site-web',
          date: new Date().toISOString(),
        }),
      })

      if (res.ok) {
        setStatus('success')
        setForm({ nom: '', email: '', activite: '', message: '' })
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <section id="contact" className="py-20 px-6" aria-labelledby="contact-title">
        <div className="max-w-[580px] mx-auto">
          <div className="bg-surface border border-accent/30 rounded-2xl p-10 text-center shadow-glow">
            <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="font-syne font-bold text-text-primary text-xl mb-2">Message envoyé !</h3>
            <p className="font-dm text-text-muted text-sm leading-relaxed">
              Je reviens vers vous sous 24h. En attendant, vous pouvez{' '}
              <a href="https://calendly.com/louka06-millon/audit-45min" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                réserver directement un créneau
              </a>.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="contact" className="py-20 px-6" aria-labelledby="contact-title">
      <div className="max-w-[580px] mx-auto">

        <div className="mb-10">
          <p className="font-mono text-xs text-accent tracking-[0.15em] uppercase mb-3">Contact</p>
          <h2
            id="contact-title"
            className="font-syne font-extrabold text-text-primary mb-3"
            style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}
          >
            Une question ? Un projet en tête ?
          </h2>
          <p className="font-dm text-text-muted text-sm leading-relaxed">
            Décrivez votre situation en quelques mots. Je vous recontacte sous 24h pour voir ce qu&apos;on peut automatiser ensemble.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-2xl p-8 space-y-5">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="nom" className="block font-dm text-text-primary text-sm font-medium mb-1.5">
                Nom complet
              </label>
              <input
                id="nom"
                type="text"
                required
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                placeholder="Jean Dupont"
                className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 font-dm text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
              />
            </div>
            <div>
              <label htmlFor="email" className="block font-dm text-text-primary text-sm font-medium mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="jean@exemple.com"
                className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 font-dm text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
              />
            </div>
          </div>

          <div>
            <label htmlFor="activite" className="block font-dm text-text-primary text-sm font-medium mb-1.5">
              Votre activité
            </label>
            <input
              id="activite"
              type="text"
              required
              value={form.activite}
              onChange={(e) => setForm({ ...form, activite: e.target.value })}
              placeholder="Consultant marketing, coach business, freelance design..."
              className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 font-dm text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="message" className="block font-dm text-text-primary text-sm font-medium mb-1.5">
              Votre message
            </label>
            <textarea
              id="message"
              rows={4}
              required
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Décrivez votre situation : quelles tâches vous prennent le plus de temps, ce que vous aimeriez automatiser..."
              className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 font-dm text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors resize-none"
            />
          </div>

          {status === 'error' && (
            <p className="font-dm text-sm text-red-400">
              Une erreur est survenue. Réessayez ou contactez-moi directement à{' '}
              <a href="mailto:hello@loukamillon.com" className="underline">hello@loukamillon.com</a>.
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg bg-accent text-bg font-dm font-medium text-sm shadow-glow hover:shadow-glow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-glow"
          >
            {status === 'loading' ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Envoi en cours...
              </>
            ) : (
              'Envoyer mon message →'
            )}
          </button>

          <p className="font-mono text-[0.65rem] text-text-muted/60 text-center tracking-wider">
            Pas de spam. Réponse sous 24h.
          </p>
        </form>

      </div>
    </section>
  )
}
