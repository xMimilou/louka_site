'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Search, Eye, EyeOff, Pencil, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import type { Article } from '@/lib/types'
import ConfirmModal from '@/components/admin/ConfirmModal'
import { toast } from '@/components/admin/Toast'

type StatusFilter = 'all' | 'published' | 'draft' | 'archived'

const statusLabels: Record<Article['status'], string> = {
  published: 'Publié',
  draft: 'Brouillon',
  archived: 'Archivé',
}

const statusBadgeClass: Record<Article['status'], string> = {
  published: 'text-success bg-success/10 border-success/30',
  draft: 'text-warning bg-warning/10 border-warning/30',
  archived: 'text-admin-muted bg-admin-surface border-admin-border',
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null)

  const fetchArticles = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      let query = supabase.from('articles').select('*').order('created_at', { ascending: false })
      if (filter !== 'all') query = query.eq('status', filter)
      const { data, error } = await query
      if (error) throw error
      setArticles(data || [])
    } catch {
      toast.error('Erreur lors du chargement des articles')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { fetchArticles() }, [fetchArticles])

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const supabase = createClient()
      const { error } = await supabase.from('articles').delete().eq('id', deleteTarget.id)
      if (error) throw error
      toast.success('Article supprimé')
      setDeleteTarget(null)
      fetchArticles()
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleToggleStatus = async (article: Article) => {
    const newStatus: Article['status'] = article.status === 'published' ? 'draft' : 'published'
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('articles')
        .update({
          status: newStatus,
          published_at: newStatus === 'published' ? new Date().toISOString() : null,
        })
        .eq('id', article.id)
      if (error) throw error
      toast.success(newStatus === 'published' ? 'Article publié !' : 'Article dépublié')
      fetchArticles()
    } catch {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const filtered = articles.filter((a) => {
    if (!search) return true
    return (
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.slug.toLowerCase().includes(search.toLowerCase())
    )
  })

  const tabs: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'Tous' },
    { value: 'published', label: 'Publié' },
    { value: 'draft', label: 'Brouillon' },
    { value: 'archived', label: 'Archivé' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <h2 className="font-syne font-bold text-admin-text text-xl">Articles & Ressources</h2>
          <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
            {articles.length}
          </span>
        </div>
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-admin-bg text-sm font-dm font-medium shadow-glow hover:shadow-glow-lg transition-all duration-200"
        >
          <Plus size={16} aria-hidden="true" />
          Nouvel article
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-1 p-1 bg-admin-bg border border-admin-border rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-dm transition-all duration-200 ${
                filter === tab.value
                  ? 'bg-admin-surface text-admin-text font-medium'
                  : 'text-admin-muted hover:text-admin-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-muted" aria-hidden="true" />
          <input
            type="search"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-admin-bg border border-admin-border rounded-lg text-sm font-dm text-admin-text placeholder-admin-muted focus:border-accent focus:outline-none transition-colors w-56"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-admin-border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mb-3" />
            <p className="font-dm text-admin-muted text-sm">Chargement...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="font-syne font-bold text-admin-text text-lg">Aucun article trouvé</p>
            <p className="font-dm text-admin-muted text-sm">
              {search ? 'Aucun résultat pour cette recherche.' : 'Créez votre premier article.'}
            </p>
            {!search && (
              <Link
                href="/admin/articles/new"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-admin-bg text-sm font-dm font-medium mt-2 shadow-glow"
              >
                <Plus size={14} />
                Créer un article
              </Link>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-admin-border" style={{ background: '#161B27' }}>
                <th className="px-4 py-3 text-left font-dm text-xs text-admin-muted uppercase tracking-wider">Titre</th>
                <th className="px-4 py-3 text-left font-dm text-xs text-admin-muted uppercase tracking-wider hidden md:table-cell">Catégorie</th>
                <th className="px-4 py-3 text-left font-dm text-xs text-admin-muted uppercase tracking-wider">Statut</th>
                <th className="px-4 py-3 text-left font-dm text-xs text-admin-muted uppercase tracking-wider hidden lg:table-cell">Date</th>
                <th className="px-4 py-3 text-right font-dm text-xs text-admin-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {filtered.map((article) => (
                <tr
                  key={article.id}
                  className="hover:bg-admin-surface transition-colors"
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-dm text-sm text-admin-text font-medium truncate max-w-xs">{article.title}</p>
                      <p className="font-mono text-[11px] text-admin-muted mt-0.5 truncate max-w-xs">{article.slug}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {article.category.slice(0, 2).map((cat) => (
                        <span key={cat} className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-admin-bg border border-admin-border text-admin-muted">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono border ${statusBadgeClass[article.status]}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" aria-hidden="true" />
                      {statusLabels[article.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="font-dm text-xs text-admin-muted">
                      {formatDate(article.published_at || article.created_at)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleToggleStatus(article)}
                        title={article.status === 'published' ? 'Dépublier' : 'Publier'}
                        className="p-1.5 rounded-lg text-admin-muted hover:text-accent transition-colors"
                      >
                        {article.status === 'published'
                          ? <Eye size={14} aria-hidden="true" />
                          : <EyeOff size={14} aria-hidden="true" />
                        }
                      </button>
                      <Link
                        href={`/admin/articles/${article.id}`}
                        className="p-1.5 rounded-lg text-admin-muted hover:text-accent transition-colors"
                        title="Modifier"
                      >
                        <Pencil size={14} aria-hidden="true" />
                      </Link>
                      <button
                        onClick={() => setDeleteTarget(article)}
                        className="p-1.5 rounded-lg text-admin-muted hover:text-danger transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Supprimer l'article"
        message={`Êtes-vous sûr de vouloir supprimer "${deleteTarget?.title}" ? Cette action est irréversible.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        confirmLabel="Supprimer définitivement"
      />
    </div>
  )
}
