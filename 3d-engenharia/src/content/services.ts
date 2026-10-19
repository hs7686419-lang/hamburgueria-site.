import { demoImage, projectImage, type ImageRef } from './types'

/**
 * Serviços. Confirmados: construção residencial e comercial.
 * Os itens com `demo: true` são EXEMPLOS de estrutura e aparecem com selo —
 * confirme, edite ou remova antes de publicar.
 *
 * icon: nome de um ícone do mapa em src/components/ui/ServiceIcon.tsx
 */
export type ServiceIconName = 'home' | 'blueprint' | 'structure' | 'management' | 'consulting' | 'installations' | 'renovation'

export interface Service {
  id: string
  title: string
  description: string
  icon: ServiceIconName
  image: ImageRef
  /** Link "Saiba mais". Padrão: formulário de orçamento com o serviço pré-selecionado. */
  href?: string
  demo?: boolean
}

export const services: Service[] = [
  {
    id: 'residencial',
    title: 'Obras residenciais',
    description:
      'Construção de residências com planejamento, acompanhamento técnico e cuidado com o acabamento em cada etapa da obra.',
    icon: 'home',
    image: projectImage('residencial-paris', 'paris-06', 'Espaço gourmet do Residencial Paris'),
  },
  {
    id: 'comercial',
    title: 'Obras comerciais',
    description:
      'Execução de edificações comerciais com organização de canteiro, controle de prazos e responsabilidade técnica.',
    icon: 'structure',
    image: demoImage('edificios-corporativos', 'Edifícios comerciais envidraçados'),
  },
  {
    id: 'projetos',
    title: 'Projetos de engenharia',
    description: 'Descrição do serviço: escopo, entregáveis e como o trabalho é conduzido. Substitua por um texto oficial.',
    icon: 'blueprint',
    image: demoImage('planta-desenho', 'Mãos desenhando uma planta técnica com régua e lápis'),
    demo: true,
  },
  {
    id: 'gerenciamento',
    title: 'Gerenciamento e planejamento',
    description: 'Descrição do serviço: cronogramas, controle de custos, relatórios e comunicação com o cliente.',
    icon: 'management',
    image: demoImage('canteiro-fundacao', 'Equipe técnica caminhando sobre canteiro de fundação'),
    demo: true,
  },
  {
    id: 'consultoria',
    title: 'Consultoria técnica',
    description: 'Descrição do serviço: análises, pareceres e apoio à tomada de decisão em cada fase do projeto.',
    icon: 'consulting',
    image: demoImage('reuniao-tecnica', 'Reunião técnica com notebook e anotações sobre a mesa'),
    demo: true,
  },
  {
    id: 'reformas',
    title: 'Reformas e adequações',
    description: 'Descrição do serviço: diagnóstico, planejamento e execução de intervenções em edificações existentes.',
    icon: 'renovation',
    image: demoImage('interior-corporativo', 'Interior corporativo amplo e iluminado'),
    demo: true,
  },
]
