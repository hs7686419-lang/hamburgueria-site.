import { Component, type ReactNode } from 'react'

/** Se o modelo oficial falhar ao carregar, volta para o edifício procedural. */
export class ModelErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: unknown) {
    console.warn('[3D] Falha ao carregar o modelo oficial; usando o modelo procedural.', error)
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
