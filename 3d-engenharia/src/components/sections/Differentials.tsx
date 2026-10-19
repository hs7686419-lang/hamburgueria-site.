import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { differentials, differentialsIntro } from '@/content/differentials'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/ui/Reveal'
import { differentialIcons } from '@/components/ui/Icons'

export function Differentials() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const rotate = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-25, 25])
  const lineScale = useTransform(scrollYProgress, [0.15, 0.55], [0, 1])

  return (
    <section ref={ref} id="diferenciais" aria-labelledby="diferenciais-titulo" className="relative overflow-hidden bg-ink-900 py-28 md:py-40">
      {/* Elemento geométrico decorativo com movimento sutil */}
      <motion.svg
        aria-hidden="true"
        viewBox="0 0 400 400"
        className="pointer-events-none absolute -right-40 top-10 h-[560px] w-[560px] text-white/[0.05] md:-right-24"
        style={{ rotate }}
      >
        <polygon points="200,20 356,110 356,290 200,380 44,290 44,110" fill="none" stroke="currentColor" />
        <polygon points="200,80 304,140 304,260 200,320 96,260 96,140" fill="none" stroke="currentColor" />
        <path d="M200 20v360M44 110l312 180M356 110 44 290" stroke="currentColor" strokeDasharray="3 7" />
      </motion.svg>

      <div className="container-site relative">
        <SectionHeading
          index="04"
          eyebrow={differentialsIntro.eyebrow}
          title={differentialsIntro.title}
          text={differentialsIntro.text}
          align="split"
          titleId="diferenciais-titulo"
        />

        <motion.div aria-hidden="true" className="mt-16 h-px origin-left bg-gradient-to-r from-metal-light/70 via-white/15 to-transparent" style={{ scaleX: lineScale }} />

        <ul className="grid sm:grid-cols-2 lg:grid-cols-3">
          {differentials.map((d, i) => {
            const Icon = differentialIcons[d.icon]
            return (
              <Reveal
                as="li"
                key={d.title}
                delay={(i % 3) * 0.08}
                className="group relative border-b border-white/[0.07] py-10 sm:pr-10 lg:pr-14"
              >
                <div className="flex items-center gap-4">
                  <span className="relative flex h-11 w-11 items-center justify-center text-metal-light">
                    <span className="absolute inset-0 rotate-45 border border-white/10 transition-transform duration-700 ease-premium group-hover:rotate-[135deg] group-hover:border-metal-light/50" aria-hidden="true" />
                    <Icon className="relative h-[18px] w-[18px]" strokeWidth={1.4} aria-hidden="true" />
                  </span>
                  <span className="font-mono text-[11px] text-steel-500">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <h3 className="mt-8 text-xl font-medium tracking-[-0.02em] text-white">{d.title}</h3>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-steel-400">{d.text}</p>
                <span aria-hidden="true" className="absolute bottom-[-1px] left-0 h-px w-0 bg-metal-light transition-[width] duration-700 ease-premium group-hover:w-full" />
              </Reveal>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
