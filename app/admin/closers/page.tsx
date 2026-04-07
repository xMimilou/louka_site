'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { Closer, Task } from '@/lib/db-parse'
import ConfirmModal from '@/components/admin/ConfirmModal'
import { toast } from '@/components/admin/Toast'

export default function ClosersPage() {
  const [closers, setClosers] = useState<Closer[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newTask, setNewTask] = useState('')

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const [closersRes, tasksRes] = await Promise.all([
      fetch('/api/admin/closers'),
      fetch('/api/admin/tasks'),
    ])
    setClosers(await closersRes.json())
    setTasks(await tasksRes.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleAddCloser = async () => {
    if (!newName.trim()) { toast.error('Nom requis'); return }
    await fetch('/api/admin/closers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, email: newEmail }),
    })
    toast.success('Closer ajouté')
    setNewName(''); setNewEmail('')
    fetchAll()
  }

  const handleDeleteCloser = async () => {
    if (!deleteTarget) return
    await fetch(`/api/admin/closers/${deleteTarget}`, { method: 'DELETE' })
    toast.success('Closer supprimé')
    setDeleteTarget(null)
    fetchAll()
  }

  const handleAddTask = async () => {
    if (!newTask.trim()) return
    await fetch('/api/admin/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTask }),
    })
    setNewTask('')
    fetchAll()
  }

  const handleToggleTask = async (task: Task) => {
    await fetch(`/api/admin/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: !task.done }),
    })
    fetchAll()
  }

  const handleDeleteTask = async (id: string) => {
    await fetch(`/api/admin/tasks/${id}`, { method: 'DELETE' })
    fetchAll()
  }

  if (loading) return <div className="flex items-center justify-center h-48"><div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-8 max-w-[900px]">
      {/* Closers */}
      <div className="space-y-4">
        <h2 className="font-syne font-bold text-admin-text text-xl">Closers</h2>
        <div className="flex gap-3 flex-wrap">
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nom *"
            className="flex-1 min-w-[140px] bg-admin-bg border border-admin-border rounded-lg px-3 py-2 text-admin-text font-dm text-sm focus:border-accent focus:outline-none" />
          <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Email"
            className="flex-1 min-w-[180px] bg-admin-bg border border-admin-border rounded-lg px-3 py-2 text-admin-text font-dm text-sm focus:border-accent focus:outline-none" />
          <button onClick={handleAddCloser} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-admin-bg text-sm font-dm font-medium shadow-glow">
            <Plus size={14} /> Ajouter
          </button>
        </div>

        <div className="rounded-xl border border-admin-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-admin-border" style={{ background: '#161B27' }}>
                <th className="px-4 py-3 text-left font-dm text-xs text-admin-muted uppercase">Nom</th>
                <th className="px-4 py-3 text-left font-dm text-xs text-admin-muted uppercase">Email</th>
                <th className="px-4 py-3 text-right font-dm text-xs text-admin-muted uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {closers.map((cl) => (
                <tr key={cl.id} className="hover:bg-admin-surface">
                  <td className="px-4 py-3 font-dm text-sm text-admin-text">{cl.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-admin-muted">{cl.email ?? '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setDeleteTarget(cl.id)} className="p-1.5 rounded-lg text-admin-muted hover:text-danger transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {closers.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-6 text-center font-dm text-sm text-admin-muted">Aucun closer.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tasks */}
      <div className="space-y-4">
        <h2 className="font-syne font-bold text-admin-text text-xl">Tâches ouvertes</h2>
        <div className="flex gap-3">
          <input value={newTask} onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddTask() }}
            placeholder="Ajouter une tâche..."
            className="flex-1 bg-admin-bg border border-admin-border rounded-lg px-3 py-2 text-admin-text font-dm text-sm focus:border-accent focus:outline-none" />
          <button onClick={handleAddTask} className="px-4 py-2 rounded-lg bg-accent text-admin-bg text-sm font-dm font-medium shadow-glow">
            <Plus size={14} />
          </button>
        </div>
        <div className="space-y-2">
          {tasks.map((t) => (
            <div key={t.id} className="flex items-center gap-3 bg-admin-surface border border-admin-border rounded-xl px-4 py-3">
              <input type="checkbox" checked={t.done} onChange={() => handleToggleTask(t)}
                className="w-4 h-4 rounded border-admin-border bg-admin-bg accent-accent cursor-pointer flex-shrink-0" />
              <p className={`font-dm text-sm flex-1 ${t.done ? 'line-through text-admin-muted' : 'text-admin-text'}`}>{t.title}</p>
              {t.candidate_name && <span className="font-mono text-[10px] text-admin-muted px-2 py-0.5 rounded bg-admin-bg border border-admin-border">{t.candidate_name}</span>}
              {t.due_date && <span className="font-mono text-[10px] text-admin-muted">{new Date(t.due_date).toLocaleDateString('fr-FR')}</span>}
              <button onClick={() => handleDeleteTask(t.id)} className="p-1 text-admin-muted hover:text-danger flex-shrink-0">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
          {tasks.length === 0 && <p className="font-dm text-sm text-admin-muted text-center py-6">Aucune tâche ouverte. 🎉</p>}
        </div>
      </div>

      <ConfirmModal isOpen={!!deleteTarget} title="Supprimer le closer" message="Supprimer ce closer ?"
        onConfirm={handleDeleteCloser} onCancel={() => setDeleteTarget(null)} />
    </div>
  )
}
