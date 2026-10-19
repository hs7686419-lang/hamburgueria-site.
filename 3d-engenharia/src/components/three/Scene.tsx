import { Suspense, useEffect, useMemo, useRef, type MutableRefObject, type ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Grid, Lightformer, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { Building, TOWER_TOP } from './Building'
import { PITCH_LIMIT_DOWN, PITCH_LIMIT_UP, YAW_LIMIT, type HeroInput } from './store'
import { site } from '@/config/site'
import { ModelErrorBoundary } from './ModelErrorBoundary'

const INTRO_SECONDS = 4.2
const damp = THREE.MathUtils.damp
const clamp = THREE.MathUtils.clamp
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export interface SceneProps {
  input: MutableRefObject<HeroInput>
  active: boolean
  quality: 'high' | 'low'
  onReady: () => void
  onContextLost: () => void
}

/** Canvas do hero. Carregado sob demanda (code splitting) pelo HeroCanvas. */
export default function Scene({ input, active, quality, onReady, onContextLost }: SceneProps) {
  const high = quality === 'high'
  return (
    <Canvas
      dpr={high ? [1, 1.75] : [1, 1.5]}
      shadows={high ? 'soft' : false}
      camera={{ position: [6, 1.5, 11], fov: 30, near: 0.1, far: 120 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      frameloop={active ? 'always' : 'never'}
      onCreated={({ gl }) => {
        gl.toneMappingExposure = 1.05
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault()
          onContextLost()
        })
      }}
      aria-hidden="true"
    >
      <fog attach="fog" args={['#07090c', 20, 46]} />
      <Lights high={high} />
      <Environment resolution={high ? 256 : 128} frames={1} background={false}>
        {/* Base do ambiente: céu noturno azulado, para o vidro nunca refletir preto puro */}
        <color attach="background" args={['#3b4756']} />
        <Lightformer form="rect" intensity={0.5} color="#0d1218" position={[0, -6, 0]} rotation-x={-Math.PI / 2} scale={[40, 40, 1]} />
        <Lightformer form="rect" intensity={2.4} color="#ffffff" position={[0, 9, 0]} rotation-x={Math.PI / 2} scale={[14, 6, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#f3e7cf" position={[-8, 3, 4]} rotation-y={Math.PI / 2.5} scale={[2, 10, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#bcd0e6" position={[8, 2.5, -2]} rotation-y={-Math.PI / 2.2} scale={[2.5, 9, 1]} />
        <Lightformer form="rect" intensity={0.8} color="#ffffff" position={[0, 2, -9]} scale={[16, 1.2, 1]} />
        <Lightformer form="ring" intensity={0.6} color="#d8c7a3" position={[4, 6, 8]} scale={3} />
        {/* Faixas de horizonte em volta da cena: dão reflexo às fachadas de vidro */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const a = (i / 6) * Math.PI * 2
          return (
            <Lightformer
              key={i}
              form="rect"
              intensity={i % 2 ? 0.8 : 1.4}
              color={i % 3 === 0 ? '#f1e6cc' : '#c9d6e6'}
              position={[Math.sin(a) * 12, -1.2 + (i % 2) * 3.2, Math.cos(a) * 12]}
              rotation-y={a + Math.PI}
              scale={[6, 1.2 + (i % 2) * 0.8, 1]}
            />
          )
        })}
      </Environment>
      <Rig input={input} onReady={onReady}>
        {(progress) => (
          <ModelErrorBoundary fallback={<Building progressRef={progress} />}>
            {site.hero3d.modelUrl ? (
              <Suspense fallback={<Building progressRef={progress} />}>
                <OfficialModel url={site.hero3d.modelUrl} scale={site.hero3d.modelScale} progress={progress} />
              </Suspense>
            ) : (
              <Building progressRef={progress} />
            )}
          </ModelErrorBoundary>
        )}
      </Rig>
      <Ground high={high} />
    </Canvas>
  )
}

function Lights({ high }: { high: boolean }) {
  const key = useRef<THREE.DirectionalLight>(null!)
  useFrame(({ clock }) => {
    // Iluminação dinâmica: o "sol" percorre lentamente um arco sobre a cena
    const t = clock.elapsedTime * 0.05
    key.current.position.set(Math.cos(t) * 11, 14 + Math.sin(t * 1.7) * 1.5, 6 + Math.sin(t) * 5)
  })
  return (
    <>
      <hemisphereLight args={['#c3cedc', '#07090c', 0.45]} />
      <directionalLight
        ref={key}
        position={[10, 14, 6]}
        intensity={2.4}
        color="#fff2de"
        castShadow={high}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={11}
        shadow-camera-bottom={-6}
        shadow-camera-near={1}
        shadow-camera-far={45}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
      />
      <directionalLight position={[-9, 6, -8]} intensity={1.3} color="#7fa3c9" />
      <pointLight position={[0, 0.7, 3.4]} intensity={6} distance={7} decay={2} color="#ffcf93" />
    </>
  )
}

function Ground({ high }: { high: boolean }) {
  const shadowBlob = useMemo(() => {
    // Sombra de contato barata (textura radial) para dispositivos sem shadow map
    const c = document.createElement('canvas')
    c.width = c.height = 128
    const ctx = c.getContext('2d')!
    const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 64)
    g.addColorStop(0, 'rgba(0,0,0,0.75)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 128, 128)
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#0b0e12" roughness={0.95} metalness={0} />
      </mesh>
      {!high && (
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.004, 0]}>
          <planeGeometry args={[9, 7.5]} />
          <meshBasicMaterial map={shadowBlob} transparent depthWrite={false} />
        </mesh>
      )}
      <Grid
        position={[0, 0.006, 0]}
        args={[60, 60]}
        cellSize={0.5}
        cellThickness={0.6}
        cellColor="#1a2129"
        sectionSize={2.5}
        sectionThickness={1}
        sectionColor="#2e3843"
        fadeDistance={34}
        fadeStrength={1.6}
        infiniteGrid
      />
    </group>
  )
}

