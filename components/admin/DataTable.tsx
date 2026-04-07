'use client'

import { Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'

export interface Column<T> {
  key: keyof T | string
  label: string
  render?: (value: unknown, row: T) => React.ReactNode
  width?: string
}

interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[]
  data: T[]
  onEdit?: (row: T) => void
  onDelete?: (row: T) => void
  onToggle?: (row: T) => void
  toggleField?: keyof T
  emptyMessage?: string
  loading?: boolean
}

export default function DataTable<T extends { id: string }>({
  columns,
  data,
  onEdit,
  onDelete,
  onToggle,
  toggleField,
  emptyMessage = 'Aucune donnée',
  loading = false,
}: DataTableProps<T>) {
  const hasActions = onEdit || onDelete || onToggle

  if (loading) {
    return (
      <div className="rounded-xl border border-admin-border overflow-hidden">
        <div className="p-8 text-center">
          <div className="inline-block w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mb-3" />
          <p className="font-dm text-admin-muted text-sm">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-admin-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-admin-border" style={{ background: '#161B27' }}>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className="px-4 py-3 text-left font-dm text-xs text-admin-muted font-medium uppercase tracking-wider"
                  style={{ width: col.width }}
                >
                  {col.label}
                </th>
              ))}
              {hasActions && (
                <th className="px-4 py-3 text-right font-dm text-xs text-admin-muted font-medium uppercase tracking-wider w-32">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (hasActions ? 1 : 0)}
                  className="px-4 py-12 text-center font-dm text-admin-muted text-sm"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-admin-border hover:bg-admin-surface transition-colors last:border-b-0"
                >
                  {columns.map((col) => {
                    const value = typeof col.key === 'string' && col.key.includes('.')
                      ? col.key.split('.').reduce((obj: unknown, key) => {
                          if (typeof obj === 'object' && obj !== null) {
                            return (obj as Record<string, unknown>)[key]
                          }
                          return undefined
                        }, row)
                      : row[col.key as keyof T]

                    return (
                      <td key={String(col.key)} className="px-4 py-3">
                        {col.render ? col.render(value, row) : (
                          <span className="font-dm text-sm text-admin-text">
                            {String(value ?? '')}
                          </span>
                        )}
                      </td>
                    )
                  })}
                  {hasActions && (
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {onToggle && toggleField && (
                          <button
                            onClick={() => onToggle(row)}
                            className="p-1.5 rounded-lg text-admin-muted hover:text-accent transition-colors"
                            title={row[toggleField] ? 'Masquer' : 'Afficher'}
                          >
                            {row[toggleField]
                              ? <ToggleRight size={16} className="text-success" aria-hidden="true" />
                              : <ToggleLeft size={16} aria-hidden="true" />
                            }
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={() => onEdit(row)}
                            className="p-1.5 rounded-lg text-admin-muted hover:text-accent transition-colors"
                            title="Modifier"
                          >
                            <Edit2 size={14} aria-hidden="true" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(row)}
                            className="p-1.5 rounded-lg text-admin-muted hover:text-danger transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 size={14} aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
