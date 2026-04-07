import { createClient } from '@/lib/supabase-server'
import type { Project, PlatformLink, Article, Workflow } from '@/lib/types'
import Nav from '@/components/public/Nav'
import Hero from '@/components/public/Hero'
import CalendlyWidget from '@/components/public/CalendlyWidget'
import Services from '@/components/public/Services'
import Pricing from '@/components/public/Pricing'
import Projects from '@/components/public/Projects'
import Resources from '@/components/public/Resources'
import Platforms from '@/components/public/Platforms'
import RoadmapCTA from '@/components/public/RoadmapCTA'
import Footer from '@/components/public/Footer'

const staticProjects: Project[] = [
  {
    id: '1',
    name: 'Vantage',
    category: 'SaaS · Finance',
    status: 'En développement',
    description: "Screener Python d'actions à fort potentiel : score IA sur 20+ critères fondamentaux, analyse automatisée.",
    stack: ['Python', 'IA', 'Data Pipeline'],
    link_url: null,
    link_label: null,
    github_url: null,
    image_url: null,
    featured: true,
    sort_order: 1,
    visible: true,
    side_project: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Bot YouTube → Telegram',
    category: 'Automatisation · Finance',
    status: 'En production',
    description: "Veille trading automatisée : surveille les chaînes YouTube d'analystes, transcrit les vidéos et envoie un résumé structuré sur Telegram toutes les 2h.",
    stack: ['n8n', 'Gemini API', 'Telegram', 'RSS'],
    link_url: null,
    link_label: null,
    github_url: null,
    image_url: null,
    featured: true,
    sort_order: 2,
    visible: true,
    side_project: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Bot "Pépites"',
    category: 'Finance · ML',
    status: 'En production',
    description: "Détection automatique d'actions à fort potentiel via scoring IA multi-critères, avec alerte Telegram en temps réel.",
    stack: ['Python', 'ML', 'Telegram', 'Finance Data'],
    link_url: null,
    link_label: null,
    github_url: null,
    image_url: null,
    featured: true,
    sort_order: 3,
    visible: true,
    side_project: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Workflow n8n — Relance client',
    category: 'Automatisation',
    status: 'En production',
    description: "Workflow n8n de relance client automatisée : séquences personnalisées, déclencheurs sur inactivité, zéro intervention manuelle.",
    stack: ['n8n', 'APIs', 'CRM', 'Automation'],
    link_url: null,
    link_label: null,
    github_url: null,
    image_url: null,
    featured: false,
    sort_order: 4,
    visible: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'lemonpunch.fr',
    category: 'Web · SaaS',
    status: 'En production',
    description: "Site web complet pour un groupe de rock — conçu et développé avec Astro.js. Design, performances et déploiement.",
    stack: ['Wordpress', 'TypeScript', 'CSS'],
    link_url: 'https://lemonpunch.fr',
    link_label: 'Voir le site',
    github_url: null,
    image_url: null,
    featured: false,
    sort_order: 5,
    visible: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'Google Maps Scraper',
    category: 'Automatisation · Data',
    status: 'En production',
    description: "Extraction automatisée de contacts professionnels depuis Google Maps : nom, téléphone, email, adresse. Prêt à l'emploi.",
    stack: ['N8N', 'Python', 'Scraping', 'Data', 'Automation'],
    link_url: null,
    link_label: null,
    github_url: null,
    image_url: null,
    featured: false,
    sort_order: 6,
    visible: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '7',
    name: 'WebEnhancer',
    category: 'Automatisation · Web',
    status: 'En production',
    description: "Un outil pour améliorer l'expérience utilisateur sur les sites web et permettre au developpeur de site de les faires sans erreurs. L'outil permet la compliance RGPD, l'amélioration de l'expérience utilisateur et l'optimisation des performances.",
    stack: ['C#', 'Python', 'Scraping', 'Data', 'Automation', 'LightHouse', 'Symfony', 'MySQL', 'Docker'],
    link_url: null,
    link_label: null,
    github_url: null,
    image_url: null,
    featured: false,
    sort_order: 6,
    visible: true,
    created_at: new Date().toISOString(),
  },
]

