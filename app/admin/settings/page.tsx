'use client'

import { useState, useEffect, useCallback } from 'react'
import { Save } from 'lucide-react'
import { toast } from '@/components/admin/Toast'

interface SettingField {
  key: string
  label: string
  placeholder: string
  type?: 'text' | 'textarea' | 'email'
  rows?: number
}

interface SettingsSection {
  title: string
  fields: SettingField[]
}

const sections: SettingsSection[] = [
  {
    title: 'Identité',
    fields: [
      { key: 'site_name', label: 'Nom affiché', placeholder: 'Louka Millon' },
      {
        key: 'tagline',
        label: 'Tagline',
        placeholder: 'Je remplace les heures de travail manuel par des systèmes qui tournent seuls.',
        type: 'textarea',
        rows: 2,
      },
      {
        key: 'description',
        label: 'Description meta',
        placeholder: 'Ingénieur en automatisation & data. Screeners, bots de trading...',
        type: 'textarea',
        rows: 3,
      },
    ],
  },
  {
    title: 'Contact',
    fields: [
      { key: 'email', label: 'Email public', placeholder: 'hello@loukamillon.com', type: 'email' },
      {
        key: 'contact_text',
        label: 'Texte du formulaire de contact',
        placeholder: "Tu passes des heures sur des tâches que ton ordinateur pourrait faire à ta place ?",
        type: 'textarea',
        rows: 4,
      },
    ],
  },
  {
    title: 'Telegram',
    fields: [
      {
        key: 'telegram_bot_token',
        label: 'Bot Token',
        placeholder: '123456789:AABBccDDeeFFggHH...',
      },
      {
        key: 'telegram_channel_id',
        label: 'Channel ID (ou chat ID)',
        placeholder: '-1001234567890',
      },
    ],
  },
  {
    title: 'Intégrations',
    fields: [
      {
        key: 'anthropic_api_key',
        label: 'Anthropic API Key',
        placeholder: 'sk-ant-...',
      },
      {
        key: 'stripe_secret_key',
        label: 'Stripe Secret Key',
        placeholder: 'sk_live_...',
      },
    ],
  },
]

const defaultValues: Record<string, string> = {
  site_name: 'Louka Millon',
  tagline: 'Je remplace les heures de travail manuel par des systèmes qui tournent seuls.',
  description: 'Ingénieur en automatisation & data. Screeners, bots de trading, pipelines de données et workflows n8n.',
  email: 'hello@loukamillon.com',
  contact_text: "Tu passes des heures sur des tâches que ton ordinateur pourrait faire à ta place ? Décris-moi le problème — en 30 minutes on sait si je peux l'automatiser.",
}

export default function SettingsPage() {
  const [values, setValues] = useState<Record<string, string>>(defaultValues)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/settings')
      if (!res.ok) throw new Error()
      const data = await res.json()
      setValues({ ...defaultValues, ...data })
    } catch {
      // Use defaults
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchSettings() }, [fetchSettings])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) throw new Error()
      toast.success('Paramètres sauvegardés !')
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
    <div className="space-y-8 max-w-[700px]">
      {sections.map((section) => (
        <div key={section.title} className="bg-admin-surface border border-admin-border rounded-xl p-6 space-y-5">
          <h3 className="font-syne font-bold text-admin-text text-base border-b border-admin-border pb-3">
            {section.title}
          </h3>

          {section.fields.map((field) => (
            <div key={field.key}>
              <label
                htmlFor={field.key}
                className="block font-dm text-sm text-admin-muted mb-1.5"
              >
                {field.label}
              </label>

              {field.type === 'textarea' ? (
                <textarea
                  id={field.key}
                  value={values[field.key] || ''}
                  onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  rows={field.rows || 3}
                  className="w-full bg-admin-bg border border-admin-border rounded-lg px-3 py-2.5 text-admin-text font-dm text-sm placeholder-admin-muted focus:border-accent focus:outline-none transition-colors resize-none"
                />
              ) : (
                <input
                  id={field.key}
                  type={field.type || 'text'}
                  value={values[field.key] || ''}
                  onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="w-full bg-admin-bg border border-admin-border rounded-lg px-3 py-2.5 text-admin-text font-dm text-sm placeholder-admin-muted focus:border-accent focus:outline-none transition-colors"
                />
              )}
            </div>
          ))}
        </div>
      ))}

      {/* Save button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent text-admin-bg font-dm font-medium text-sm shadow-glow hover:shadow-glow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Save size={16} aria-hidden="true" />
          {saving ? 'Sauvegarde en cours...' : 'Sauvegarder les paramètres'}
        </button>
      </div>
    </div>
  )
}
