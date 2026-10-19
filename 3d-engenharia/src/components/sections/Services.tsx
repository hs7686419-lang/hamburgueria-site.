import { ArrowUpRight } from 'lucide-react'
import { services, type Service } from '@/content/services'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/ui/Reveal'
import { ResponsiveImage } from '@/components/ui/ResponsiveImage'
import { DemoBadge } from '@/components/ui/DemoBadge'
import { serviceIcons } from '@/components/ui/Icons'
import { onAnchorClick } from '@/lib/scroll'

export const SERVICE_EVENT = 'select-service'

/** Pré-seleciona o serviço no formulário de orçamento. */
function preselect(service: Service) {
  window.dispatchEvent(new CustomEvent(SERVICE_EVENT, { detail: service.title }))
}

export function Services() {
  const hasDemo = services.some((s) => s.demo)
  return (
    <section id="servicos" aria-labelledby="servicos-titulo" className="relative bg-ink-900 py-28 md:py-40">
      <div aria-hidden="true" className="grid-lines pointer-events-none absolute inset-0 opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent_60%)]" />
      <div className="container-site relative">
        <SectionHeading
          index="02"
          eyebrow="Serviços"
          title={['Soluções de engenharia', 'do estudo à entrega.']}
          text="Obras residenciais e comerciais em Campo Belo e região. Cada serviço pode ser solicitado diretamente pelo formulário de orçamento."
          align="split"
          titleId="servicos-titulo"
        />
        {hasDemo && (
          <Reveal className="mt-8">
            <DemoBadge label="Itens marcados são exemplos — confirme antes de publicar" />
          </Reveal>
        )}

        <ul className="mt-16 grid gap-px overflow-hidden border border-white/[0.07] bg-white/[0.07] sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <ServiceCard key={s.id} service={s} index={i} />
          ))}
        </ul>
      </div>
    </section>
  )
}

function ServiceCard({ service, index }: { service: Service; index: number }) {
  const Icon = serviceIcons[service.icon]
  const href = service.href ?? '#contato'
  return (
    <Reveal as="li" delay={(index % 3) * 0.08} className="group relative bg-ink-900">
      <article className="relative flex h-full min-h-[440px] flex-col overflow-hidden p-8 md:p-10">
        {/* Imagem revelada ao passar o mouse (sempre visível em telas de toque) */}
        <div className="absolute inset-0 opacity-[0.22] transition-opacity duration-700 ease-premium group-focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-40">
          <ResponsiveImage
            image={service.image}
            sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
            className="h-full w-full"
            imgClassName="scale-110 grayscale-[30%] transition-transform duration-[1400ms] ease-premium group-hover:scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/80 to-ink-950/40" />
        </div>

        <div className="relative flex items-start justify-between">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.12] text-metal-light transition-colors duration-500 group-hover:border-metal-light/50 group-hover:bg-metal-light/10">
            <Icon className="h-5 w-5" strokeWidth={1.4} aria-hidden="true" />
          </span>
          <span className="flex items-center gap-3">
            {service.demo && <DemoBadge label="Exemplo" />}
            <span className="font-mono text-[11px] text-steel-500">{String(index + 1).padStart(2, '0')}</span>
          </span>
        </div>

        <div className="relative mt-auto pt-24">
          <h3 className="text-2xl font-medium tracking-[-0.02em] text-white">{service.title}</h3>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-steel-400 transition-colors duration-500 group-hover:text-steel-200">
            {service.description}
          </p>
          <a
            href={href}
            onClick={(e) => {
              preselect(service)
              if (href.startsWith('#')) onAnchorClick(e)
            }}
            className="mt-8 inline-flex items-center gap-2 text-sm text-white after:absolute after:inset-0 after:content-['']"
          >
            <span className="relative">
              Solicitar orçamento
              <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-metal-light transition-transform duration-500 ease-premium group-hover:scale-x-100" />
            </span>
            <span className="inline-flex" aria-hidden="true">
              <ArrowUpRight className="h-4 w-4 transition-transform duration-500 ease-premium group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
            <span className="sr-only"> para {service.title}</span>
          </a>
        </div>
        <span aria-hidden="true" className="absolute bottom-0 left-0 h-px w-0 bg-metal-light transition-[width] duration-700 ease-premium group-hover:w-full" />
      </article>
    </Reveal>
  )
}
