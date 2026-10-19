import { site } from '@/config/site'

/** Selo que identifica conteúdo de exemplo (desligue em site.showDemoBadges). */
export function DemoBadge({ className = '', label = 'Conteúdo demonstrativo' }: { className?: string; label?: string }) {
  if (!site.showDemoBadges) return null
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-metal/40 bg-ink-950/70 px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.16em] text-metal-light backdrop-blur-md ${className}`}
    >
      <span className="h-1 w-1 rounded-full bg-metal-light" aria-hidden="true" />
      {label}
    </span>
  )
}
