'use client'

import { useState } from 'react'
import type { Project } from '@/lib/types'

interface ProjectsProps {
  projects: Project[]
}

const statusColors: Record<string, string> = {
  'En production': 'text-success bg-success/10 border-success/30',
  'En développement': 'text-warning bg-warning/10 border-warning/30',
  'Démo dispo': 'text-accent bg-accent/10 border-accent/30',
  'Archivé': 'text-text-muted bg-surface border-border',
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <article
      className={`bg-surface border border-border rounded-2xl p-6 hover:border-accent hover:shadow-glow hover:-translate-y-1 transition-all duration-300 flex flex-col ${
        index === 0 ? 'md:col-span-2 lg:col-span-1' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="font-mono text-xs text-text-muted mb-1">{project.category}</p>
          <h3 className="font-syne font-bold text-text-primary text-base leading-snug">{project.name}</h3>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border flex-shrink-0 ${
            statusColors[project.status] || statusColors['Archivé']
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" aria-hidden="true" />
          {project.status}
        </span>
      </div>

      <p className="font-dm text-text-muted text-sm leading-relaxed flex-1 mb-5">{project.description}</p>

      <div className="flex flex-wrap gap-1.5 mb-5">
        {project.stack.map((tech) => (
          <span
            key={tech}
            className="font-mono text-[11px] px-2 py-0.5 rounded bg-bg border border-border text-text-muted"
          >
            {tech}
          </span>
        ))}
      </div>

      {(project.link_url || project.github_url) && (
        <div className="flex gap-3 mt-auto">
          {project.link_url && (
            <a
              href={project.link_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-dm text-accent hover:underline"
            >
              {project.link_label || 'Voir →'}
            </a>
          )}
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-dm text-text-muted hover:text-text-primary transition-colors"
            >
              GitHub →
            </a>
          )}
        </div>
      )}
    </article>
  )
}

export default function Projects({ projects }: ProjectsProps) {
  const [showSide, setShowSide] = useState(false)

  const main = projects.filter((p) => !p.side_project)
  const side = projects.filter((p) => p.side_project)

  return (
    <section id="projets" className="py-28 px-6" aria-labelledby="projets-title">
      <div className="max-w-[1160px] mx-auto">
        <div className="mb-12">
          <p className="font-mono text-xs text-accent tracking-[0.15em] uppercase mb-3">Portfolio</p>
          <h2
            className="font-syne font-extrabold text-text-primary mb-4"
            style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)' }}
            id="projets-title"
          >
            Ce que j&apos;ai construit
          </h2>
          <p className="font-dm text-text-muted text-base leading-relaxed max-w-[540px]">
            Des projets concrets, en production ou en développement actif. Chacun résout un problème réel.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {main.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>

        {side.length > 0 && (
          <div className="mt-16">
            <button
              onClick={() => setShowSide((v) => !v)}
              className="flex items-center gap-3 font-mono text-xs text-text-muted tracking-[0.15em] uppercase hover:text-text-primary transition-colors mb-6"
              aria-expanded={showSide}
            >
              <span className="w-4 h-px bg-border" aria-hidden="true" />
              Side projects
              <span className="text-accent">{showSide ? '↑' : '↓'}</span>
            </button>

            {showSide && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {side.map((project, index) => (
                  <ProjectCard key={project.id} project={project} index={index} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
