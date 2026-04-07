'use client'

import { usePathname, useRouter } from 'next/navigation'
import { LogOut, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

const pageTitles: Record<string, string> = {
  '/admin/articles': 'Articles & Ressources',
  '/admin/projects': 'Projets Portfolio',
  '/admin/links': 'Liens & Plateformes',
  '/admin/files': 'Gestionnaire de Fichiers',
  '/admin/settings': 'Paramètres',
}

function getPageTitle(pathname: string): string {
  for (const [pattern, title] of Object.entries(pageTitles)) {
    if (pathname.startsWith(pattern)) return title
  }
  return 'Admin'
}

export default function AdminHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const title = getPageTitle(pathname)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <header
      className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
      style={{ background: '#0F1117', borderColor: '#2D3748' }}
    >
      <h1 className="font-syne font-bold text-admin-text text-lg">{title}</h1>

      <div className="flex items-center gap-3">
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-admin-border text-admin-muted text-xs font-dm hover:text-admin-text hover:border-accent transition-all duration-200"
        >
          Voir le site
          <ExternalLink size={12} aria-hidden="true" />
        </Link>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-admin-border text-admin-muted text-xs font-dm hover:text-danger hover:border-danger transition-all duration-200"
          title="Se déconnecter"
        >
          <LogOut size={12} aria-hidden="true" />
          Déconnexion
        </button>
      </div>
    </header>
  )
}
