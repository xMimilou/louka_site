'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError('Email ou mot de passe incorrect.')
        setLoading(false)
        return
      }

      router.push('/admin/articles')
    } catch {
      setError('Une erreur est survenue. Réessaie.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-admin-bg flex items-center justify-center px-4">
        <div className="w-full max-w-[400px]">
          {/* Logo */}
          <div className="text-center mb-8">
            <span className="font-mono text-2xl font-medium text-accent">[L.M]</span>
            <p className="font-dm text-admin-muted text-sm mt-1">Espace Admin</p>
          </div>

          {/* Card */}
          <div className="bg-admin-surface border border-admin-border rounded-2xl p-8">
            <h1 className="font-syne font-bold text-admin-text text-xl mb-6">Se connecter</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block font-dm text-xs text-admin-muted mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@louka-millon.fr"
                  className="w-full bg-admin-bg border border-admin-border rounded-lg px-3 py-2.5 text-admin-text font-dm text-sm placeholder-admin-muted focus:border-accent focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label htmlFor="password" className="block font-dm text-xs text-admin-muted mb-1.5">
                  Mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-admin-bg border border-admin-border rounded-lg px-3 py-2.5 text-admin-text font-dm text-sm placeholder-admin-muted focus:border-accent focus:outline-none transition-colors"
                />
              </div>

              {error && (
                <div className="bg-danger/10 border border-danger/30 rounded-lg px-4 py-3">
                  <p className="font-dm text-sm text-danger">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-accent text-admin-bg font-dm font-medium text-sm shadow-glow hover:shadow-glow-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loading ? 'Connexion...' : 'Se connecter →'}
              </button>
            </form>
          </div>

          <p className="text-center font-dm text-xs text-admin-muted mt-6">
            Accès réservé — Louka Millon
          </p>
        </div>
      </div>
  )
}
