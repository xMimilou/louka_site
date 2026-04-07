'use client'

import { useState, useEffect } from 'react'
import CalendlyButton from './CalendlyButton'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('light')

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'dark' | 'light' | null
    if (saved === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
      setTheme('dark')
    }
    // Light is the default — no attribute needed
  }, [])

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    if (next === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
    localStorage.setItem('theme', next)
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const navLinks = [
    { href: '/systeme-90', label: 'Système 90' },
    { href: '/a-propos', label: 'À propos' },
    { href: '/ressources', label: 'Ressources' },
  ]

  return (
    <>
      <nav
        className={`fixed left-0 right-0 z-50 transition-all duration-300 border-b ${
          scrolled
            ? 'bg-bg/80 backdrop-blur-lg border-border'
            : 'bg-transparent border-transparent'
        }`}
        style={{ top: 'var(--bar-height, 0px)' }}
        aria-label="Navigation principale"
      >
        <div className="max-w-[1160px] mx-auto px-6 py-5 flex items-center justify-between">
          <a
            href="#"
            className="font-mono text-accent text-sm font-medium tracking-wider hover:shadow-glow transition-all duration-300"
            aria-label="Retour en haut"
          >
            [L.M]
          </a>

          <div className="hidden md:flex items-center gap-3">
            <ul className="flex items-center gap-8 list-none" role="list">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="font-dm text-sm font-medium text-text-muted hover:text-text-primary transition-colors duration-300"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <CalendlyButton className="font-dm text-sm font-medium text-accent border border-accent px-4 py-2 rounded-md hover:bg-accent/10 hover:shadow-glow transition-all duration-300 cursor-pointer bg-transparent">
                  Audit gratuit →
                </CalendlyButton>
              </li>
            </ul>
            <button
              onClick={toggleTheme}
              aria-label="Changer de thème"
              title={theme === 'light' ? 'Passer en thème sombre' : 'Passer en thème clair'}
              className="w-9 h-9 flex items-center justify-center rounded-md border border-accent/30 bg-accent/10 text-accent hover:border-accent hover:bg-accent/20 transition-all duration-300 cursor-pointer"
            >
              {theme === 'light' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              )}
            </button>
          </div>

          <button
            className="md:hidden flex flex-col gap-[5px] bg-transparent border-none cursor-pointer p-1 z-[101]"
            aria-label="Ouvrir le menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span
              className={`block w-6 h-[2px] bg-text-primary rounded-sm transition-transform duration-300 origin-center ${
                mobileOpen ? 'translate-y-[7px] rotate-45' : ''
              }`}
            />
            <span
              className={`block w-6 h-[2px] bg-text-primary rounded-sm transition-opacity duration-300 ${
                mobileOpen ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <span
              className={`block w-6 h-[2px] bg-text-primary rounded-sm transition-transform duration-300 origin-center ${
                mobileOpen ? '-translate-y-[7px] -rotate-45' : ''
              }`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-label="Menu mobile"
        className={`fixed inset-0 bg-bg/97 backdrop-blur-xl z-[99] flex flex-col items-center justify-center gap-10 transition-all duration-300 ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="font-syne text-3xl font-bold text-text-primary hover:text-accent transition-colors duration-300"
            onClick={() => setMobileOpen(false)}
          >
            {link.label}
          </a>
        ))}
        <CalendlyButton
          className="font-syne text-3xl font-bold text-accent bg-transparent border-none cursor-pointer hover:opacity-80 transition-opacity duration-300"
          onClick={() => setMobileOpen(false)}
        >
          Audit gratuit →
        </CalendlyButton>
      </div>
    </>
  )
}
