'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ArrowLeft, Save, Globe, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import type { Article } from '@/lib/types'
import { toast } from '@/components/admin/Toast'
import FileUpload from '@/components/admin/FileUpload'

const Editor = dynamic(() => import('./EditorComponent'), { ssr: false })

interface PageProps {
  params: Promise<{ id: string }>
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

const emptyArticle: Omit<Article, 'id' | 'created_at' | 'updated_at'> = {
  title: '',
  slug: '',
  excerpt: null,
  content: null,
  category: [],
  tags: [],
  cover_url: null,
  file_url: null,
  file_label: null,
  ext_link: null,
  ext_label: null,
  status: 'draft',
  downloads: 0,
  published_at: null,
}

const categories = ['Python', 'Finance', 'n8n', 'Automatisation', 'MQL5', 'ML', 'Trading', 'Data']

export default function ArticleEditorPage({ params }: PageProps) {
  const { id } = use(params)
  const isNew = id === 'new'
  const router = useRouter()

  const [article, setArticle] = useState<Partial<Article>>(emptyArticle)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [slugEdited, setSlugEdited] = useState(false)
  const [categoryInput, setCategoryInput] = useState('')
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    if (isNew) return
    const fetchArticle = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase.from('articles').select('*').eq('id', id).single()
        if (error) throw error
        setArticle(data)
        setSlugEdited(true)
      } catch {
        toast.error('Article introuvable')
        router.push('/admin/articles')
      } finally {
        setLoading(false)
      }
    }
    fetchArticle()
  }, [id, isNew, router])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    setArticle((prev) => ({
      ...prev,
      title,
      slug: slugEdited ? prev.slug : slugify(title),
    }))
  }

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugEdited(true)
    setArticle((prev) => ({ ...prev, slug: e.target.value }))
  }

  const handleEditorChange = useCallback((content: Record<string, unknown>) => {
    setArticle((prev) => ({ ...prev, content }))
  }, [])

  const handleSave = async (publish = false) => {
    if (!article.title?.trim()) {
      toast.error('Le titre est requis')
      return
    }
    if (!article.slug?.trim()) {
      toast.error('Le slug est requis')
      return
    }

    setSaving(true)
    try {
      const supabase = createClient()
      const now = new Date().toISOString()
      const payload = {
        ...article,
        status: publish ? 'published' : (article.status || 'draft'),
        published_at: publish && !article.published_at ? now : article.published_at,
        updated_at: now,
      }

      if (isNew) {
        const { data, error } = await supabase
          .from('articles')
          .insert({ ...payload, created_at: now })
          .select()
          .single()
        if (error) throw error
        toast.success(publish ? 'Article publié !' : 'Brouillon sauvegardé')
        router.push(`/admin/articles/${data.id}`)
      } else {
        const { error } = await supabase
          .from('articles')
          .update(payload)
          .eq('id', id)
        if (error) throw error
        toast.success(publish ? 'Article publié !' : 'Sauvegardé')
        setArticle((prev) => ({ ...prev, ...payload }))
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const addCategory = (cat: string) => {
    if (!cat.trim()) return
    setArticle((prev) => ({
      ...prev,
      category: [...new Set([...(prev.category || []), cat.trim()])],
    }))
    setCategoryInput('')
  }

  const removeCategory = (cat: string) => {
    setArticle((prev) => ({ ...prev, category: (prev.category || []).filter((c) => c !== cat) }))
  }

  const addTag = (tag: string) => {
    if (!tag.trim()) return
    setArticle((prev) => ({
      ...prev,
      tags: [...new Set([...(prev.tags || []), tag.trim()])],
    }))
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    setArticle((prev) => ({ ...prev, tags: (prev.tags || []).filter((t) => t !== tag) }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Link
          href="/admin/articles"
          className="inline-flex items-center gap-2 text-admin-muted hover:text-admin-text text-sm font-dm transition-colors"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Retour
        </Link>

        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border ${
            article.status === 'published'
              ? 'text-success bg-success/10 border-success/30'
              : article.status === 'archived'
              ? 'text-admin-muted bg-admin-surface border-admin-border'
              : 'text-warning bg-warning/10 border-warning/30'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" aria-hidden="true" />
            {article.status === 'published' ? 'Publié' : article.status === 'archived' ? 'Archivé' : 'Brouillon'}
          </span>

          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-admin-border text-admin-text text-sm font-dm hover:border-accent transition-all duration-200 disabled:opacity-60"
          >
            <Save size={14} aria-hidden="true" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder brouillon'}
          </button>

          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-admin-bg text-sm font-dm font-medium shadow-glow hover:shadow-glow-lg transition-all duration-200 disabled:opacity-60"
          >
            <Globe size={14} aria-hidden="true" />
            {saving ? '...' : 'Publier'}
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
        {/* Left: editor */}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Titre de l'article..."
            value={article.title || ''}
            onChange={handleTitleChange}
            className="w-full bg-transparent border-b border-admin-border pb-3 text-admin-text font-syne font-bold placeholder-admin-muted focus:outline-none focus:border-accent transition-colors"
            style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}
          />

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-admin-muted">/ressources/</span>
            <input
              type="text"
              placeholder="slug-de-l-article"
              value={article.slug || ''}
              onChange={handleSlugChange}
              className="flex-1 bg-admin-bg border border-admin-border rounded-lg px-3 py-1.5 font-mono text-xs text-admin-text focus:border-accent focus:outline-none transition-colors"
            />
          </div>

          <Editor
            initialContent={article.content || null}
            onChange={handleEditorChange}
          />
        </div>

        {/* Right: metadata panel */}
        <aside className="space-y-5">
          {/* Status */}
          <div className="bg-admin-surface border border-admin-border rounded-xl p-4 space-y-3">
            <h3 className="font-syne font-bold text-admin-text text-sm">Statut</h3>
            <select
              value={article.status || 'draft'}
              onChange={(e) => setArticle((prev) => ({ ...prev, status: e.target.value as Article['status'] }))}
              className="w-full bg-admin-bg border border-admin-border rounded-lg px-3 py-2 text-admin-text font-dm text-sm focus:border-accent focus:outline-none transition-colors"
            >
              <option value="draft">Brouillon</option>
              <option value="published">Publié</option>
              <option value="archived">Archivé</option>
            </select>

            <div>
              <label className="block font-dm text-xs text-admin-muted mb-1.5">
                <Clock size={10} className="inline mr-1" aria-hidden="true" />
                Date de publication
              </label>
              <input
                type="date"
                value={article.published_at ? article.published_at.split('T')[0] : ''}
                onChange={(e) => setArticle((prev) => ({
                  ...prev,
                  published_at: e.target.value ? new Date(e.target.value).toISOString() : null,
                }))}
                className="w-full bg-admin-bg border border-admin-border rounded-lg px-3 py-2 text-admin-text font-dm text-sm focus:border-accent focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Excerpt */}
          <div className="bg-admin-surface border border-admin-border rounded-xl p-4 space-y-2">
            <h3 className="font-syne font-bold text-admin-text text-sm">Extrait</h3>
            <textarea
              placeholder="Résumé de l'article..."
              value={article.excerpt || ''}
              onChange={(e) => setArticle((prev) => ({ ...prev, excerpt: e.target.value }))}
              rows={3}
              className="w-full bg-admin-bg border border-admin-border rounded-lg px-3 py-2 text-admin-text font-dm text-sm placeholder-admin-muted focus:border-accent focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Categories */}
          <div className="bg-admin-surface border border-admin-border rounded-xl p-4 space-y-3">
            <h3 className="font-syne font-bold text-admin-text text-sm">Catégories</h3>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => (article.category || []).includes(cat) ? removeCategory(cat) : addCategory(cat)}
                  className={`font-mono text-[10px] px-2 py-0.5 rounded border transition-colors ${
                    (article.category || []).includes(cat)
                      ? 'bg-accent/15 text-accent border-accent/30'
                      : 'bg-admin-bg text-admin-muted border-admin-border hover:border-accent'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Autre catégorie..."
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCategory(categoryInput) } }}
                className="flex-1 bg-admin-bg border border-admin-border rounded-lg px-3 py-1.5 font-dm text-xs text-admin-text placeholder-admin-muted focus:border-accent focus:outline-none"
              />
            </div>
            {(article.category || []).length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {(article.category || []).map((cat) => (
                  <span key={cat} className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded bg-accent/15 text-accent border border-accent/30">
                    {cat}
                    <button onClick={() => removeCategory(cat)} className="hover:text-danger" type="button">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="bg-admin-surface border border-admin-border rounded-xl p-4 space-y-3">
            <h3 className="font-syne font-bold text-admin-text text-sm">Tags</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ajouter un tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput) } }}
                className="flex-1 bg-admin-bg border border-admin-border rounded-lg px-3 py-1.5 font-dm text-xs text-admin-text placeholder-admin-muted focus:border-accent focus:outline-none"
              />
            </div>
            {(article.tags || []).length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {(article.tags || []).map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded bg-admin-surface text-admin-muted border border-admin-border">
                    #{tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-danger" type="button">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Cover image */}
          <div className="bg-admin-surface border border-admin-border rounded-xl p-4 space-y-3">
            <h3 className="font-syne font-bold text-admin-text text-sm">Image de couverture</h3>
            {article.cover_url && (
              <div className="w-full h-32 rounded-lg overflow-hidden bg-admin-bg mb-2">
                <img src={article.cover_url} alt="Cover" className="w-full h-full object-cover" />
              </div>
            )}
            <FileUpload
              bucket="uploads"
              folder="covers"
              accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
              onUploaded={(url) => setArticle((prev) => ({ ...prev, cover_url: url }))}
              label="Uploader une image"
              currentUrl={article.cover_url}
            />
          </div>

          {/* Downloadable file */}
          <div className="bg-admin-surface border border-admin-border rounded-xl p-4 space-y-3">
            <h3 className="font-syne font-bold text-admin-text text-sm">Fichier téléchargeable</h3>
            <FileUpload
              bucket="uploads"
              folder="files"
              onUploaded={(url, name) => setArticle((prev) => ({
                ...prev,
                file_url: url,
                file_label: prev.file_label || name,
              }))}
              label="Uploader un fichier"
              currentUrl={article.file_url}
            />
            {article.file_url && (
              <input
                type="text"
                placeholder="Label du bouton de téléchargement"
                value={article.file_label || ''}
                onChange={(e) => setArticle((prev) => ({ ...prev, file_label: e.target.value }))}
                className="w-full bg-admin-bg border border-admin-border rounded-lg px-3 py-2 font-dm text-xs text-admin-text placeholder-admin-muted focus:border-accent focus:outline-none"
              />
            )}
          </div>

          {/* External link */}
          <div className="bg-admin-surface border border-admin-border rounded-xl p-4 space-y-3">
            <h3 className="font-syne font-bold text-admin-text text-sm">Lien externe</h3>
            <input
              type="url"
              placeholder="https://..."
              value={article.ext_link || ''}
              onChange={(e) => setArticle((prev) => ({ ...prev, ext_link: e.target.value }))}
              className="w-full bg-admin-bg border border-admin-border rounded-lg px-3 py-2 font-dm text-xs text-admin-text placeholder-admin-muted focus:border-accent focus:outline-none"
            />
            <input
              type="text"
              placeholder="Label du lien"
              value={article.ext_label || ''}
              onChange={(e) => setArticle((prev) => ({ ...prev, ext_label: e.target.value }))}
              className="w-full bg-admin-bg border border-admin-border rounded-lg px-3 py-2 font-dm text-xs text-admin-text placeholder-admin-muted focus:border-accent focus:outline-none"
            />
          </div>
        </aside>
      </div>
    </div>
  )
}
