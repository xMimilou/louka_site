# Refonte Home Système 90 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refonte la home pour aligner l'offre affichée (1 497€ / Système 90 = 14j build + 76j suivi) avec le plan de lancement avril, en ajoutant scarcité, précision et capture email.

**Architecture:** 2 nouveaux composants (AnnouncementBar, EmailCapture), 1 nouvelle API route, et modification de 5 composants existants. La coordination du bandeau d'annonce avec la nav utilise une CSS variable `--bar-height` setée par JS au montage. Pas de context React — communication via CSS variable uniquement.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS (custom tokens: accent=#0369A1, bg=#F8FAFC, surface=#FFF, text-primary=#0F172A, text-muted=#64748B, success=#22C55E, danger=#EF4444, border=#E2E8F0), fonts: font-syne (headings), font-dm (body), font-mono (labels/mono).

---

## File Map

| Fichier | Action | Responsabilité |
|---|---|---|
| `components/public/AnnouncementBar.tsx` | Créer | Bandeau sticky scarcité, dismissible via sessionStorage, set CSS var `--bar-height` |
| `components/public/Hero.tsx` | Modifier | Sous-titre clarifié, ligne urgence sous CTAs, padding top dynamique |
| `components/public/Nav.tsx` | Modifier | `top` dynamique via `style={{ top: 'var(--bar-height, 0px)' }}` |
| `components/public/Pricing.tsx` | Refaire | Layout split gauche (prix/CTA) / droite (phases + garantie) + process steps mis à jour |
| `components/public/FAQ.tsx` | Modifier | Remplacer "sem. 4", "sem. 5-12" par "J+14", "J+14 à J+90" |
| `components/public/EmailCapture.tsx` | Créer | Form email + mock PDF, appel POST /api/email-capture |
| `app/api/email-capture/route.ts` | Créer | POST handler V1 : valide email, log console, retourne JSON |
| `components/public/Footer.tsx` | Modifier | Accepte prop `platforms?: PlatformLink[]`, affiche liens dans footer |
| `app/page.tsx` | Modifier | Supprime sections/imports inutiles, ajoute AnnouncementBar + EmailCapture, passe platforms à Footer |

---

## Task 1 : AnnouncementBar

**Files:**
- Create: `components/public/AnnouncementBar.tsx`

- [ ] **Step 1 : Créer le composant**

```tsx
// components/public/AnnouncementBar.tsx
'use client'

import { useState, useEffect } from 'react'

const BAR_HEIGHT = 40

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!sessionStorage.getItem('bar-dismissed')) {
      setVisible(true)
      document.documentElement.style.setProperty('--bar-height', `${BAR_HEIGHT}px`)
    }
  }, [])

  const dismiss = () => {
    setVisible(false)
    sessionStorage.setItem('bar-dismissed', '1')
    document.documentElement.style.setProperty('--bar-height', '0px')
  }

  if (!visible) return null

  return (
    <div
      className="fixed left-0 right-0 z-[60] bg-bg border-b-2 border-accent flex items-center justify-between px-4 md:px-6"
      style={{ top: 0, height: BAR_HEIGHT }}
      role="banner"
    >
      <div className="flex-1 flex items-center justify-center gap-3 md:gap-6 font-mono text-[10px] md:text-xs text-text-muted flex-wrap">
        <span className="opacity-50 hidden sm:inline">[ ÉDITION AVRIL ]</span>
        <span className="flex items-center gap-2">
          <span className="text-danger text-[8px]">●</span>
          <strong className="text-text-primary">3 places · 1 497€</strong>
        </span>
        <span className="text-border hidden sm:inline">·</span>
        <span className="hidden sm:inline">Ferme le 30/04</span>
        <a
          href="#tarifs"
          className="text-accent underline hover:no-underline transition-all"
        >
          Réserver →
        </a>
      </div>
      <button
        onClick={dismiss}
        className="text-text-muted hover:text-text-primary transition-colors ml-3 flex-shrink-0 text-base leading-none cursor-pointer bg-transparent border-none"
        aria-label="Fermer le bandeau"
      >
        ×
      </button>
    </div>
  )
}
```

- [ ] **Step 2 : Vérifier TypeScript**

```bash
cd C:/Users/Louka/Documents/agence_automatisation/personnal_site
npx tsc --noEmit
```

Attendu : aucune erreur sur ce fichier.

