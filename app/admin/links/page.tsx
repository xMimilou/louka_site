'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Save, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import type { PlatformLink } from '@/lib/types'
import ConfirmModal from '@/components/admin/ConfirmModal'
import { toast } from '@/components/admin/Toast'

const iconOptions = ['malt', 'comeup', 'linkedin', 'github', 'email', 'twitter', 'youtube', 'discord', 'telegram', 'other']

const defaultLinks: Omit<PlatformLink, 'id'>[] = [
  { platform: 'Malt', label: 'Mon profil freelance', url: '#', icon: 'malt', visible: true, sort_order: 1 },
  { platform: 'Comeup', label: 'Mes services packagés', url: '#', icon: 'comeup', visible: true, sort_order: 2 },
  { platform: 'LinkedIn', label: 'Me suivre sur LinkedIn', url: '#', icon: 'linkedin', visible: true, sort_order: 3 },
  { platform: 'GitHub', label: 'Mes projets open source', url: '#', icon: 'github', visible: true, sort_order: 4 },
  { platform: 'Email', label: 'hello@loukamillon.com', url: 'mailto:hello@loukamillon.com', icon: 'email', visible: true, sort_order: 5 },
]

export default function LinksPage() {
  const [links, setLinks] = useState<Array<Partial<PlatformLink> & { _new?: boolean; _key: string }>>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const fetchLinks = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('platform_links')
        .select('*')
        .order('sort_order')
      if (error) throw error
      if (data && data.length > 0) {
        setLinks(data.map((l) => ({ ...l, _key: l.id })))
      } else {
        setLinks(defaultLinks.map((l, i) => ({ ...l, _new: true, _key: `new-${i}` })))
      }
    } catch {
      setLinks(defaultLinks.map((l, i) => ({ ...l, _new: true, _key: `new-${i}` })))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchLinks() }, [fetchLinks])

  const handleUpdate = (key: string, field: keyof PlatformLink, value: string | boolean | number) => {
    setLinks((prev) => prev.map((l) => l._key === key ? { ...l, [field]: value } : l))
  }

  const handleAddRow = () => {
    const newKey = `new-${Date.now()}`
    setLinks((prev) => [
      ...prev,
      {
        platform: '',
        label: '',
        url: '',
        icon: 'other',
        visible: true,
        sort_order: prev.length + 1,
        _new: true,
        _key: newKey,
      },
    ])
  }

  const handleDeleteRow = (key: string) => {
    const link = links.find((l) => l._key === key)
    if (link?._new) {
      setLinks((prev) => prev.filter((l) => l._key !== key))
    } else {
      setDeleteTarget(key)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    const link = links.find((l) => l._key === deleteTarget)
    if (!link?.id) return
    try {
      const supabase = createClient()
      const { error } = await supabase.from('platform_links').delete().eq('id', link.id)
      if (error) throw error
      toast.success('Lien supprimé')
      setDeleteTarget(null)
      setLinks((prev) => prev.filter((l) => l._key !== deleteTarget))
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleSaveAll = async () => {
    setSaving(true)
    try {
      const supabase = createClient()
      const toUpsert = links
        .filter((l) => l.platform?.trim())
        .map((l, i) => ({
          id: l._new ? undefined : l.id,
          platform: l.platform || '',
          label: l.label || '',
          url: l.url || '',
          icon: l.icon || 'other',
          visible: l.visible !== false,
          sort_order: i + 1,
        }))

      for (const item of toUpsert) {
        if (item.id) {
          await supabase.from('platform_links').update(item).eq('id', item.id)
        } else {
          const { id: _removed, ...insertData } = item as typeof item & { id?: string }
          await supabase.from('platform_links').insert(insertData)
        }
      }

      toast.success('Modifications sauvegardées !')
      fetchLinks()
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-syne font-bold text-admin-text text-xl">Liens & Plateformes</h2>
        <div className="flex gap-3">
          <button
            onClick={handleAddRow}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-admin-border text-admin-text text-sm font-dm hover:border-accent transition-all"
          >
            <Plus size={14} aria-hidden="true" />
            Ajouter
          </button>
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-admin-bg text-sm font-dm font-medium shadow-glow hover:shadow-glow-lg transition-all disabled:opacity-60"
          >
            <Save size={14} aria-hidden="true" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-admin-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-admin-border" style={{ background: '#161B27' }}>
              <th className="px-4 py-3 text-left font-dm text-xs text-admin-muted uppercase tracking-wider">Plateforme</th>
              <th className="px-4 py-3 text-left font-dm text-xs text-admin-muted uppercase tracking-wider">Label</th>
              <th className="px-4 py-3 text-left font-dm text-xs text-admin-muted uppercase tracking-wider">URL</th>
              <th className="px-4 py-3 text-left font-dm text-xs text-admin-muted uppercase tracking-wider w-24">Icône</th>
              <th className="px-4 py-3 text-center font-dm text-xs text-admin-muted uppercase tracking-wider w-20">Visible</th>
              <th className="px-4 py-3 text-right font-dm text-xs text-admin-muted uppercase tracking-wider w-16">Sup.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border">
            {links.map((link) => (
              <tr key={link._key} className="hover:bg-admin-surface transition-colors">
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={link.platform || ''}
                    onChange={(e) => handleUpdate(link._key, 'platform', e.target.value)}
                    placeholder="Malt"
                    className="w-full bg-transparent border-b border-transparent hover:border-admin-border focus:border-accent font-mono text-sm text-admin-text outline-none transition-colors py-0.5"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={link.label || ''}
                    onChange={(e) => handleUpdate(link._key, 'label', e.target.value)}
                    placeholder="Mon profil freelance"
                    className="w-full bg-transparent border-b border-transparent hover:border-admin-border focus:border-accent font-dm text-sm text-admin-text outline-none transition-colors py-0.5"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={link.url || ''}
                    onChange={(e) => handleUpdate(link._key, 'url', e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-transparent border-b border-transparent hover:border-admin-border focus:border-accent font-mono text-xs text-admin-muted outline-none transition-colors py-0.5"
                  />
                </td>
                <td className="px-4 py-3">
                  <select
                    value={link.icon || 'other'}
                    onChange={(e) => handleUpdate(link._key, 'icon', e.target.value)}
                    className="w-full bg-admin-bg border border-admin-border rounded-lg px-2 py-1 font-mono text-xs text-admin-text focus:border-accent focus:outline-none"
                  >
                    {iconOptions.map((icon) => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={link.visible !== false}
                    onChange={(e) => handleUpdate(link._key, 'visible', e.target.checked)}
                    className="w-4 h-4 rounded border-admin-border bg-admin-bg accent-accent cursor-pointer"
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDeleteRow(link._key)}
                    className="p-1.5 rounded-lg text-admin-muted hover:text-danger transition-colors"
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="font-dm text-xs text-admin-muted">
        Cliquez sur une cellule pour la modifier. Cliquez sur &ldquo;Sauvegarder les modifications&rdquo; pour enregistrer.
      </p>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Supprimer le lien"
        message="Êtes-vous sûr de vouloir supprimer ce lien ?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
