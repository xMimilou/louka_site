'use client'

import { useEffect, useMemo } from 'react'
import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/mantine'
import '@blocknote/mantine/style.css'

interface EditorComponentProps {
  initialContent?: Record<string, unknown> | null
  onChange: (content: Record<string, unknown>) => void
}

export default function EditorComponent({ initialContent, onChange }: EditorComponentProps) {
  const editor = useCreateBlockNote({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialContent: initialContent ? (initialContent as any) : undefined,
  })

  useEffect(() => {
    const unsubscribe = editor.onChange(() => {
      const doc = editor.document
      onChange({ content: doc })
    })
    return unsubscribe
  }, [editor, onChange])

  return (
    <div className="min-h-[400px] rounded-xl border border-admin-border overflow-hidden" style={{ background: '#0F1117' }}>
      <BlockNoteView
        editor={editor}
        theme="dark"
      />
    </div>
  )
}
