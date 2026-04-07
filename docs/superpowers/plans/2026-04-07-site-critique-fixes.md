# Site Critique Fixes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply 8 prioritized critique fixes to the personal site: rename nav/routes "Ressources"→"Blog", rewrite hero subtitle, remove weak social proof stats, move pricing footnote to FAQ, replace generic case studies with build-in-public case, and add a newsletter strip.

**Architecture:** All changes are local to `components/public/` and `app/` — no new API routes, no schema changes. The Blog section reuses the existing articles DB (same Supabase table as Ressources) with new front-facing routes and a `/ressources` → `/blog` redirect.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, Supabase (existing client), no new dependencies.

---

## File Map

**Modified:**
- `components/public/Nav.tsx` — change "Ressources" link to "Blog"
- `components/public/Hero.tsx` — rewrite subtitle paragraph
- `components/public/SocialProof.tsx` — remove "130+ prospects" stat, replace example cases with build-in-public case
- `components/public/Pricing.tsx` — remove hébergement footnote
- `components/public/FAQ.tsx` — add hébergement FAQ entry + "Pourquoi 1497€?" entry
- `components/public/Footer.tsx` — update "Ressources" link to "Blog"
- `app/page.tsx` — add `<NewsletterStrip />` before `<Footer />`

**Created:**
- `components/public/NewsletterStrip.tsx` — newsletter signup (different copy than EmailCapture PDF)
- `app/blog/page.tsx` — Blog listing (rebranded from ressources)
- `app/blog/[slug]/page.tsx` — Blog article page (rebranded from ressources)
- `app/ressources/redirect.tsx` — not needed; use Next.js redirect in page.tsx instead

**No change needed:**
- `app/ressources/[slug]/ArticleBody.tsx` — imported as-is from blog slug page
- `app/api/email-capture/route.ts` — reused by NewsletterStrip unchanged
- Admin pages — still manage articles for the same DB table

---

## Task 1: Nav — "Ressources" → "Blog"

**Files:**
- Modify: `components/public/Nav.tsx:46-50`

- [ ] **Step 1: Change the nav link**

In `components/public/Nav.tsx`, find the `navLinks` array (line 46) and update the Ressources entry:

```ts
const navLinks = [
  { href: '/systeme-90', label: 'Système 90' },
  { href: '/a-propos', label: 'À propos' },
  { href: '/blog', label: 'Blog' },
]
```

- [ ] **Step 2: Commit**

```bash
git add components/public/Nav.tsx
git commit -m "feat: nav Ressources → Blog"
```

---

## Task 2: Blog listing page

**Files:**
- Create: `app/blog/page.tsx`

- [ ] **Step 1: Create `app/blog/page.tsx`**

This is a copy of `app/ressources/page.tsx` with three changes:
1. Metadata title/description → Blog
2. Section label "Ressources" → "Blog"
3. Article card links → `/blog/${article.slug}`

