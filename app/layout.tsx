import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: 'Louka Millon — Automatisation sur-mesure',
  description: 'Vous perdez des heures sur des tâches répétitives. Je les automatise. Système 90 : workflows construits pour vous en 90 jours, puis maîtrisés par vous.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link href="https://assets.calendly.com/assets/external/widget.css" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Script
          src="https://assets.calendly.com/assets/external/widget.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
