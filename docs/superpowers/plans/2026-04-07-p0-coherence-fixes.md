# P0 Cohérence — Site Critique Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix critical coherence issues across /systeme-90, /a-propos, Nav, and Footer so the site speaks to one ICP (freelance/consultant/coach) with one offer (Système 90 1497€).

**Architecture:** All changes are self-contained in existing page files and the shared Nav/Footer components. No new files, no new routes, no API changes.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS.

---

## File Map

**Modified:**
- `app/systeme-90/page.tsx` — Remove Starter/DFY tiers, single-card layout, fix timeline (4 semaines → 14 jours), remove hébergement footnote
- `app/a-propos/page.tsx` — Keep only Workflow n8n project, rename section to "Automatisations en production"
- `components/public/Nav.tsx` — Logo [L.M] → "Louka Millon" linking to /
- `components/public/Footer.tsx` — Remove "Offre" anchor link

**No change needed:**
- `app/blog/page.tsx` — Already clean (build-in-public article)
- `components/public/Hero.tsx` — Already fixed last session
- `components/public/SocialProof.tsx` — Already fixed last session

---

## Task 1: /systeme-90 — Single offer, clean layout

**Files:**
- Modify: `app/systeme-90/page.tsx`

**Context:** Currently shows 3 tiers (Starter 497€ / Système 90 1497€ / Done For You 4997€). A prospect from the home lands here expecting to see the 1497€ offer and instead sees a comparison table. The tiers array, the pricing section JSX, and the process steps all need updating. Timeline says "4 semaines" but home says "14 jours" — fix consistency.

- [ ] **Step 1: Replace the tiers array with a single offer**

In `app/systeme-90/page.tsx`, replace lines 12–61 (the `tiers` array):

```ts
const offer = {
  price: '1 497€',
  tag: 'Recommandé · 3 places restantes',
  features: [
    'Audit de process complet (45 min)',
    'Tous vos workflows construits & déployés (J+0 → J+14)',
    'Briefing vidéo à chaque livraison',
    'Formation pilotage 2h (J+14)',
    'Support Telegram 90 jours',
    'Révisions illimitées si < 5h/sem économisées',
    'Accès & documentation complète',
  ],
}
```

- [ ] **Step 2: Fix the process steps — timeline consistency**

Replace the `steps` array (lines 63–69) to match the home's J+0/J+14/J+90 language:

```ts
const steps = [
  { n: '1', title: 'Audit gratuit (45 min)', desc: 'On analyse votre process ensemble, je détecte les tâches qui vous bloquent le plus. Gratuit, sans engagement.' },
  { n: '2', title: 'Proposition sur-mesure', desc: 'Sur la base de l\'analyse : les workflows prioritaires, le temps gagné estimé. Sous 48h.' },
  { n: '3', title: 'Je construis tout', desc: 'J+0 à J+14 : tous vos workflows déployés et opérationnels. Vous ne touchez à rien.' },
  { n: '4', title: 'Formation & autonomie', desc: 'J+14 : formation pilotage de 2h. Vos systèmes tournent seuls, vous savez les piloter.' },
  { n: '5', title: '76 jours de garantie', desc: 'J+14 à J+90 : support Telegram, révisions illimitées si l\'objectif 5h/sem n\'est pas atteint.' },
]
```

- [ ] **Step 3: Replace the pricing section JSX**

Find the `{/* Pricing tiers */}` section (lines 107–160) and replace it entirely with a single centered card:

