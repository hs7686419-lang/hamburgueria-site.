import { about } from '@/content/about'
import { Reveal, RevealTitle } from '@/components/ui/Reveal'
import { Parallax } from '@/components/ui/Parallax'
import { ResponsiveImage } from '@/components/ui/ResponsiveImage'
import { DemoBadge } from '@/components/ui/DemoBadge'

export function About() {
  return (
    <section id="sobre" aria-labelledby="sobre-titulo" className="relative overflow-hidden py-28 md:py-40">
      <div className="container-site">
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-10">
          {/* Coluna de texto */}
          <div className="lg:col-span-6 lg:pr-8 xl:col-span-5">
            <Reveal className="mb-6 flex items-center gap-4">
              <span className="font-mono text-[11px] text-steel-500">01</span>
              <span className="eyebrow">{about.eyebrow}</span>
            </Reveal>
            <RevealTitle id="sobre-titulo" lines={about.title} className="display-2" accentLast />
            <Reveal delay={0.1}>
              <p className="mt-10 text-lg leading-relaxed text-steel-200 md:text-xl md:leading-relaxed">{about.lead}</p>
            </Reveal>
            {about.paragraphs.map((p, i) => (
              <Reveal key={i} delay={0.15 + i * 0.05}>
                <p className="mt-6 leading-relaxed text-steel-400">{p}</p>
              </Reveal>
            ))}

            <ul className="mt-14 divide-y divide-white/[0.07] border-y border-white/[0.07]">
              {about.pillars.map((p, i) => (
                <Reveal as="li" key={p.title} delay={0.1 + i * 0.08} className="group grid grid-cols-[3rem_1fr] gap-4 py-6">
                  <span className="font-mono text-[11px] text-metal-light">0{i + 1}</span>
                  <div>
                    <h3 className="text-lg font-medium tracking-tight text-white transition-transform duration-500 ease-premium group-hover:translate-x-1">
                      {p.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-steel-400">{p.text}</p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>

          {/* Composição editorial de imagens */}
          <div className="relative lg:col-span-6 xl:col-span-7">
            <div className="relative grid grid-cols-12 gap-4 lg:h-full">
              <Reveal className="col-span-12 sm:col-span-9 lg:col-span-10 lg:col-start-3" y={50}>
                <figure className="relative">
                  <Parallax offset={50} className="aspect-[4/5] sm:aspect-[5/6]">
                    <ResponsiveImage image={about.images.primary} sizes="(min-width:1024px) 45vw, 90vw" className="h-full w-full" imgClassName="object-[50%_88%] grayscale-[35%] contrast-[1.05]" />
                  </Parallax>
                  <DemoBadge className="absolute left-4 top-4" label="Foto ilustrativa" />
                  <figcaption className="absolute -left-3 bottom-10 hidden origin-bottom-left -rotate-90 font-mono text-[10px] uppercase tracking-[0.24em] text-steel-500 lg:block">
                    Fig. 01 — Planejamento
                  </figcaption>
                </figure>
              </Reveal>
              <Reveal className="col-span-8 col-start-5 -mt-24 sm:col-span-6 sm:col-start-7 lg:absolute lg:-bottom-16 lg:left-0 lg:col-span-5 lg:mt-0 lg:w-[42%]" delay={0.15} y={80}>
                <figure className="relative border-8 border-ink-950">
                  <Parallax offset={30} className="aspect-[4/5]">
                    <ResponsiveImage image={about.images.secondary} sizes="(min-width:1024px) 22vw, 50vw" className="h-full w-full" imgClassName="grayscale-[35%]" />
                  </Parallax>
                </figure>
              </Reveal>
              {/* Detalhe gráfico técnico */}
              <div aria-hidden="true" className="pointer-events-none absolute -right-6 -top-10 hidden h-40 w-40 lg:block">
                <svg viewBox="0 0 160 160" className="h-full w-full text-white/15">
                  <circle cx="80" cy="80" r="60" fill="none" stroke="currentColor" />
                  <circle cx="80" cy="80" r="2" fill="#d8c7a3" />
                  <line x1="0" y1="80" x2="160" y2="80" stroke="currentColor" strokeDasharray="2 6" />
                  <line x1="80" y1="0" x2="80" y2="160" stroke="currentColor" strokeDasharray="2 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {about.team.length > 0 && (
          <div className="mt-32">
            <Reveal>
              <h3 className="eyebrow mb-10">Equipe</h3>
            </Reveal>
            <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {about.team.map((m, i) => (
                <Reveal as="li" key={m.name} delay={i * 0.06}>
                  <ResponsiveImage image={m.photo} className="aspect-[3/4]" placeholderLabel="Foto do profissional" />
                  <p className="mt-4 text-white">{m.name}</p>
                  <p className="text-sm text-steel-400">{m.role}</p>
                </Reveal>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
