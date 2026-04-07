'use client'

import { useState, useEffect, useCallback } from 'react'
import { ExternalLink } from 'lucide-react'
import type { Candidate } from '@/lib/db-parse'
import { toast } from '@/components/admin/Toast'

const columns: { status: string; label: string; color: string }[] = [
  { status: 'recu',     label: '📥 Reçu',      color: 'border-admin-border' },
  { status: 'contacte', label: '✉️ Contacté',   color: 'border-accent/40' },
  { status: 'qualifie', label: '✅ Qualifié',   color: 'border-blue-400/40' },
  { status: 'rdv',      label: '📞 RDV',        color: 'border-warning/40' },
  { status: 'gagne',    label: '🏆 Gagné',      color: 'border-success/40' },
  { status: 'perdu',    label: '❌ Perdu',      color: 'border-danger/40' },
]

const fitColors: Record<string, string> = {
  A: 'text-success bg-success/10 border-success/30',
  B: 'text-accent bg-accent/10 border-accent/20',
  C: 'text-warning bg-warning/10 border-warning/30',
  D: 'text-admin-muted bg-admin-surface border-admin-border',
}

const fits = ['all', 'A', 'B', 'C', 'D']

export default function CRMPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [fitFilter, setFitFilter] = useState('all')
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)

  const fetchCandidates = useCallback(async () => {
    setLoading(true)
    try {
      const params = fitFilter !== 'all' ? `?fit=${fitFilter}` : ''
      const res = await fetch(`/api/admin/candidates${params}`)
      setCandidates(await res.json())
    } catch { toast.error('Erreur chargement') }
    finally { setLoading(false) }
  }, [fitFilter])

  useEffect(() => { fetchCandidates() }, [fetchCandidates])

  const handleDrop = async (targetStatus: string) => {
    if (!dragging || dragOver === null) return
    const candidate = candidates.find((c) => c.id === dragging)
    if (!candidate || candidate.status === targetStatus) return

    // Optimistic update
    setCandidates((prev) => prev.map((c) => c.id === dragging ? { ...c, status: targetStatus as Candidate['status'] } : c))

    try {
      await fetch(`/api/admin/candidates/${dragging}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetStatus }),
      })
      if (targetStatus === 'gagne') {
        toast.success(`🏆 ${candidate.name} — deal gagné ! Paiement créé.`)
      }
    } catch {
      toast.error('Erreur lors du déplacement')
      fetchCandidates()
    }
    setDragging(null)
    setDragOver(null)
  }

  const byStatus = (status: string) =>
    candidates.filter((c) => c.status === status)

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div className="space-y-5 h-full flex flex-col">
      <div className="flex items-center justify-between gap-4 flex-wrap flex-shrink-0">
        <h2 className="font-syne font-bold text-admin-text text-xl">Pipeline CRM</h2>
        <div className="flex gap-1 p-1 bg-admin-bg border border-admin-border rounded-xl">
          {fits.map((f) => (
            <button key={f} onClick={() => setFitFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-dm transition-all ${fitFilter === f ? 'bg-admin-surface text-admin-text font-medium' : 'text-admin-muted hover:text-admin-text'}`}>
              {f === 'all' ? 'Tous' : `Fit ${f}`}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 flex-1 min-h-0">
        {columns.map((col) => {
          const cards = byStatus(col.status)
          const isOver = dragOver === col.status
          return (
            <div
              key={col.status}
              className={`flex-shrink-0 w-56 flex flex-col rounded-xl border transition-all ${col.color} ${isOver ? 'bg-accent/5 border-accent' : 'bg-admin-surface'}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(col.status) }}
              onDragLeave={() => setDragOver(null)}
              onDrop={() => handleDrop(col.status)}
            >
              {/* Column header */}
              <div className="px-3 py-2.5 border-b border-admin-border flex-shrink-0">
                <p className="font-dm text-xs font-medium text-admin-text">{col.label}</p>
                <p className="font-mono text-[10px] text-admin-muted mt-0.5">{cards.length} prospect{cards.length !== 1 ? 's' : ''}</p>
              </div>

              {/* Cards */}
              <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[60px]">
                {cards.map((c) => (
                  <div
                    key={c.id}
                    draggable
                    onDragStart={() => setDragging(c.id)}
                    onDragEnd={() => { setDragging(null); setDragOver(null) }}
                    className={`bg-admin-bg border border-admin-border rounded-lg p-3 cursor-grab active:cursor-grabbing transition-all hover:border-accent ${dragging === c.id ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-1.5">
                      {c.fit_grade && (
                        <span className={`font-mono text-[9px] px-1 py-0.5 rounded border flex-shrink-0 ${fitColors[c.fit_grade]}`}>
                          {c.fit_grade}
                        </span>
                      )}
                      {c.linkedin_url && (
                        <a href={c.linkedin_url} target="_blank" rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-admin-muted hover:text-accent ml-auto flex-shrink-0"
                        >
                          <ExternalLink size={10} aria-hidden="true" />
                        </a>
                      )}
                    </div>
                    <p className="font-dm text-xs font-medium text-admin-text leading-tight">{c.name}</p>
                    {c.headline && (
                      <p className="font-mono text-[9px] text-admin-muted mt-1 line-clamp-2">{c.headline}</p>
                    )}
                    {c.ai_score !== null && (
                      <p className={`font-mono text-[9px] mt-1 font-bold ${c.ai_score >= 75 ? 'text-success' : c.ai_score >= 55 ? 'text-warning' : 'text-admin-muted'}`}>
                        IA: {c.ai_score}
                      </p>
                    )}
                  </div>
                ))}
                {cards.length === 0 && isOver && (
                  <div className="h-16 border-2 border-dashed border-accent/40 rounded-lg flex items-center justify-center">
                    <p className="font-mono text-[10px] text-accent">Déposer ici</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
