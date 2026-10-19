import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { setScrollLocked } from '@/lib/scroll'
import { videoSources } from './LoopVideo'

const ease = [0.22, 1, 0.36, 1] as const

export interface VideoSource {
  src: string
  poster?: string
  title: string
}

/** Player em tela cheia para os vídeos verticais (com som e controles). */
export function VideoModal({ video, onClose }: { video: VideoSource | null; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!video) return
    returnFocus.current = document.activeElement as HTMLElement
    setScrollLocked(true)
    const t = setTimeout(() => closeRef.current?.focus(), 50)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(t)
      document.removeEventListener('keydown', onKey)
      setScrollLocked(false)
      returnFocus.current?.focus({ preventScroll: true })
    }
  }, [video, onClose])

  return (
    <AnimatePresence>
      {video && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="absolute inset-0 bg-ink-950/90 backdrop-blur-md" onClick={onClose} aria-hidden="true" />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={video.title}
            className="relative flex max-h-full flex-col items-center"
            initial={{ y: 30, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.55, ease }}
          >
            <div className="mb-3 flex w-full items-center justify-between gap-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel-300">{video.title}</p>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Fechar vídeo"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-white transition-colors hover:bg-white hover:text-ink-950"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <video
              key={video.src}
              poster={video.poster}
              controls
              autoPlay
              playsInline
              preload="metadata"
              className="aspect-[9/16] max-h-[calc(100svh-7rem)] w-auto max-w-full border border-white/10 bg-black shadow-2xl"
            >
              {videoSources(video.src, false).map((s) => (
                <source key={s.src} src={s.src} type={s.type} />
              ))}
              Seu navegador não reproduz este vídeo.
            </video>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
