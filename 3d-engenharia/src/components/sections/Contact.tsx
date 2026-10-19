import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, ArrowUpRight, CheckCircle2, Loader2, Mail, MapPin, Phone } from 'lucide-react'
import { site, whatsappLink } from '@/config/site'
import { services } from '@/content/services'
import { Button } from '@/components/ui/Button'
import { Reveal, RevealTitle } from '@/components/ui/Reveal'
import { Parallax } from '@/components/ui/Parallax'
import { ResponsiveImage } from '@/components/ui/ResponsiveImage'
import { demoImage } from '@/content/types'
import { socialIcons, WhatsAppIcon } from '@/components/ui/BrandIcons'
import { SERVICE_EVENT } from './Services'

type Field = 'nome' | 'empresa' | 'email' | 'telefone' | 'servico' | 'descricao'
type Values = Record<Field, string>
type Errors = Partial<Record<Field, string>>
type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'success' } | { kind: 'error'; message: string }

const initial: Values = { nome: '', empresa: '', email: '', telefone: '', servico: '', descricao: '' }
const OTHER = 'Outro / ainda não sei'

function validate(v: Values): Errors {
  const e: Errors = {}
  if (v.nome.trim().length < 2) e.nome = 'Informe seu nome.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) e.email = 'Informe um e-mail válido.'
  const digits = v.telefone.replace(/\D/g, '')
  if (digits.length < 10 || digits.length > 13) e.telefone = 'Informe um telefone com DDD.'
  if (!v.servico) e.servico = 'Selecione o tipo de serviço.'
  if (v.descricao.trim().length < 20) e.descricao = 'Descreva o projeto em pelo menos 20 caracteres.'
  return e
}

