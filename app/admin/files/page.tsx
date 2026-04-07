'use client'

import { useState, useEffect, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Copy, Trash2, FileText, File, FileSpreadsheet, Archive } from 'lucide-react'
import ConfirmModal from '@/components/admin/ConfirmModal'
import { toast } from '@/components/admin/Toast'

type FileType = 'all' | 'json' | 'python' | 'excel' | 'pdf' | 'zip' | 'image' | 'other'

interface LocalFile {
  name: string
  size: number
  created_at: string
}

function getFileType(name: string): FileType {
  const ext = name.split('.').pop()?.toLowerCase()
  if (!ext) return 'other'
  if (ext === 'json') return 'json'
  if (ext === 'py') return 'python'
  if (['xlsx', 'csv', 'xls'].includes(ext)) return 'excel'
  if (ext === 'pdf') return 'pdf'
  if (['zip', 'tar', 'gz'].includes(ext)) return 'zip'
  if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) return 'image'
  return 'other'
}

function FileIcon({ type }: { type: FileType }) {
  const props = { size: 16, 'aria-hidden': true as const }
  switch (type) {
    case 'json': return <FileText {...props} className="text-warning" />
    case 'python': return <FileText {...props} className="text-accent" />
    case 'excel': return <FileSpreadsheet {...props} className="text-success" />
    case 'pdf': return <FileText {...props} className="text-danger" />
    case 'zip': return <Archive {...props} className="text-admin-muted" />
    default: return <File {...props} className="text-admin-muted" />
  }
}

const typeBadge: Record<FileType, string> = {
  all: '',
  json: 'text-warning bg-warning/10 border-warning/30',
  python: 'text-accent bg-accent/10 border-accent/30',
  excel: 'text-success bg-success/10 border-success/30',
  pdf: 'text-danger bg-danger/10 border-danger/30',
  zip: 'text-admin-muted bg-admin-surface border-admin-border',
  image: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
  other: 'text-admin-muted bg-admin-surface border-admin-border',
}

function formatBytes(bytes: number): string {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function FilesPage() {
  const [files, setFiles] = useState<LocalFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [filter, setFilter] = useState<FileType>('all')
  const [deleteTarget, setDeleteTarget] = useState<LocalFile | null>(null)

  const fetchFiles = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/upload')
      if (!res.ok) throw new Error()
      setFiles(await res.json())
    } catch {
      toast.error('Erreur lors du chargement des fichiers')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchFiles() }, [fetchFiles])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return
    setUploading(true)
    setUploadProgress(30)

    try {
      const formData = new FormData()
      formData.append('file', file)
      setUploadProgress(60)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      if (!res.ok) throw new Error()
      setUploadProgress(100)
      toast.success(`"${file.name}" uploadé avec succès !`)
      fetchFiles()
    } catch {
      toast.error("Erreur lors de l'upload")
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }, [fetchFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 50 * 1024 * 1024,
  })

  const handleCopyUrl = async (fileName: string) => {
    const url = `${window.location.origin}/uploads/${fileName}`
    await navigator.clipboard.writeText(url)
    toast.success('URL copiée dans le presse-papier !')
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch('/api/admin/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: deleteTarget.name }),
      })
      if (!res.ok) throw new Error()
      toast.success('Fichier supprimé')
      setDeleteTarget(null)
      fetchFiles()
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  const filteredFiles = files.filter((f) => filter === 'all' || getFileType(f.name) === filter)
  const totalSize = files.reduce((sum, f) => sum + (f.size || 0), 0)

  const filterTabs: { value: FileType; label: string }[] = [
    { value: 'all', label: 'Tous' },
    { value: 'json', label: 'JSON' },
    { value: 'python', label: 'Python' },
    { value: 'excel', label: 'Excel/CSV' },
    { value: 'pdf', label: 'PDF' },
    { value: 'zip', label: 'ZIP' },
    { value: 'image', label: 'Images' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-syne font-bold text-admin-text text-xl">Gestionnaire de Fichiers</h2>
          <p className="font-mono text-xs text-admin-muted mt-0.5">
            {files.length} fichier{files.length !== 1 ? 's' : ''} · {formatBytes(totalSize)} utilisés
          </p>
        </div>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${
          isDragActive ? 'border-accent bg-accent/5' : 'border-admin-border hover:border-accent/50 hover:bg-admin-surface'
        } ${uploading ? 'pointer-events-none' : ''}`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="space-y-4">
            <div className="inline-block w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <div className="w-64 mx-auto bg-admin-border rounded-full h-1.5">
              <div className="bg-accent h-1.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
            </div>
            <p className="font-dm text-sm text-admin-muted">Upload en cours...</p>
          </div>
        ) : (
          <div className="space-y-3">
            <Upload size={32} className="mx-auto text-admin-muted" aria-hidden="true" />
            <div>
              <p className="font-syne font-bold text-admin-text">
                {isDragActive ? 'Déposez le fichier ici' : 'Glissez-déposez un fichier'}
              </p>
              <p className="font-dm text-sm text-admin-muted mt-1">ou cliquez pour sélectionner</p>
            </div>
            <p className="font-mono text-xs text-admin-muted">
              .json .py .xlsx .csv .zip .pdf .png .jpg — Max 50 MB
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-1 p-1 bg-admin-bg border border-admin-border rounded-xl w-fit">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-dm transition-all duration-200 ${
              filter === tab.value ? 'bg-admin-surface text-admin-text font-medium' : 'text-admin-muted hover:text-admin-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-admin-border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mb-3" />
            <p className="font-dm text-admin-muted text-sm">Chargement...</p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="font-syne font-bold text-admin-text">Aucun fichier</p>
            <p className="font-dm text-admin-muted text-sm">
              {filter !== 'all' ? 'Aucun fichier de ce type.' : 'Uploadez votre premier fichier.'}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-admin-border" style={{ background: '#161B27' }}>
                <th className="px-4 py-3 text-left font-dm text-xs text-admin-muted uppercase tracking-wider">Nom</th>
                <th className="px-4 py-3 text-left font-dm text-xs text-admin-muted uppercase tracking-wider hidden md:table-cell">Taille</th>
                <th className="px-4 py-3 text-left font-dm text-xs text-admin-muted uppercase tracking-wider hidden lg:table-cell">Date</th>
                <th className="px-4 py-3 text-left font-dm text-xs text-admin-muted uppercase tracking-wider w-20">Type</th>
                <th className="px-4 py-3 text-right font-dm text-xs text-admin-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {filteredFiles.map((file) => {
                const type = getFileType(file.name)
                return (
                  <tr key={file.name} className="hover:bg-admin-surface transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <FileIcon type={type} />
                        <span className="font-mono text-sm text-admin-text truncate max-w-xs">{file.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="font-mono text-xs text-admin-muted">{formatBytes(file.size)}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="font-dm text-xs text-admin-muted">{formatDate(file.created_at)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full border uppercase ${typeBadge[type]}`}>
                        {type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleCopyUrl(file.name)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-admin-border text-admin-muted text-xs font-dm hover:text-accent hover:border-accent transition-colors"
                          title="Copier l'URL"
                        >
                          <Copy size={12} aria-hidden="true" />
                          <span className="hidden sm:inline">Copier</span>
                        </button>
                        <button
                          onClick={() => setDeleteTarget(file)}
                          className="p-1.5 rounded-lg text-admin-muted hover:text-danger transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={14} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Supprimer le fichier"
        message={`Êtes-vous sûr de vouloir supprimer "${deleteTarget?.name}" ? Cette action est irréversible.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        confirmLabel="Supprimer"
      />
    </div>
  )
}
