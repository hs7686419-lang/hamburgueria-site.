import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

/**
 * Fontes de um vídeo .mp4 (H.264). Com `webm`, oferece antes a versão .webm (VP9)
 * de mesmo nome — usada nos loops, que são leves; o navegador escolhe a que suporta.
 */
export function videoSources(src: string, webm = true) {
  const alt = src.replace(/\.mp4$/, '.webm')
  if (!webm || alt === src) return [{ src, type: 'video/mp4' }]
  return [
    { src: alt, type: 'video/webm' },
    { src, type: 'video/mp4' },
  ]
}

/**
 * Vídeo curto, mudo e em loop para fundos de cards. Só baixa e toca quando
 * está visível; pausa fora da tela. Com movimento reduzido, mostra só o pôster.
 */
export function LoopVideo({ src, poster, className = '' }: { src: string; poster: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const reduce = useReducedMotion()
  const [load, setLoad] = useState(false)

  // Ao liberar o carregamento, as <source> entram no DOM e o vídeo é recarregado
  useEffect(() => {
    const el = ref.current
    if (!el || !load) return
    el.load()
    el.play().catch(() => {})
  }, [load])

  useEffect(() => {
    const el = ref.current
    if (!el || reduce) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setLoad(true)
          if (el.readyState > 0) el.play().catch(() => {})
        } else el.pause()
      },
      { rootMargin: '200px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduce])

  return (
    <video
      ref={ref}
      className={className}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      tabIndex={-1}
      disablePictureInPicture
    >
      {load && videoSources(src).map((s) => <source key={s.src} src={s.src} type={s.type} />)}
    </video>
  )
}
