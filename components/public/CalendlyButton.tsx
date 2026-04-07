'use client'

const CALENDLY_URL = 'https://calendly.com/louka06-millon/audit-45min'

interface CalendlyButtonProps {
  className?: string
  children: React.ReactNode
  onClick?: () => void
}

export default function CalendlyButton({ className, children, onClick }: CalendlyButtonProps) {
  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    onClick?.()
    const w = window as typeof window & { Calendly?: { showPopupWidget: (url: string) => void } }
    if (w.Calendly) {
      w.Calendly.showPopupWidget(CALENDLY_URL)
    } else {
      window.open(CALENDLY_URL, '_blank')
    }
  }

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  )
}
