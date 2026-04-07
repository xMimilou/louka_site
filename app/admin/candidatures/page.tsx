'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Trash2, ExternalLink } from 'lucide-react'
import type { Candidate } from '@/lib/db-parse'
import ConfirmModal from '@/components/admin/ConfirmModal'
import { toast } from '@/components/admin/Toast'

const statusLabels: Record<string, string> = {
  recu: 'Reçu', contacte: 'Contacté', qualifie: 'Qualifié',
  rdv: 'RDV', gagne: 'Gagné', perdu: 'Perdu',
}
const statusColors: Record<string, string> = {
  recu: 'text-admin-muted bg-admin-surface border-admin-border',
  contacte: 'text-accent bg-accent/10 border-accent/20',
  qualifie: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  rdv: 'text-warning bg-warning/10 border-warning/30',
  gagne: 'text-success bg-success/10 border-success/30',
  perdu: 'text-danger bg-danger/10 border-danger/30',
}
const fitColors: Record<string, string> = {
  A: 'text-success bg-success/10 border-success/30',
  B: 'text-accent bg-accent/10 border-accent/20',
  C: 'text-warning bg-warning/10 border-warning/30',
  D: 'text-admin-muted bg-admin-surface border-admin-border',
}
const statuses = ['all', 'recu', 'contacte', 'qualifie', 'rdv', 'gagne', 'perdu']
const fits = ['all', 'A', 'B', 'C', 'D']

function scoreAI(c: Candidate): { score: number; verdict: string } {
  let score = 40
  const text = `${c.headline ?? ''} ${c.notes ?? ''} ${c.keyword ?? ''}`.toLowerCase()
  if (/scaler|systeme|automatis|scale/.test(text)) score += 20
  if (/agence|coach|freelance|consultant|fondateur/.test(text)) score += 15
  if (/budget|€|revenue|growth|senior/.test(text)) score += 15
  if (c.fit_grade === 'A') score += 15
  else if (c.fit_grade === 'B') score += 5
  else if (c.fit_grade === 'D') score -= 30
  if (/junior|étudiant|salarié/.test(text)) score -= 25
  score = Math.max(0, Math.min(100, score))
  const verdict = score >= 75 ? 'A — Qualifiable' : score >= 55 ? 'B — À confirmer' : score >= 35 ? 'C — À qualifier' : 'D — Hors cible'
  return { score, verdict }
}

