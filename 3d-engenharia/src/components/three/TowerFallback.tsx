/**
 * Alternativa visual quando WebGL não está disponível (ou o 3D falha):
 * desenho técnico isométrico do edifício em SVG, com traçado animado.
 * Não simula interação — apenas mantém a composição da primeira tela.
 */
export function TowerFallback({ note }: { note?: string }) {
  const floors = 18
  const lines = []
  for (let i = 0; i <= floors; i++) {
    const y = 520 - i * 22
    const dx = i * 1.2
    lines.push(
      <path
        key={i}
        d={`M${300 + dx} ${y} L${400 + dx * 0.4} ${y - 50} L${500 - dx} ${y} L${400 - dx * 0.4} ${y + 50} Z`}
        fill={i === floors ? 'rgba(216,199,163,0.08)' : 'none'}
        stroke="currentColor"
        strokeOpacity={i % 5 === 0 ? 0.7 : 0.28}
        strokeWidth={i % 5 === 0 ? 1.1 : 0.8}
        className="tower-line"
        style={{ animationDelay: `${i * 60}ms` }}
      />,
    )
  }
  return (
    <div className="absolute inset-0 flex items-center justify-end overflow-hidden md:pr-[6vw]" role="img" aria-label="Desenho técnico de um edifício">
      <svg viewBox="200 80 400 520" className="h-[78%] w-auto text-metal-light max-md:mx-auto max-md:h-[52%] max-md:-translate-y-[18%] max-md:opacity-60">
        <style>{`.tower-line{stroke-dasharray:600;stroke-dashoffset:600;animation:draw 1.8s cubic-bezier(.22,1,.36,1) forwards}@keyframes draw{to{stroke-dashoffset:0}}`}</style>
        {lines}
        <line x1="300" y1="520" x2="321.6" y2="124" stroke="currentColor" strokeOpacity=".5" />
        <line x1="500" y1="520" x2="478.4" y2="124" stroke="currentColor" strokeOpacity=".5" />
        <line x1="400" y1="570" x2="407.2" y2="174" stroke="currentColor" strokeOpacity=".35" />
      </svg>
      {note && (
        <p className="absolute bottom-24 right-6 max-w-[16rem] text-right font-mono text-[10px] uppercase tracking-[0.18em] text-steel-500">{note}</p>
      )}
    </div>
  )
}
