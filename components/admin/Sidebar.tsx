'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, FolderOpen, Link2, HardDrive, Settings, Zap } from 'lucide-react'

const navItems = [
  { href: '/admin/articles', icon: FileText, label: 'Articles & Ressources' },
  { href: '/admin/projects', icon: FolderOpen, label: 'Projets' },
  { href: '/admin/workflows', icon: Zap, label: 'Workflows' },
  { href: '/admin/links', icon: Link2, label: 'Liens & Plateformes' },
  { href: '/admin/files', icon: HardDrive, label: 'Fichiers' },
  { href: '/admin/settings', icon: Settings, label: 'Paramètres' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="w-60 flex-shrink-0 flex flex-col border-r"
      style={{ background: '#161B27', borderColor: '#2D3748' }}
    >
      {/* Logo */}
      <div className="px-6 py-5 border-b" style={{ borderColor: '#2D3748' }}>
        <Link href="/admin" className="font-mono text-accent text-base font-medium tracking-wider hover:text-accent transition-colors">
          [L.M]
        </Link>
        <p className="font-dm text-[11px] text-admin-muted mt-0.5">Admin Panel</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Navigation admin">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-dm transition-all duration-200 ${
                isActive
                  ? 'bg-accent/15 text-accent font-medium'
                  : 'text-admin-muted hover:text-admin-text hover:bg-admin-surface'
              }`}
            >
              <Icon size={16} className="flex-shrink-0" aria-hidden="true" />
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t" style={{ borderColor: '#2D3748' }}>
        <Link
          href="/"
          target="_blank"
          className="font-dm text-xs text-admin-muted hover:text-accent transition-colors flex items-center gap-1.5"
        >
          <span>Voir le site</span>
          <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </aside>
  )
}