/**
 * Controla câmera, rotação do modelo e progresso da animação de entrada.
 * - mouse: a câmera ajusta a perspectiva (parallax)
 * - arraste: gira o modelo dentro dos limites (YAW/PITCH_LIMIT)
 * - rolagem: a câmera sobe e se afasta na saída do hero
 */
function Rig({
  input,
  onReady,
  children,
}: {
  input: MutableRefObject<HeroInput>
  onReady: () => void
  children: (progress: MutableRefObject<number>) => ReactNode
}) {
  const progress = useRef(input.current.reduced ? 1 : 0)
  const model = useRef<THREE.Group>(null!)
  const target = useMemo(() => new THREE.Vector3(), [])
  const cam = useRef({ az: 1.2, h: 0.9, r: 13, yaw: 0, pitch: 0, look: 2.6 })
  const started = useRef(false)
  const { size } = useThree()

  useEffect(() => {
    // Primeiro quadro desenhado → avisa o DOM para revelar o canvas
    const id = requestAnimationFrame(() => onReady())
    return () => cancelAnimationFrame(id)
  }, [onReady])

  useFrame((state, delta) => {
    const s = input.current
    const dt = Math.min(delta, 1 / 20)
    const t = state.clock.elapsedTime

    if (!started.current) {
      started.current = true
      if (s.reduced) cam.current = { az: 0.62, h: 5.4, r: 22, yaw: 0, pitch: 0, look: 3.9 }
    }

    // Progresso da animação cinematográfica
    if (progress.current < 1) progress.current = Math.min(1, progress.current + dt / INTRO_SECONDS)
    const intro = easeInOut(Math.min(1, progress.current * 1.08))

    // Enquadramento responsivo
    const aspect = size.width / size.height
    const portrait = aspect < 0.9
    const offsetX = aspect > 1.15 ? clamp((aspect - 1) * 2.4, 1.1, 3.1) : 0
    const fit = portrait ? 1.7 : aspect < 1.15 ? 1.2 : 1

    // Posição-alvo da câmera (coordenadas esféricas em torno do edifício)
    const idle = s.reduced ? 0 : 1
    const parallax = s.touch || s.reduced ? 0 : 1
    let az = THREE.MathUtils.lerp(1.2, 0.62, intro) + s.px * 0.16 * parallax + Math.sin(t * 0.12) * 0.05 * idle
    let h = THREE.MathUtils.lerp(0.9, 5.4, intro) + s.py * 1.1 * parallax + Math.sin(t * 0.21) * 0.15 * idle
    let r = THREE.MathUtils.lerp(13, 22, intro) * fit
    let look = THREE.MathUtils.lerp(2.6, TOWER_TOP * 0.52, intro)

    // Saída do hero
    h += s.scroll * 5
    r += s.scroll * 4
    look += s.scroll * 2.4
    az += s.scroll * 0.35

    const c = cam.current
    const k = progress.current < 1 ? 6 : 2.6
    c.az = damp(c.az, az, k, dt)
    c.h = damp(c.h, h, k, dt)
    c.r = damp(c.r, r, k, dt)
    c.look = damp(c.look, look, k, dt)

    state.camera.position.set(Math.sin(c.az) * c.r, c.h, Math.cos(c.az) * c.r)
    target.set(0, c.look, 0)
    state.camera.lookAt(target)

    // Desloca o enquadramento para a direita no desktop (texto à esquerda)
    const cam3 = state.camera as THREE.PerspectiveCamera
    const shift = offsetX / (2 * c.r * Math.tan(THREE.MathUtils.degToRad(cam3.fov / 2)) * aspect)
    // No celular (retrato) o edifício sobe para a metade superior, acima do texto
    const shiftY = portrait ? 0.2 * size.height : 0
    cam3.setViewOffset(size.width, size.height, -shift * size.width, shiftY, size.width, size.height)

    // Rotação do modelo: arraste (limitado) + leve oscilação contínua
    const inactive = performance.now() / 1000 - s.lastInteraction > 3.5 && !s.dragging
    if (inactive) {
      // Retorna devagar à posição de repouso depois de alguns segundos
      s.dragYaw = damp(s.dragYaw, 0, 0.6, dt)
      s.dragPitch = damp(s.dragPitch, 0, 0.6, dt)
    }
    const yaw = clamp(s.dragYaw, -YAW_LIMIT, YAW_LIMIT) + Math.sin(t * 0.18) * 0.06 * idle
    const pitch = clamp(s.dragPitch, PITCH_LIMIT_DOWN, PITCH_LIMIT_UP)
    c.yaw = damp(c.yaw, yaw, s.dragging ? 10 : 3.5, dt)
    c.pitch = damp(c.pitch, pitch, s.dragging ? 10 : 3.5, dt)
    model.current.rotation.set(c.pitch, c.yaw, 0)
  })

  return <group ref={model}>{children(progress)}</group>
}

/** Modelo oficial (.glb/.gltf) definido em site.hero3d.modelUrl. */
function OfficialModel({ url, scale, progress }: { url: string; scale: number; progress: MutableRefObject<number> }) {
  const { scene } = useGLTF(url)
  const ref = useRef<THREE.Group>(null!)
  useEffect(() => {
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (mesh.isMesh) {
        mesh.castShadow = true
        mesh.receiveShadow = true
      }
    })
  }, [scene])
  useFrame(() => {
    const p = easeInOut(Math.min(1, progress.current * 1.3))
    ref.current.scale.set(scale, Math.max(0.0001, scale * p), scale)
  })
  return (
    <group ref={ref}>
      <primitive object={scene} />
    </group>
  )
}
