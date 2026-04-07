'use client'

import { useState } from 'react'

const faqs = [
  {
    q: 'Et si mes process ne sont pas clairs ou documentés ?',
    a: "C'est justement pour ça qu'on commence par un audit. Les 3 premiers jours du programme, on clarifie ensemble vos process avant d'automatiser quoi que ce soit. Vous n'avez pas besoin d'arriver avec un cahier des charges.",
  },
  {
    q: 'Combien d\'heures dois-je investir de mon côté ?',
    a: "Environ 3h30 sur 14 jours : l'audit (45 min), 2-3 sessions de validation des workflows (30 min chacune), et une formation de 2h à la fin pour piloter vos automatisations. Le reste, c'est moi qui construis.",
  },
  {
    q: 'Comment fonctionne la garantie concrètement ?',
    a: "Si vous ne gagnez pas 5h/sem dans les 30 jours après livraison, je reviens sur les workflows gratuitement — jusqu'à ce qu'on atteigne l'objectif. Pas de délai supplémentaire, pas de condition cachée. Vous gardez tout ce qui est livré dans tous les cas.",
  },
  {
    q: "C'est quoi exactement un workflow d'automatisation ?",
    a: "C'est une séquence de tâches que votre logiciel exécute automatiquement à votre place. Exemple concret : un prospect répond à votre email → le CRM est mis à jour, une notification Telegram vous arrive, et un email de confirmation lui est envoyé. Tout ça sans que vous touchiez à quoi que ce soit.",
  },
  {
    q: "Je n'ai pas encore Make ou n8n, c'est un problème ?",
    a: "Non. On choisit les outils ensemble pendant l'audit, en fonction de vos process et de votre budget. Je travaille avec Make, n8n, Zapier, et plusieurs alternatives. Si vous avez déjà des outils en place, on s'adapte.",
  },
  {
    q: 'Mes outils actuels sont-ils compatibles ?',
    a: "Dans 95% des cas, oui. Gmail, Google Sheets, Notion, Airtable, HubSpot, Pipedrive, Slack, Telegram, Stripe, Calendly, Typeform, DocuSign — la liste est longue. On vérifie la compatibilité exacte pendant l'audit, avant tout engagement.",
  },
  {
    q: 'Est-ce que je vais devenir dépendant de vous après le programme ?',
    a: "Non, c'est exactement l'inverse. La phase J+14 à J+90 est dédiée à vous former sur vos propres automatisations. Vous repartez avec les accès, la documentation, et la compréhension de tout ce qui a été construit. Un retainer optionnel à 500€/mois est disponible si vous voulez continuer à faire évoluer le système, mais il n'est pas obligatoire.",
  },
  {
    q: 'Combien de temps avant de voir les premiers résultats ?',
    a: "Les premiers workflows sont livrés et opérationnels à J+14. Certains clients voient des gains dès J+7 sur les tâches prioritaires. La garantie porte sur 30 jours après la livraison finale.",
  },
]

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="py-24 px-6" aria-labelledby="faq-title">
      <div className="max-w-[760px] mx-auto">
        <div className="mb-10">
          <p className="font-mono text-xs text-accent tracking-[0.15em] uppercase mb-3">Questions fréquentes</p>
          <h2
            id="faq-title"
            className="font-syne font-extrabold text-text-primary"
            style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}
          >
            Vous avez des doutes ? C&apos;est normal.
          </h2>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-border rounded-xl overflow-hidden bg-surface">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-bg transition-colors duration-200 cursor-pointer"
                aria-expanded={open === i}
              >
                <span className="font-dm font-medium text-text-primary text-sm">{faq.q}</span>
                <span
                  className={`flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full border border-accent/30 text-accent transition-transform duration-200 ${
                    open === i ? 'rotate-45' : ''
                  }`}
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="6" y1="0" x2="6" y2="12" /><line x1="0" y1="6" x2="12" y2="6" />
                  </svg>
                </span>
              </button>
              {open === i && (
                <div className="px-6 pb-5 border-t border-border">
                  <p className="font-dm text-text-muted text-sm leading-relaxed pt-4">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