- [ ] **Step 3 : Commit**

```bash
git add components/public/AnnouncementBar.tsx
git commit -m "feat: add AnnouncementBar with scarcity info and sessionStorage dismiss"
```

---

## Task 2 : Nav — top dynamique

**Files:**
- Modify: `components/public/Nav.tsx`

La Nav est `fixed top-0`. Avec le bandeau au-dessus, elle doit être à `top: var(--bar-height, 0px)`.

- [ ] **Step 1 : Modifier l'élément `<nav>` dans Nav.tsx**

Trouver la ligne :
```tsx
className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
```

Remplacer par :
```tsx
className={`fixed left-0 right-0 z-50 transition-all duration-300 border-b ${
```

Et ajouter `style={{ top: 'var(--bar-height, 0px)' }}` sur l'élément `<nav>` :

```tsx
<nav
  className={`fixed left-0 right-0 z-50 transition-all duration-300 border-b ${
    scrolled
      ? 'bg-bg/80 backdrop-blur-lg border-border'
      : 'bg-transparent border-transparent'
  }`}
  style={{ top: 'var(--bar-height, 0px)' }}
  aria-label="Navigation principale"
>
```

- [ ] **Step 2 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

Attendu : pas d'erreur.

- [ ] **Step 3 : Commit**

```bash
git add components/public/Nav.tsx
git commit -m "feat: nav follows announcement bar height via CSS variable"
```

---

## Task 3 : Hero — sous-titre + urgence + padding

**Files:**
- Modify: `components/public/Hero.tsx`

- [ ] **Step 1 : Mettre à jour le `<header>` avec padding dynamique**

Trouver :
```tsx
className="relative min-h-screen flex items-center justify-center text-center px-6 pt-32 pb-20 overflow-hidden"
```

Remplacer par :
```tsx
className="relative min-h-screen flex items-center justify-center text-center px-6 pb-20 overflow-hidden"
style={{ paddingTop: 'calc(var(--bar-height, 0px) + 8rem)' }}
```

- [ ] **Step 2 : Mettre à jour le sous-titre**

Trouver :
```tsx
<p className="font-dm text-text-muted leading-relaxed max-w-[560px] mx-auto mb-10" style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)' }}>
  J&apos;analyse votre process avec vous, détecte les tâches qui vous bloquent,
  et construis les automatisations qui vous font gagner un maximum de temps.
</p>
```

Remplacer par :
```tsx
<p className="font-dm text-text-muted leading-relaxed max-w-[560px] mx-auto mb-10" style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)' }}>
  En 14 jours, vos workflows sont construits et déployés.
  Dans les 90 jours, vous êtes autonome — ou je reviens gratuitement.
</p>
```

- [ ] **Step 3 : Ajouter la ligne urgence sous les CTAs**

Trouver :
```tsx
        </div>
      </div>
    </header>
```

Remplacer par :
```tsx
        </div>
        <p className="font-mono text-[10px] text-danger mt-5 tracking-wide flex items-center justify-center gap-2">
          <span>●</span>
          <span>3 places restantes · Prix de lancement 1 497€</span>
        </p>
      </div>
    </header>
```

- [ ] **Step 4 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 5 : Commit**

```bash
git add components/public/Hero.tsx
git commit -m "feat: hero subtitle clarifies 90j structure, adds urgency line"
```

---

## Task 4 : Pricing — refonte complète

**Files:**
- Modify: `components/public/Pricing.tsx`

Remplacement complet du fichier. Le nouveau layout : split gauche/droite (1/3 + 2/3 sur desktop), phases Build/Suivi clairement séparées, process steps mis à jour pour 14j.

- [ ] **Step 1 : Remplacer le contenu de Pricing.tsx**

```tsx
// components/public/Pricing.tsx
import CalendlyButton from './CalendlyButton'

const buildIncludes = [
  'Audit process complet (45 min)',
  'Tous les workflows construits & déployés',
  'Briefing vidéo à chaque livraison',
]

const followIncludes = [
  'Formation pilotage (2h)',
  'Support Telegram 90 jours',
  'Révisions illimitées si < 5h/sem économisées',
  'Accès & documentation complète',
]

