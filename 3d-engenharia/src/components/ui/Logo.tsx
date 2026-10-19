import { useId } from 'react'
import { site } from '@/config/site'

/**
 * Símbolo da 3D Engenharia (esfera vermelha com o "3" + arco azul do "D"),
 * redesenhado em vetor a partir da logo oficial.
 * `tone="dark"` usa um azul um pouco mais claro para manter contraste em fundo escuro.
 */
export function LogoMark({ className = '', tone = 'dark' }: { className?: string; tone?: 'dark' | 'light' }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg viewBox="40 10 340 316" className={className} aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-e`} cx="0.36" cy="0.32" r="0.75">
          <stop offset="0" stopColor="#ff6a6a" />
          <stop offset="0.35" stopColor="#e3161d" />
          <stop offset="0.8" stopColor="#b10c12" />
          <stop offset="1" stopColor="#7d070b" />
        </radialGradient>
        <linearGradient id={`${id}-b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".75" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        fill={tone === 'dark' ? '#2d52c4' : '#1f3f9b'}
        d="M66 22C262 26 364 92 360 170 356 250 258 304 70 316 214 290 292 240 294 170 296 100 214 52 66 22Z"
      />
      <circle cx="190" cy="172" r="106" fill={`url(#${id}-e)`} />
      <ellipse cx="160" cy="112" rx="62" ry="34" fill={`url(#${id}-b)`} transform="rotate(-24 160 112)" />
      <path fill="none" stroke="#fff" strokeWidth="27" strokeLinejoin="round" d="M148 122h82q22 0 22 22v54q0 22-22 22h-82M178 171h74" />
    </svg>
  )
}

/**
 * Logo para o cabeçalho (horizontal): símbolo + "ENGENHARIA" + complemento.
 * `variant="stacked"` reproduz a composição oficial (símbolo sobre o nome).
 * Se `site.logo.src` for definido, o arquivo oficial substitui o desenho.
 */
export function Logo({ className = '', variant = 'horizontal' }: { className?: string; variant?: 'horizontal' | 'stacked' }) {
  if (site.logo.src) {
    return (
      <img
        src={site.logo.src}
        alt={site.logo.alt}
        width={site.logo.width}
        height={site.logo.height}
        className={`${variant === 'stacked' ? 'h-24' : 'h-10'} w-auto ${className}`}
        decoding="async"
      />
    )
  }

  if (variant === 'stacked') {
    return (
      <span className={`inline-flex w-36 flex-col items-center ${className}`} role="img" aria-label={`${site.name} — ${site.tagline}`}>
        <LogoMark className="w-28" />
        <span aria-hidden="true" className="mt-2 w-full text-center text-[19px] font-black leading-none tracking-[0.02em] text-white [font-family:'Arial_Black',Arial,sans-serif]">
          ENGENHARIA
        </span>
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`} role="img" aria-label={`${site.name} — ${site.tagline}`}>
      <LogoMark className="h-10 w-auto shrink-0" />
      <span className="flex flex-col leading-none" aria-hidden="true">
        <span className="text-[15px] font-black tracking-[0.02em] text-white [font-family:'Arial_Black',Arial,sans-serif]">ENGENHARIA</span>
        <span className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.34em] text-steel-400">{site.tagline}</span>
      </span>
    </span>
  )
}
