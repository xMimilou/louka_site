'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, X, GripVertical } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import type { Workflow } from '@/lib/types'
import ConfirmModal from '@/components/admin/ConfirmModal'
import { toast } from '@/components/admin/Toast'

const emptyWorkflow: Omit<Workflow, 'id' | 'created_at'> = {
  title: '',
  description: '',
  tags: [],
  sort_order: 0,
  visible: false,
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const [editTarget, setEditTarget] = useState<Partial<Workflow> | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Workflow | null>(null)
  const [saving, setSaving] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [isNew, setIsNew] = useState(false)

  const fetchWorkflows = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .order('sort_order')
      if (error) throw error
      setWorkflows(data || [])
    } catch {
      toast.error('Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchWorkflows() }, [fetchWorkflows])

  const openNew = () => {
    setIsNew(true)
    setEditTarget({ ...emptyWorkflow, sort_order: workflows.length + 1 })
    setTagInput('')
  }

  const openEdit = (workflow: Workflow) => {
    setIsNew(false)
    setEditTarget({ ...workflow })
    setTagInput('')
  }

  const closeEdit = () => {
    setEditTarget(null)
    setTagInput('')
  }

  const handleSave = async () => {
    if (!editTarget?.title?.trim()) {
      toast.error('Le titre est requis')
      return
    }
    setSaving(true)
    try {
      const supabase = createClient()
      if (isNew) {
        const { error } = await supabase.from('workflows').insert({
          ...editTarget,
          created_at: new Date().toISOString(),
        })
        if (error) throw error
        toast.success('Workflow créé !')
      } else {
        const { error } = await supabase
          .from('workflows')
          .update(editTarget)
          .eq('id', editTarget.id)
        if (error) throw error
        toast.success('Workflow mis à jour !')
      }
      closeEdit()
      fetchWorkflows()
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
      const { error } = await supabase.from('workflows').delete().eq('id', deleteTarget.id)
      if (error) throw error
      toast.success('Workflow supprimé')
      setDeleteTarget(null)
      fetchWorkflows()
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleToggleVisible = async (workflow: Workflow) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('workflows')
        .update({ visible: !workflow.visible })
        .eq('id', workflow.id)
      if (error) throw error
      toast.success(workflow.visible ? 'Workflow masqué' : 'Workflow affiché sur le site')
      fetchWorkflows()
    } catch {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const addTag = (tag: string) => {
    if (!tag.trim()) return
    setEditTarget((prev) => prev ? ({
      ...prev,
      tags: [...new Set([...(prev.tags || []), tag.trim()])],
    }) : prev)
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    setEditTarget((prev) => prev ? ({
      ...prev,
      tags: (prev.tags || []).filter((t) => t !== tag),
    }) : prev)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-syne font-bold text-admin-text text-xl">Workflows — Services</h2>
          <p className="font-dm text-admin-muted text-sm mt-0.5">Activez un workflow une fois qu&apos;il est construit et prêt à être présenté.</p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-admin-bg text-sm font-dm font-medium shadow-glow hover:shadow-glow-lg transition-all duration-200"
        >
          <Plus size={16} aria-hidden="true" />
          Nouveau workflow
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : workflows.length === 0 ? (
        <div className="rounded-xl border border-admin-border p-12 text-center space-y-3">
          <p className="font-syne font-bold text-admin-text text-lg">Aucun workflow</p>
          <p className="font-dm text-admin-muted text-sm">Créez votre premier workflow.</p>
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-admin-bg text-sm font-dm font-medium shadow-glow mt-2"
          >
            <Plus size={14} />
            Nouveau workflow
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {workflows.map((workflow) => (
            <div
              key={workflow.id}
              className={`flex items-center gap-4 bg-admin-surface border border-admin-border rounded-xl px-4 py-4 transition-all duration-200 ${
                !workflow.visible ? 'opacity-50' : ''
              }`}
            >
              <GripVertical size={16} className="text-admin-muted flex-shrink-0 cursor-grab" aria-hidden="true" />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h3 className="font-syne font-bold text-admin-text text-sm">{workflow.title}</h3>
                  <span className={`font-mono text-[10px] px-2 py-0.5 rounded border ${
                    workflow.visible
                      ? 'text-success bg-success/10 border-success/30'
                      : 'text-admin-muted bg-admin-bg border-admin-border'
                  }`}>
                    {workflow.visible ? 'Visible' : 'Masqué'}
                  </span>
                </div>
                {workflow.description && (
                  <p className="font-dm text-[11px] text-admin-muted mb-1.5 truncate max-w-[500px]">{workflow.description}</p>
                )}
                <div className="flex flex-wrap gap-1">
                  {workflow.tags.map((tag) => (
                    <span key={tag} className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-admin-bg border border-admin-border text-admin-muted">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleToggleVisible(workflow)}
                  className={`p-1.5 rounded-lg text-xs font-mono transition-colors ${
                    workflow.visible ? 'text-success hover:text-admin-muted' : 'text-admin-muted hover:text-success'
                  }`}
                  title={workflow.visible ? 'Masquer du site' : 'Afficher sur le site'}
                >
                  {workflow.visible ? '●' : '○'}
                </button>
                <button
                  onClick={() => openEdit(workflow)}
                  className="px-3 py-1.5 rounded-lg border border-admin-border text-admin-text text-xs font-dm hover:border-accent transition-colors"
                >
                  Modifier
                </button>
                <button
                  onClick={() => setDeleteTarget(workflow)}
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
          <div className="relative w-full max-w-[520px] bg-admin-surface border border-admin-border rounded-2xl p-6 shadow-2xl mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-syne font-bold text-admin-text text-lg">
                {isNew ? 'Nouveau workflow' : 'Modifier le workflow'}
              </h2>
              <button onClick={closeEdit} className="text-admin-muted hover:text-admin-text transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-dm text-xs text-admin-muted mb-1.5">Titre *</label>
                <input
                  type="text"
                  value={editTarget.title || ''}
                  onChange={(e) => setEditTarget((p) => p ? ({ ...p, title: e.target.value }) : p)}
                  className="w-full bg-admin-bg border border-admin-border rounded-lg px-3 py-2 text-admin-text font-dm text-sm focus:border-accent focus:outline-none"
                  placeholder="Relance automatique prospects"
                />
              </div>

              <div>
                <label className="block font-dm text-xs text-admin-muted mb-1.5">Description</label>
                <textarea
                  value={editTarget.description || ''}
                  onChange={(e) => setEditTarget((p) => p ? ({ ...p, description: e.target.value }) : p)}
                  rows={3}
                  className="w-full bg-admin-bg border border-admin-border rounded-lg px-3 py-2 text-admin-text font-dm text-sm focus:border-accent focus:outline-none resize-none"
                  placeholder="Ce que ce workflow automatise concrètement..."
                />
              </div>

              <div>
                <label className="block font-dm text-xs text-admin-muted mb-1.5">Tags (outils)</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput) } }}
                    placeholder="n8n, Gmail, Python..."
                    className="flex-1 bg-admin-bg border border-admin-border rounded-lg px-3 py-2 font-dm text-sm text-admin-text focus:border-accent focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => addTag(tagInput)}
                    className="px-3 py-2 rounded-lg bg-accent/15 text-accent text-sm font-dm hover:bg-accent/25 transition-colors"
                  >
                    +
                  </button>
                </div>
                {(editTarget.tags || []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {(editTarget.tags || []).map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded bg-admin-bg border border-admin-border text-admin-muted">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-danger">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editTarget.visible !== false}
                    onChange={(e) => setEditTarget((p) => p ? ({ ...p, visible: e.target.checked }) : p)}
                    className="w-4 h-4 rounded border-admin-border bg-admin-bg accent-accent"
                  />
                  <span className="font-dm text-sm text-admin-text">Visible sur le site</span>
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
        title="Supprimer le workflow"
        message={`Êtes-vous sûr de vouloir supprimer "${deleteTarget?.title}" ?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
