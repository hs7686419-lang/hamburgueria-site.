import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import {
  motion,
  type MotionValue,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import { hero } from '@/content/hero'
import { ButtonLink } from '@/components/ui/Button'
import { HeroCanvas } from '@/components/three/HeroCanvas'
import { createHeroInput, PITCH_LIMIT_DOWN, PITCH_LIMIT_UP, YAW_LIMIT } from '@/components/three/store'
import { useCoarsePointer, useIsMobile } from '@/hooks/useMediaQuery'
import { onAnchorClick } from '@/lib/scroll'

const ease = [0.22, 1, 0.36, 1] as const

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const input = useRef(createHeroInput())
  const reduce = !!useReducedMotion()
  const coarse = useCoarsePointer()
  const mobile = useIsMobile()
  const [inView, setInView] = useState(true)
  const [sceneReady, setSceneReady] = useState(false)
  const [hint, setHint] = useState(true)

  input.current.reduced = reduce
  input.current.touch = coarse

  // Parallax das camadas de interface (fundo e conteúdo) com o mouse
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 60, damping: 20, mass: 0.6 })
  const sy = useSpring(my, { stiffness: 60, damping: 20, mass: 0.6 })
  const bgX = useTransform(sx, (v) => v * -18)
  const bgY = useTransform(sy, (v) => v * -12)
  const fgX = useTransform(sx, (v) => v * 8)
  const fgY = useTransform(sy, (v) => v * 6)

  // Transição para o restante do site
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    input.current.scroll = v
  })
  const contentY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, -120])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0])
  const canvasOpacity = useTransform(scrollYProgress, [0.2, 1], [1, 0.15])
  const canvasScale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1, 1.06])

  // Pausa o render 3D fora da tela
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Mouse, arraste e toque
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    let startX = 0
    let startY = 0
    let baseYaw = 0
    let basePitch = 0
    let pointerId: number | null = null
    let horizontal: boolean | null = null

    const isInteractive = (t: EventTarget | null) =>
      t instanceof Element && !!t.closest('a,button,input,select,textarea,[data-no-drag]')

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1
      const ny = -(((e.clientY - r.top) / r.height) * 2 - 1)
      const s = input.current
      if (e.pointerType === 'mouse') {
        s.px = nx
        s.py = ny
        mx.set(nx)
        my.set(ny)
      }
      if (pointerId === e.pointerId) {
        const dx = e.clientX - startX
        const dy = e.clientY - startY
        if (horizontal === null && Math.hypot(dx, dy) > 6) horizontal = Math.abs(dx) > Math.abs(dy)
        if (e.pointerType !== 'mouse' && horizontal === false) return // deixa a página rolar
        s.dragging = true
        s.dragYaw = Math.max(-YAW_LIMIT, Math.min(YAW_LIMIT, baseYaw + (dx / r.width) * 2.2))
        if (e.pointerType === 'mouse') {
          s.dragPitch = Math.max(PITCH_LIMIT_DOWN, Math.min(PITCH_LIMIT_UP, basePitch + (dy / r.height) * 0.8))
        }
        s.lastInteraction = performance.now() / 1000
      }
    }
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || isInteractive(e.target)) return
      pointerId = e.pointerId
      startX = e.clientX
      startY = e.clientY
      baseYaw = input.current.dragYaw
      basePitch = input.current.dragPitch
      horizontal = null
      if (e.pointerType === 'mouse') el.style.cursor = 'grabbing'
      setHint(false)
    }
    const onUp = (e: PointerEvent) => {
      if (pointerId !== e.pointerId) return
      pointerId = null
      input.current.dragging = false
      input.current.lastInteraction = performance.now() / 1000
      el.style.cursor = ''
    }
    const onLeave = () => {
      input.current.px = 0
      input.current.py = 0
      mx.set(0)
      my.set(0)
    }

    el.addEventListener('pointermove', onMove, { passive: true })
    el.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [mx, my])

  // Teclado: setas giram o modelo quando a área 3D está focada
  const onKeyDown = useCallback((e: KeyboardEvent) => {
    const s = input.current
    const step = 0.12
    if (e.key === 'ArrowLeft') s.dragYaw = Math.max(-YAW_LIMIT, s.dragYaw - step)
    else if (e.key === 'ArrowRight') s.dragYaw = Math.min(YAW_LIMIT, s.dragYaw + step)
    else if (e.key === 'ArrowUp') s.dragPitch = Math.min(PITCH_LIMIT_UP, s.dragPitch + 0.05)
    else if (e.key === 'ArrowDown') s.dragPitch = Math.max(PITCH_LIMIT_DOWN, s.dragPitch - 0.05)
    else return
    e.preventDefault()
    s.lastInteraction = performance.now() / 1000
    setHint(false)
  }, [])

  const handleReady = useCallback(() => setSceneReady(true), [])
  const show = sceneReady || reduce
  const delay = (d: number) => (reduce ? 0 : d)

  return (
    <section
      id="inicio"
      ref={sectionRef}
      aria-label="Apresentação"
      className="noise relative h-[100svh] min-h-[640px] w-full cursor-grab touch-pan-y select-none overflow-hidden bg-ink-950"
    >
      {/* Fundo: gradientes e malha técnica com parallax */}
      <motion.div aria-hidden="true" className="absolute inset-[-40px]" style={{ x: bgX, y: bgY }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_70%_40%,rgba(120,140,165,0.16),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_35%_at_72%_78%,rgba(216,199,163,0.08),transparent_70%)]" />
        <div className="grid-lines absolute inset-0 [mask-image:radial-gradient(ellipse_80%_70%_at_60%_45%,black,transparent_80%)]" />
      </motion.div>

      {/* Cena 3D */}
      <motion.div
        className="absolute inset-0"
        style={{ opacity: canvasOpacity, scale: canvasScale }}
        tabIndex={0}
        role="img"
        aria-label="Modelo 3D interativo de um edifício. Use as setas do teclado para girar."
        onKeyDown={onKeyDown}
        data-hero-canvas
      >
        <div className="pointer-events-none absolute inset-0">
          <HeroCanvas input={input} active={inView} quality={mobile || coarse ? 'low' : 'high'} onReady={handleReady} />
        </div>
      </motion.div>

      {/* Sombreamento para legibilidade do texto */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(7,9,12,0.92)_0%,rgba(7,9,12,0.55)_38%,transparent_65%)] max-md:bg-[linear-gradient(0deg,rgba(7,9,12,0.96)_0%,rgba(7,9,12,0.75)_42%,transparent_70%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-ink-950" />

      {/* Elementos técnicos */}
      <TechnicalOverlay mx={mx} my={my} show={show} reduce={reduce} />

      {/* Conteúdo */}
      <motion.div style={{ y: contentY, opacity: contentOpacity }} className="relative z-10 h-full">
        <motion.div style={{ x: fgX, y: fgY }} className="container-site flex h-full flex-col justify-end pb-28 pt-28 md:justify-center md:pb-0">
          <div className="max-w-[44rem]">
            <motion.p
              className="eyebrow mb-7"
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={show ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 1, ease, delay: delay(0.3) }}
            >
              {hero.eyebrow}
            </motion.p>
            <h1 className="display-1">
              {hero.title.map((line, i) => (
                <span key={line} className="block overflow-hidden pb-[0.06em]">
                  <motion.span
                    className={`block ${i === hero.title.length - 1 ? 'text-metal-grad' : ''}`}
                    initial={reduce ? false : { y: '110%' }}
                    animate={show ? { y: '0%' } : undefined}
                    transition={{ duration: 1.3, ease, delay: delay(0.45 + i * 0.12) }}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </h1>
            <motion.p
              className="mt-7 max-w-[34rem] text-base leading-relaxed text-steel-300 md:text-lg"
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={show ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 1.1, ease, delay: delay(0.85) }}
            >
              {hero.description}
            </motion.p>
            <motion.div
              className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={show ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 1.1, ease, delay: delay(1.05) }}
            >
              <ButtonLink href={hero.primaryCta.href}>{hero.primaryCta.label}</ButtonLink>
              <ButtonLink href={hero.secondaryCta.href} variant="ghost">
                {hero.secondaryCta.label}
              </ButtonLink>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Indicador de interação + rolagem */}
      <motion.div
        className="pointer-events-none absolute bottom-8 right-5 z-10 hidden items-center gap-3 sm:right-8 md:flex lg:right-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: show && hint ? 1 : 0 }}
        transition={{ duration: 0.8, delay: hint ? delay(2.6) : 0 }}
        aria-hidden="true"
      >
        <span className="relative flex h-8 w-8 items-center justify-center rounded-full border border-white/20">
          <span className="h-1.5 w-1.5 animate-[floaty_2.4s_ease-in-out_infinite] rounded-full bg-metal-light" />
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-steel-400">
          {coarse ? 'Deslize para girar' : 'Arraste para girar'}
        </span>
      </motion.div>

      <motion.a
        href="#sobre"
        onClick={onAnchorClick}
        className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2 text-steel-400 transition-colors hover:text-white max-md:hidden"
        style={{ opacity: contentOpacity }}
      >
        <motion.span
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: show ? 1 : 0 }}
          transition={{ duration: 1, delay: delay(1.6) }}
        >
        <span className="font-mono text-[10px] uppercase tracking-[0.3em]">Role</span>
        <span className="relative block h-10 w-px overflow-hidden bg-white/15">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_2.2s_cubic-bezier(.22,1,.36,1)_infinite] bg-metal-light" />
        </span>
        </motion.span>
        <span className="sr-only">Rolar para a próxima seção</span>
      </motion.a>
    </section>
  )
}