```tsx
        {/* Pricing */}
        <section className="max-w-[1160px] mx-auto mb-20" aria-labelledby="pricing-title">
          <p className="font-mono text-xs text-accent tracking-[0.15em] uppercase mb-3 text-center">L&apos;offre</p>
          <h2
            id="pricing-title"
            className="font-syne font-extrabold text-text-primary text-center mb-10"
            style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}
          >
            Système 90 — tout inclus, un seul tarif.
          </h2>
          <div className="max-w-[560px] mx-auto">
            <div className="relative rounded-2xl p-8 bg-surface border-2 border-accent shadow-glow">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 font-mono text-[10px] px-3 py-1 rounded-full bg-accent text-bg tracking-wider uppercase whitespace-nowrap">
                {offer.tag}
              </span>
              <div className="mb-6 text-center">
                <p className="font-mono text-xs text-accent tracking-wider uppercase mb-2">Système 90</p>
                <p
                  className="font-syne font-extrabold text-accent leading-none mb-1"
                  style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)' }}
                >
                  {offer.price}
                </p>
                <p className="font-dm text-text-muted text-xs">Prix de lancement</p>
              </div>
              <ul className="space-y-2 mb-6">
                {offer.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 font-dm text-sm text-text-muted">
                    <span className="text-accent text-[8px] mt-1.5 flex-shrink-0">◆</span>
                    {f}
                  </li>
                ))}
              </ul>
              <CalendlyButton className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-accent text-bg font-dm font-medium text-sm shadow-glow hover:shadow-glow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
                Réserver l&apos;audit gratuit →
              </CalendlyButton>
              <p className="font-dm text-center text-text-muted text-[10px] mt-2">Gratuit · sans engagement</p>
            </div>
          </div>
        </section>
```

- [ ] **Step 4: Fix hero timeline "En 4 semaines" → "En 14 jours"**

Find line 96 in the hero section:
```tsx
            <span className="text-accent">En 4 semaines.</span>
```
Change to:
```tsx
            <span className="text-accent">En 14 jours.</span>
```

- [ ] **Step 5: Fix guarantee wording**

Find line 210 in the guarantee section:
```tsx
              5 heures économisées — ou je reviens gratuitement.
```
Change to:
```tsx
              5 heures économisées par semaine — ou je retravaille gratuitement.
```

- [ ] **Step 6: Commit**

```bash
git add app/systeme-90/page.tsx
git commit -m "fix: systeme-90 single offer 1497€, remove Starter/DFY, fix timeline to 14j"
```

---

## Task 2: /a-propos — Keep only workflow project

**Files:**
- Modify: `app/a-propos/page.tsx`

**Context:** Portfolio shows 7 projects — 6 are off-topic (trading bots, SaaS, web dev). The ICP (freelance/consultant/coach) sees this and thinks "this isn't for me." Keep only the 1 relevant project and rename the section.

- [ ] **Step 1: Replace the projects array**

In `app/a-propos/page.tsx`, replace the entire `projects` array (lines 11–62) with:

```ts
const projects = [
  {
    name: 'Workflow n8n — Relance client',
    category: 'Automatisation',
    status: 'En production',
    description: "Workflow n8n de relance client automatisée : séquences personnalisées, déclencheurs sur inactivité, zéro intervention manuelle.",
    stack: ['n8n', 'APIs', 'CRM'],
  },
  {
    name: 'Workflow n8n — Onboarding client',
    category: 'Automatisation',
    status: 'En production',
    description: "Automatisation complète de l'onboarding : dossier Drive créé, accès envoyés, email de bienvenue personnalisé — déclenché dès la signature.",
    stack: ['n8n', 'Google Drive', 'Gmail'],
  },
  {
    name: 'Workflow n8n — Pipeline de vente',
    category: 'Automatisation',
    status: 'En production',
    description: "CRM léger sur Google Sheets avec notifications Telegram à chaque étape clé : nouveau prospect, devis envoyé, relance automatique.",
    stack: ['n8n', 'Google Sheets', 'Telegram'],
  },
]
```

- [ ] **Step 2: Rename portfolio section**

Find the `{/* Portfolio */}` section heading (around line 141–145):

```tsx
          <section>
            <p className="font-mono text-xs text-accent tracking-[0.15em] uppercase mb-3">Portfolio</p>
            <h2 className="font-syne font-bold text-text-primary mb-8" style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)' }}>
              Projets construits
            </h2>
```

Replace with:

