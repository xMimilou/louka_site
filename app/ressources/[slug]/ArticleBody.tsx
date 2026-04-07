'use client'

import dynamic from 'next/dynamic'

const BlockNoteViewClient = dynamic(() => import('./BlockNoteViewClient'), { ssr: false })

interface ArticleBodyProps {
  content: Record<string, unknown>
}

export default function ArticleBody({ content }: ArticleBodyProps) {
  return <BlockNoteViewClient content={content} />
}
