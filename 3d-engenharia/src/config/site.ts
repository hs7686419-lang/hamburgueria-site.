/**
 * Configuração central do site.
 *
 * Tudo que é dado institucional (logo, contatos, redes, número do WhatsApp,
 * endpoint do formulário, modelo 3D oficial) fica aqui. Campos vazios não são
 * exibidos — nada é inventado.
 */

export type SocialNetwork = 'instagram' | 'linkedin' | 'facebook' | 'youtube'

export interface SiteConfig {
  name: string
  /** Caminho da logo oficial (ex.: '/brand/logo.svg'). Vazio = marca provisória em texto. */
  logo: { src: string; srcOnLight?: string; alt: string; width: number; height: number }
  contact: {
    email: string
    phone: string
    address: string
    hours: string
  }
  /** Número com DDI + DDD, apenas dígitos (ex.: '5511999999999'). */
  whatsapp: { number: string; message: string }
  social: Partial<Record<SocialNetwork, string>>
  form: {
    /** Endpoint que recebe POST JSON. Vazio = formulário avisa que o envio não está configurado. */
    endpoint: string
  }
  hero3d: {
    /**
     * Caminho de um modelo .glb/.gltf oficial (ex.: '/models/edificio.glb').
     * Vazio = edifício procedural gerado em código.
     */
    modelUrl: string
    /** Escala aplicada ao modelo oficial para caber na cena (altura alvo ≈ 6 unidades). */
    modelScale: number
  }
  /**
   * Exibe selos "Conteúdo demonstrativo" nos itens de exemplo.
   * Desative quando todo o conteúdo real estiver cadastrado.
   */
  showDemoBadges: boolean
}

export const site: SiteConfig = {
  name: '3D Engenharia',
  logo: { src: '', alt: '3D Engenharia', width: 160, height: 40 },
  contact: {
    email: '',
    phone: '',
    address: '',
    hours: '',
  },
  whatsapp: {
    number: import.meta.env.VITE_WHATSAPP_NUMBER ?? '',
    message: 'Olá! Gostaria de falar com a 3D Engenharia sobre um projeto.',
  },
  social: {
    // instagram: 'https://instagram.com/...',
    // linkedin: 'https://linkedin.com/company/...',
  },
  form: {
    endpoint: import.meta.env.VITE_FORM_ENDPOINT ?? '',
  },
  hero3d: {
    modelUrl: '',
    modelScale: 1,
  },
  showDemoBadges: true,
}

export const navItems = [
  { id: 'inicio', label: 'Início' },
  { id: 'sobre', label: 'Sobre nós' },
  { id: 'servicos', label: 'Serviços' },
  { id: 'projetos', label: 'Projetos' },
  { id: 'contato', label: 'Contato' },
] as const

export function whatsappLink(text = site.whatsapp.message): string | null {
  const digits = site.whatsapp.number.replace(/\D/g, '')
  if (!digits) return null
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
}