/** Máscara brasileira simples: (11) 98765-4321 */
function maskPhone(value: string) {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export function Contact() {
  const [values, setValues] = useState<Values>(initial)
  const [errors, setErrors] = useState<Errors>({})
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({})
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const formRef = useRef<HTMLFormElement>(null)
  const uid = useId()
  const serviceOptions = [...services.map((s) => s.title), OTHER]

  // Pré-seleção vinda dos cards de serviço
  useEffect(() => {
    const onSelect = (e: Event) => {
      const title = (e as CustomEvent<string>).detail
      setValues((v) => ({ ...v, servico: title }))
    }
    window.addEventListener(SERVICE_EVENT, onSelect)
    return () => window.removeEventListener(SERVICE_EVENT, onSelect)
  }, [])

  const set = (field: Field, value: string) => {
    const next = { ...values, [field]: field === 'telefone' ? maskPhone(value) : value }
    setValues(next)
    if (touched[field]) setErrors(validate(next))
  }
  const blur = (field: Field) => {
    setTouched((t) => ({ ...t, [field]: true }))
    setErrors(validate(values))
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const errs = validate(values)
    setErrors(errs)
    setTouched({ nome: true, email: true, telefone: true, servico: true, descricao: true })
    if (Object.keys(errs).length) {
      const first = Object.keys(errs)[0]
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
      return
    }

    // Sem integração configurada: NÃO simula envio.
    if (!site.form.endpoint) {
      setStatus({
        kind: 'error',
        message:
          'O envio de formulários ainda não foi configurado neste site, por isso sua mensagem não foi enviada. ' +
          (whatsappLink() ? 'Fale conosco pelo WhatsApp enquanto isso.' : 'Tente novamente mais tarde.'),
      })
      return
    }

    setStatus({ kind: 'sending' })
    try {
      const res = await fetch(site.form.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...values, origem: 'site', enviadoEm: new Date().toISOString() }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setStatus({ kind: 'success' })
      setValues(initial)
      setTouched({})
    } catch (err) {
      console.error('[Formulário] Falha no envio', err)
      setStatus({ kind: 'error', message: 'Não foi possível enviar sua mensagem agora. Verifique sua conexão e tente novamente.' })
    }
  }

  const fieldProps = (f: Field) => ({
    id: `${uid}-${f}`,
    name: f,
    value: values[f],
    'aria-invalid': touched[f] && errors[f] ? true : undefined,
    'aria-describedby': touched[f] && errors[f] ? `${uid}-${f}-erro` : undefined,
    onBlur: () => blur(f),
  })

  const wa = whatsappLink()

  return (
    <section id="contato" aria-labelledby="contato-titulo" className="relative overflow-hidden py-28 md:py-40">
      {/* Fundo com parallax */}
      <div aria-hidden="true" className="absolute inset-0">
        <Parallax offset={80} className="h-full w-full">
          <ResponsiveImage image={demoImage('perspectiva-torres', '')} className="h-full w-full" imgClassName="opacity-[0.18] grayscale" />
        </Parallax>
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950 via-ink-950/80 to-ink-950" />
      </div>

      <div className="container-site relative grid gap-16 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <Reveal className="mb-6 flex items-center gap-4">
            <span className="font-mono text-[11px] text-steel-500">05</span>
            <span className="eyebrow">Contato e orçamento</span>
          </Reveal>
          <RevealTitle id="contato-titulo" lines={['Vamos tirar seu', 'próximo projeto', 'do papel?']} className="display-2" accentLast />
          <Reveal delay={0.1}>
            <p className="mt-8 max-w-md text-lg leading-relaxed text-steel-300">
              Conte um pouco sobre a sua obra ou sobre o imóvel que você procura. A equipe da 3D Engenharia analisa cada solicitação e retorna com os próximos passos.
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <ol className="mt-12 space-y-5 border-l border-white/10 pl-6 text-sm text-steel-400">
              {['Envie as informações do projeto', 'Análise técnica da solicitação', 'Retorno com proposta e próximos passos'].map((s, i) => (
                <li key={s} className="relative">
                  <span className="absolute -left-[29px] top-1.5 h-[9px] w-[9px] rotate-45 border border-metal-light bg-ink-950" aria-hidden="true" />
                  <span className="mr-3 font-mono text-[11px] text-metal-light">0{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
          </Reveal>
          {site.contact.address && (
            <Reveal delay={0.22}>
              <div className="mt-12 flex gap-4 border-t border-white/[0.07] pt-8">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-metal-light" strokeWidth={1.4} aria-hidden="true" />
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel-500">Onde estamos</p>
                  <p className="mt-2 text-steel-200">{site.contact.address}</p>
                  {site.contact.mapsUrl && (
                    <a
                      href={site.contact.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group mt-3 inline-flex items-center gap-1.5 text-sm text-white underline decoration-white/25 underline-offset-[6px] transition-colors hover:decoration-metal-light"
                    >
                      Ver no mapa
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                      <span className="sr-only">(abre em nova aba)</span>
                    </a>
                  )}
                </div>
              </div>
            </Reveal>
          )}
          {site.social.instagram && (
            <Reveal delay={0.23}>
              <a
                href={site.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-8 inline-flex items-center gap-3 text-sm text-steel-300 transition-colors hover:text-white"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 transition-colors group-hover:border-metal-light/60">
                  {socialIcons.instagram({ className: 'h-4 w-4' })}
                </span>
                Acompanhe as obras no Instagram <span className="text-white">@{site.social.instagram.split('/').filter(Boolean).pop()}</span>
                <span className="sr-only">(abre em nova aba)</span>
              </a>
            </Reveal>
          )}
          {(wa || site.contact.phone || site.contact.email) && (
            <Reveal delay={0.24}>
              <div className="mt-10 border-t border-white/[0.07] pt-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-steel-500">Prefere conversar?</p>
                {site.contact.phone && (
                  <a
                    href={`tel:+55${site.contact.phone.replace(/\D/g, '')}`}
                    className="mt-2 block text-2xl font-medium tracking-[-0.02em] text-white transition-colors hover:text-metal-light"
                  >
                    {site.contact.phone}
                  </a>
                )}
                {site.contact.email && (
                  <a
                    href={`mailto:${site.contact.email}`}
                    className="mt-2 inline-flex items-center gap-2 break-all text-sm text-steel-300 underline decoration-white/20 underline-offset-[6px] transition-colors hover:text-white hover:decoration-metal-light"
                  >
                    <Mail className="h-4 w-4 shrink-0 text-metal-light" aria-hidden="true" />
                    {site.contact.email}
                  </a>
                )}
                <div className="mt-5 flex flex-wrap gap-3">
                  {wa && (
                    <a
                      href={wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-11 items-center gap-2 rounded-full bg-[#1f9d55] px-5 text-sm font-medium text-white transition-transform duration-300 hover:scale-[1.03]"
                    >
                      <WhatsAppIcon className="h-4 w-4" />
                      Conversar no WhatsApp
                      <span className="sr-only">(abre em nova aba)</span>
                    </a>
                  )}
                  {site.contact.phone && (
                    <a
                      href={`tel:+55${site.contact.phone.replace(/\D/g, '')}`}
                      className="inline-flex h-11 items-center gap-2 rounded-full border border-white/20 px-5 text-sm text-white transition-colors hover:border-metal-light/60 hover:bg-white/5"
                    >
                      <Phone className="h-4 w-4" aria-hidden="true" />
                      Ligar
                    </a>
                  )}
                </div>
              </div>
            </Reveal>
          )}
        </div>

        <Reveal className="lg:col-span-7" delay={0.1}>
          <form ref={formRef} noValidate onSubmit={onSubmit} className="glass relative p-6 sm:p-10" aria-describedby={`${uid}-req`}>
            <p id={`${uid}-req`} className="mb-8 font-mono text-[10px] uppercase tracking-[0.2em] text-steel-500">
              Campos com * são obrigatórios
            </p>
            <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
              <FormField label="Nome *" htmlFor={`${uid}-nome`} error={touched.nome ? errors.nome : undefined} errorId={`${uid}-nome-erro`}>
                <input {...fieldProps('nome')} type="text" autoComplete="name" className="field" placeholder="Seu nome completo" onChange={(e) => set('nome', e.target.value)} />
              </FormField>
              <FormField label="Empresa (opcional)" htmlFor={`${uid}-empresa`}>
                <input {...fieldProps('empresa')} type="text" autoComplete="organization" className="field" placeholder="Nome da empresa" onChange={(e) => set('empresa', e.target.value)} />
              </FormField>
              <FormField label="E-mail *" htmlFor={`${uid}-email`} error={touched.email ? errors.email : undefined} errorId={`${uid}-email-erro`}>
                <input {...fieldProps('email')} type="email" autoComplete="email" inputMode="email" className="field" placeholder="voce@email.com" onChange={(e) => set('email', e.target.value)} />
              </FormField>
              <FormField label="Telefone *" htmlFor={`${uid}-telefone`} error={touched.telefone ? errors.telefone : undefined} errorId={`${uid}-telefone-erro`}>
                <input {...fieldProps('telefone')} type="tel" autoComplete="tel" inputMode="tel" className="field" placeholder="(00) 00000-0000" onChange={(e) => set('telefone', e.target.value)} />
              </FormField>
              <FormField className="sm:col-span-2" label="Tipo de serviço *" htmlFor={`${uid}-servico`} error={touched.servico ? errors.servico : undefined} errorId={`${uid}-servico-erro`}>
                <select {...fieldProps('servico')} className="field select-chevron cursor-pointer appearance-none pr-8" onChange={(e) => set('servico', e.target.value)}>
                  <option value="" disabled>
                    Selecione uma opção
                  </option>
                  {serviceOptions.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField className="sm:col-span-2" label="Descrição do projeto *" htmlFor={`${uid}-descricao`} error={touched.descricao ? errors.descricao : undefined} errorId={`${uid}-descricao-erro`}>
                <textarea {...fieldProps('descricao')} rows={4} className="field resize-y" placeholder="Tipo de obra, localização, prazos desejados, etapa atual…" onChange={(e) => set('descricao', e.target.value)} />
              </FormField>
            </div>

            <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-xs text-xs leading-relaxed text-steel-500">
                Ao enviar, você concorda com o uso dos dados para retorno do contato, conforme a{' '}
                <a href="/privacidade/" className="text-steel-300 underline decoration-white/20 underline-offset-4 hover:text-white">
                  política de privacidade
                </a>
                .
              </p>
              <Button type="submit" disabled={status.kind === 'sending'} arrow={status.kind !== 'sending'} className="w-full sm:w-auto">
                {status.kind === 'sending' ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Enviando…
                  </span>
                ) : (
                  'Enviar solicitação'
                )}
              </Button>
            </div>

            <div aria-live="polite" role="status">
              <AnimatePresence>
                {(status.kind === 'success' || status.kind === 'error') && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`mt-8 flex gap-3 border p-4 text-sm leading-relaxed ${
                      status.kind === 'success' ? 'border-emerald-400/30 bg-emerald-400/[0.06] text-emerald-100' : 'border-red-400/30 bg-red-400/[0.06] text-red-100'
                    }`}
                  >
                    {status.kind === 'success' ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden="true" />
                    ) : (
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" aria-hidden="true" />
                    )}
                    <p>
                      {status.kind === 'success'
                        ? 'Mensagem enviada com sucesso! Em breve entraremos em contato.'
                        : status.message}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  )
}

function FormField({
  label,
  htmlFor,
  error,
  errorId,
  className = '',
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  errorId?: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1 block font-mono text-[10px] uppercase tracking-[0.2em] text-steel-400">
        {label}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            id={errorId}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 text-xs text-red-300"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
