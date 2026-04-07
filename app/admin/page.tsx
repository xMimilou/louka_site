'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Users, TrendingUp, CreditCard, FileText } from 'lucide-react'

interface DashboardData {
  candidates: number
  fit_a: number
  fit_b: number
  won: number
  revenue_cents: number
  articles_published: number
  tweets_published: number
  payments_pending: number
  recent_candidates: { id: string; name: string; fit_grade: string; status: string; created_at: string }[]
  funnel: Record<string, number>
}

const OBJECTIF_CENTS = 200000 // 2000€

const funnelLabels: Record<string, string> = {
  recu: '📥 Reçu',
  contacte: '✉️ Contacté',
  qualifie: '✅ Qualifié',
  rdv: '📞 RDV',
  gagne: '🏆 Gagné',
  perdu: '❌ Perdu',
}

const funnelOrder = ['recu', 'contacte', 'qualifie', 'rdv', 'gagne', 'perdu']

const fitColors: Record<string, string> = {
  A: 'text-success bg-success/10 border-success/30',
  B: 'text-accent bg-accent/10 border-accent/20',
  C: 'text-warning bg-warning/10 border-warning/30',
  D: 'text-admin-muted bg-admin-surface border-admin-border',
}

function formatEuros(cents: number) {
  return (cents / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!data) return null

  const progressPct = Math.min(100, Math.round((data.revenue_cents / OBJECTIF_CENTS) * 100))

  const kpis = [
    { label: 'Prospects total', value: data.candidates, sub: `${data.fit_a} fit A · ${data.fit_b} fit B`, icon: Users, href: '/admin/candidatures' },
    { label: 'Deals gagnés', value: data.won, sub: `${data.payments_pending} paiement${data.payments_pending !== 1 ? 's' : ''} en attente`, icon: TrendingUp, href: '/admin/paiements' },
    { label: 'CA encaissé', value: formatEuros(data.revenue_cents), sub: `Objectif : 2 000 €/mois`, icon: CreditCard, href: '/admin/paiements' },
    { label: 'Articles publiés', value: data.articles_published, sub: `${data.tweets_published} tweet${data.tweets_published !== 1 ? 's' : ''} publiés`, icon: FileText, href: '/admin/articles' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-syne font-bold text-admin-text text-2xl">Dashboard</h1>
        <p className="font-dm text-admin-muted text-sm mt-1">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Objectif tracker */}
      <div className="bg-admin-surface border border-admin-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-mono text-xs text-admin-muted uppercase tracking-wider mb-1">Objectif avril</p>
            <p className="font-syne font-bold text-admin-text text-lg">{formatEuros(data.revenue_cents)} / 2 000 €</p>
          </div>
          <span className="font-mono text-2xl font-bold text-accent">{progressPct}%</span>
        </div>
        <div className="w-full bg-admin-bg rounded-full h-2">
          <div
            className="bg-accent h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Link
              key={kpi.label}
              href={kpi.href}
              className="bg-admin-surface border border-admin-border rounded-xl p-5 hover:border-accent transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <p className="font-dm text-xs text-admin-muted">{kpi.label}</p>
                <Icon size={14} className="text-admin-muted group-hover:text-accent transition-colors" aria-hidden="true" />
              </div>
              <p className="font-syne font-bold text-admin-text text-2xl mb-1">{kpi.value}</p>
              <p className="font-mono text-[10px] text-admin-muted">{kpi.sub}</p>
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Funnel */}
        <div className="bg-admin-surface border border-admin-border rounded-xl p-5">
          <h2 className="font-syne font-bold text-admin-text text-sm mb-4">Pipeline</h2>
          <div className="space-y-2">
            {funnelOrder.map((s) => {
              const n = data.funnel[s] ?? 0
              const max = Math.max(1, ...Object.values(data.funnel))
              return (
                <div key={s} className="flex items-center gap-3">
                  <span className="font-dm text-xs text-admin-muted w-28 flex-shrink-0">{funnelLabels[s]}</span>
                  <div className="flex-1 bg-admin-bg rounded-full h-1.5">
                    <div
                      className="bg-accent h-1.5 rounded-full transition-all"
                      style={{ width: `${(n / max) * 100}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs text-admin-muted w-6 text-right">{n}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent candidates */}
        <div className="bg-admin-surface border border-admin-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-syne font-bold text-admin-text text-sm">Derniers prospects</h2>
            <Link href="/admin/candidatures" className="font-dm text-xs text-accent hover:underline">Voir tout →</Link>
          </div>
          <div className="space-y-3">
            {data.recent_candidates.map((c) => (
              <div key={c.id} className="flex items-center gap-3">
                {c.fit_grade && (
                  <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded border flex-shrink-0 ${fitColors[c.fit_grade] ?? fitColors.D}`}>
                    {c.fit_grade}
                  </span>
                )}
                <span className="font-dm text-sm text-admin-text truncate flex-1">{c.name}</span>
                <span className="font-mono text-[10px] text-admin-muted flex-shrink-0">{formatDate(c.created_at)}</span>
              </div>
            ))}
            {data.recent_candidates.length === 0 && (
              <p className="font-dm text-sm text-admin-muted">Aucun prospect encore.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
