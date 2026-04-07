'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { Tweet } from '@/lib/db-parse'
import { toast } from '@/components/admin/Toast'

export default function TweetsPage() {
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')

  const fetchTweets = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/tweets')
    setTweets(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchTweets() }, [fetchTweets])

  const handleAdd = async () => {
    if (!content.trim()) { toast.error('Contenu requis'); return }
    await fetch('/api/admin/tweets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, scheduled_at: scheduledAt || null }),
    })
    setContent(''); setScheduledAt('')
    fetchTweets()
  }

  const handlePublish = async (t: Tweet) => {
    await fetch(`/api/admin/tweets/${t.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: true }),
    })
    toast.success('Tweet marqué comme publié')
    fetchTweets()
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/tweets/${id}`, { method: 'DELETE' })
    fetchTweets()
  }

  const published = tweets.filter((t) => t.published)
  const scheduled = tweets.filter((t) => !t.published && t.scheduled_at)
  const drafts = tweets.filter((t) => !t.published && !t.scheduled_at)

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  function TweetCard({ tweet }: { tweet: Tweet }) {
    return (
      <div className="bg-admin-surface border border-admin-border rounded-xl p-4 space-y-2">
        <p className="font-dm text-sm text-admin-text whitespace-pre-wrap">{tweet.content}</p>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex gap-3">
            {tweet.published && (
              <span className="font-mono text-[10px] text-admin-muted">❤ {tweet.likes} · 👁 {tweet.impressions}</span>
            )}
            {tweet.scheduled_at && !tweet.published && (
              <span className="font-mono text-[10px] text-warning">📅 {formatDate(tweet.scheduled_at)}</span>
            )}
            {!tweet.published && !tweet.scheduled_at && (
              <span className="font-mono text-[10px] text-admin-muted">Brouillon</span>
            )}
          </div>
          <div className="flex gap-2">
            {!tweet.published && (
              <button onClick={() => handlePublish(tweet)}
                className="px-3 py-1 rounded-lg bg-accent/15 text-accent text-xs font-dm border border-accent/30 hover:bg-accent/25 transition-colors">
                Publié ✓
              </button>
            )}
            <button onClick={() => handleDelete(tweet.id)} className="p-1 text-admin-muted hover:text-danger">
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-[800px]">
      <h2 className="font-syne font-bold text-admin-text text-xl">Tweets</h2>

      {/* Compose */}
      <div className="bg-admin-surface border border-admin-border rounded-xl p-4 space-y-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Rédiger un tweet..."
          rows={3}
          maxLength={280}
          className="w-full bg-admin-bg border border-admin-border rounded-lg px-3 py-2.5 text-admin-text font-dm text-sm placeholder-admin-muted focus:border-accent focus:outline-none resize-none"
        />
        <div className="flex items-center gap-3 flex-wrap">
          <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)}
            className="bg-admin-bg border border-admin-border rounded-lg px-3 py-1.5 text-admin-text font-dm text-xs focus:border-accent focus:outline-none" />
          <span className="font-mono text-xs text-admin-muted ml-auto">{content.length}/280</span>
          <button onClick={handleAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-admin-bg text-sm font-dm font-medium shadow-glow">
            <Plus size={14} /> Ajouter
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32"><div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <>
          {scheduled.length > 0 && (
            <div className="space-y-3">
              <p className="font-mono text-xs text-warning uppercase tracking-wider">Planifiés ({scheduled.length})</p>
              {scheduled.map((t) => <TweetCard key={t.id} tweet={t} />)}
            </div>
          )}
          {drafts.length > 0 && (
            <div className="space-y-3">
              <p className="font-mono text-xs text-admin-muted uppercase tracking-wider">Brouillons ({drafts.length})</p>
              {drafts.map((t) => <TweetCard key={t.id} tweet={t} />)}
            </div>
          )}
          {published.length > 0 && (
            <div className="space-y-3">
              <p className="font-mono text-xs text-success uppercase tracking-wider">Publiés ({published.length})</p>
              {published.map((t) => <TweetCard key={t.id} tweet={t} />)}
            </div>
          )}
          {tweets.length === 0 && <p className="font-dm text-sm text-admin-muted text-center py-8">Aucun tweet.</p>}
        </>
      )}
    </div>
  )
}
