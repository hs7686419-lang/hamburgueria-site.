import { demoImage, type ImageRef } from './types'

/**
 * Serviços — cadastre aqui os serviços que a 3D Engenharia realmente oferece.
 * Os itens abaixo são EXEMPLOS de estrutura (demo: true) e não afirmam que a
 * empresa executa essas atividades.
 *
 * icon: nome de um ícone do mapa em src/components/ui/ServiceIcon.tsx
 */
export type ServiceIconName = 'blueprint' | 'structure' | 'management' | 'consulting' | 'installations' | 'renovation'

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
    id: 'projetos',
    title: 'Projetos de engenharia',
    description: 'Descrição do serviço: escopo, entregáveis e como o trabalho é conduzido. Substitua por um texto oficial.',
    icon: 'blueprint',
    image: demoImage('planta-desenho', 'Mãos desenhando uma planta técnica com régua e lápis'),
    demo: true,
  },
  {
    id: 'execucao',
    title: 'Execução de obras',
    description: 'Descrição do serviço: etapas, acompanhamento técnico e padrões de qualidade adotados.',
    icon: 'structure',
    image: demoImage('equipe-obra', 'Vista aérea de equipe trabalhando sobre laje em construção'),
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
    id: 'instalacoes',
    title: 'Instalações',
    description: 'Descrição do serviço: sistemas, compatibilização e acompanhamento da execução.',
    icon: 'installations',
    image: demoImage('instalacoes-industriais', 'Tubulações e equipamentos de uma instalação industrial'),
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
