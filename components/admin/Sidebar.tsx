'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, Kanban, FileText, FolderOpen,
  Link2, HardDrive, Settings, Zap, CreditCard, Twitter, UserCheck
} from 'lucide-react'

const crmItems = [
  { href: '/admin/candidatures', icon: Users, label: 'Prospects' },
  { href: '/admin/crm', icon: Kanban, label: 'Pipeline CRM' },
  { href: '/admin/closers', icon: UserCheck, label: 'Closers & Tâches' },
  { href: '/admin/paiements', icon: CreditCard, label: 'Paiements' },
]

const contentItems = [
  { href: '/admin/articles', icon: FileText, label: 'Articles & Ressources' },
  { href: '/admin/tweets', icon: Twitter, label: 'Tweets' },
]

const siteItems = [
  { href: '/admin/projects', icon: FolderOpen, label: 'Projets' },
  { href: '/admin/workflows', icon: Zap, label: 'Workflows' },
  { href: '/admin/links', icon: Link2, label: 'Liens' },
  { href: '/admin/files', icon: HardDrive, label: 'Fichiers' },
  { href: '/admin/settings', icon: Settings, label: 'Paramètres' },
]

function NavItem({ href, icon: Icon, label, pathname }: { href: string; icon: React.ElementType; label: string; pathname: string }) {
  const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href))
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-dm transition-all duration-200 ${
        isActive
          ? 'bg-accent/15 text-accent font-medium'
          : 'text-admin-muted hover:text-admin-text hover:bg-admin-surface'
      }`}
    >
      <Icon size={15} className="flex-shrink-0" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </Link>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pt-4 pb-1 font-mono text-[10px] text-admin-muted uppercase tracking-[0.12em]">
      {children}
    </p>
  )
}

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col border-r overflow-y-auto" style={{ background: '#161B27', borderColor: '#2D3748' }}>
      {/* Logo */}
      <div className="px-6 py-5 border-b flex-shrink-0" style={{ borderColor: '#2D3748' }}>
        <Link href="/admin" className="font-mono text-accent text-base font-medium tracking-wider">
          [L.M]
        </Link>
        <p className="font-dm text-[11px] text-admin-muted mt-0.5">Admin Panel</p>
      </div>

      {/* Dashboard link */}
      <div className="px-3 pt-3">
        <NavItem href="/admin" icon={LayoutDashboard} label="Dashboard" pathname={pathname} />
      </div>

      {/* CRM */}
      <nav className="px-3 pb-2" aria-label="CRM">
        <SectionLabel>CRM</SectionLabel>
        {crmItems.map((item) => (
          <NavItem key={item.href} {...item} pathname={pathname} />
        ))}
      </nav>

      {/* Contenu */}
      <nav className="px-3 pb-2" aria-label="Contenu">
        <SectionLabel>Contenu</SectionLabel>
        {contentItems.map((item) => (
          <NavItem key={item.href} {...item} pathname={pathname} />
        ))}
      </nav>

      {/* Site */}
      <nav className="px-3 pb-4" aria-label="Site">
        <SectionLabel>Site</SectionLabel>
        {siteItems.map((item) => (
          <NavItem key={item.href} {...item} pathname={pathname} />
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto px-6 py-4 border-t flex-shrink-0" style={{ borderColor: '#2D3748' }}>
        <Link href="/" target="_blank" className="font-dm text-xs text-admin-muted hover:text-accent transition-colors flex items-center gap-1.5">
          <span>Voir le site</span>
          <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </aside>
  )
}