const steps = [
  {
    n: '1',
    title: 'Audit gratuit (45 min)',
    desc: "On analyse votre process ensemble, je détecte les tâches qui vous bloquent le plus. Gratuit, sans engagement.",
  },
  {
    n: '2',
    title: 'Proposition sur-mesure',
    desc: "Sur la base de l'analyse : les workflows prioritaires, le temps gagné estimé. Sous 48h.",
  },
  {
    n: '3',
    title: 'Je construis tout',
    desc: "J+0 à J+14 : tous vos workflows déployés et opérationnels. Vous ne touchez à rien.",
  },
  {
    n: '4',
    title: 'Formation & autonomie',
    desc: "J+14 : formation pilotage de 2h. Vos systèmes tournent seuls, vous savez les piloter.",
  },
  {
    n: '5',
    title: '76 jours de garantie',
    desc: "J+14 à J+90 : support Telegram, révisions illimitées si l'objectif 5h/sem n'est pas atteint.",
  },
]

export default function Pricing() {
  return (
    <section id="tarifs" className="py-28 px-6" aria-labelledby="tarifs-title">
      <div className="max-w-[1160px] mx-auto">

        {/* Header */}
        <div className="mb-12">
          <p className="font-mono text-xs text-accent tracking-[0.15em] uppercase mb-3">Système 90</p>
          <h2
            id="tarifs-title"
            className="font-syne font-extrabold text-text-primary mb-4"
            style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)' }}
          >
            On identifie ce qui vous coûte du temps. On l&apos;automatise.
          </h2>
          <p className="font-dm text-text-muted text-base leading-relaxed max-w-[580px]">
            Pas de solution générique. On part de votre process réel, on détecte les tâches bloquantes,
            et je construis les automatisations qui vous font gagner le plus de temps.
          </p>
        </div>

        {/* Split card */}
        <div className="bg-surface border border-accent shadow-glow rounded-2xl overflow-hidden mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3">

            {/* Left : prix + CTA */}
            <div className="col-span-1 p-8 flex flex-col items-center text-center gap-4 md:border-r border-b md:border-b-0 border-border">
              <p className="font-mono text-[10px] text-accent tracking-[0.15em] uppercase">Système 90</p>
              <p
                className="font-syne font-extrabold text-accent leading-none"
                style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)' }}
              >
                1 497€
              </p>
              <p className="font-dm text-text-muted text-xs">Prix de lancement</p>
              <div className="w-full h-px bg-border" />
              <p className="font-mono text-xs text-danger flex items-center gap-2">
                <span className="text-[8px]">●</span> 3 places restantes
              </p>
              <p className="font-mono text-[10px] text-text-muted">Ferme le 30 avril</p>
              <CalendlyButton className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-accent text-bg font-dm font-medium text-sm shadow-glow hover:shadow-glow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
                Réserver l&apos;audit gratuit →
              </CalendlyButton>
              <p className="font-dm text-text-muted text-[10px]">Gratuit · sans engagement</p>
            </div>

            {/* Right : phases + garantie */}
            <div className="col-span-2 p-8 flex flex-col gap-6">

              {/* Phase Build */}
              <div>
                <p className="font-mono text-[10px] text-accent tracking-[0.12em] uppercase mb-3">
                  J+0 → J+14 · Build
                </p>
                <ul className="flex flex-col gap-2">
                  {buildIncludes.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm font-dm text-text-muted">
                      <span className="text-accent text-[8px] mt-1.5 flex-shrink-0">◆</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="h-px bg-border" />

              {/* Phase Suivi */}
              <div>
                <p className="font-mono text-[10px] text-success tracking-[0.12em] uppercase mb-3">
                  J+14 → J+90 · Suivi &amp; Garantie
                </p>
                <ul className="flex flex-col gap-2">
                  {followIncludes.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm font-dm text-text-muted">
                      <span className="text-success text-[8px] mt-1.5 flex-shrink-0">◆</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Garantie inline */}
              <div className="bg-success/5 border border-success/20 rounded-xl px-5 py-3">
                <p className="font-dm text-sm text-text-muted">
                  <span className="text-text-primary font-medium">Garantie résultat :</span>{' '}
                  5h/sem économisées dans les 30 jours après livraison, ou je reviens sur les
                  workflows gratuitement jusqu&apos;à l&apos;objectif.
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* Note hébergement */}
        <p className="font-dm text-text-muted text-xs mb-20 opacity-60">
          * L&apos;hébergement des automatisations (serveur, outils tiers) n&apos;est pas inclus. Comptez environ 10 à 20&nbsp;€/mois.
        </p>

        {/* Process steps */}
        <div>
          <p className="font-mono text-xs text-accent tracking-[0.15em] uppercase mb-3">Comment ça marche</p>
          <h3
            className="font-syne font-bold text-text-primary mb-8"
            style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)' }}
          >
            De l&apos;audit à l&apos;autonomie
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {steps.map((step) => (
              <div key={step.n} className="bg-surface border border-border rounded-xl p-5">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <span className="font-mono text-sm font-bold text-accent">{step.n}</span>
                </div>
                <p className="font-syne font-semibold text-text-primary text-sm mb-2">{step.title}</p>
                <p className="font-dm text-text-muted text-xs leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
```

- [ ] **Step 2 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3 : Commit**

```bash
git add components/public/Pricing.tsx
git commit -m "feat: pricing refonte — split layout 1497€, phases Build/Suivi, 90j clarified"
```

---

## Task 5 : FAQ — alignement 14j

**Files:**
- Modify: `components/public/FAQ.tsx`

Deux réponses contiennent des références temporelles incorrectes.

- [ ] **Step 1 : Mettre à jour la réponse "résultats"**

Trouver :
```tsx
    a: "Les premiers workflows sont livrés et opérationnels en fin de semaine 4. Certains clients voient des gains dès la semaine 2 sur les tâches prioritaires. La garantie porte sur 30 jours après la livraison finale.",
```

Remplacer par :
```tsx
    a: "Les premiers workflows sont livrés et opérationnels à J+14. Certains clients voient des gains dès J+7 sur les tâches prioritaires. La garantie porte sur 30 jours après la livraison finale.",
```

- [ ] **Step 2 : Mettre à jour la réponse "dépendance"**

Trouver :
```tsx
    a: "Non, c'est exactement l'inverse. Les sem. 5 à 12 sont dédiées à vous former sur vos propres automatisations. Vous repartez avec les accès, la documentation, et la compréhension de tout ce qui a été construit. Un retainer optionnel à 500€/mois est disponible si vous voulez continuer à faire évoluer le système, mais il n'est pas obligatoire.",
```

Remplacer par :
```tsx
    a: "Non, c'est exactement l'inverse. La phase J+14 à J+90 est dédiée à vous former sur vos propres automatisations. Vous repartez avec les accès, la documentation, et la compréhension de tout ce qui a été construit. Un retainer optionnel à 500€/mois est disponible si vous voulez continuer à faire évoluer le système, mais il n'est pas obligatoire.",
```

- [ ] **Step 3 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 4 : Commit**

```bash
git add components/public/FAQ.tsx
git commit -m "fix: FAQ timing references aligned with 14j sprint (J+14, J+7)"
```

---

## Task 6 : EmailCapture component

**Files:**
- Create: `components/public/EmailCapture.tsx`

- [ ] **Step 1 : Créer le composant**

```tsx
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
```

- [ ] **Step 2 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3 : Commit**

```bash
git add components/public/EmailCapture.tsx
git commit -m "feat: EmailCapture component with PDF mock and form"
```

---

## Task 7 : API route email-capture

**Files:**
- Create: `app/api/email-capture/route.ts`

V1 : validation email, log console, retourne JSON. Aucun provider email requis.

- [ ] **Step 1 : Créer le répertoire et la route**

```bash
mkdir -p app/api/email-capture
```

- [ ] **Step 2 : Écrire la route**

```ts
// app/api/email-capture/route.ts
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const email =
    body !== null &&
    typeof body === 'object' &&
    'email' in body &&
    typeof (body as { email: unknown }).email === 'string'
      ? (body as { email: string }).email
      : null

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  console.log('[email-capture]', new Date().toISOString(), email)

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 3 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 4 : Commit**

```bash
git add app/api/email-capture/route.ts
git commit -m "feat: email-capture API route v1 (log + JSON response)"
```

---

## Task 8 : Footer — ajout platforms

**Files:**
- Modify: `components/public/Footer.tsx`

- [ ] **Step 1 : Remplacer le contenu de Footer.tsx**

```tsx
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
```

- [ ] **Step 2 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 3 : Commit**

```bash
git add components/public/Footer.tsx
git commit -m "feat: footer accepts platforms prop, renders platform links"
```

---

## Task 9 : page.tsx — restructuration

**Files:**
- Modify: `app/page.tsx`

Supprime les imports et composants des sections retirées. Ajoute AnnouncementBar et EmailCapture. Passe `platforms` à Footer. Supprime les data statiques inutilisées (staticProjects, staticWorkflows).

- [ ] **Step 1 : Remplacer app/page.tsx**

```tsx
// app/page.tsx
import { createClient } from '@/lib/supabase-server'
import type { PlatformLink } from '@/lib/types'
import Nav from '@/components/public/Nav'
import AnnouncementBar from '@/components/public/AnnouncementBar'
import Hero from '@/components/public/Hero'
import CalendlyWidget from '@/components/public/CalendlyWidget'
import SocialProof from '@/components/public/SocialProof'
import Pricing from '@/components/public/Pricing'
import Guarantee from '@/components/public/Guarantee'
import FAQ from '@/components/public/FAQ'
import EmailCapture from '@/components/public/EmailCapture'
import Footer from '@/components/public/Footer'

const staticPlatforms: PlatformLink[] = [
  { id: '1', platform: 'Malt', label: 'Mon profil Malt', url: 'https://www.malt.fr/profile/loukamillon', icon: 'malt', visible: true, sort_order: 1 },
  { id: '2', platform: 'Comeup', label: 'Mes services Comeup', url: 'https://comeup.com/fr/@xmimilou', icon: 'comeup', visible: true, sort_order: 2 },
  { id: '3', platform: 'LinkedIn', label: 'LinkedIn', url: 'https://www.linkedin.com/in/louka-millon-426b7a1b7/', icon: 'linkedin', visible: true, sort_order: 3 },
  { id: '4', platform: 'Email', label: 'hello@loukamillon.com', url: 'mailto:hello@loukamillon.com', icon: 'email', visible: true, sort_order: 4 },
]

export default async function HomePage() {
  let platforms: PlatformLink[] = staticPlatforms

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project.supabase.co') {
      const supabase = await createClient()
      const { data: dbPlatforms } = await supabase
        .from('platform_links')
        .select('*')
        .eq('visible', true)
        .order('sort_order')
      if (dbPlatforms && dbPlatforms.length > 0) platforms = dbPlatforms
    }
  } catch {
    // Use static fallback
  }

  return (
    <>
      <AnnouncementBar />
      <Nav />
      <main>
        <Hero platforms={platforms} />
        <SocialProof />
        <Pricing />
        <Guarantee />
        <FAQ />
        <EmailCapture />
      </main>
      <Footer platforms={platforms} />
      <CalendlyWidget />
    </>
  )
}
```

- [ ] **Step 2 : Vérifier TypeScript**

```bash
npx tsc --noEmit
```

Attendu : zéro erreur.

- [ ] **Step 3 : Build complet**

```bash
npm run build
```

Attendu : build réussi, pas d'erreur. Si erreur de type sur un composant, retourner au task concerné et corriger.

- [ ] **Step 4 : Vérification visuelle**

```bash
npm run dev
```

Ouvrir http://localhost:3000 et vérifier :
- Bandeau jaune/monospace en haut avec "3 places · 1 497€" et bouton ×
- Nav décalée sous le bandeau
- Hero : nouveau sous-titre + "● 3 places restantes" en rouge sous les CTAs
- Sections disparues : plus de Services/Workflows, Projects, Resources, RoadmapCTA
- Pricing : split gauche prix/CTA + droite phases
- EmailCapture : card avec PDF mock + form email
- Footer : liens Malt, Comeup, LinkedIn, Email visibles

- [ ] **Step 5 : Commit final**

```bash
git add app/page.tsx
git commit -m "feat: home restructured — AnnouncementBar, single offer 1497€, EmailCapture, platforms in footer"
```

---

## Résumé des commits attendus

```
feat: add AnnouncementBar with scarcity info and sessionStorage dismiss
feat: nav follows announcement bar height via CSS variable
feat: hero subtitle clarifies 90j structure, adds urgency line
feat: pricing refonte — split layout 1497€, phases Build/Suivi, 90j clarified
fix: FAQ timing references aligned with 14j sprint (J+14, J+7)
feat: EmailCapture component with PDF mock and form
feat: email-capture API route v1 (log + JSON response)
feat: footer accepts platforms prop, renders platform links
feat: home restructured — AnnouncementBar, single offer 1497€, EmailCapture, platforms in footer
```
