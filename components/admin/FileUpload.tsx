'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, File } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { toast } from './Toast'

interface FileUploadProps {
  bucket?: string
  folder?: string
  accept?: Record<string, string[]>
  maxSize?: number
  onUploaded: (url: string, fileName: string) => void
  label?: string
  currentUrl?: string | null
}

export default function FileUpload({
  bucket = 'uploads',
  folder = '',
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    'application/pdf': ['.pdf'],
    'text/plain': ['.txt'],
    'application/json': ['.json'],
    'application/zip': ['.zip'],
    'text/x-python': ['.py'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'text/csv': ['.csv'],
  },
  maxSize = 10 * 1024 * 1024, // 10MB
  onUploaded,
  label = 'Déposer un fichier ici',
  currentUrl,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [fileName, setFileName] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setUploading(true)
    setProgress(10)

    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-z0-9]/gi, '-').toLowerCase()
      const uniqueName = `${folder ? folder + '/' : ''}${baseName}-${Date.now()}.${ext}`

      setProgress(30)

      const { error } = await supabase.storage
        .from(bucket)
        .upload(uniqueName, file, { upsert: true })

      if (error) throw error

      setProgress(80)

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(uniqueName)

      setProgress(100)
      setFileName(file.name)
      onUploaded(urlData.publicUrl, file.name)
      toast.success('Fichier uploadé avec succès !')
    } catch (err) {
      toast.error("Erreur lors de l'upload")
      console.error(err)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }, [bucket, folder, onUploaded])

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
  })

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-accent bg-accent/5'
            : 'border-admin-border hover:border-accent/50 hover:bg-admin-surface'
        } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input {...getInputProps()} />

        {uploading ? (
          <div className="space-y-3">
            <div className="inline-block w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <div className="w-full bg-admin-border rounded-full h-1.5">
              <div
                className="bg-accent h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="font-dm text-sm text-admin-muted">Upload en cours... {progress}%</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload size={24} className="mx-auto text-admin-muted" aria-hidden="true" />
            <p className="font-dm text-sm text-admin-muted">{label}</p>
            <p className="font-dm text-xs text-admin-muted opacity-60">
              ou cliquez pour sélectionner
            </p>
          </div>
        )}
      </div>

      {fileRejections.length > 0 && (
        <p className="font-dm text-xs text-danger">
          Fichier refusé : {fileRejections[0]?.errors[0]?.message}
        </p>
      )}

      {(currentUrl || fileName) && !uploading && (
        <div className="flex items-center gap-2 px-3 py-2 bg-admin-bg border border-admin-border rounded-lg">
          <File size={14} className="text-admin-muted flex-shrink-0" aria-hidden="true" />
          <span className="font-mono text-xs text-admin-text truncate flex-1">
            {fileName || currentUrl?.split('/').pop()}
          </span>
          {currentUrl && (
            <a
              href={currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent text-xs font-dm hover:underline flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              Voir
            </a>
          )}
        </div>
      )}
    </div>
  )
}
