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
