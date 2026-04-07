'use client'

import { useState, useEffect } from 'react'

const BAR_HEIGHT = 40

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!sessionStorage.getItem('bar-dismissed')) {
      setVisible(true)
      document.documentElement.style.setProperty('--bar-height', `${BAR_HEIGHT}px`)
    }
  }, [])

  const dismiss = () => {
    setVisible(false)
    sessionStorage.setItem('bar-dismissed', '1')
    document.documentElement.style.setProperty('--bar-height', '0px')
  }

  if (!visible) return null

  return (
    <div
      className="fixed left-0 right-0 z-[60] bg-bg border-b-2 border-accent flex items-center justify-between px-4 md:px-6"
      style={{ top: 0, height: BAR_HEIGHT }}
      role="banner"
    >
      <div className="flex-1 flex items-center justify-center gap-3 md:gap-6 font-mono text-[10px] md:text-xs text-text-muted flex-wrap">
        <span className="opacity-50 hidden sm:inline">[ ÉDITION AVRIL ]</span>
        <span className="flex items-center gap-2">
          <span className="text-danger text-[8px]">●</span>
          <strong className="text-text-primary">3 places · 1 497€</strong>
        </span>
        <span className="text-border hidden sm:inline">·</span>
        <span className="hidden sm:inline">Ferme le 30/04</span>
        <a
          href="#tarifs"
          className="text-accent underline hover:no-underline transition-all"
        >
          Réserver →
        </a>
      </div>
      <button
        onClick={dismiss}
        className="text-text-muted hover:text-text-primary transition-colors ml-3 flex-shrink-0 text-base leading-none cursor-pointer bg-transparent border-none"
        aria-label="Fermer le bandeau"
      >
        ×
      </button>
    </div>
  )
}
