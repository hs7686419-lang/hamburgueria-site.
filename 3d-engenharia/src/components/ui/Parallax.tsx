import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef, type ReactNode } from 'react'

/** Desloca o conteúdo verticalmente conforme a rolagem (parallax suave). */
export function Parallax({
  children,
  offset = 60,
  className = '',
}: {
  children: ReactNode
  /** Deslocamento total em px (positivo = move mais devagar que a página). */
  offset?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-offset, offset])
  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div style={{ y }} className="absolute inset-[-12%_0] will-change-transform">
        {children}
      </motion.div>
    </div>
  )
}
