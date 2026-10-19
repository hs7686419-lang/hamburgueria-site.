import { useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { projects, type Project } from '@/content/projects'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/ui/Reveal'
import { ResponsiveImage } from '@/components/ui/ResponsiveImage'
import { DemoBadge } from '@/components/ui/DemoBadge'
import { ProjectModal } from './ProjectModal'

const ALL = 'Todos'
const ease = [0.22, 1, 0.36, 1] as const

/**
 * Grade assimétrica automática (desktop): blocos de 4 itens que se encaixam
 * sem vazios (7×2 + 5×3 / 7×3 + 5×2, espelhado no bloco seguinte). O último
 * bloco incompleto é redistribuído para não deixar buracos.
 */
const BLOCK_A = ['lg:col-span-7 lg:row-span-2', 'lg:col-span-5 lg:row-span-3', 'lg:col-span-7 lg:row-span-3', 'lg:col-span-5 lg:row-span-2']
const BLOCK_B = ['lg:col-span-5 lg:row-span-3', 'lg:col-span-7 lg:row-span-2', 'lg:col-span-5 lg:row-span-2', 'lg:col-span-7 lg:row-span-3']
const TAIL: Record<number, string[]> = {
  1: ['lg:col-span-12 lg:row-span-3'],
  2: ['lg:col-span-6 lg:row-span-3', 'lg:col-span-6 lg:row-span-3'],
  3: ['lg:col-span-4 lg:row-span-3', 'lg:col-span-4 lg:row-span-3', 'lg:col-span-4 lg:row-span-3'],
}
function spanFor(i: number, total: number) {
  const block = Math.floor(i / 4)
  const rem = total - block * 4
  if (rem < 4) return TAIL[rem][i % 4]
  return (block % 2 ? BLOCK_B : BLOCK_A)[i % 4]
}

export function Projects() {
  const reduce = useReducedMotion()
  const categories = useMemo(() => [ALL, ...Array.from(new Set(projects.map((p) => p.category)))], [])
  const [filter, setFilter] = useState(ALL)
  const [openId, setOpenId] = useState<string | null>(null)
  const list = filter === ALL ? projects : projects.filter((p) => p.category === filter)
  const current = projects.find((p) => p.id === openId) ?? null
  const hasDemo = projects.some((p) => p.demo)

  return (
    <section id="projetos" aria-labelledby="projetos-titulo" className="relative py-28 md:py-40">
      <div className="container-site">
        <SectionHeading
          index="03"
          eyebrow="Projetos"
          title={['Portfólio de', 'projetos.']}
          text="Obras entregues pela 3D Engenharia. Clique em um projeto para ver detalhes, localização e galeria de imagens."
          align="split"
          titleId="projetos-titulo"
        />

        <div className="mt-14 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          {categories.length > 2 && (
            <Reveal>
              <div role="group" aria-label="Filtrar projetos por categoria" className="-mx-1 flex flex-wrap gap-2">
                {categories.map((c) => {
                  const active = c === filter
                  return (
                    <button
                      key={c}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setFilter(c)}
                      className={`relative rounded-full border px-4 py-2 text-[13px] transition-colors duration-300 ${
                        active ? 'border-transparent text-ink-950' : 'border-white/10 text-steel-300 hover:border-white/25 hover:text-white'
                      }`}
                    >
                      {active && (
                        <motion.span layoutId="filter-pill" className="absolute inset-0 rounded-full bg-steel-50" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />
                      )}
                      <span className="relative">{c}</span>
                    </button>
                  )
                })}
              </div>
            </Reveal>
          )}
          {hasDemo && (
            <Reveal delay={0.1}>
              <DemoBadge label="Itens demonstrativos estão identificados" />
            </Reveal>
          )}
        </div>

        <motion.ul layout={!reduce} className="mt-10 grid gap-4 sm:grid-cols-2 lg:auto-rows-[150px] lg:grid-cols-12 lg:gap-5 xl:auto-rows-[170px]">
          <AnimatePresence mode="popLayout" initial={false}>
            {list.map((p, i) => (
              <motion.li
                key={p.id}
                layout={!reduce}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.6, ease }}
                className={spanFor(i, list.length)}
              >
                <Reveal delay={(i % 3) * 0.07} y={40} className="h-full">
                  <ProjectCard project={p} onOpen={() => setOpenId(p.id)} />
                </Reveal>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </div>

      <ProjectModal project={current} onClose={() => setOpenId(null)} />
    </section>
  )
}

function ProjectCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      className="group relative block h-full min-h-[320px] w-full overflow-hidden bg-ink-850 text-left sm:min-h-[380px] lg:min-h-0"
    >
      <ResponsiveImage
        image={project.images[0]}
        sizes="(min-width:1024px) 55vw, (min-width:640px) 50vw, 100vw"
        className="absolute inset-0 h-full w-full"
        imgClassName="grayscale-[25%] transition-[transform,filter] duration-[1600ms] ease-premium group-hover:scale-[1.06] group-hover:grayscale-0"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950/95 via-ink-950/30 to-transparent transition-opacity duration-700 group-hover:opacity-90" />
      {project.demo && <DemoBadge className="absolute left-5 top-5" label="Demonstrativo" />}
      <span className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-ink-950/40 text-white backdrop-blur-md transition-all duration-500 ease-premium group-hover:rotate-90 group-hover:border-metal-light/60 group-hover:bg-metal-light group-hover:text-ink-950">
        <Plus className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-metal-light">
          {project.category} <span className="text-steel-500">·</span> <span className="text-steel-400">{project.location}</span>
        </p>
        <h3 className="mt-3 text-xl font-medium tracking-[-0.02em] text-white md:text-2xl">{project.name}</h3>
        <p className="mt-2 max-w-md translate-y-2 text-sm text-steel-300 opacity-0 transition-all duration-500 ease-premium group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100">
          {project.summary}
        </p>
      </div>
    </button>
  )
}
