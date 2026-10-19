import type { ImageRef } from './types'

/**
 * Serviços oficiais da 3D Engenharia.
 *
 * - image: imagem de capa (também usada como pôster do vídeo)
 * - video.loop: trecho curto, sem som, que roda no fundo do card
 * - video.full: vídeo completo (com som) aberto pelo botão "Assistir ao vídeo"
 * - icon: nome de um ícone do mapa em src/components/ui/Icons.tsx
 */
export type ServiceIconName = 'execution' | 'administration' | 'sales'

export interface VideoRef {
  /** Trecho curto em loop (mudo). */
  loop: string
  /** Vídeo completo com som (opcional). */
  full?: string
  poster: string
  /** Título do vídeo completo (acessibilidade). */
  title?: string
}

export interface Service {
  id: string
  title: string
  description: string
  icon: ServiceIconName
  image: ImageRef
  video?: VideoRef
  /** Rótulo do link principal. Padrão: "Solicitar orçamento". */
  cta?: string
  /** Link principal. Padrão: formulário de contato com o serviço pré-selecionado. */
  href?: string
  demo?: boolean
}

export const services: Service[] = [
  {
    id: 'execucao',
    title: 'Execução de obras',
    description:
      'Construção de obras residenciais e comerciais do início ao fim, com equipe própria, planejamento de cada etapa e acompanhamento técnico até a entrega.',
    icon: 'execution',
    image: { src: '/videos/execucao-poster.webp', alt: 'Obra do Residencial Alamedas em execução, vista de drone' },
    video: {
      loop: '/videos/execucao-loop.mp4',
      full: '/videos/residencial-alamedas.mp4',
      poster: '/videos/residencial-alamedas-poster.webp',
      title: 'Residencial Alamedas — obra em execução',
    },
  },
  {
    id: 'administracao',
    title: 'Administração de obras',
    description:
      'A 3D Engenharia conduz a sua obra por você: planejamento, compras, coordenação das equipes e controle de custos e prazos, com prestação de contas transparente.',
    icon: 'administration',
    image: { src: '/videos/administracao-poster.webp', alt: 'Vista aérea do canteiro do Residencial Alamedas' },
    video: {
      loop: '/videos/administracao-loop.mp4',
      full: '/videos/residencial-alamedas.mp4',
      poster: '/videos/residencial-alamedas-poster.webp',
      title: 'Residencial Alamedas — obra em execução',
    },
  },
  {
    id: 'venda',
    title: 'Venda de imóveis',
    description:
      'Apartamentos em empreendimentos da 3D Engenharia em Campo Belo, com o padrão de qualidade da construtora. Fale com a equipe para conhecer as unidades disponíveis.',
    icon: 'sales',
    image: { src: '/videos/venda-poster.webp', alt: 'Hall de entrada do Residencial Paris' },
    video: {
      loop: '/videos/venda-loop.mp4',
      full: '/videos/residencial-paris.mp4',
      poster: '/videos/residencial-paris-poster.webp',
      title: 'Tour pelo Residencial Paris',
    },
    cta: 'Quero conhecer os imóveis',
  },
]