const staticWorkflows: Workflow[] = [
  {
    id: '1',
    title: 'Relance automatique prospects',
    description: 'Séquence email J+0 à J+10 depuis Google Sheets. Vous ajoutez un contact, le système fait le reste.',
    tags: ['n8n', 'Gmail', 'Google Sheets'],
    sort_order: 1,
    visible: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'CRM automatisé Google Sheets',
    description: 'Statuts, historique de contact et scoring mis à jour automatiquement. Votre pipeline toujours à jour sans y toucher.',
    tags: ['n8n', 'Google Sheets', 'Telegram'],
    sort_order: 2,
    visible: true,
    coming_soon: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Onboarding client automatisé',
    description: 'Nouveau client signé → contrat envoyé, accès transmis, email de bienvenue et dossier créé automatiquement.',
    tags: ['n8n', 'Gmail', 'Google Drive'],
    sort_order: 3,
    visible: true,
    coming_soon: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Dashboard pipeline de vente',
    description: 'Vue centralisée de tous vos prospects avec scoring automatique et alertes sur les deals à risque.',
    tags: ['n8n', 'Google Sheets', 'Telegram'],
    sort_order: 4,
    visible: true,
    coming_soon: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'Alertes LinkedIn → Telegram',
    description: 'Un nouveau prospect correspond à vos critères → alerte Telegram instantanée avec son profil.',
    tags: ['n8n', 'LinkedIn', 'Telegram'],
    sort_order: 5,
    visible: true,
    coming_soon: true,
    created_at: new Date().toISOString(),
  },
]

const staticPlatforms: PlatformLink[] = [
  { id: '1', platform: 'Malt', label: 'Mon profil freelance', url: 'https://www.malt.fr/profile/loukamillon', icon: 'malt', visible: true, sort_order: 1 },
  { id: '2', platform: 'Comeup', label: 'Mes services packagés', url: 'https://comeup.com/fr/@xmimilou', icon: 'comeup', visible: true, sort_order: 2 },
  { id: '3', platform: 'LinkedIn', label: 'Me suivre sur LinkedIn', url: 'https://www.linkedin.com/in/louka-millon-426b7a1b7/', icon: 'linkedin', visible: true, sort_order: 3 },
  { id: '4', platform: 'Email', label: 'hello@loukamillon.com', url: 'mailto:hello@loukamillon.com', icon: 'email', visible: true, sort_order: 4 },
]

export default async function HomePage() {
  let projects: Project[] = staticProjects
  let platforms: PlatformLink[] = staticPlatforms
  let articles: Article[] = []
  let workflows: Workflow[] = staticWorkflows

  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project.supabase.co') {
      const supabase = await createClient()

      const { data: dbProjects } = await supabase
        .from('projects')
        .select('*')
        .eq('visible', true)
        .order('sort_order')

      if (dbProjects && dbProjects.length > 0) projects = dbProjects

      const { data: dbPlatforms } = await supabase
        .from('platform_links')
        .select('*')
        .eq('visible', true)
        .order('sort_order')

      if (dbPlatforms && dbPlatforms.length > 0) platforms = dbPlatforms

      const { data: dbArticles } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(3)

      if (dbArticles) articles = dbArticles

      const { data: dbWorkflows } = await supabase
        .from('workflows')
        .select('*')
        .eq('visible', true)
        .order('sort_order')

      if (dbWorkflows && dbWorkflows.length > 0) workflows = dbWorkflows
    }
  } catch {
    // Use static fallback data
  }

  return (
    <>
      <Nav />
      <main>
        <Hero platforms={platforms} />
        <Services workflows={workflows} />
        <Pricing />
        <Projects projects={projects} />
        <Resources articles={articles} />
        <Platforms platforms={platforms} />
        <RoadmapCTA />
      </main>
      <Footer />
      <CalendlyWidget />
    </>
  )
}
