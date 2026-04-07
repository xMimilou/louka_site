import type { Metadata } from 'next'
import Nav from '@/components/public/Nav'
import Footer from '@/components/public/Footer'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Conditions Générales de Vente — Louka Millon',
  description: 'Conditions générales de vente des prestations de Louka Millon, automatisation de workflows.',
}

export default function CGV() {
  return (
    <>
      <Nav />
      <main className="pt-32 pb-20 px-6 min-h-screen">
        <div className="max-w-[760px] mx-auto">
          <h1 className="font-syne font-extrabold text-text-primary mb-2" style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}>
            Conditions Générales de Vente
          </h1>
          <p className="font-dm text-text-muted text-sm mb-12">Dernière mise à jour : avril 2025</p>

          <div className="space-y-10 font-dm text-sm leading-relaxed">

            <section>
              <h2 className="font-syne font-bold text-text-primary text-base mb-3">1. Objet et champ d&apos;application</h2>
              <p className="text-text-muted">
                Les présentes CGV régissent les prestations de services d&apos;automatisation de workflows
                proposées par Louka Millon (micro-entreprise, SIRET : [À compléter]) à destination
                de professionnels (freelances, consultants, coachs, TPE/PME).
              </p>
            </section>

            <section>
              <h2 className="font-syne font-bold text-text-primary text-base mb-3">2. Prestations proposées</h2>
              <p className="text-text-muted mb-2">Les principales offres sont :</p>
              <ul className="list-disc list-inside space-y-1 text-text-muted pl-2">
                <li><strong className="text-text-primary">Système 90</strong> : programme 90 jours d&apos;automatisation sur-mesure (tarif : 3 500€ à 5 000€ selon situation)</li>
                <li><strong className="text-text-primary">Audit gratuit</strong> : session de 45 minutes d&apos;analyse de vos process, sans engagement</li>
                <li><strong className="text-text-primary">Retainer mensuel</strong> : maintenance et nouvelles automatisations (500€/mois, optionnel)</li>
              </ul>
              <p className="text-text-muted mt-2">
                Les tarifs exacts sont définis dans le devis transmis après l&apos;audit gratuit.
              </p>
            </section>

            <section>
              <h2 className="font-syne font-bold text-text-primary text-base mb-3">3. Formation du contrat</h2>
              <p className="text-text-muted">
                Le contrat est formé à réception du devis signé et du versement de l&apos;acompte (30% du montant total).
                L&apos;audit gratuit de 45 minutes n&apos;engage à rien et ne constitue pas un contrat.
              </p>
            </section>

            <section>
              <h2 className="font-syne font-bold text-text-primary text-base mb-3">4. Conditions de paiement</h2>
              <ul className="list-disc list-inside space-y-1 text-text-muted pl-2">
                <li>Acompte de 30% à la signature du devis</li>
                <li>Solde de 70% à la livraison finale (fin des 4 premières semaines)</li>
                <li>Paiement par virement bancaire ou via lien Stripe</li>
                <li>Tout retard de paiement entraîne une pénalité de 3 fois le taux légal en vigueur</li>
              </ul>
            </section>

            <section>
              <h2 className="font-syne font-bold text-text-primary text-base mb-3">5. Garantie résultat</h2>
              <div className="bg-surface border border-accent/20 rounded-xl p-5">
                <p className="text-text-primary font-medium mb-2">Garantie 5 heures économisées par semaine</p>
                <p className="text-text-muted">
                  Si le client ne gagne pas au moins 5 heures par semaine sur ses tâches répétitives dans les
                  30 jours suivant la livraison finale, Louka Millon s&apos;engage à revoir les workflows
                  gratuitement jusqu&apos;à atteindre cet objectif.
                </p>
                <p className="text-text-muted mt-2">
                  Cette garantie s&apos;applique sous réserve que le client ait : (a) fourni un accès aux outils
                  nécessaires, (b) participé aux sessions de formation prévues, (c) utilisé les workflows livrés
                  conformément aux briefings vidéo fournis.
                </p>
              </div>
            </section>

            <section>
              <h2 className="font-syne font-bold text-text-primary text-base mb-3">6. Délais de livraison</h2>
              <p className="text-text-muted">
                Pour le programme Système 90, les délais standards sont :
              </p>
              <ul className="list-disc list-inside space-y-1 text-text-muted pl-2 mt-2">
                <li>Semaines 1–4 : construction et livraison de tous les workflows</li>
                <li>Semaines 5–12 : accompagnement hebdomadaire, formation, ajustements</li>
              </ul>
              <p className="text-text-muted mt-2">
                Ces délais sont donnés à titre indicatif. Tout retard imputable au client (non-fourniture des
                accès, indisponibilité) ne peut être imputé à Louka Millon.
              </p>
            </section>

            <section>
              <h2 className="font-syne font-bold text-text-primary text-base mb-3">7. Propriété intellectuelle</h2>
              <p className="text-text-muted">
                Les livrables (workflows, documentation, scripts) deviennent la propriété entière du client
                à réception du paiement intégral. Louka Millon conserve le droit de mentionner la prestation
                dans son portfolio, sans divulguer d&apos;informations confidentielles.
              </p>
            </section>

            <section>
              <h2 className="font-syne font-bold text-text-primary text-base mb-3">8. Confidentialité</h2>
              <p className="text-text-muted">
                Louka Millon s&apos;engage à ne divulguer aucune information relative au process, aux données
                clients ou à l&apos;activité du client à des tiers, pendant et après la prestation.
              </p>
            </section>

            <section>
              <h2 className="font-syne font-bold text-text-primary text-base mb-3">9. Résiliation</h2>
              <p className="text-text-muted">
                En cas de résiliation par le client après le début des travaux, l&apos;acompte reste acquis
                et les travaux réalisés sont facturés au prorata. En cas de manquement grave de Louka Millon,
                le client peut résilier sans frais et obtenir le remboursement des sommes versées au-delà
                du travail effectué.
              </p>
            </section>

            <section>
              <h2 className="font-syne font-bold text-text-primary text-base mb-3">10. Responsabilité</h2>
              <p className="text-text-muted">
                Louka Millon est tenu à une obligation de moyens. Sa responsabilité ne peut être engagée en cas
                de dysfonctionnement lié aux outils tiers (n8n, Make, Zapier, Google, etc.) ou d&apos;utilisation
                incorrecte des livrables par le client. L&apos;hébergement des automatisations n&apos;est pas
                inclus dans les prestations.
              </p>
            </section>

            <section>
              <h2 className="font-syne font-bold text-text-primary text-base mb-3">11. Loi applicable et juridiction</h2>
              <p className="text-text-muted">
                Les présentes CGV sont soumises au droit français. En cas de litige, et après tentative de
                résolution amiable, les tribunaux français seront compétents.
              </p>
            </section>

            <section>
              <h2 className="font-syne font-bold text-text-primary text-base mb-3">12. Contact</h2>
              <p className="text-text-muted">
                Pour toute question relative aux présentes CGV :{' '}
                <a href="mailto:hello@loukamillon.com" className="text-accent hover:underline">hello@loukamillon.com</a>
              </p>
            </section>

          </div>

          <div className="mt-12 pt-6 border-t border-border">
            <Link href="/" className="font-dm text-sm text-accent hover:underline">← Retour à l&apos;accueil</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
