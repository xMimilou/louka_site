'use client'

import { useEffect } from 'react'

const CALENDLY_URL = 'https://calendly.com/louka06-millon/audit-45min'

export default function CalendlyWidget() {
  useEffect(() => {
    const w = window as typeof window & {
      Calendly?: { initBadgeWidget: (opts: object) => void }
    }
    if (w.Calendly) {
      w.Calendly.initBadgeWidget({
        url: CALENDLY_URL,
        text: 'Réserver mon audit gratuit',
        color: '#00D4FF',
        textColor: '#0a0a0f',
        branding: false,
      })
    } else {
      // Retry once script finishes loading
      const timer = setTimeout(() => {
        if (w.Calendly) {
          w.Calendly.initBadgeWidget({
            url: CALENDLY_URL,
            text: 'Réserver mon audit gratuit',
            color: '#00D4FF',
            textColor: '#0a0a0f',
            branding: false,
          })
        }
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  return null
}
