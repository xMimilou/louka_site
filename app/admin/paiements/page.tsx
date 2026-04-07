'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Payment } from '@/lib/db-parse'
import { toast } from '@/components/admin/Toast'

function formatEuros(cents: number) {
  return (cents / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
}
function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function PaiementsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/payments')
    setPayments(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchPayments() }, [fetchPayments])

  const handleMarkPaid = async (id: string) => {
    await fetch(`/api/admin/payments/${id}`, { method: 'PUT' })
    toast.success('Paiement marqué comme payé ✅')
    fetchPayments()
  }

  const totalPaid = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0)
  const totalPending = payments.filter((p) => p.status === 'pending').reduce((s, p) => s + p.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-syne font-bold text-admin-text text-xl">Paiements</h2>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 max-w-[500px]">
        <div className="bg-admin-surface border border-success/30 rounded-xl p-4">
          <p className="font-dm text-xs text-admin-muted mb-1">Encaissé</p>
          <p className="font-syne font-bold text-success text-xl">{formatEuros(totalPaid)}</p>
        </div>
        <div className="bg-admin-surface border border-admin-border rounded-xl p-4">
          <p className="font-dm text-xs text-admin-muted mb-1">En attente</p>
          <p className="font-syne font-bold text-warning text-xl">{formatEuros(totalPending)}</p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-admin-border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><div className="inline-block w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-admin-border" style={{ background: '#161B27' }}>
                <th className="px-4 py-3 text-left font-dm text-xs text-admin-muted uppercase">Client</th>
                <th className="px-4 py-3 text-left font-dm text-xs text-admin-muted uppercase">Montant</th>
                <th className="px-4 py-3 text-left font-dm text-xs text-admin-muted uppercase">Statut</th>
                <th className="px-4 py-3 text-left font-dm text-xs text-admin-muted uppercase hidden md:table-cell">Date</th>
                <th className="px-4 py-3 text-right font-dm text-xs text-admin-muted uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-admin-surface">
                  <td className="px-4 py-3 font-dm text-sm text-admin-text">{p.candidate_name ?? '—'}</td>
                  <td className="px-4 py-3 font-mono text-sm text-admin-text font-bold">{formatEuros(p.amount)}</td>
                  <td className="px-4 py-3">
                    <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full border ${p.status === 'paid' ? 'text-success bg-success/10 border-success/30' : 'text-warning bg-warning/10 border-warning/30'}`}>
                      {p.status === 'paid' ? 'Payé' : 'En attente'}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell font-dm text-xs text-admin-muted">{formatDate(p.paid_at || p.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    {p.status === 'pending' && (
                      <button onClick={() => handleMarkPaid(p.id)}
                        className="px-3 py-1.5 rounded-lg bg-success/15 text-success text-xs font-dm font-medium hover:bg-success/25 transition-colors border border-success/30">
                        Marquer payé
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center font-dm text-admin-muted text-sm">Aucun paiement.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
