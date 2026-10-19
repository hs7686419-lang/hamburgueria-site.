import { motion, useReducedMotion, type Variants } from 'framer-motion'
import type { ElementType, ReactNode } from 'react'

const ease = [0.22, 1, 0.36, 1] as const

/** Entrada discreta (opacidade + deslocamento) quando o elemento entra na tela. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  as = 'div',
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
  as?: 'div' | 'li' | 'p' | 'span' | 'article' | 'header'
}) {
  const reduce = useReducedMotion()
  const Comp = motion[as] as ElementType
  return (
    <Comp
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 1, ease, delay }}
    >
      {children}
    </Comp>
  )
}

const lineVariants: Variants = {
  hidden: { y: '110%' },
  show: (i: number) => ({ y: '0%', transition: { duration: 1.1, ease, delay: i * 0.09 } }),
}

/**
 * Revelação progressiva de títulos: cada linha sobe por trás de uma máscara.
 * `lines` = linhas do título (quebras controladas pelo conteúdo).
 */
export function RevealTitle({
  lines,
  as: Tag = 'h2',
  className = '',
  delay = 0,
  immediate = false,
  accentLast = false,
  id,
}: {
  lines: string[]
  as?: 'h1' | 'h2' | 'h3'
  className?: string
  delay?: number
  /** Anima ao montar (hero) em vez de ao entrar na tela. */
  immediate?: boolean
  accentLast?: boolean
  id?: string
}) {
  const reduce = useReducedMotion()
  const MotionTag = motion[Tag]
  return (
    <MotionTag
      id={id}
      className={className}
      initial={reduce ? false : 'hidden'}
      {...(immediate ? { animate: 'show' } : { whileInView: 'show', viewport: { once: true, margin: '0px 0px -12% 0px' } })}
    >
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em]">
          <motion.span
            className={`block ${accentLast && i === lines.length - 1 ? 'text-metal-grad' : ''}`}
            variants={lineVariants}
            custom={i + delay / 0.09}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  )
}
