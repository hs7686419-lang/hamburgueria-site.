import { useState } from 'react'
import type { ImageRef } from '@/content/types'

/**
 * Imagem otimizada (lazy, srcset, decodificação assíncrona) com transição suave
 * de carregamento. Sem `image` ou com erro, mostra um espaço reservado técnico
 * pronto para receber a fotografia oficial.
 */
export function ResponsiveImage({
  image,
  sizes = '100vw',
  className = '',
  imgClassName = '',
  priority = false,
  placeholderLabel = 'Espaço para fotografia',
}: {
  image?: ImageRef
  sizes?: string
  className?: string
  imgClassName?: string
  priority?: boolean
  placeholderLabel?: string
}) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  if (!image?.src || failed) {
    return (
      <div className={`relative overflow-hidden bg-ink-850 ${className}`} role="img" aria-label={image?.alt || placeholderLabel}>
        <div className="grid-lines absolute inset-0 opacity-70" />
        <svg className="absolute inset-0 h-full w-full text-white/10" preserveAspectRatio="none" aria-hidden="true">
          <line x1="0" y1="0" x2="100%" y2="100%" stroke="currentColor" />
          <line x1="100%" y1="0" x2="0" y2="100%" stroke="currentColor" />
        </svg>
        <span className="absolute bottom-4 left-4 font-mono text-[10px] uppercase tracking-[0.2em] text-steel-400">
          {placeholderLabel}
        </span>
      </div>
    )
  }

  const srcSet = image.srcSmall ? `${image.srcSmall} 800w, ${image.src} 1600w` : undefined

  return (
    <div className={`relative overflow-hidden bg-ink-850 ${className}`}>
      <img
        src={image.src}
        srcSet={srcSet}
        sizes={srcSet ? sizes : undefined}
        alt={image.alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={`h-full w-full object-cover transition-[opacity,filter,transform] duration-[1200ms] ease-premium ${
          loaded ? 'opacity-100 blur-0' : 'opacity-0 blur-md'
        } ${imgClassName}`}
      />
    </div>
  )
}
