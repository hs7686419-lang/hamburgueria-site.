import { Reveal, RevealTitle } from './Reveal'

export function SectionHeading({
  eyebrow,
  title,
  text,
  index,
  align = 'left',
  titleId,
}: {
  eyebrow: string
  title: string[]
  text?: string
  /** Numeração técnica da seção, ex.: "02". */
  index?: string
  align?: 'left' | 'split'
  titleId?: string
}) {
  return (
    <div className={align === 'split' ? 'grid gap-8 lg:grid-cols-12 lg:items-end' : 'max-w-3xl'}>
      <div className={align === 'split' ? 'lg:col-span-7' : ''}>
        <Reveal className="mb-6 flex items-center gap-4">
          {index && <span className="font-mono text-[11px] text-steel-500">{index}</span>}
          <span className="eyebrow">{eyebrow}</span>
        </Reveal>
        <RevealTitle id={titleId} lines={title} className="display-2" accentLast />
      </div>
      {text && (
        <Reveal delay={0.15} className={align === 'split' ? 'lg:col-span-5 lg:pb-2' : 'mt-6'}>
          <p className="max-w-md text-base leading-relaxed text-steel-300 md:text-lg">{text}</p>
        </Reveal>
      )}
    </div>
  )
}
