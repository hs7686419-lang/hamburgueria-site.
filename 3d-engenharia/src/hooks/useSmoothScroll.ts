import { useEffect } from 'react'
import Lenis from 'lenis'
import { registerLenis, scrollToHash } from '@/lib/scroll'

/** Rolagem suave (Lenis) no desktop. Desativada com prefers-reduced-motion. */
export function useSmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let lenis: Lenis | null = null
    let raf = 0
    if (!reduce) {
      lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true })
      registerLenis(lenis)
      const loop = (time: number) => {
        lenis?.raf(time)
        raf = requestAnimationFrame(loop)
      }
      raf = requestAnimationFrame(loop)
    }
    // Abre direto na seção indicada pela URL (ex.: /#contato)
    if (location.hash) {
      const hash = location.hash
      setTimeout(() => scrollToHash(hash), 300)
    }
    return () => {
      cancelAnimationFrame(raf)
      lenis?.destroy()
      registerLenis(null)
    }
  }, [])
}
