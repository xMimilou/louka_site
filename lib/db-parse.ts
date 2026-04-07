import type { Article, Project, Workflow, PlatformLink } from './types'

function parseJSON<T>(val: unknown): T | null {
  if (val === null || val === undefined) return null
  if (typeof val === 'object') return val as T
  try { return JSON.parse(val as string) as T } catch { return null }
}

function parseBool(val: unknown): boolean {
  if (typeof val === 'boolean') return val
  return Number(val) === 1
}

export function parseArticle(row: Record<string, unknown>): Article {
  return {
    ...row,
    category: parseJSON<string[]>(row.category) ?? [],
    tags: parseJSON<string[]>(row.tags) ?? [],
    content: parseJSON<Record<string, unknown>>(row.content),
    downloads: Number(row.downloads ?? 0),
    // dates come back as Date objects from mysql2
    published_at: row.published_at ? String(row.published_at) : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  } as Article
}

export function parseProject(row: Record<string, unknown>): Project {
  return {
    ...row,
    stack: parseJSON<string[]>(row.stack) ?? [],
    featured: parseBool(row.featured),
    visible: parseBool(row.visible),
    side_project: parseBool(row.side_project),
    sort_order: Number(row.sort_order ?? 0),
    created_at: String(row.created_at),
  } as Project
}

export function parseWorkflow(row: Record<string, unknown>): Workflow {
  return {
    ...row,
    tags: parseJSON<string[]>(row.tags) ?? [],
    visible: parseBool(row.visible),
    coming_soon: parseBool(row.coming_soon),
    sort_order: Number(row.sort_order ?? 0),
    created_at: String(row.created_at),
  } as Workflow
}

export function parsePlatformLink(row: Record<string, unknown>): PlatformLink {
  return {
    ...row,
    visible: parseBool(row.visible),
    sort_order: Number(row.sort_order ?? 0),
  } as PlatformLink
}

export interface Candidate {
  id: string
  name: string
  email: string | null
  phone: string | null
  linkedin_url: string | null
  headline: string | null
  location: string | null
  keyword: string | null
  fit_grade: 'A' | 'B' | 'C' | 'D' | null
  source: string
  answers: string | null
  notes: string | null
  status: 'recu' | 'contacte' | 'qualifie' | 'rdv' | 'gagne' | 'perdu'
  ai_score: number | null
  ai_verdict: string | null
  closer_id: string | null
  created_at: string
}

export interface Closer {
  id: string
  name: string
  email: string | null
  created_at: string
}

export interface Payment {
  id: string
  candidate_id: string | null
  candidate_name?: string
  amount: number
  currency: string
  status: 'pending' | 'paid'
  stripe_id: string | null
  paid_at: string | null
  created_at: string
}

export interface Task {
  id: string
  closer_id: string | null
  candidate_id: string | null
  candidate_name?: string
  closer_name?: string
  title: string
  done: boolean
  due_date: string | null
  created_at: string
}

export interface Tweet {
  id: string
  content: string
  scheduled_at: string | null
  published: boolean
  likes: number
  impressions: number
  created_at: string
}

export interface Log {
  id: string
  level: string
  message: string
  created_at: string
}

export function parseCandidate(row: Record<string, unknown>): Candidate {
  return {
    ...row,
    ai_score: row.ai_score !== null && row.ai_score !== undefined ? Number(row.ai_score) : null,
    created_at: String(row.created_at),
  } as Candidate
}

export function parseCloser(row: Record<string, unknown>): Closer {
  return { ...row, created_at: String(row.created_at) } as Closer
}

export function parsePayment(row: Record<string, unknown>): Payment {
  return {
    ...row,
    amount: Number(row.amount ?? 0),
    paid_at: row.paid_at ? String(row.paid_at) : null,
    created_at: String(row.created_at),
  } as Payment
}

export function parseTask(row: Record<string, unknown>): Task {
  return {
    ...row,
    done: parseBool(row.done),
    created_at: String(row.created_at),
  } as Task
}

export function parseTweet(row: Record<string, unknown>): Tweet {
  return {
    ...row,
    published: parseBool(row.published),
    likes: Number(row.likes ?? 0),
    impressions: Number(row.impressions ?? 0),
    scheduled_at: row.scheduled_at ? String(row.scheduled_at) : null,
    created_at: String(row.created_at),
  } as Tweet
}

export function parseLog(row: Record<string, unknown>): Log {
  return { ...row, created_at: String(row.created_at) } as Log
}
