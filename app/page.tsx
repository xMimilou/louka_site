import pool from '@/lib/db'
import type { PlatformLink } from '@/lib/types'
import Nav from '@/components/public/Nav'
import AnnouncementBar from '@/components/public/AnnouncementBar'
import Hero from '@/components/public/Hero'
import CalendlyWidget from '@/components/public/CalendlyWidget'
import SocialProof from '@/components/public/SocialProof'
import Pricing from '@/components/public/Pricing'
import Guarantee from '@/components/public/Guarantee'
import FAQ from '@/components/public/FAQ'
import EmailCapture from '@/components/public/EmailCapture'
import NewsletterStrip from '@/components/public/NewsletterStrip'
import Footer from '@/components/public/Footer'

const staticPlatforms: PlatformLink[] = [
  { id: '1', platform: 'Malt', label: 'Mon profil Malt', url: 'https://www.malt.fr/profile/loukamillon', icon: 'malt', visible: true, sort_order: 1 },
  { id: '2', platform: 'Comeup', label: 'Mes services Comeup', url: 'https://comeup.com/fr/@xmimilou', icon: 'comeup', visible: true, sort_order: 2 },
  { id: '3', platform: 'LinkedIn', label: 'LinkedIn', url: 'https://www.linkedin.com/in/louka-millon-426b7a1b7/', icon: 'linkedin', visible: true, sort_order: 3 },
  { id: '4', platform: 'Email', label: 'hello@loukamillon.com', url: 'mailto:hello@loukamillon.com', icon: 'email', visible: true, sort_order: 4 },
]

export default async function HomePage() {
  let platforms: PlatformLink[] = staticPlatforms

  try {
    const [rows] = await pool.execute(
      'SELECT * FROM platform_links WHERE visible = 1 ORDER BY sort_order'
    ) as [PlatformLink[], unknown]
    if (rows.length > 0) platforms = rows
  } catch {
    // Use static fallback
  }

  return (
    <>
      <AnnouncementBar />
      <Nav />
      <main>
        <Hero platforms={platforms} />
        <SocialProof />
        <Pricing />
        <Guarantee />
        <FAQ />
        <EmailCapture />
        <NewsletterStrip />
      </main>
      <Footer platforms={platforms} />
      <CalendlyWidget />
    </>
  )
}
