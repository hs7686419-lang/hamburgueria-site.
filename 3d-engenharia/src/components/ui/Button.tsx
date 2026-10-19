import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { onAnchorClick } from '@/lib/scroll'

type Variant = 'primary' | 'ghost' | 'link'

const base =
  'group relative inline-flex items-center justify-center gap-3 overflow-hidden text-sm font-medium tracking-[-0.005em] transition-[color,background-color,border-color,box-shadow,transform] duration-500 ease-premium disabled:cursor-not-allowed disabled:opacity-60'

const variants: Record<Variant, string> = {
  primary:
    'h-12 rounded-full bg-steel-50 px-6 text-ink-950 shadow-[0_10px_40px_-12px_rgba(216,199,163,0.45)] hover:bg-white hover:shadow-[0_14px_50px_-12px_rgba(216,199,163,0.7)] active:scale-[0.98]',
  ghost:
    'h-12 rounded-full border border-white/20 bg-white/[0.03] px-6 text-white backdrop-blur-md hover:border-metal-light/60 hover:bg-white/[0.07] active:scale-[0.98]',
  link: 'h-auto px-0 text-white after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-metal-light after:transition-transform after:duration-500 after:ease-premium hover:after:origin-left hover:after:scale-x-100',
}

function Arrow() {
  return (
    <span className="relative inline-flex h-4 w-4 overflow-hidden" aria-hidden="true">
      <ArrowUpRight className="absolute h-4 w-4 transition-transform duration-500 ease-premium group-hover:-translate-y-4 group-hover:translate-x-4" />
      <ArrowUpRight className="absolute h-4 w-4 -translate-x-4 translate-y-4 transition-transform duration-500 ease-premium group-hover:translate-x-0 group-hover:translate-y-0" />
    </span>
  )
}

interface CommonProps {
  variant?: Variant
  arrow?: boolean
  children: ReactNode
  className?: string
}

export function ButtonLink({
  variant = 'primary',
  arrow = true,
  children,
  className = '',
  href,
  ...rest
}: CommonProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const internal = href?.startsWith('#')
  return (
    <a
      href={href}
      onClick={internal ? onAnchorClick : undefined}
      className={`${base} ${variants[variant]} ${className}`}
      {...rest}
    >
      <span className="relative">{children}</span>
      {arrow && <Arrow />}
    </a>
  )
}

export function Button({
  variant = 'primary',
  arrow = true,
  children,
  className = '',
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      <span className="relative">{children}</span>
      {arrow && <Arrow />}
    </button>
  )
}