```tsx
import { createClient } from '@/lib/supabase-server'
import type { Article } from '@/lib/types'
import Link from 'next/link'
import Nav from '@/components/public/Nav'
import Footer from '@/components/public/Footer'

export const metadata = {
  title: 'Blog — Louka Millon',
  description: 'Automatisations, workflows et outils pour freelances et consultants. 1 article par semaine.',
}

const staticArticles: Article[] = [
  {
    id: '1',
    title: "Mon 1er workflow en production — relance prospect automatique",
    slug: 'workflow-relance-prospect-automatique',
    excerpt: 'Build in public : comment j\'ai automatisé mes relances LinkedIn + email avec n8n et Google Sheets. Architecture, erreurs, résultats.',
    content: null,
    category: ['n8n', 'Automatisation'],
    tags: ['relance', 'prospection', 'workflow'],
    cover_url: null,
    file_url: null,
    file_label: null,
    ext_link: null,
    ext_label: null,
    status: 'published',
    downloads: 0,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export default async function BlogPage() {
  let articles: Article[] = staticArticles

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project.supabase.co') {
      const supabase = await createClient()
      const { data } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })

      if (data && data.length > 0) articles = data
    }
  } catch {
    // Use static fallback
  }

  return (
    <>
      <Nav />
      <main className="min-h-screen pt-24 pb-20 px-6">
        <div className="max-w-[1160px] mx-auto">
          <div className="mb-14">
            <Link href="/" className="font-dm text-sm text-text-muted hover:text-accent transition-colors mb-6 inline-flex items-center gap-2">
              ← Retour à l&apos;accueil
            </Link>
            <p className="font-mono text-xs text-accent tracking-[0.15em] uppercase mb-3 mt-4">Blog</p>
            <h1
              className="font-syne font-extrabold text-text-primary mb-4"
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
            >
              Automatisations en build public
            </h1>
            <p className="font-dm text-text-muted text-base leading-relaxed max-w-[540px]">
              Workflows, outils et leçons apprises — documentés au fil de la construction.
              {articles.length > 0 && ` ${articles.length} article${articles.length > 1 ? 's' : ''} disponible${articles.length > 1 ? 's' : ''}.`}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <article
                key={article.id}
                className="bg-surface border border-border rounded-2xl p-6 hover:border-accent hover:shadow-glow hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                {article.cover_url && (
                  <div className="w-full h-40 rounded-xl overflow-hidden mb-5 bg-bg">
                    <img src={article.cover_url} alt={article.title} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {article.category.slice(0, 3).map((cat) => (
                    <span key={cat} className="font-mono text-[11px] text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-full">
                      {cat}
                    </span>
                  ))}
                </div>

                <h2 className="font-syne font-bold text-text-primary text-base leading-snug mb-3 flex-1">
                  {article.title}
                </h2>

                {article.excerpt && (
                  <p className="font-dm text-text-muted text-sm leading-relaxed mb-5 line-clamp-3">
                    {article.excerpt}
                  </p>
                )}

                <div className="flex items-center justify-between mb-5">
                  <div className="flex flex-wrap gap-1">
                    {article.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="font-mono text-[10px] px-2 py-0.5 rounded bg-bg border border-border text-text-muted">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 mt-auto">
                  <Link
                    href={`/blog/${article.slug}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-surface border border-border text-sm font-dm text-text-primary hover:border-accent hover:text-accent transition-all duration-300"
                  >
                    Lire l&apos;article →
                  </Link>
                  {article.file_url && (
                    <a
                      href={article.file_url}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-bg text-sm font-dm font-medium shadow-glow hover:shadow-glow-lg transition-all duration-300"
                      download
                    >
                      ↓
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/blog/page.tsx
git commit -m "feat: blog listing page at /blog"
```

---

## Task 3: Blog article page

**Files:**
- Create: `app/blog/[slug]/page.tsx`

- [ ] **Step 1: Create `app/blog/[slug]/page.tsx`**

Copy of `app/ressources/[slug]/page.tsx` with two changes:
1. Metadata title → "Blog"
2. Back link → `/blog` with label "Retour au blog"

```tsx
import { createClient } from '@/lib/supabase-server'
import type { Article } from '@/lib/types'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Nav from '@/components/public/Nav'
import Footer from '@/components/public/Footer'
import ArticleBody from '../../ressources/[slug]/ArticleBody'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  return {
    title: `${slug} — Blog Louka Millon`,
    robots: 'index, follow',
  }
}

function estimateReadingTime(content: Record<string, unknown> | null): number {
  if (!content) return 1
  const text = JSON.stringify(content)
  const words = text.split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const staticArticle: Article = {
  id: '1',
  title: "Mon 1er workflow en production — relance prospect automatique",
  slug: 'workflow-relance-prospect-automatique',
  excerpt: 'Build in public : comment j\'ai automatisé mes relances LinkedIn + email avec n8n et Google Sheets. Architecture, erreurs, résultats.',
  content: null,
  category: ['n8n', 'Automatisation'],
  tags: ['relance', 'prospection', 'workflow'],
  cover_url: null,
  file_url: null,
  file_label: null,
  ext_link: null,
  ext_label: null,
  status: 'published',
  downloads: 0,
  published_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params
  let article: Article | null = null

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project.supabase.co') {
      const supabase = await createClient()
      const { data } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single()

      article = data
    } else {
      if (slug === staticArticle.slug) {
        article = staticArticle
      }
    }
  } catch {
    if (slug === staticArticle.slug) {
      article = staticArticle
    }
  }

  if (!article) {
    notFound()
  }

  const readTime = estimateReadingTime(article.content)

  return (
    <>
      <Nav />
      <main className="min-h-screen pt-24 pb-20 px-6">
        <div className="max-w-[860px] mx-auto">
          <Link
            href="/blog"
            className="font-dm text-sm text-text-muted hover:text-accent transition-colors mb-8 inline-flex items-center gap-2"
          >
            ← Retour au blog
          </Link>

          {article.cover_url && (
            <div className="w-full h-64 rounded-2xl overflow-hidden mb-8 mt-6">
              <img src={article.cover_url} alt={article.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-6 mt-6">
            {article.category.map((cat) => (
              <span
                key={cat}
                className="font-mono text-xs text-accent bg-accent/10 border border-accent/20 px-3 py-1 rounded-full"
              >
                {cat}
              </span>
            ))}
          </div>

          <h1
            className="font-syne font-extrabold text-text-primary leading-tight mb-4"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}
          >
            {article.title}
          </h1>

          <div className="flex items-center gap-4 text-text-muted font-dm text-sm mb-8 flex-wrap">
            {article.published_at && (
              <time dateTime={article.published_at}>{formatDate(article.published_at)}</time>
            )}
            <span>·</span>
            <span>{readTime} min de lecture</span>
          </div>

          {article.excerpt && (
            <p className="font-dm text-text-muted text-lg leading-relaxed mb-10 border-l-2 border-accent pl-5">
              {article.excerpt}
            </p>
          )}

          {article.content ? (
            <ArticleBody content={article.content} />
          ) : (
            <div className="prose prose-invert max-w-none">
              <p className="font-dm text-text-muted leading-relaxed">
                Le contenu de cet article sera bientôt disponible.
              </p>
            </div>
          )}

          {article.file_url && (
            <div className="mt-12 bg-surface border border-accent/30 rounded-2xl p-6 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h3 className="font-syne font-bold text-text-primary mb-1">
                  {article.file_label || 'Télécharger la ressource'}
                </h3>
                <p className="font-dm text-text-muted text-sm">
                  {article.downloads} personnes ont déjà téléchargé ce fichier.
                </p>
              </div>
              <a
                href={article.file_url}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent text-bg font-dm font-medium text-sm shadow-glow hover:shadow-glow-lg transition-all duration-300 flex-shrink-0"
                download
              >
                ↓ Télécharger
              </a>
            </div>
          )}

          {article.ext_link && (
            <div className="mt-6 bg-surface border border-border rounded-2xl p-6 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h3 className="font-syne font-bold text-text-primary mb-1">
                  {article.ext_label || 'Ressource externe'}
                </h3>
              </div>
              <a
                href={article.ext_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-accent text-accent font-dm font-medium text-sm hover:bg-accent/10 transition-all duration-300 flex-shrink-0"
              >
                Voir →
              </a>
            </div>
          )}

          {article.tags.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span key={tag} className="font-mono text-xs px-3 py-1 rounded-full bg-surface border border-border text-text-muted">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/blog/
git commit -m "feat: blog article page at /blog/[slug]"
```

---

## Task 4: Redirect /ressources → /blog + update Footer

**Files:**
- Modify: `app/ressources/page.tsx` (top of file — add redirect)
- Modify: `components/public/Footer.tsx:58-63`

- [ ] **Step 1: Add redirect in ressources page**

Replace the entire `app/ressources/page.tsx` content with a simple redirect. The admin still links articles to `/ressources/[slug]` — those stay untouched. Only the listing page redirects.

At the top of `app/ressources/page.tsx`, replace:

```tsx
import { createClient } from '@/lib/supabase-server'
```

with:

```tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
```

Then, as the very first line inside `RessourcesPage()`, add:

```tsx
export default async function RessourcesPage() {
  redirect('/blog')
```

This is a permanent redirect — Next.js `redirect()` uses 307 by default; for a permanent SEO redirect, use:

```tsx
import { permanentRedirect } from 'next/navigation'
// ...
export default async function RessourcesPage() {
  permanentRedirect('/blog')
```

- [ ] **Step 2: Update Footer link**

In `components/public/Footer.tsx`, find the "Ressources" link (line 57–63) and change it to Blog:

```tsx
<Link
  href="/blog"
  className="text-text-muted text-xs font-dm hover:text-text-primary transition-colors"
>
  Blog
</Link>
```

- [ ] **Step 3: Commit**

```bash
git add app/ressources/page.tsx components/public/Footer.tsx
git commit -m "feat: redirect /ressources → /blog, update footer link"
```

---

## Task 5: Hero subtitle rewrite

**Files:**
- Modify: `components/public/Hero.tsx:36-39`

- [ ] **Step 1: Replace the subtitle paragraph**

In `components/public/Hero.tsx`, replace the `<p>` tag at line 36:

Old:
```tsx
<p className="font-dm text-text-muted leading-relaxed max-w-[560px] mx-auto mb-10" style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)' }}>
  En 14 jours, vos workflows sont construits et déployés.
  Dans les 90 jours, vous êtes autonome — ou je reviens gratuitement.
</p>
```

New:
```tsx
<p className="font-dm text-text-muted leading-relaxed max-w-[560px] mx-auto mb-10" style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)' }}>
  Je construis vos automatisations en 14 jours.
  Vous gagnez au minimum{' '}
  <span className="text-text-primary font-medium">5h par semaine</span>{' '}
  — garanti ou je retravaille gratuitement.
</p>
```

- [ ] **Step 2: Commit**

```bash
git add components/public/Hero.tsx
git commit -m "fix: hero subtitle — single duration, 5h/sem promise front and center"
```

---

## Task 6: Social proof — remove "130+" stat + build-in-public case

**Files:**
- Modify: `components/public/SocialProof.tsx:1-22`

- [ ] **Step 1: Update the stats array**

In `components/public/SocialProof.tsx`, replace the `stats` array (lines 1–5):

Old:
```ts
const stats = [
  { value: '130+', label: 'Prospects analysés\npour mon propre pipeline' },
  { value: '7', label: 'Workflows\nen production' },
  { value: '5h+', label: 'Économisées par semaine\npar client livré' },
]
```

New:
```ts
const stats = [
  { value: '7', label: 'Workflows\nen production' },
  { value: '5h+', label: 'Économisées par semaine\nobjectif garanti' },
  { value: '14j', label: 'De l\'audit\nà la livraison' },
]
```

- [ ] **Step 2: Replace example cases with build-in-public case**

Replace the `cases` array (lines 7–22):

Old:
```ts
const cases = [
  {
    label: 'Exemple type · Coach business',
    before: 'Relances prospects faites à la main, 1h30/sem perdue',
    after: 'Séquence email automatique J+0 à J+10 depuis Google Sheets',
    gain: '6h/sem économisées',
    tools: ['n8n', 'Gmail', 'Google Sheets'],
  },
  {
    label: 'Exemple type · Consultant indépendant',
    before: 'Onboarding client : 2h de config à chaque nouveau signé',
    after: 'Dossier Drive créé, accès envoyés, email de bienvenue — automatique',
    gain: '5h/mois économisées',
    tools: ['n8n', 'Google Drive', 'Gmail'],
  },
]
```

New:
```ts
const cases = [
  {
    label: 'Mon 1er workflow · Build in public',
    before: 'Relances prospects faites à la main : copier-coller, oublis, 1h30/sem perdue',
    after: 'Séquence n8n : email J+0 auto, relance J+3 si pas de réponse, CRM mis à jour',
    gain: '6h/sem récupérées',
    tools: ['n8n', 'Gmail', 'Google Sheets'],
  },
]
```

Also update the grid class in the JSX to handle a single card (so it doesn't stretch to full width). Find the cases grid div:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
```

Change to:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[600px]">
```

- [ ] **Step 3: Commit**

```bash
git add components/public/SocialProof.tsx
git commit -m "fix: remove 130+ stat, replace generic cases with build-in-public own workflow"
```

---

## Task 7: Move hébergement note from Pricing to FAQ

**Files:**
- Modify: `components/public/Pricing.tsx:139-142`
- Modify: `components/public/FAQ.tsx:5-38`

- [ ] **Step 1: Remove hébergement note from Pricing**

In `components/public/Pricing.tsx`, delete lines 139–142:

```tsx
{/* Note hébergement */}
<p className="font-dm text-text-muted text-xs mb-20 opacity-60">
  * L&apos;hébergement des automatisations (serveur, outils tiers) n&apos;est pas inclus. Comptez environ 10 à 20&nbsp;€/mois.
</p>
```

Replace with just adjusting the margin on the process steps section. Find `{/* Process steps */}` and change the `<div>` just above it if it had `mb-20` — otherwise simply delete the note paragraph and the existing margin from the card (`mb-4`) handles spacing.

The simplest edit: remove only the `<p>` tag for the note. The `mb-4` on the split card and the process steps div handle spacing naturally.

- [ ] **Step 2: Add hébergement entry to FAQ**

In `components/public/FAQ.tsx`, add two new entries at the end of the `faqs` array (after line 37, before the closing `]`):

```ts
  {
    q: 'Y a-t-il des coûts additionnels après le 1 497€ ?',
    a: "Les workflows tournent sur votre propre compte n8n ou Make (~10 à 20€/mois selon le volume de tâches). Vous gardez le contrôle total — rien ne passe par moi. Si vous préférez zéro gestion, un retainer optionnel à 500€/mois est disponible pour que je maintienne et fasse évoluer le système à votre place.",
  },
  {
    q: 'Pourquoi 1 497€ et pas moins ?',
    a: "5h/sem économisées × 52 semaines = 260 heures par an. À 50€/h de valeur de votre temps, c'est 13 000€ récupérés. Le ROI est positif dès le 2e mois. Le prix reflète aussi le travail réel : audit, build sur-mesure, formation, et 76 jours de support garanti — pas un template vendu à 200 personnes.",
  },
```

- [ ] **Step 3: Commit**

```bash
git add components/public/Pricing.tsx components/public/FAQ.tsx
git commit -m "fix: move hébergement note to FAQ, add ROI FAQ entry"
```

---

## Task 8: Newsletter strip before Footer

**Files:**
- Create: `components/public/NewsletterStrip.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create `components/public/NewsletterStrip.tsx`**

```tsx
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
```

- [ ] **Step 2: Add NewsletterStrip to home page**

In `app/page.tsx`, add the import and place the component before `<Footer />`:

Add import after EmailCapture import (line 12):
```tsx
import NewsletterStrip from '@/components/public/NewsletterStrip'
```

In the JSX, add `<NewsletterStrip />` between `<EmailCapture />` and `<Footer />`:
```tsx
        <EmailCapture />
        <NewsletterStrip />
      </main>
      <Footer platforms={platforms} />
```

- [ ] **Step 3: Commit**

```bash
git add components/public/NewsletterStrip.tsx app/page.tsx
git commit -m "feat: newsletter strip before footer — 1 workflow/semaine CTA"
```

---

## Self-Review

**Spec coverage check:**

| Critique item | Covered by task |
|---|---|
| P1: Nav "Ressources" → "Blog" | Task 1 |
| P1: Create /blog | Task 2 + 3 |
| P1: Hero subtitle rewrite (5h/sem) | Task 5 |
| P1: Remove "130+ prospects" | Task 6 |
| P2: Hébergement → FAQ | Task 7 |
| P2: Replace generic cases with build-in-public | Task 6 |
| P2: Newsletter bloc before footer | Task 8 |
| P3: Portfolio home = workflows only | Not in scope — home page has no portfolio section currently |
| P3: FAQ develop (6 questions) | Partially — FAQ already has 8 good entries; Task 7 adds 2 more for total of 10 |
| Footer update | Task 4 |
| /ressources redirect | Task 4 |

**Placeholder scan:** No TBDs, no "implement later", all code blocks complete.

**Type consistency:** `Article` type used consistently from `@/lib/types` in Tasks 2 and 3. `staticArticle` slug in Task 3 matches the blog listing in Task 2 (`workflow-relance-prospect-automatique`). `ArticleBody` import path in Task 3 (`../../ressources/[slug]/ArticleBody`) resolves correctly from `app/blog/[slug]/page.tsx`.
