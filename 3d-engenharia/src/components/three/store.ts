/**
 * Estado compartilhado entre o DOM do hero e a cena 3D.
 * É um objeto mutável (sem re-render): os eventos de mouse/toque/rolagem
 * escrevem aqui e o loop de animação da cena lê a cada quadro.
 */
export interface HeroInput {
  /** Ponteiro normalizado em relação ao hero (-1..1). */
  px: number
  py: number
  /** Rotação acumulada pelo arraste (radianos, já limitada). */
  dragYaw: number
  dragPitch: number
  dragging: boolean
  lastInteraction: number
  /** Progresso da saída do hero ao rolar (0..1). */
  scroll: number
  /** Movimento reduzido (prefers-reduced-motion). */
  reduced: boolean
  /** Dispositivo de toque (sem parallax de ponteiro). */
  touch: boolean
}

export const YAW_LIMIT = 0.62 // ≈ 35°
export const PITCH_LIMIT_UP = 0.16
export const PITCH_LIMIT_DOWN = -0.1

export function createHeroInput(): HeroInput {
  return {
    px: 0,
    py: 0,
    dragYaw: 0,
    dragPitch: 0,
    dragging: false,
    lastInteraction: 0,
    scroll: 0,
    reduced: false,
    touch: false,
  }
}
