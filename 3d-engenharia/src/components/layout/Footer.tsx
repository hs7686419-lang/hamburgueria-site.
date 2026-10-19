import { Mail, MapPin, Phone, Clock } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { navItems, site, whatsappLink, type SocialNetwork } from '@/config/site'
import { socialIcons, socialLabels } from '@/components/ui/BrandIcons'
import { onAnchorClick } from '@/lib/scroll'

export function Footer({ base = '' }: { base?: string }) {
  const year = new Date().getFullYear()
  const { email, phone, address, hours } = site.contact
  const socials = Object.entries(site.social).filter(([, url]) => !!url) as [SocialNetwork, string][]
  const wa = whatsappLink()
  const hasContact = !!(email || phone || address || hours || wa)

  return (
    <footer className="relative border-t border-white/[0.07] bg-ink-950">
      <div className="container-site grid gap-14 py-20 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-5">
          <Logo />
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-steel-400">
            Engenharia que transforma projetos em realidade — com planejamento, precisão técnica e compromisso com a qualidade.
          </p>
          {socials.length > 0 && (
            <ul className="mt-8 flex gap-3" aria-label="Redes sociais">
              {socials.map(([net, url]) => {
                const Icon = socialIcons[net]
                return (
                  <li key={net}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${socialLabels[net]} (abre em nova aba)`}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-steel-300 transition-colors duration-300 hover:border-metal-light/60 hover:text-white"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <nav aria-label="Rodapé" className="md:col-span-3">
          <h2 className="mb-5 font-mono text-[10px] uppercase tracking-[0.22em] text-steel-500">Navegação</h2>
          <ul className="space-y-3">
            {navItems.map((n) => (
              <li key={n.id}>
                <a
                  href={base ? `${base}#${n.id}` : `#${n.id}`}
                  onClick={base ? undefined : onAnchorClick}
                  className="text-sm text-steel-300 transition-colors hover:text-white"
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-4">
          <h2 className="mb-5 font-mono text-[10px] uppercase tracking-[0.22em] text-steel-500">Contato</h2>
          {hasContact ? (
            <ul className="space-y-4 text-sm text-steel-300">
              {email && (
                <li className="flex gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-metal-light" aria-hidden="true" />
                  <a href={`mailto:${email}`} className="hover:text-white">{email}</a>
                </li>
              )}
              {phone && (
                <li className="flex gap-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-metal-light" aria-hidden="true" />
                  <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="hover:text-white">{phone}</a>
                </li>
              )}
              {wa && (
                <li className="flex gap-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-metal-light" aria-hidden="true" />
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="hover:text-white">WhatsApp</a>
                </li>
              )}
              {address && (
                <li className="flex gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-metal-light" aria-hidden="true" />
                  <span>{address}</span>
                </li>
              )}
              {hours && (
                <li className="flex gap-3">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-metal-light" aria-hidden="true" />
                  <span>{hours}</span>
                </li>
              )}
            </ul>
          ) : (
            <p className="text-sm leading-relaxed text-steel-500">
              Informações de contato em breve. Use o{' '}
              <a href={base ? `${base}#contato` : '#contato'} onClick={base ? undefined : onAnchorClick} className="text-steel-300 underline decoration-white/20 underline-offset-4 hover:text-white">
                formulário de orçamento
              </a>
              .
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-white/[0.06]">
        <div className="container-site flex flex-col gap-4 py-7 text-xs text-steel-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {site.name}. Todos os direitos reservados.</p>
          <div className="flex items-center gap-6">
            <a href="/privacidade/" className="transition-colors hover:text-white">Política de privacidade</a>
            <a href={base ? `${base}#inicio` : '#inicio'} onClick={base ? undefined : onAnchorClick} className="transition-colors hover:text-white">
              Voltar ao topo ↑
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
