'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, X, GripVertical, ExternalLink, Github } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import type { Project } from '@/lib/types'
import ConfirmModal from '@/components/admin/ConfirmModal'
import { toast } from '@/components/admin/Toast'

const statusColors: Record<string, string> = {
  'En production': 'text-success bg-success/10 border-success/30',
  'En développement': 'text-warning bg-warning/10 border-warning/30',
  'Démo dispo': 'text-accent bg-accent/10 border-accent/30',
  'Archivé': 'text-admin-muted bg-admin-surface border-admin-border',
}

const categories = ['SaaS · Finance', 'Finance · Algo Trading', 'ML · Finance', 'Automatisation', 'Automatisation · Finance', 'Web', 'Data']
const statusOptions = ['En production', 'En développement', 'Démo dispo', 'Archivé']

const emptyProject: Omit<Project, 'id' | 'created_at'> = {
  name: '',
  category: '',
  status: 'En développement',
  description: '',
  stack: [],
  link_url: null,
  link_label: null,
  github_url: null,
  image_url: null,
  featured: false,
  sort_order: 0,
  visible: true,
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [editTarget, setEditTarget] = useState<Partial<Project> | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)
  const [saving, setSaving] = useState(false)
  const [stackInput, setStackInput] = useState('')
  const [isNew, setIsNew] = useState(false)

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('sort_order')
      if (error) throw error
      setProjects(data || [])
    } catch {
      toast.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  const openNew = () => {
    setIsNew(true)
    setEditTarget({ ...emptyProject, sort_order: projects.length + 1 })
    setStackInput('')
  }

  const openEdit = (project: Project) => {
    setIsNew(false)
    setEditTarget({ ...project })
    setStackInput('')
  }

  const closeEdit = () => {
    setEditTarget(null)
    setStackInput('')
  }

  const handleSave = async () => {
    if (!editTarget?.name?.trim()) {
      toast.error('Le nom est requis')
      return
    }
    setSaving(true)
    try {
      const supabase = createClient()
      if (isNew) {
        const { error } = await supabase.from('projects').insert({
          ...editTarget,
          created_at: new Date().toISOString(),
        })
        if (error) throw error
        toast.success('Projet créé !')
      } else {
        const { error } = await supabase
          .from('projects')
          .update(editTarget)
          .eq('id', editTarget.id)
        if (error) throw error
        toast.success('Projet mis à jour !')
      }
      closeEdit()
      fetchProjects()
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const supabase = createClient()
      const { error } = await supabase.from('projects').delete().eq('id', deleteTarget.id)
      if (error) throw error
      toast.success('Projet supprimé')
      setDeleteTarget(null)
      fetchProjects()
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleToggleVisible = async (project: Project) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('projects')
        .update({ visible: !project.visible })
        .eq('id', project.id)
      if (error) throw error
      toast.success(project.visible ? 'Projet masqué' : 'Projet affiché')
      fetchProjects()
    } catch {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const addStack = (tech: string) => {
    if (!tech.trim()) return
    setEditTarget((prev) => prev ? ({
      ...prev,
      stack: [...new Set([...(prev.stack || []), tech.trim()])],
    }) : prev)
    setStackInput('')
  }

  const removeStack = (tech: string) => {
    setEditTarget((prev) => prev ? ({
      ...prev,
      stack: (prev.stack || []).filter((t) => t !== tech),
    }) : prev)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-syne font-bold text-admin-text text-xl">Projets Portfolio</h2>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-admin-bg text-sm font-dm font-medium shadow-glow hover:shadow-glow-lg transition-all duration-200"
        >
          <Plus size={16} aria-hidden="true" />
          Nouveau projet
        </button>
      </div>

      {/* Projects grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-xl border border-admin-border p-12 text-center space-y-3">
          <p className="font-syne font-bold text-admin-text text-lg">Aucun projet</p>
          <p className="font-dm text-admin-muted text-sm">Créez votre premier projet.</p>
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-admin-bg text-sm font-dm font-medium shadow-glow mt-2"
          >
            <Plus size={14} />
            Nouveau projet
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className={`flex items-center gap-4 bg-admin-surface border border-admin-border rounded-xl px-4 py-4 transition-all duration-200 ${
                !project.visible ? 'opacity-50' : ''
              }`}
            >
              <GripVertical size={16} className="text-admin-muted flex-shrink-0 cursor-grab" aria-hidden="true" />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h3 className="font-syne font-bold text-admin-text text-sm">{project.name}</h3>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono border ${statusColors[project.status] || statusColors['Archivé']}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" aria-hidden="true" />
                    {project.status}
                  </span>
                  {project.featured && (
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-accent/15 text-accent border border-accent/30">
                      Featured
                    </span>
                  )}
                </div>
                <p className="font-mono text-[11px] text-admin-muted">{project.category}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {project.stack.map((tech) => (
                    <span key={tech} className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-admin-bg border border-admin-border text-admin-muted">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {project.link_url && (
                  <a href={project.link_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg text-admin-muted hover:text-accent transition-colors">
                    <ExternalLink size={14} aria-hidden="true" />
                  </a>
                )}
                {project.github_url && (
                  <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg text-admin-muted hover:text-accent transition-colors">
                    <Github size={14} aria-hidden="true" />
                  </a>
                )}
                <button
                  onClick={() => handleToggleVisible(project)}
                  className={`p-1.5 rounded-lg text-xs font-mono transition-colors ${
                    project.visible ? 'text-success hover:text-admin-muted' : 'text-admin-muted hover:text-success'
                  }`}
                  title={project.visible ? 'Masquer' : 'Afficher'}
                >
                  {project.visible ? '●' : '○'}
                </button>
                <button
                  onClick={() => openEdit(project)}
                  className="px-3 py-1.5 rounded-lg border border-admin-border text-admin-text text-xs font-dm hover:border-accent transition-colors"
                >
                  Modifier
                </button>
                <button
                  onClick={() => setDeleteTarget(project)}
                  className="p-1.5 rounded-lg text-admin-muted hover:text-danger transition-colors"
                >
                  <X size={14} aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeEdit} aria-hidden="true" />
          <div className="relative w-full max-w-[600px] bg-admin-surface border border-admin-border rounded-2xl p-6 shadow-2xl mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-syne font-bold text-admin-text text-lg">
                {isNew ? 'Nouveau projet' : 'Modifier le projet'}
              </h2>
              <button onClick={closeEdit} className="text-admin-muted hover:text-admin-text transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-dm text-xs text-admin-muted mb-1.5">Nom *</label>
                <input
                  type="text"
                  value={editTarget.name || ''}
                  onChange={(e) => setEditTarget((p) => p ? ({ ...p, name: e.target.value }) : p)}
                  className="w-full bg-admin-bg border border-admin-border rounded-lg px-3 py-2 text-admin-text font-dm text-sm focus:border-accent focus:outline-none"
                  placeholder="Nom du projet"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-dm text-xs text-admin-muted mb-1.5">Catégorie</label>
                  <select
                    value={editTarget.category || ''}
                    onChange={(e) => setEditTarget((p) => p ? ({ ...p, category: e.target.value }) : p)}
                    className="w-full bg-admin-bg border border-admin-border rounded-lg px-3 py-2 text-admin-text font-dm text-sm focus:border-accent focus:outline-none"
                  >
                    <option value="">Choisir...</option>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-dm text-xs text-admin-muted mb-1.5">Statut</label>
                  <select
                    value={editTarget.status || 'En développement'}
                    onChange={(e) => setEditTarget((p) => p ? ({ ...p, status: e.target.value as Project['status'] }) : p)}
                    className="w-full bg-admin-bg border border-admin-border rounded-lg px-3 py-2 text-admin-text font-dm text-sm focus:border-accent focus:outline-none"
                  >
                    {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-dm text-xs text-admin-muted mb-1.5">Description</label>
                <textarea
                  value={editTarget.description || ''}
                  onChange={(e) => setEditTarget((p) => p ? ({ ...p, description: e.target.value }) : p)}
                  rows={3}
                  className="w-full bg-admin-bg border border-admin-border rounded-lg px-3 py-2 text-admin-text font-dm text-sm focus:border-accent focus:outline-none resize-none"
                  placeholder="Description du projet..."
                />
              </div>

              <div>
                <label className="block font-dm text-xs text-admin-muted mb-1.5">Stack technique</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={stackInput}
                    onChange={(e) => setStackInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addStack(stackInput) } }}
                    placeholder="Python, React, n8n..."
                    className="flex-1 bg-admin-bg border border-admin-border rounded-lg px-3 py-2 font-dm text-sm text-admin-text focus:border-accent focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => addStack(stackInput)}
                    className="px-3 py-2 rounded-lg bg-accent/15 text-accent text-sm font-dm hover:bg-accent/25 transition-colors"
                  >
                    +
                  </button>
                </div>
                {(editTarget.stack || []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {(editTarget.stack || []).map((tech) => (
                      <span key={tech} className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded bg-admin-bg border border-admin-border text-admin-muted">
                        {tech}
                        <button type="button" onClick={() => removeStack(tech)} className="hover:text-danger">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-dm text-xs text-admin-muted mb-1.5">URL du projet</label>
                  <input
                    type="url"
                    value={editTarget.link_url || ''}
                    onChange={(e) => setEditTarget((p) => p ? ({ ...p, link_url: e.target.value || null }) : p)}
                    placeholder="https://..."
                    className="w-full bg-admin-bg border border-admin-border rounded-lg px-3 py-2 font-dm text-sm text-admin-text focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-dm text-xs text-admin-muted mb-1.5">GitHub URL</label>
                  <input
                    type="url"
                    value={editTarget.github_url || ''}
                    onChange={(e) => setEditTarget((p) => p ? ({ ...p, github_url: e.target.value || null }) : p)}
                    placeholder="https://github.com/..."
                    className="w-full bg-admin-bg border border-admin-border rounded-lg px-3 py-2 font-dm text-sm text-admin-text focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editTarget.featured || false}
                    onChange={(e) => setEditTarget((p) => p ? ({ ...p, featured: e.target.checked }) : p)}
                    className="w-4 h-4 rounded border-admin-border bg-admin-bg accent-accent"
                  />
                  <span className="font-dm text-sm text-admin-text">Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editTarget.visible !== false}
                    onChange={(e) => setEditTarget((p) => p ? ({ ...p, visible: e.target.checked }) : p)}
                    className="w-4 h-4 rounded border-admin-border bg-admin-bg accent-accent"
                  />
                  <span className="font-dm text-sm text-admin-text">Visible</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeEdit}
                className="px-4 py-2 rounded-lg border border-admin-border text-admin-text text-sm font-dm hover:border-accent transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-accent text-admin-bg text-sm font-dm font-medium shadow-glow hover:shadow-glow-lg transition-all disabled:opacity-60"
              >
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Supprimer le projet"
        message={`Êtes-vous sûr de vouloir supprimer "${deleteTarget?.name}" ?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
