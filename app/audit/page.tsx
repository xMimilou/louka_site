'use client'

import { useState } from 'react'
import Nav from '@/components/public/Nav'
import Footer from '@/components/public/Footer'
import CalendlyButton from '@/components/public/CalendlyButton'

const questions = [
  {
    id: 'size',
    label: 'Taille de votre activité',
    options: ['Solopreneur / Freelance', '2–5 personnes', '5–20 personnes', '20+ personnes'],
  },
  {
    id: 'tools',
    label: 'Outils que vous utilisez au quotidien (sélectionnez tout ce qui s\'applique)',
    options: ['Google Workspace (Gmail, Sheets, Drive)', 'Notion / Airtable', 'HubSpot / Pipedrive', 'Slack / Telegram', 'Stripe / Facturation', 'Calendly / RDV', 'Autre CRM'],
    multi: true,
  },
  {
    id: 'tasks',
    label: 'Votre top 3 des tâches qui vous prennent le plus de temps',
    type: 'textarea',
    placeholder: 'Ex: relances prospects, création de devis, onboarding clients, reporting...',
  },
  {
    id: 'budget',
    label: 'Budget envisagé pour automatiser',
    options: ['< 500€', '500€ – 1 500€', '1 500€ – 5 000€', '> 5 000€', 'Je ne sais pas encore'],
  },
  {
    id: 'urgency',
    label: 'Urgence',
    options: ['Je veux démarrer dans les 2 semaines', 'Dans le mois', 'Dans les 3 mois', 'Je me renseigne pour l\'instant'],
  },
]

export default function AuditPage() {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [submitted, setSubmitted] = useState(false)
  const [step, setStep] = useState(0)

  const currentQ = questions[step]
  const isLast = step === questions.length - 1

  const handleSingle = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentQ.id]: value }))
  }

  const handleMulti = (value: string) => {
    setAnswers((prev) => {
      const current = (prev[currentQ.id] as string[]) ?? []
      return {
        ...prev,
        [currentQ.id]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      }
    })
  }

  const handleNext = () => {
    if (isLast) {
      setSubmitted(true)
    } else {
      setStep((s) => s + 1)
    }
  }

  const canContinue = () => {
    const ans = answers[currentQ.id]
    if (currentQ.type === 'textarea') return typeof ans === 'string' && ans.trim().length > 0
    if (currentQ.multi) return Array.isArray(ans) && ans.length > 0
    return typeof ans === 'string' && ans.length > 0
  }

  return (
    <>
      <Nav />
      <main className="pt-32 pb-20 px-6 min-h-screen">
        <div className="max-w-[640px] mx-auto">

          {!submitted ? (
            <>
              <div className="mb-10">
                <p className="font-mono text-xs text-accent tracking-[0.18em] uppercase mb-3">Audit gratuit — Pré-qualification</p>
                <h1
                  className="font-syne font-extrabold text-text-primary leading-tight mb-3"
                  style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}
                >
                  5 questions pour préparer votre audit
                </h1>
                <p className="font-dm text-text-muted text-sm">
                  Ça prend 2 minutes. Les réponses me permettent de préparer l&apos;audit pour qu&apos;on aille
                  droit au but — pas de temps perdu à expliquer votre contexte.
                </p>
              </div>

              {/* Progress */}
              <div className="flex gap-1.5 mb-8">
                {questions.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                      i <= step ? 'bg-accent' : 'bg-border'
                    }`}
                  />
                ))}
              </div>

              {/* Question */}
              <div className="bg-surface border border-border rounded-2xl p-7 mb-4">
                <p className="font-dm font-medium text-text-primary mb-5 text-sm">{currentQ.label}</p>

                {currentQ.type === 'textarea' ? (
                  <textarea
                    className="w-full bg-bg border border-border rounded-xl p-4 font-dm text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-accent transition-colors duration-200"
                    rows={4}
                    placeholder={currentQ.placeholder}
                    value={(answers[currentQ.id] as string) ?? ''}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, [currentQ.id]: e.target.value }))}
                  />
                ) : (
                  <div className="space-y-2">
                    {currentQ.options?.map((opt) => {
                      const isSelected = currentQ.multi
                        ? ((answers[currentQ.id] as string[]) ?? []).includes(opt)
                        : answers[currentQ.id] === opt
                      return (
                        <button
                          key={opt}
                          onClick={() => currentQ.multi ? handleMulti(opt) : handleSingle(opt)}
                          className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-dm transition-all duration-200 cursor-pointer ${
                            isSelected
                              ? 'border-accent bg-accent/5 text-text-primary'
                              : 'border-border bg-bg text-text-muted hover:border-accent/50'
                          }`}
                        >
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0}
                  className="font-dm text-sm text-text-muted hover:text-text-primary transition-colors disabled:opacity-30 cursor-pointer"
                >
                  ← Précédent
                </button>
                <button
                  onClick={handleNext}
                  disabled={!canContinue()}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent text-bg font-dm font-medium text-sm shadow-glow hover:shadow-glow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-glow"
                >
                  {isLast ? 'Accéder au calendrier →' : 'Suivant →'}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-success/10 border border-success/20 flex items-center justify-center mx-auto mb-6">
                <svg viewBox="0 0 24 24" className="w-7 h-7 text-success fill-none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="font-syne font-extrabold text-text-primary mb-3" style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)' }}>
                Parfait — réservez votre créneau.
              </h2>
              <p className="font-dm text-text-muted text-sm mb-8 max-w-[400px] mx-auto leading-relaxed">
                Vos réponses m&apos;ont permis de préparer l&apos;audit. Choisissez le créneau qui vous convient —
                la session dure 45 minutes, sans engagement.
              </p>
              <CalendlyButton className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-accent text-bg font-dm font-medium text-sm shadow-glow hover:shadow-glow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
                Choisir mon créneau →
              </CalendlyButton>
              <p className="font-mono text-[11px] text-text-muted mt-4 tracking-wide">
                Audit gratuit · 45 min · Visio ou téléphone
              </p>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  )
}