```tsx
          <section>
            <p className="font-mono text-xs text-accent tracking-[0.15em] uppercase mb-3">Automatisations en production</p>
            <h2 className="font-syne font-bold text-text-primary mb-8" style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)' }}>
              Workflows déployés
            </h2>
```

- [ ] **Step 3: Remove the `link` rendering from the project card JSX**

The new projects have no `link` property. Find the block (around line 166–175):

```tsx
                  {'link' in p && p.link && (
                    <a
                      href={p.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 font-dm text-xs text-accent hover:underline"
                    >
                      Voir le projet →
                    </a>
                  )}
```

Delete this block entirely (none of the new projects have links).

- [ ] **Step 4: Commit**

```bash
git add app/a-propos/page.tsx
git commit -m "fix: a-propos portfolio — keep only automation workflows, remove off-topic projects"
```

---

## Task 3: Nav — logo links home as "Louka Millon"

**Files:**
- Modify: `components/public/Nav.tsx:64-69`

**Context:** Logo currently is `[L.M]` with `href="#"` (scrolls to top of current page). Critique wants it to be "Louka Millon" linking to `/`. This doubles as the explicit "Accueil" nav item.

- [ ] **Step 1: Update the logo anchor**

In `components/public/Nav.tsx`, find the logo `<a>` tag (lines 64–69):

```tsx
          <a
            href="#"
            className="font-mono text-accent text-sm font-medium tracking-wider hover:shadow-glow transition-all duration-300"
            aria-label="Retour en haut"
          >
            [L.M]
          </a>
```

Replace with:

```tsx
          <a
            href="/"
            className="font-mono text-accent text-sm font-medium tracking-wider hover:shadow-glow transition-all duration-300"
            aria-label="Retour à l'accueil"
          >
            Louka Millon
          </a>
```

- [ ] **Step 2: Commit**

```bash
git add components/public/Nav.tsx
git commit -m "fix: nav logo → Louka Millon, links to / (home)"
```

---

## Task 4: Footer — remove "Offre" duplicate link

**Files:**
- Modify: `components/public/Footer.tsx:45-50`

**Context:** Footer has "Offre" (anchor `#tarifs`) AND "Système 90" (page `/systeme-90`). Both point to pricing. The `#tarifs` anchor only works on the home page — on all other pages it navigates home without the anchor. Removing it leaves: Système 90 | Blog | À propos | Mentions légales | CGV.

- [ ] **Step 1: Remove the "Offre" link**

In `components/public/Footer.tsx`, delete lines 45–50:

```tsx
            <a
              href="#tarifs"
              className="text-text-muted text-xs font-dm hover:text-text-primary transition-colors"
            >
              Offre
            </a>
```

- [ ] **Step 2: Commit**

```bash
git add components/public/Footer.tsx
git commit -m "fix: footer remove redundant Offre anchor, keep Système 90 link"
```

---

## Self-Review

**Spec coverage check:**

| Critique P0 item | Covered by task |
|---|---|
| /systeme-90: remove Starter + DFY | Task 1 |
| /a-propos: remove off-topic projects | Task 2 |
| Nav: [L.M] → Louka Millon, link to / | Task 3 |
| Footer: remove "Offre" duplicate | Task 4 |
| /ressources: off-topic articles | Already fixed (blog static articles are clean; /ressources redirects to /blog) |
| Nav: Blog already done | Already done in previous session |

**P1 items covered:**
| Critique P1 item | Covered by task |
|---|---|
| Hero sous-titre 5h/sem | Already done previous session |
| Virer "130+" | Already done previous session |
| Cohérence offre 1497€ | Task 1 (4 semaines → 14 jours, guarantee wording) |
| Bouton "Accueil" explicite | Task 3 (logo → Louka Millon linking to /) |

**Placeholder scan:** No TBDs. All code blocks are complete.

**Type consistency:** `offer` object used only in Task 1. `projects` array in Task 2 has no `link` field — Task 2 Step 3 removes the link-rendering JSX to match.
