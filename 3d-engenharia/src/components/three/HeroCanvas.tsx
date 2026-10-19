import { Component, lazy, Suspense, useCallback, useEffect, useState, type MutableRefObject, type ReactNode } from 'react'
import { hasWebGL } from '@/lib/webgl'
import { TowerFallback } from './TowerFallback'
import type { HeroInput } from './store'

const Scene = lazy(() => import('./Scene'))

class SceneBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: unknown) {
    console.warn('[3D] Cena desativada após erro; exibindo alternativa estática.', error)
    this.props.onError()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

/**
 * Carrega a cena 3D sob demanda, com indicador de progresso, alternativa
 * visual sem WebGL e tratamento de erros (falha de carregamento, perda de contexto).
 */
export function HeroCanvas({
  input,
  active,
  quality,
  onReady,
}: {
  input: MutableRefObject<HeroInput>
  active: boolean
  quality: 'high' | 'low'
  onReady?: () => void
}) {
  const [supported, setSupported] = useState<boolean | null>(null)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => setSupported(hasWebGL()), [])

  const handleReady = useCallback(() => {
    setReady(true)
    onReady?.()
  }, [onReady])
  const handleFail = useCallback(() => {
    setFailed(true)
    onReady?.()
  }, [onReady])

  useEffect(() => {
    if (supported === false) onReady?.()
  }, [supported, onReady])

  if (supported === false || failed) {
    return <TowerFallback note={failed ? 'Visualização 3D indisponível neste dispositivo.' : undefined} />
  }

  return (
    <>
      <div
        className={`absolute inset-0 transition-opacity duration-[1600ms] ease-premium ${ready ? 'opacity-100' : 'opacity-0'}`}
      >
        {supported && (
          <SceneBoundary onError={handleFail}>
            <Suspense fallback={null}>
              <Scene input={input} active={active} quality={quality} onReady={handleReady} onContextLost={handleFail} />
            </Suspense>
          </SceneBoundary>
        )}
      </div>
      <div
        className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-700 md:justify-end md:pr-[18vw] ${
          ready ? 'opacity-0' : 'opacity-100'
        }`}
        aria-hidden={ready}
      >
        <div className="flex flex-col items-center gap-4" role="status">
          <span className="relative block h-px w-40 overflow-hidden bg-white/10">
            <span className="absolute inset-y-0 left-0 w-1/3 animate-[loader_1.4s_ease-in-out_infinite] bg-metal-light" />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-steel-400">Carregando modelo 3D</span>
        </div>
      </div>
    </>
  )
}
