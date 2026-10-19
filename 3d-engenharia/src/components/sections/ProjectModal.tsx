import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react'
import type { Project } from '@/content/projects'
import { ResponsiveImage } from '@/components/ui/ResponsiveImage'
import { DemoBadge } from '@/components/ui/DemoBadge'
import { ButtonLink } from '@/components/ui/Button'
import { scrollToHash, setScrollLocked } from '@/lib/scroll'
import { VideoModal } from '@/components/ui/VideoModal'

const ease = [0.22, 1, 0.36, 1] as const

/** Modal de detalhes do projeto: galeria, ficha técnica e chamada para orçamento. */
export function ProjectModal({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    setPlaying(false)
    if (!project) return
    setIndex(0)
    returnFocus.current = document.activeElement as HTMLElement
    setScrollLocked(true)
    const t = setTimeout(() => dialogRef.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus(), 50)
    return () => {
      clearTimeout(t)
      setScrollLocked(false)
      returnFocus.current?.focus({ preventScroll: true })
    }
  }, [project])

  useEffect(() => {
    if (!project) return
    const n = project.images.length
    const onKey = (e: KeyboardEvent) => {
      if (playing) return // o player de vídeo trata as próprias teclas
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight' && n > 1) setIndex((i) => (i + 1) % n)
      else if (e.key === 'ArrowLeft' && n > 1) setIndex((i) => (i - 1 + n) % n)
      else if (e.key === 'Tab' && dialogRef.current) {
        const f = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button,a[href]')).filter((el) => !el.hasAttribute('disabled'))
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
    return () => document.removeEventListener('keydown', onKey)
  }, [project, onClose, playing])

  return (
    <>
    <VideoModal video={playing && project?.video ? project.video : null} onClose={() => setPlaying(false)} />
    <AnimatePresence>
      {project && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="absolute inset-0 bg-ink-950/85 backdrop-blur-md" onClick={onClose} aria-hidden="true" />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="projeto-titulo"
            data-lenis-prevent
            className="relative grid max-h-[92svh] w-full max-w-6xl overflow-y-auto border border-white/[0.08] bg-ink-900 shadow-2xl lg:grid-cols-[1.45fr_1fr] lg:overflow-hidden"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.6, ease }}
          >
            {/* Galeria */}
            <div className="relative aspect-[4/3] bg-ink-850 lg:aspect-auto lg:min-h-[560px]">
              <AnimatePresence mode="sync" initial={false}>
                <motion.div
                  key={index}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease }}
                >
                  <ResponsiveImage image={project.images[index]} sizes="(min-width:1024px) 60vw, 100vw" className="h-full w-full" priority />
                </motion.div>
              </AnimatePresence>
              {project.images.length > 1 && (
                <>
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <span className="rounded-full bg-ink-950/60 px-3 py-1 font-mono text-[11px] text-steel-200 backdrop-blur" aria-live="polite">
                      {String(index + 1).padStart(2, '0')} / {String(project.images.length).padStart(2, '0')}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        aria-label="Imagem anterior"
                        onClick={() => setIndex((i) => (i - 1 + project.images.length) % project.images.length)}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-ink-950/50 text-white backdrop-blur transition-colors hover:bg-white hover:text-ink-950"
                      >
                        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        aria-label="Próxima imagem"
                        onClick={() => setIndex((i) => (i + 1) % project.images.length)}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-ink-950/50 text-white backdrop-blur transition-colors hover:bg-white hover:text-ink-950"
                      >
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Ficha do projeto */}
            <div className="flex flex-col p-7 sm:p-10 lg:max-h-[92svh] lg:overflow-y-auto">
              <div className="flex items-start justify-between gap-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-metal-light">{project.category}</p>
                <button
                  type="button"
                  data-autofocus
                  onClick={onClose}
                  aria-label="Fechar detalhes do projeto"
                  className="-mr-2 -mt-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-white transition-colors hover:bg-white hover:text-ink-950"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <h3 id="projeto-titulo" className="mt-4 text-3xl font-medium tracking-[-0.03em] text-white">
                {project.name}
              </h3>
              {project.demo && <DemoBadge className="mt-4 self-start" />}
              <p className="mt-6 leading-relaxed text-steel-300">{project.description}</p>

              <dl className="mt-8 divide-y divide-white/[0.07] border-y border-white/[0.07] text-sm">
                {[
                  ['Categoria', project.category],
                  ['Localização', project.location],
                  ...(project.status ? [['Situação', project.status]] : []),
                  ...(project.year ? [['Ano', project.year]] : []),
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-6 py-3">
                    <dt className="text-steel-500">{k}</dt>
                    <dd className="text-right text-steel-200">{v}</dd>
                  </div>
                ))}
              </dl>

              {project.images.length > 1 && (
                <div className="mt-8 grid grid-cols-4 gap-2">
                  {project.images.map((img, i) => (
                    <button
                      key={img.src + i}
                      type="button"
                      onClick={() => setIndex(i)}
                      aria-label={`Ver imagem ${i + 1}`}
                      aria-current={i === index}
                      className={`relative aspect-square overflow-hidden transition-opacity duration-300 ${i === index ? 'opacity-100 ring-1 ring-metal-light' : 'opacity-50 hover:opacity-90'}`}
                    >
                      <img src={img.srcSmall ?? img.src} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {project.video && (
                <button
                  type="button"
                  onClick={() => setPlaying(true)}
                  className="mt-8 inline-flex items-center gap-3 self-start rounded-full border border-white/20 py-1.5 pl-1.5 pr-5 text-sm text-white transition-colors hover:border-metal-light/60 hover:bg-white/10"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink-950">
                    <Play className="ml-0.5 h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  </span>
                  Assistir ao vídeo da obra
                </button>
              )}

              <div className="mt-auto pt-10">
                <ButtonLink
                  href="#contato"
                  onClick={(e) => {
                    e.preventDefault()
                    onClose()
                    setTimeout(() => scrollToHash('#contato'), 350)
                  }}
                  className="w-full sm:w-auto"
                >
                  Solicitar um projeto semelhante
                </ButtonLink>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  )
}
