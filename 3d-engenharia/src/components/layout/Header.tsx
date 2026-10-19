import { useEffect, useRef, useState } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Logo } from '@/components/ui/Logo'
import { ButtonLink } from '@/components/ui/Button'
import { navItems } from '@/config/site'
import { useActiveSection, useScrolled } from '@/hooks/useScrolled'
import { onAnchorClick, scrollToHash, setScrollLocked } from '@/lib/scroll'

const ease = [0.22, 1, 0.36, 1] as const
const ids = navItems.map((n) => n.id)

/**
 * Cabeçalho: transparente sobre o hero; ao rolar vira barra compacta com
 * fundo sólido e desfoque. `base` permite usar os links em outras páginas
 * (ex.: política de privacidade → "/#contato").
 */
export function Header({ base = '' }: { base?: string }) {
  const scrolled = useScrolled(40)
  const active = useActiveSection(ids)
  const [open, setOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Fecha com Esc, prende o foco no painel e trava a rolagem do fundo
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
      if (e.key === 'Tab' && panelRef.current) {
        const f = panelRef.current.querySelectorAll<HTMLElement>('a,button')
        const first = f[0]
        const last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    setScrollLocked(true)
    panelRef.current?.querySelector<HTMLElement>('a')?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      setScrollLocked(false)
    }
  }, [open])

  useEffect(() => {
    const onResize = () => window.innerWidth >= 1024 && setOpen(false)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const link = (id: string) => (base ? `${base}#${id}` : `#${id}`)
  const onNav = (e: ReactMouseEvent<HTMLAnchorElement>) => {
    if (base) return setOpen(false)
    if (!open) return onAnchorClick(e)
    // Menu móvel aberto: fecha (destrava a rolagem) e só então navega
    e.preventDefault()
    const href = e.currentTarget.getAttribute('href') ?? ''
    setOpen(false)
    setTimeout(() => scrollToHash(href), 60)
  }

  const compact = scrolled || open

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:text-ink-950"
      >
        Pular para o conteúdo
      </a>
      <div
        className={`transition-[background-color,backdrop-filter,border-color,padding] duration-700 ease-premium ${
          compact
            ? 'border-b border-white/[0.07] bg-ink-950/75 py-3 backdrop-blur-xl backdrop-saturate-150'
            : 'border-b border-transparent bg-transparent py-6'
        }`}
      >
        <div className="container-site flex items-center justify-between gap-6">
          <a href={link('inicio')} onClick={onNav} className="relative z-10 shrink-0" aria-label="3D Engenharia — início">
            <Logo />
          </a>

          <nav aria-label="Principal" className="hidden lg:block">
            <ul className="flex items-center gap-1 rounded-full border border-white/[0.07] bg-white/[0.02] p-1 backdrop-blur-md">
              {navItems.map((item) => {
                const isActive = !base && active === item.id
                return (
                  <li key={item.id} className="relative">
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-full bg-white/[0.08]"
                        transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                      />
                    )}
                    <a
                      href={link(item.id)}
                      onClick={onNav}
                      aria-current={isActive ? 'true' : undefined}
                      className={`relative block rounded-full px-4 py-2 text-[13px] transition-colors duration-300 ${
                        isActive ? 'text-white' : 'text-steel-300 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <ButtonLink href={link('contato')} onClick={onNav} className="!hidden !h-10 !px-5 !text-[13px] sm:!inline-flex">
              Orçamento
            </ButtonLink>
            <button
              ref={toggleRef}
              type="button"
              className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.03] backdrop-blur-md lg:hidden"
              aria-expanded={open}
              aria-controls="menu-mobile"
              aria-label={open ? 'Fechar menu' : 'Abrir menu'}
              onClick={() => setOpen((o) => !o)}
            >
              <span className="relative block h-3 w-5" aria-hidden="true">
                <span
                  className={`absolute left-0 block h-px w-5 bg-white transition-transform duration-500 ease-premium ${
                    open ? 'top-1.5 rotate-45' : 'top-0'
                  }`}
                />
                <span
                  className={`absolute left-0 block h-px w-5 bg-white transition-transform duration-500 ease-premium ${
                    open ? 'top-1.5 -rotate-45' : 'top-3'
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="menu-mobile"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 -z-10 flex flex-col bg-ink-950/[0.97] px-5 pb-10 pt-28 backdrop-blur-2xl sm:px-8 lg:hidden"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.7, ease }}
          >
            <div className="grid-lines pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
            <nav aria-label="Menu móvel" className="relative">
              <ul className="space-y-1">
                {navItems.map((item, i) => (
                  <li key={item.id} className="overflow-hidden">
                    <motion.a
                      href={link(item.id)}
                      onClick={onNav}
                      className="flex items-baseline gap-4 py-2 text-[clamp(2rem,9vw,3rem)] font-medium tracking-tightest text-white"
                      initial={{ y: '100%' }}
                      animate={{ y: 0 }}
                      exit={{ y: '100%' }}
                      transition={{ duration: 0.7, ease, delay: 0.12 + i * 0.05 }}
                    >
                      <span className="font-mono text-[11px] text-metal-light">0{i + 1}</span>
                      {item.label}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </nav>
            <motion.div
              className="relative mt-auto"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <ButtonLink href={link('contato')} onClick={onNav} className="w-full">
                Solicite um orçamento
              </ButtonLink>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