export default function CandidaturesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [fitFilter, setFitFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Candidate | null>(null)
  const [editNotes, setEditNotes] = useState<Record<string, string>>({})
  const [addOpen, setAddOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newLinkedIn, setNewLinkedIn] = useState('')

  const fetchCandidates = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.set('status', filter)
      if (fitFilter !== 'all') params.set('fit', fitFilter)
      if (search) params.set('q', search)
      const res = await fetch(`/api/admin/candidates?${params}`)
      setCandidates(await res.json())
    } catch { toast.error('Erreur chargement') }
    finally { setLoading(false) }
  }, [filter, fitFilter, search])

  useEffect(() => { fetchCandidates() }, [fetchCandidates])

  const handleStatusChange = async (c: Candidate, status: string) => {
    await fetch(`/api/admin/candidates/${c.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    toast.success(`${c.name} → ${statusLabels[status]}`)
    fetchCandidates()
  }

  const handleFitChange = async (c: Candidate, fit: string) => {
    await fetch(`/api/admin/candidates/${c.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...c, fit_grade: fit }),
    })
    fetchCandidates()
  }

  const handleSaveNotes = async (c: Candidate) => {
    await fetch(`/api/admin/candidates/${c.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...c, notes: editNotes[c.id] }),
    })
    toast.success('Notes sauvegardées')
    setEditNotes((prev) => { const n = { ...prev }; delete n[c.id]; return n })
    fetchCandidates()
  }

  const handleScoreAI = async (c: Candidate) => {
    const { score, verdict } = scoreAI(c)
    await fetch(`/api/admin/candidates/${c.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...c, ai_score: score, ai_verdict: verdict }),
    })
    toast.success(`Score IA : ${score} — ${verdict}`)
    fetchCandidates()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await fetch(`/api/admin/candidates/${deleteTarget.id}`, { method: 'DELETE' })
    toast.success('Prospect supprimé')
    setDeleteTarget(null)
    fetchCandidates()
  }

  const handleAdd = async () => {
    if (!newName.trim()) { toast.error('Nom requis'); return }
    await fetch('/api/admin/candidates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, linkedin_url: newLinkedIn || null }),
    })
    toast.success('Prospect ajouté')
    setNewName(''); setNewLinkedIn(''); setAddOpen(false)
    fetchCandidates()
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <h2 className="font-syne font-bold text-admin-text text-xl">Prospects</h2>
          <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">{candidates.length}</span>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-admin-bg text-sm font-dm font-medium shadow-glow hover:shadow-glow-lg transition-all"
        >
          <Plus size={16} /> Ajouter
        </button>
      </div>

      {/* Add form */}
      {addOpen && (
        <div className="bg-admin-surface border border-admin-border rounded-xl p-4 flex gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Nom *"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 min-w-[160px] bg-admin-bg border border-admin-border rounded-lg px-3 py-2 text-admin-text font-dm text-sm focus:border-accent focus:outline-none"
          />
          <input
            type="text"
            placeholder="URL LinkedIn"
            value={newLinkedIn}
            onChange={(e) => setNewLinkedIn(e.target.value)}
            className="flex-1 min-w-[200px] bg-admin-bg border border-admin-border rounded-lg px-3 py-2 text-admin-text font-dm text-sm focus:border-accent focus:outline-none"
          />
          <button onClick={handleAdd} className="px-4 py-2 rounded-lg bg-accent text-admin-bg text-sm font-dm font-medium">Ajouter</button>
          <button onClick={() => setAddOpen(false)} className="px-4 py-2 rounded-lg border border-admin-border text-admin-muted text-sm font-dm">Annuler</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="flex gap-1 p-1 bg-admin-bg border border-admin-border rounded-xl">
          {statuses.map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-dm transition-all ${filter === s ? 'bg-admin-surface text-admin-text font-medium' : 'text-admin-muted hover:text-admin-text'}`}>
              {s === 'all' ? 'Tous' : statusLabels[s]}
            </button>
          ))}
        </div>
        <div className="flex gap-1 p-1 bg-admin-bg border border-admin-border rounded-xl">
          {fits.map((f) => (
            <button key={f} onClick={() => setFitFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-dm transition-all ${fitFilter === f ? 'bg-admin-surface text-admin-text font-medium' : 'text-admin-muted hover:text-admin-text'}`}>
              {f === 'all' ? 'Fit' : `Fit ${f}`}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-muted" />
          <input
            type="search"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-4 py-1.5 bg-admin-bg border border-admin-border rounded-lg text-sm font-dm text-admin-text placeholder-admin-muted focus:border-accent focus:outline-none w-48"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-admin-border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><div className="inline-block w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
        ) : candidates.length === 0 ? (
          <div className="p-12 text-center"><p className="font-dm text-admin-muted">Aucun prospect.</p></div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-admin-border" style={{ background: '#161B27' }}>
                <th className="px-4 py-3 text-left font-dm text-xs text-admin-muted uppercase">Fit</th>
                <th className="px-4 py-3 text-left font-dm text-xs text-admin-muted uppercase">Nom</th>
                <th className="px-4 py-3 text-left font-dm text-xs text-admin-muted uppercase hidden lg:table-cell">Headline</th>
                <th className="px-4 py-3 text-left font-dm text-xs text-admin-muted uppercase">Statut</th>
                <th className="px-4 py-3 text-left font-dm text-xs text-admin-muted uppercase hidden xl:table-cell">Score IA</th>
                <th className="px-4 py-3 text-left font-dm text-xs text-admin-muted uppercase hidden 2xl:table-cell">Notes</th>
                <th className="px-4 py-3 text-right font-dm text-xs text-admin-muted uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {candidates.map((c) => (
                <tr key={c.id} className="hover:bg-admin-surface transition-colors">
                  {/* Fit */}
                  <td className="px-4 py-3">
                    <select
                      value={c.fit_grade ?? ''}
                      onChange={(e) => handleFitChange(c, e.target.value)}
                      className={`font-mono text-[10px] px-1.5 py-0.5 rounded border bg-transparent cursor-pointer focus:outline-none ${c.fit_grade ? fitColors[c.fit_grade] : 'text-admin-muted border-admin-border'}`}
                    >
                      <option value="">—</option>
                      {['A', 'B', 'C', 'D'].map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </td>
                  {/* Name */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <p className="font-dm text-sm text-admin-text font-medium truncate max-w-[140px]">{c.name}</p>
                      {c.linkedin_url && (
                        <a href={c.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-admin-muted hover:text-accent flex-shrink-0">
                          <ExternalLink size={11} aria-hidden="true" />
                        </a>
                      )}
                    </div>
                    <p className="font-mono text-[10px] text-admin-muted">{c.source}</p>
                  </td>
                  {/* Headline */}
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <p className="font-dm text-xs text-admin-muted truncate max-w-[200px]">{c.headline ?? '—'}</p>
                  </td>
                  {/* Status */}
                  <td className="px-4 py-3">
                    <select
                      value={c.status}
                      onChange={(e) => handleStatusChange(c, e.target.value)}
                      className={`font-mono text-[10px] px-2 py-0.5 rounded-full border cursor-pointer focus:outline-none bg-transparent ${statusColors[c.status]}`}
                    >
                      {Object.entries(statusLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </td>
                  {/* AI Score */}
                  <td className="px-4 py-3 hidden xl:table-cell">
                    {c.ai_score !== null ? (
                      <div>
                        <span className={`font-mono text-xs font-bold ${c.ai_score >= 75 ? 'text-success' : c.ai_score >= 55 ? 'text-warning' : 'text-admin-muted'}`}>
                          {c.ai_score}
                        </span>
                        <p className="font-dm text-[10px] text-admin-muted truncate max-w-[120px]">{c.ai_verdict}</p>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleScoreAI(c)}
                        className="font-mono text-[10px] px-2 py-0.5 rounded border border-admin-border text-admin-muted hover:border-accent hover:text-accent transition-colors"
                      >
                        Score IA
                      </button>
                    )}
                  </td>
                  {/* Notes */}
                  <td className="px-4 py-3 hidden 2xl:table-cell">
                    {editNotes[c.id] !== undefined ? (
                      <div className="flex gap-1">
                        <input
                          type="text"
                          value={editNotes[c.id]}
                          onChange={(e) => setEditNotes((prev) => ({ ...prev, [c.id]: e.target.value }))}
                          className="w-40 bg-admin-bg border border-accent rounded px-2 py-0.5 text-xs font-dm text-admin-text focus:outline-none"
                          onKeyDown={(e) => { if (e.key === 'Enter') handleSaveNotes(c) }}
                          autoFocus
                        />
                        <button onClick={() => handleSaveNotes(c)} className="text-accent text-xs font-mono">✓</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditNotes((prev) => ({ ...prev, [c.id]: c.notes ?? '' }))}
                        className="font-dm text-xs text-admin-muted hover:text-admin-text truncate max-w-[160px] text-left"
                      >
                        {c.notes ?? <span className="italic">Ajouter note…</span>}
                      </button>
                    )}
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setDeleteTarget(c)}
                        className="p-1.5 rounded-lg text-admin-muted hover:text-danger transition-colors"
                      >
                        <Trash2 size={13} aria-hidden="true" />
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
        title="Supprimer le prospect"
        message={`Supprimer "${deleteTarget?.name}" ?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        confirmLabel="Supprimer"
      />
    </div>
  )
}
