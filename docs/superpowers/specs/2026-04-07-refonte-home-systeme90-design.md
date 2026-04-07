# Spec — Refonte Home Système 90

**Date :** 2026-04-07  
**Objectif :** Aligner la home sur l'offre réelle (1497€ / 14j build / 90j total) pour le lancement avril. Éliminer les frictions de conversion identifiées dans l'audit critique.

---

## Contexte

Le site actuel affiche une offre à 3500-5000€ / 90 jours alors que le plan de lancement est à 1497€ / 14 jours. Un prospect venant d'un DM voit une incohérence de prix × 3 et de durée × 6. La refonte supprime cette friction et transforme la home en page de conversion focalisée sur une seule offre.

---

## Décisions structurelles

### Offre unique
- **Nom :** Système 90
- **Prix :** 1 497€ (prix de lancement)
- **Structure :** 14 jours de build + 76 jours de suivi/garantie = 90 jours d'engagement total
- **Scarcité :** 3 places, deadline 30 avril

### Sections supprimées
| Section | Raison |
|---|---|
| Services / Workflows | 4 workflows marqués "coming soon" = signal négatif |
| Projects | Dilue le positionnement freelance automatisation |
| Resources | Vide — aucun article publié |
| RoadmapCTA | Hors sujet pour la conversion |
| Platforms (section) | Déplacé en footer |

---

## Nouvelle structure de page

```
[ Bandeau scarcité ]      ← sticky, au-dessus de la nav
[ Nav ]                   ← inchangée
[ Hero ]                  ← headline conservé, sous-titre clarifié
[ Social Proof ]          ← stats + workflow exemple (inchangé)
[ Offre Système 90 ]      ← section pricing refaite
[ Garantie ]              ← inchangée
[ FAQ ]                   ← contenu mis à jour
[ Capture email ]         ← nouveau composant
[ Footer ]                ← + liens plateformes
```

---

## Composants détaillés

### 1. AnnouncementBar (nouveau composant)

**Style :** Monospace/terminal, cohérent avec l'identité visuelle du site.

```
[ ÉDITION AVRIL ]    ● 3 places · 1 497€    ·    Ferme le 30/04    Réserver →
```

- Sticky, `z-index` au-dessus de la nav (position `top: 0`)
- La nav descend d'autant (padding-top ajusté)
- Cliquable → scroll vers `#tarifs`
- Fond : `bg-bg`, border-bottom `border-accent`, couleurs `text-muted` / `text-accent`
- Fermable via bouton ×, état persisté en `sessionStorage`

### 2. Hero — modifications

**Headline :** conservée telle quelle.

**Sous-titre :** remplacé par :
> "En 14 jours, vos workflows sont construits et déployés. Dans les 90 jours, vous êtes autonome — ou je reviens gratuitement."

**Ajout sous les CTAs :**
```
● 3 places restantes · Prix de lancement 1 497€
```
Style : `font-mono text-xs text-danger`, petit, discret.

**CTAs :** inchangés (audit gratuit → Calendly, "Voir le Système 90" → `#tarifs`).

### 3. Pricing — refonte complète

**Layout :** Split gauche / droite (2 colonnes sur desktop, empilé sur mobile).

**Colonne gauche (1/3) — Ancre prix :**
- Label monospace "Système 90"
- Prix `1 497€` en grand (font-syne, accent color)
- "Prix de lancement"
- Séparateur
- `● 3 places restantes` (text-danger)
- "Ferme le 30 avril"
- CTA primaire "Réserver l'audit gratuit →" (full-width)
- Sous-texte "Gratuit, sans engagement"

**Colonne droite (2/3) — Valeur :**

Phase 1 — J+0 → J+14 · BUILD :
- Audit process complet (45 min)
- Tous les workflows construits & déployés
- Briefing vidéo à chaque livraison

Phase 2 — J+14 → J+90 · SUIVI & GARANTIE :
- Formation pilotage (2h)
- Support Telegram 90 jours
- Révisions illimitées si < 5h/sem économisées
- Accès & documentation complète

**Encart garantie inline :**
> "Garantie résultat : 5h/sem économisées dans les 30 jours ou je reviens gratuitement jusqu'à l'objectif."

**Note tarifaire :** conservée (hébergement ~10-20€/mois non inclus).

**Section "Comment ça marche" (5 steps) :** conservée sous la card, mise à jour pour aligner avec 14j (step 3 = "Sem. 1–2", step 4 = "Formation J+14", step 5 = "Autonomie J+90").

### 4. Garantie

Section existante conservée. Seule modification : la garantie est déjà précise dans le code actuel ("je revois les workflows gratuitement jusqu'à atteinte des 5h") — rien à changer.

### 5. FAQ — mises à jour contenu

Questions à mettre à jour pour aligner avec 14j / 1497€ :
- Q "Combien de temps avant les premiers résultats ?" → aligner sur J+14 livraison
- Q "Combien d'heures dois-je investir ?" → déjà correct (14 jours)
- Supprimer toute mention "Sem. 5–12" ou "semaine 4" qui contredit le sprint 14j

### 6. EmailCapture (nouveau composant)

**Positionnement :** entre FAQ et Footer.

**Layout :** Card horizontale avec mock PDF à gauche.

**Mock PDF :** petite card stylisée `box-shadow: 4px 4px 0 var(--accent)`, contenu :
- Label "PDF GRATUIT" (monospace)
- Lignes placeholder (divs gris)
- Titre "5 Workflows Freelance" (accent)

**Texte :**
- Label : "Méthode gratuite"
- Titre : "Les 5 workflows qui font gagner le plus de temps"
- Description : "Relances, onboarding, CRM — les automatisations que je déploie en priorité pour chaque client."

**Form :** input email + bouton "Recevoir →"

**Comportement :** soumission → appel `POST /api/email-capture` (à créer) qui envoie le PDF par email (Resend ou simple mailto fallback en V1). En V1 acceptable : lien direct vers le PDF dans la confirmation.

**Note bas :** "Aucun spam · PDF envoyé immédiatement"

### 7. Footer — ajout plateformes

Ajouter les liens Malt, Comeup, LinkedIn, Email dans le footer (actuellement dans une section dédiée supprimée).

---

## app/page.tsx — changements

```tsx
// Supprimer ces imports et composants :
// - <Services workflows={workflows} />
// - <Projects projects={projects} />
// - <Resources articles={articles} />
// - <RoadmapCTA />
// - <Platforms platforms={platforms} />

// Ajouter :
// - <AnnouncementBar /> avant <Nav />
// - <EmailCapture /> après <FAQ />

// Passer platforms à <Footer /> au lieu de <Platforms />
```

---

## Fichiers touchés

| Fichier | Action |
|---|---|
| `components/public/AnnouncementBar.tsx` | Créer |
| `components/public/EmailCapture.tsx` | Créer |
| `components/public/Hero.tsx` | Modifier (sous-titre + urgence) |
| `components/public/Pricing.tsx` | Refaire (layout B + steps mis à jour) |
| `components/public/FAQ.tsx` | Modifier (contenu aligné 14j) |
| `components/public/Footer.tsx` | Modifier (ajouter liens plateformes) |
| `app/page.tsx` | Modifier (structure sections) |
| `app/api/email-capture/route.ts` | Créer (V1 : log + réponse JSON) |

---

## Hors scope

- Création du PDF (le form peut renvoyer vers un lien placeholder en V1)
- Intégration email provider (Resend, Mailchimp) — V1 = log serveur
- Pages `/systeme-90`, `/a-propos`, `/ressources` — inchangées
- Admin, auth, Supabase — non touchés
