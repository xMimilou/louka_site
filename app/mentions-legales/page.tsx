import type { Metadata } from 'next'
import Nav from '@/components/public/Nav'
import Footer from '@/components/public/Footer'

export const metadata: Metadata = {
  title: 'Mentions légales — Louka Millon',
  description: 'Mentions légales du site loukamillon.com',
}

export default function MentionsLegales() {
  return (
    <>
      <Nav />
      <main className="pt-32 pb-20 px-6 min-h-screen">
        <div className="max-w-[760px] mx-auto">
          <h1 className="font-syne font-extrabold text-text-primary mb-2" style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)' }}>
            Mentions légales
          </h1>
          <p className="font-dm text-text-muted text-sm mb-12">Dernière mise à jour : avril 2025</p>

          <div className="space-y-10 font-dm text-sm leading-relaxed">

            <section>
              <h2 className="font-syne font-bold text-text-primary text-base mb-3">1. Éditeur du site</h2>
              <p className="text-text-muted">
                <strong className="text-text-primary">Louka Millon</strong><br />
                Micro-entreprise<br />
                SIRET : <span className="text-text-muted">[À compléter]</span><br />
                Adresse : <span className="text-text-muted">[À compléter]</span><br />
                Email : <a href="mailto:hello@loukamillon.com" className="text-accent hover:underline">hello@loukamillon.com</a>
              </p>
            </section>

            <section>
              <h2 className="font-syne font-bold text-text-primary text-base mb-3">2. Hébergeur</h2>
              <p className="text-text-muted">
                <strong className="text-text-primary">Vercel Inc.</strong><br />
                340 Pine Street, Suite 1200, San Francisco, CA 94104, États-Unis<br />
                <a href="https://vercel.com" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">vercel.com</a>
              </p>
            </section>

            <section>
              <h2 className="font-syne font-bold text-text-primary text-base mb-3">3. Propriété intellectuelle</h2>
              <p className="text-text-muted">
                L&apos;ensemble du contenu de ce site (textes, images, graphismes, logo, etc.) est la propriété exclusive
                de Louka Millon, sauf mention contraire. Toute reproduction, distribution ou utilisation sans
                autorisation écrite préalable est interdite.
              </p>
            </section>

            <section>
              <h2 className="font-syne font-bold text-text-primary text-base mb-3">4. Données personnelles (RGPD)</h2>
              <p className="text-text-muted mb-3">
                Ce site peut collecter des données personnelles dans les cas suivants :
              </p>
              <ul className="list-disc list-inside space-y-1 text-text-muted pl-2">
                <li>Prise de rendez-vous via Calendly (email, nom, réponses aux questions)</li>
                <li>Téléchargement du lead magnet (email si formulaire de capture activé)</li>
                <li>Formulaire de contact (email, message)</li>
                <li>Cookies Google Analytics (statistiques de visite anonymisées)</li>
              </ul>
              <p className="text-text-muted mt-3">
                Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression
                de vos données. Pour exercer ce droit :{' '}
                <a href="mailto:hello@loukamillon.com" className="text-accent hover:underline">hello@loukamillon.com</a>
              </p>
            </section>

            <section>
              <h2 className="font-syne font-bold text-text-primary text-base mb-3">5. Cookies</h2>
              <p className="text-text-muted">
                Ce site utilise Google Analytics 4 pour mesurer l&apos;audience (cookies analytiques). Ces cookies
                sont anonymisés et ne permettent pas de vous identifier personnellement. Vous pouvez refuser les
                cookies en modifiant les paramètres de votre navigateur.
              </p>
            </section>

            <section>
              <h2 className="font-syne font-bold text-text-primary text-base mb-3">6. Liens hypertextes</h2>
              <p className="text-text-muted">
                Ce site peut contenir des liens vers des sites tiers. Louka Millon ne peut être tenu responsable
                du contenu de ces sites ni de l&apos;utilisation qui pourrait en être faite.
              </p>
            </section>

            <section>
              <h2 className="font-syne font-bold text-text-primary text-base mb-3">7. Loi applicable</h2>
              <p className="text-text-muted">
                Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux
                français seront compétents.
              </p>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
