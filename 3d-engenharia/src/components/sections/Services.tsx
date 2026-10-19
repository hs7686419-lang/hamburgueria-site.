import { useState } from 'react'
import { ArrowUpRight, Play } from 'lucide-react'
import { services, type Service } from '@/content/services'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/ui/Reveal'
import { ResponsiveImage } from '@/components/ui/ResponsiveImage'
import { DemoBadge } from '@/components/ui/DemoBadge'
import { serviceIcons } from '@/components/ui/Icons'
import { onAnchorClick } from '@/lib/scroll'
import { LoopVideo } from '@/components/ui/LoopVideo'
import { VideoModal, type VideoSource } from '@/components/ui/VideoModal'

export const SERVICE_EVENT = 'select-service'

/** Pré-seleciona o serviço no formulário de orçamento. */
function preselect(service: Service) {
  window.dispatchEvent(new CustomEvent(SERVICE_EVENT, { detail: service.title }))
}

export function Services() {
  const hasDemo = services.some((s) => s.demo)
  const [video, setVideo] = useState<VideoSource | null>(null)
  return (
    <section id="servicos" aria-labelledby="servicos-titulo" className="relative bg-ink-900 py-28 md:py-40">
      <div aria-hidden="true" className="grid-lines pointer-events-none absolute inset-0 opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent_60%)]" />
      <div className="container-site relative">
        <SectionHeading
          index="02"
          eyebrow="Serviços"
          title={['Da construção', 'às chaves na mão.']}
          text="Da construção à venda: a 3D Engenharia executa, administra e comercializa obras residenciais e comerciais em Campo Belo e região."
          align="split"
          titleId="servicos-titulo"
        />
        {hasDemo && (
          <Reveal className="mt-8">
            <DemoBadge label="Itens marcados são exemplos — confirme antes de publicar" />
          </Reveal>
        )}

        <ul className="mt-16 grid gap-px overflow-hidden border border-white/[0.07] bg-white/[0.07] lg:grid-cols-3">
          {services.map((s, i) => (
            <ServiceCard key={s.id} service={s} index={i} onPlay={setVideo} />
          ))}
        </ul>
      </div>
      <VideoModal video={video} onClose={() => setVideo(null)} />
    </section>
  )
}

function ServiceCard({ service, index, onPlay }: { service: Service; index: number; onPlay: (v: VideoSource) => void }) {
  const Icon = serviceIcons[service.icon]
  const href = service.href ?? '#contato'
  const v = service.video
  return (
    <Reveal as="li" delay={(index % 3) * 0.08} className="group relative bg-ink-900">
      <article className="relative flex h-full min-h-[520px] flex-col overflow-hidden p-8 md:min-h-[600px] md:p-10">
        {/* Mídia de fundo: vídeo em loop (ou imagem), realçado ao passar o mouse */}
        <div className="absolute inset-0 opacity-50 transition-opacity duration-700 ease-premium group-focus-within:opacity-90 group-hover:opacity-90">
          {v ? (
            <LoopVideo
              src={v.loop}
              poster={service.image.src}
              className="h-full w-full scale-105 object-cover grayscale-[20%] transition-transform duration-[1400ms] ease-premium group-hover:scale-100"
            />
          ) : (
            <ResponsiveImage
              image={service.image}
              sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
              className="h-full w-full"
              imgClassName="scale-110 grayscale-[30%] transition-transform duration-[1400ms] ease-premium group-hover:scale-100"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/70 to-ink-950/20" />
        </div>

        <div className="relative flex items-start justify-between">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.18] bg-ink-950/40 text-metal-light backdrop-blur-md transition-colors duration-500 group-hover:border-metal-light/50 group-hover:bg-metal-light/10">
            <Icon className="h-5 w-5" strokeWidth={1.4} aria-hidden="true" />
          </span>
          <span className="flex items-center gap-3">
            {service.demo && <DemoBadge label="Exemplo" />}
            <span className="font-mono text-[11px] text-steel-300">{String(index + 1).padStart(2, '0')}</span>
          </span>
        </div>

        <div className="relative mt-auto pt-24">
          <h3 className="text-2xl font-medium tracking-[-0.02em] text-white md:text-[1.75rem]">{service.title}</h3>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-steel-300 transition-colors duration-500 group-hover:text-steel-100">
            {service.description}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <a
              href={href}
              onClick={(e) => {
                preselect(service)
                if (href.startsWith('#')) onAnchorClick(e)
              }}
              className="group/link relative inline-flex items-center gap-2 text-sm text-white"
            >
              <span className="relative">
                {service.cta ?? 'Solicitar orçamento'}
                <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-metal-light transition-transform duration-500 ease-premium group-hover:scale-x-100" />
              </span>
              <ArrowUpRight className="h-4 w-4 transition-transform duration-500 ease-premium group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
              <span className="sr-only"> — {service.title}</span>
            </a>
            {v?.full && (
              <button
                type="button"
                onClick={() => onPlay({ src: v.full!, poster: v.poster, title: v.title ?? service.title })}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-ink-950/40 py-1.5 pl-1.5 pr-4 text-xs text-white backdrop-blur-md transition-colors hover:border-metal-light/60 hover:bg-white/10"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-ink-950">
                  <Play className="ml-0.5 h-3 w-3 fill-current" aria-hidden="true" />
                </span>
                Assistir ao vídeo
              </button>
            )}
          </div>
        </div>
        <span aria-hidden="true" className="absolute bottom-0 left-0 h-px w-0 bg-metal-light transition-[width] duration-700 ease-premium group-hover:w-full" />
      </article>
    </Reveal>
  )
}
