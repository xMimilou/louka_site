'use client'

import { useEffect, useState } from 'react'

interface BlockNoteViewClientProps {
  content: Record<string, unknown>
}

// Render BlockNote JSON as readable HTML
function renderBlocks(blocks: unknown[]): string {
  if (!Array.isArray(blocks)) return ''

  return blocks.map((block: unknown) => {
    if (typeof block !== 'object' || block === null) return ''
    const b = block as Record<string, unknown>
    const type = b.type as string
    const content = b.content as unknown[]
    const children = b.children as unknown[]

    const text = Array.isArray(content)
      ? content.map((c: unknown) => {
          if (typeof c !== 'object' || c === null) return ''
          const ci = c as Record<string, unknown>
          let t = (ci.text as string) || ''
          const styles = ci.styles as Record<string, unknown> || {}
          if (styles.bold) t = `<strong>${t}</strong>`
          if (styles.italic) t = `<em>${t}</em>`
          if (styles.code) t = `<code class="font-mono text-accent bg-surface px-1.5 py-0.5 rounded text-sm">${t}</code>`
          if (ci.type === 'link') {
            const href = (ci.href as string) || '#'
            t = `<a href="${href}" class="text-accent hover:underline" target="_blank" rel="noopener noreferrer">${t}</a>`
          }
          return t
        }).join('')
      : ''

    const childHtml = children ? renderBlocks(children as unknown[]) : ''

    switch (type) {
      case 'heading': {
        const level = (b.props as Record<string, unknown>)?.level as number || 1
        const tagMap: Record<number, string> = {
          1: 'h2',
          2: 'h3',
          3: 'h4',
        }
        const tag = tagMap[level] || 'h2'
        const classes = level === 1
          ? 'font-syne font-bold text-text-primary text-2xl mt-10 mb-4'
          : level === 2
          ? 'font-syne font-bold text-text-primary text-xl mt-8 mb-3'
          : 'font-syne font-bold text-text-primary text-lg mt-6 mb-2'
        return `<${tag} class="${classes}">${text}</${tag}>`
      }
      case 'paragraph':
        return `<p class="font-dm text-text-muted leading-relaxed mb-4">${text}</p>`
      case 'bulletListItem':
        return `<li class="font-dm text-text-muted leading-relaxed">${text}${childHtml}</li>`
      case 'numberedListItem':
        return `<li class="font-dm text-text-muted leading-relaxed">${text}${childHtml}</li>`
      case 'codeBlock': {
        const lang = (b.props as Record<string, unknown>)?.language as string || ''
        return `<pre class="bg-surface border border-border rounded-xl p-5 my-6 overflow-x-auto"><code class="font-mono text-sm text-text-primary">${text}</code></pre>`
      }
      case 'quote':
        return `<blockquote class="border-l-2 border-accent pl-5 my-6 font-dm text-text-muted italic">${text}</blockquote>`
      case 'image': {
        const src = (b.props as Record<string, unknown>)?.url as string || ''
        const alt = (b.props as Record<string, unknown>)?.caption as string || ''
        return `<figure class="my-8"><img src="${src}" alt="${alt}" class="w-full rounded-xl border border-border" />${alt ? `<figcaption class="font-dm text-text-muted text-sm text-center mt-2">${alt}</figcaption>` : ''}</figure>`
      }
      default:
        return text ? `<p class="font-dm text-text-muted leading-relaxed mb-4">${text}</p>` : ''
    }
  }).join('\n')
}

export default function BlockNoteViewClient({ content }: BlockNoteViewClientProps) {
  const [html, setHtml] = useState('')

  useEffect(() => {
    try {
      const blocks = (content.content as unknown[]) || (content as unknown as unknown[])
      let rendered = renderBlocks(Array.isArray(blocks) ? blocks : [])

      // Wrap consecutive list items
      rendered = rendered.replace(
        /(<li class="font-dm[^"]*"[^>]*>[\s\S]*?<\/li>\n?)+/g,
        (match) => `<ul class="list-disc list-inside space-y-2 mb-4 ml-4">${match}</ul>`
      )

      setHtml(rendered)
    } catch {
      setHtml('<p class="font-dm text-text-muted">Erreur lors du rendu du contenu.</p>')
    }
  }, [content])

  return (
    <div
      className="article-body"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