/** Linhas arquitetônicas, coordenadas e marcações técnicas sutis. */
const fmt = (v: number) => `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(3)}`

function TechnicalOverlay({ mx, my, show, reduce }: { mx: MotionValue<number>; my: MotionValue<number>; show: boolean; reduce: boolean }) {
  const cx = useTransform(mx, fmt)
  const cy = useTransform(my, fmt)
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[5]"
      initial={reduce ? false : { opacity: 0 }}
      animate={show ? { opacity: 1 } : undefined}
      transition={{ duration: 1.6, delay: reduce ? 0 : 1.2 }}
    >
      {/* Cantos de enquadramento */}
      {['left-5 top-24 border-l border-t', 'right-5 top-24 border-r border-t', 'left-5 bottom-5 border-b border-l', 'right-5 bottom-5 border-b border-r'].map(
        (c) => (
          <span key={c} className={`absolute h-4 w-4 border-white/25 sm:h-5 sm:w-5 lg:left-auto ${c}`} />
        ),
      )}

      {/* Régua vertical à direita */}
      <div className="absolute right-6 top-1/2 hidden -translate-y-1/2 flex-col items-end gap-[7px] lg:flex">
        {Array.from({ length: 25 }).map((_, i) => (
          <span key={i} className={`block h-px bg-white/25 ${i % 6 === 0 ? 'w-4 bg-white/45' : 'w-2'}`} />
        ))}
      </div>

      {/* Eixos de projeto */}
      <div className="absolute left-0 right-0 top-[22%] hidden h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent md:block" />
      <div className="absolute bottom-0 top-0 hidden w-px bg-gradient-to-b from-transparent via-white/[0.06] to-transparent md:left-[58%] md:block" />

      {/* Coordenadas do cursor e metadados técnicos */}
      <div className="absolute right-12 top-28 hidden text-right font-mono text-[10px] uppercase leading-relaxed tracking-[0.2em] text-steel-500 md:block lg:right-14">
        <p>
          X <motion.span className="tabular-nums text-steel-300">{cx}</motion.span>
          <span className="mx-2" />Y <motion.span className="tabular-nums text-steel-300">{cy}</motion.span>
        </p>
        <p>Estudo volumétrico · Esc. 1:500</p>
      </div>
      <div className="absolute bottom-24 right-12 hidden font-mono text-[10px] uppercase tracking-[0.2em] text-steel-500 lg:right-14 lg:block">
        EL. ±0.00
      </div>
      <div className="absolute left-1/2 top-28 hidden -translate-x-1/2 items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-steel-600 xl:flex">
        <span>A</span>
        <span className="h-px w-16 bg-white/15" />
        <span>B</span>
        <span className="h-px w-16 bg-white/15" />
        <span>C</span>
      </div>
    </motion.div>
  )
}
