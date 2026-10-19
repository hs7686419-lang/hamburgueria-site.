import { site } from '@/config/site'

/**
 * Logo da empresa. Enquanto `site.logo.src` estiver vazio, exibe uma marca
 * provisória (monograma geométrico + nome). Basta definir o caminho da logo
 * oficial em src/config/site.ts para substituí-la em todo o site.
 */
export function Logo({ className = '', compact = false }: { className?: string; compact?: boolean }) {
  if (site.logo.src) {
    return (
      <img
        src={site.logo.src}
        alt={site.logo.alt}
        width={site.logo.width}
        height={site.logo.height}
        className={`h-9 w-auto ${className}`}
        decoding="async"
      />
    )
  }
  return (
    <span className={`inline-flex items-center gap-3 ${className}`} aria-label={site.name}>
      <svg viewBox="0 0 40 40" className="h-9 w-9 shrink-0" aria-hidden="true">
        <defs>
          <linearGradient id="logo-metal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#8c7856" />
            <stop offset=".5" stopColor="#f1e6cc" />
            <stop offset="1" stopColor="#b8a27a" />
          </linearGradient>
        </defs>
        <path d="M20 3 35 11.5v17L20 37 5 28.5v-17Z" fill="none" stroke="url(#logo-metal)" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M20 3v17m0 0 15-8.5M20 20 5 11.5M20 20v17" stroke="url(#logo-metal)" strokeWidth="1" opacity=".55" />
      </svg>
      {!compact && (
        <span className="flex flex-col leading-none" aria-hidden="true">
          <span className="text-[17px] font-semibold tracking-[-0.02em] text-white">3D</span>
          <span className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.32em] text-steel-300">Engenharia</span>
        </span>
      )}
    </span>
  )
}
