import type Lenis from 'lenis'
import type { MouseEvent } from 'react'

let lenis: Lenis | null = null

export function registerLenis(instance: Lenis | null) {
  lenis = instance
}

/** Rola até uma âncora (#id) respeitando o cabeçalho fixo e o Lenis, quando ativo. */
export function scrollToHash(hash: string) {
  const id = hash.replace(/^#/, '')
  const el = id ? document.getElementById(id) : null
  if (!el) return
  const offset = id === 'inicio' ? 0 : -64
  if (lenis) {
    lenis.scrollTo(el, { offset, duration: 1.4 })
  } else {
    const top = el.getBoundingClientRect().top + window.scrollY + offset
    window.scrollTo({ top, behavior: 'smooth' })
  }
  history.replaceState(null, '', `#${id}`)
  // Move o foco para a seção (acessibilidade) sem provocar novo salto.
  el.setAttribute('tabindex', '-1')
  el.focus({ preventScroll: true })
}

/** Handler para <a href="#..."> internos. */
export function onAnchorClick(e: MouseEvent<HTMLAnchorElement>) {
  const href = e.currentTarget.getAttribute('href') ?? ''
  if (!href.startsWith('#')) return
  e.preventDefault()
  scrollToHash(href)
}

/** Trava/destrava a rolagem da página (modais, menu). */
export function setScrollLocked(locked: boolean) {
  if (lenis) {
    if (locked) lenis.stop()
    else lenis.start()
  }
  document.documentElement.style.overflow = locked ? 'hidden' : ''
}
