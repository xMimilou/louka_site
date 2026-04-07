export interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: Record<string, unknown> | null  // BlockNote JSON
  category: string[]
  tags: string[]
  cover_url: string | null
  file_url: string | null
  file_label: string | null
  ext_link: string | null
  ext_label: string | null
  status: 'draft' | 'published' | 'archived'
  downloads: number
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  name: string
  category: string
  status: 'En production' | 'En développement' | 'Démo dispo' | 'Archivé'
  description: string
  stack: string[]
  link_url: string | null
  link_label: string | null
  github_url: string | null
  image_url: string | null
  featured: boolean
  sort_order: number
  visible: boolean
  side_project?: boolean
  created_at: string
}

export interface PlatformLink {
  id: string
  platform: string
  label: string
  url: string
  icon: string
  visible: boolean
  sort_order: number
}

export interface Workflow {
  id: string
  title: string
  description: string
  tags: string[]
  sort_order: number
  visible: boolean
  coming_soon?: boolean
  created_at: string
}

export interface Settings {
  [key: string]: string
}
