import { useLayoutEffect, useMemo, useRef, type MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Edifício procedural: torre com giro progressivo entre pavimentos, pele de
 * vidro, brises metálicos, lajes aparentes, embasamento e coroamento.
 * Tudo em InstancedMesh (poucas draw calls) para rodar bem no celular.
 *
 * A animação de entrada é controlada por `progress` (0..1), lido a cada quadro:
 *   0.00–0.35  traçado técnico (linhas) desenhado de baixo para cima
 *   0.15–0.85  pavimentos sobem um a um, acompanhados por um anel de "scan"
 *   0.80–1.00  janelas acendem e o traçado se recolhe
 */

export const FLOORS = 22
export const FLOOR_H = 0.3
export const PODIUM_H = 0.6
const W = 2.05
const D = 2.05
const TWIST = THREE.MathUtils.degToRad(1.55)
const FINS_PER_FACE = 7
const BAYS = 6
export const TOWER_TOP = PODIUM_H + FLOORS * FLOOR_H

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/** Progresso individual de cada pavimento dentro da janela de construção. */
function floorProgress(global: number, i: number) {
  const start = 0.15 + (i / FLOORS) * 0.6
  return easeOut(clamp01((global - start) / 0.12))
}

// Materiais compartilhados
function useMaterials() {
  return useMemo(
    () => ({
      glass: new THREE.MeshPhysicalMaterial({
        color: '#7f93a8',
        metalness: 0.92,
        roughness: 0.12,
        clearcoat: 1,
        clearcoatRoughness: 0.06,
        envMapIntensity: 2.2,
      }),
      slab: new THREE.MeshStandardMaterial({ color: '#d4d7db', roughness: 0.55, metalness: 0.08 }),
      fin: new THREE.MeshStandardMaterial({ color: '#8e959e', roughness: 0.32, metalness: 0.92, envMapIntensity: 1.2 }),
      champagne: new THREE.MeshStandardMaterial({ color: '#c8b38a', roughness: 0.28, metalness: 1, envMapIntensity: 1.4 }),
      window: new THREE.MeshBasicMaterial({ color: '#ffb35c', transparent: true, opacity: 0, toneMapped: false, blending: THREE.AdditiveBlending, depthWrite: false }),
      line: new THREE.LineBasicMaterial({ color: '#d8c7a3', transparent: true, opacity: 0.9, depthWrite: false }),
      ghost: new THREE.LineBasicMaterial({ color: '#8b96a3', transparent: true, opacity: 0.22, depthWrite: false }),
      scan: new THREE.LineBasicMaterial({ color: '#f1e6cc', transparent: true, opacity: 0, depthWrite: false, toneMapped: false }),
      scanGlow: new THREE.MeshBasicMaterial({
        color: '#f1e6cc',
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false,
        blending: THREE.AdditiveBlending,
      }),
    }),
    [],
  )
}

/** Traçado técnico: contorno de cada laje + arestas verticais torcidas. */
function useBlueprintGeometry() {
  return useMemo(() => {
    const pts: number[] = []
    const corners = (i: number) => {
      const y = PODIUM_H + i * FLOOR_H
      const a = i * TWIST
      const c = Math.cos(a)
      const s = Math.sin(a)
      return [
        [-W / 2, -D / 2],
        [W / 2, -D / 2],
        [W / 2, D / 2],
        [-W / 2, D / 2],
      ].map(([x, z]) => new THREE.Vector3(x * c + z * s, y, -x * s + z * c))
    }
    for (let i = 0; i <= FLOORS; i++) {
      const cs = corners(i)
      for (let k = 0; k < 4; k++) {
        const p = cs[k]
        const q = cs[(k + 1) % 4]
        pts.push(p.x, p.y, p.z, q.x, q.y, q.z)
      }
      if (i < FLOORS) {
        const up = corners(i + 1)
        for (let k = 0; k < 4; k++) pts.push(cs[k].x, cs[k].y, cs[k].z, up[k].x, up[k].y, up[k].z)
      }
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return g
  }, [])
}

export function Building({ progressRef }: { progressRef: MutableRefObject<number> }) {
  const m = useMaterials()
  const blueprint = useBlueprintGeometry()

  const slabs = useRef<THREE.InstancedMesh>(null!)
  const glass = useRef<THREE.InstancedMesh>(null!)
  const fins = useRef<THREE.InstancedMesh>(null!)
  const windows = useRef<THREE.InstancedMesh>(null!)
  const lines = useRef<THREE.LineSegments>(null!)
  const scan = useRef<THREE.Group>(null!)
  const crown = useRef<THREE.Group>(null!)
  const podium = useRef<THREE.Group>(null!)
  const lastBuilt = useRef(-1)

  const finCount = FLOORS * 4 * FINS_PER_FACE
  const windowCount = FLOORS * 4 * BAYS

  // Janelas acesas (sorteio determinístico, ~24%)
  const lit = useMemo(() => {
    let seed = 7
    const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
    return Array.from({ length: windowCount }, () => rnd() < 0.17)
  }, [windowCount])

  const dummy = useMemo(() => new THREE.Object3D(), [])
  const scanGeom = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const r = 0.95
    const hw = (W / 2) * 1.28 * r
    const hd = (D / 2) * 1.28 * r
    g.setAttribute(
      'position',
      new THREE.Float32BufferAttribute([-hw, 0, -hd, hw, 0, -hd, hw, 0, hd, -hw, 0, hd, -hw, 0, -hd], 3),
    )
    return g
  }, [])

  /** Recalcula as matrizes das instâncias para o progresso atual. */
  const layout = (global: number) => {
    let fi = 0
    let wi = 0
    for (let i = 0; i < FLOORS; i++) {
      const p = floorProgress(global, i)
      const y = PODIUM_H + i * FLOOR_H
      const rot = i * TWIST
      const sXZ = Math.max(0.0001, 0.86 + 0.14 * p)
      const sY = Math.max(0.0001, p)

      // Laje
      dummy.position.set(0, y + 0.025, 0)
      dummy.rotation.set(0, rot, 0)
      dummy.scale.set(sXZ * (p > 0 ? 1 : 0.0001), 1, sXZ * (p > 0 ? 1 : 0.0001))
      dummy.updateMatrix()
      slabs.current.setMatrixAt(i, dummy.matrix)

      // Vidro (cresce para cima a partir da laje)
      const gh = (FLOOR_H - 0.05) * sY
      dummy.position.set(0, y + 0.05 + gh / 2, 0)
      dummy.scale.set(sXZ, sY, sXZ)
      dummy.updateMatrix()
      glass.current.setMatrixAt(i, dummy.matrix)

      // Brises verticais + janelas, por fachada
      for (let f = 0; f < 4; f++) {
        const fa = rot + (f * Math.PI) / 2
        const c = Math.cos(fa)
        const s = Math.sin(fa)
        for (let j = 0; j < FINS_PER_FACE; j++) {
          const lx = -W / 2 + (j / (FINS_PER_FACE - 1)) * W
          const lz = D / 2 + 0.045
          dummy.position.set(lx * c + lz * s, y + 0.05 + gh / 2, -lx * s + lz * c)
          dummy.rotation.set(0, fa, 0)
          dummy.scale.set(1, sY, sXZ)
          dummy.updateMatrix()
          fins.current.setMatrixAt(fi++, dummy.matrix)
        }
        for (let j = 0; j < BAYS; j++) {
          const lx = -W / 2 + ((j + 0.5) / BAYS) * W
          const lz = D / 2 + 0.006
          const on = lit[wi] && p >= 1
          dummy.position.set(lx * c + lz * s, y + 0.05 + (FLOOR_H - 0.05) / 2, -lx * s + lz * c)
          dummy.rotation.set(0, fa, 0)
          dummy.scale.setScalar(on ? 1 : 0.0001)
          dummy.updateMatrix()
          windows.current.setMatrixAt(wi++, dummy.matrix)
        }
      }
    }
    slabs.current.instanceMatrix.needsUpdate = true
    glass.current.instanceMatrix.needsUpdate = true
    fins.current.instanceMatrix.needsUpdate = true
    windows.current.instanceMatrix.needsUpdate = true
  }

  useLayoutEffect(() => {
    layout(progressRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const twinkleClock = useRef(0)

  useFrame((state, delta) => {
    const g = progressRef.current

    // Atualiza instâncias apenas enquanto a construção está em andamento
    const builtKey = g >= 1 ? 1 : Math.round(g * 600) / 600
    if (builtKey !== lastBuilt.current) {
      layout(g)
      lastBuilt.current = builtKey
    }

    // Traçado técnico
    const total = blueprint.getAttribute('position').count
    const lp = easeInOut(clamp01(g / 0.38))
    blueprint.setDrawRange(0, Math.floor(total * lp))
    m.line.opacity = 0.85 * (1 - clamp01((g - 0.78) / 0.22)) + 0.1

    // Anel de scan acompanha o pavimento em construção
    const scanP = clamp01((g - 0.15) / 0.72)
    const scanY = PODIUM_H + scanP * FLOORS * FLOOR_H
    scan.current.position.y = scanY
    scan.current.rotation.y = scanP * FLOORS * TWIST
    const scanVis = Math.sin(Math.PI * clamp01((g - 0.12) / 0.8))
    m.scan.opacity = scanVis * 0.95
    m.scanGlow.opacity = scanVis * 0.14

    // Embasamento e coroamento
    const pp = easeOut(clamp01((g - 0.06) / 0.18))
    podium.current.scale.set(1, Math.max(0.0001, pp), 1)
    const cp = easeOut(clamp01((g - 0.84) / 0.14))
    crown.current.scale.set(1, Math.max(0.0001, cp), 1)
    crown.current.position.y = TOWER_TOP + (1 - cp) * 0.4

    // Janelas acendem no final e cintilam suavemente
    const wp = clamp01((g - 0.86) / 0.14)
    m.window.opacity = wp * (0.9 + Math.sin(state.clock.elapsedTime * 0.8) * 0.06)
    if (g >= 1) {
      twinkleClock.current += delta
      if (twinkleClock.current > 2.4) {
        twinkleClock.current = 0
        const idx = Math.floor(Math.random() * windowCount)
        lit[idx] = !lit[idx]
        layout(1)
      }
    }
  })

  return (
    <group>
      {/* Embasamento */}
      <group ref={podium}>
        <mesh position={[0, PODIUM_H / 2, 0]} castShadow receiveShadow material={m.glass}>
          <boxGeometry args={[4.4, PODIUM_H - 0.04, 3.3]} />
        </mesh>
        <mesh position={[0, PODIUM_H - 0.02, 0]} castShadow receiveShadow material={m.slab}>
          <boxGeometry args={[4.55, 0.05, 3.45]} />
        </mesh>
        <mesh position={[0, 0.015, 0]} receiveShadow material={m.slab}>
          <boxGeometry args={[4.7, 0.03, 3.6]} />
        </mesh>
        {/* Friso metálico do embasamento */}
        <mesh position={[0, PODIUM_H - 0.075, 0]} material={m.champagne}>
          <boxGeometry args={[4.47, 0.04, 3.37]} />
        </mesh>
        {/* Pilares de fachada do embasamento */}
        {Array.from({ length: 11 }).map((_, i) => (
          <mesh key={i} position={[-2.2 + i * 0.44, PODIUM_H / 2 - 0.03, 1.665]} castShadow material={m.fin}>
            <boxGeometry args={[0.035, PODIUM_H - 0.1, 0.04]} />
          </mesh>
        ))}
      </group>

      <instancedMesh ref={slabs} args={[undefined, undefined, FLOORS]} material={m.slab} castShadow receiveShadow>
        <boxGeometry args={[W + 0.14, 0.05, D + 0.14]} />
      </instancedMesh>
      <instancedMesh ref={glass} args={[undefined, undefined, FLOORS]} material={m.glass} castShadow receiveShadow>
        <boxGeometry args={[W, FLOOR_H - 0.05, D]} />
      </instancedMesh>
      <instancedMesh ref={fins} args={[undefined, undefined, finCount]} material={m.fin} castShadow>
        <boxGeometry args={[0.03, FLOOR_H - 0.05, 0.09]} />
      </instancedMesh>
      <instancedMesh ref={windows} args={[undefined, undefined, windowCount]} material={m.window}>
        <planeGeometry args={[(W / BAYS) * 0.7, (FLOOR_H - 0.05) * 0.72]} />
      </instancedMesh>

      {/* Coroamento */}
      <group ref={crown} position={[0, TOWER_TOP, 0]} rotation={[0, FLOORS * TWIST, 0]}>
        <mesh position={[0, 0.03, 0]} castShadow material={m.slab}>
          <boxGeometry args={[W + 0.14, 0.06, D + 0.14]} />
        </mesh>
        {[
          // anel superior
          [0, 0.46, D / 2 + 0.04, W + 0.12, 0.035, 0.035],
          [0, 0.46, -D / 2 - 0.04, W + 0.12, 0.035, 0.035],
          [W / 2 + 0.04, 0.46, 0, 0.035, 0.035, D + 0.12],
          [-W / 2 - 0.04, 0.46, 0, 0.035, 0.035, D + 0.12],
          // montantes de canto
          ...[-1, 1].flatMap((sx) => [-1, 1].map((sz) => [sx * (W / 2 + 0.04), 0.25, sz * (D / 2 + 0.04), 0.035, 0.42, 0.035])),
        ].map(([x, y, z, w, h, d], i) => (
          <mesh key={i} position={[x, y, z]} castShadow material={m.champagne}>
            <boxGeometry args={[w, h, d]} />
          </mesh>
        ))}
        <mesh position={[0.45, 0.85, -0.3]} castShadow material={m.fin}>
          <cylinderGeometry args={[0.018, 0.03, 1.2, 8]} />
        </mesh>
      </group>

      {/* Traçado técnico */}
      <lineSegments ref={lines} geometry={blueprint} material={m.line} />

      {/* Anel de scan */}
      <group ref={scan}>
        <lineLoop geometry={scanGeom} material={m.scan} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} material={m.scanGlow}>
          <planeGeometry args={[W * 1.22, D * 1.22]} />
        </mesh>
      </group>

      {/* Volumes "em projeto" ao fundo (apenas arestas) */}
      <GhostVolume position={[-3.6, 0, -2.6]} size={[1.6, 3.6, 1.6]} material={m.ghost} />
      <GhostVolume position={[3.4, 0, -3.4]} size={[2.2, 2.1, 1.4]} material={m.ghost} />
    </group>
  )
}

function GhostVolume({
  position,
  size,
  material,
}: {
  position: [number, number, number]
  size: [number, number, number]
  material: THREE.LineBasicMaterial
}) {
  const geom = useMemo(() => {
    const box = new THREE.BoxGeometry(...size)
    const edges = new THREE.EdgesGeometry(box)
    box.dispose()
    return edges
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size[0], size[1], size[2]])
  return <lineSegments geometry={geom} material={material} position={[position[0], position[1] + size[1] / 2, position[2]]} />
}
