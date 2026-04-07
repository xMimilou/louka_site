'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Supprimer',
  cancelLabel = 'Annuler',
  danger = true,
}: ConfirmModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    if (isOpen) {
      document.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-[420px] bg-admin-surface border border-admin-border rounded-2xl p-6 shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <h2 id="modal-title" className="font-syne font-bold text-admin-text text-lg">
            {title}
          </h2>
          <button
            onClick={onCancel}
            className="text-admin-muted hover:text-admin-text transition-colors ml-4 flex-shrink-0"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        <p className="font-dm text-admin-muted text-sm leading-relaxed mb-6">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-admin-border text-admin-text text-sm font-dm hover:border-accent transition-all duration-200"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-dm font-medium transition-all duration-200 ${
              danger
                ? 'bg-danger text-white hover:bg-danger/80'
                : 'bg-accent text-admin-bg shadow-glow hover:shadow-glow-lg'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
