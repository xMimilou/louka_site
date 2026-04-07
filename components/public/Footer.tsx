import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border py-10 px-6">
      <div className="max-w-[1160px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-accent text-sm font-medium">[L.M]</span>
          <span className="text-text-muted text-xs font-dm">
            © {year} Louka Millon · Tous droits réservés
          </span>
        </div>

        <nav className="flex items-center gap-6" aria-label="Liens de pied de page">
          <a href="#offres" className="text-text-muted text-xs font-dm hover:text-text-primary transition-colors">Offres</a>
          <a href="#projets" className="text-text-muted text-xs font-dm hover:text-text-primary transition-colors">Projets</a>
          <a href="#outils" className="text-text-muted text-xs font-dm hover:text-text-primary transition-colors">Outils</a>
          <Link href="/ressources" className="text-text-muted text-xs font-dm hover:text-text-primary transition-colors">Ressources</Link>
          <a href="#contact" className="text-text-muted text-xs font-dm hover:text-text-primary transition-colors">Contact</a>
        </nav>

      </div>
    </footer>
  )
}
