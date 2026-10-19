import { demoImage, type ImageRef } from './types'

/**
 * Portfólio. Os itens abaixo são DEMONSTRATIVOS (demo: true) — fotos de banco de
 * imagens, sem relação com obras da 3D Engenharia. Substitua pelas obras reais.
 *
 * A grade assimétrica é montada automaticamente pela ordem da lista.
 */
export interface Project {
  id: string
  name: string
  category: string
  location: string
  year?: string
  summary: string
  description: string
  images: ImageRef[]
  demo?: boolean
}

export const projects: Project[] = [
  {
    id: 'demo-01',
    name: 'Projeto demonstrativo 01',
    category: 'Corporativo',
    location: 'Localização a definir',
    summary: 'Edifício de escritórios — exemplo de card.',
    description:
      'Texto de exemplo. Descreva aqui o escopo da obra, os desafios técnicos, as soluções adotadas e o resultado entregue ao cliente.',
    images: [
      demoImage('edificios-corporativos', 'Conjunto de edifícios corporativos envidraçados ao entardecer'),
      demoImage('torres-vidro', 'Torres de vidro vistas de baixo para cima'),
      demoImage('interior-corporativo', 'Interior corporativo amplo e iluminado'),
    ],
    demo: true,
  },
  {
    id: 'demo-02',
    name: 'Projeto demonstrativo 02',
    category: 'Residencial',
    location: 'Localização a definir',
    summary: 'Residência contemporânea — exemplo de card.',
    description:
      'Texto de exemplo. Descreva aqui o escopo da obra, os desafios técnicos, as soluções adotadas e o resultado entregue ao cliente.',
    images: [
      demoImage('residencia-contemporanea', 'Residência contemporânea iluminada ao anoitecer'),
      demoImage('fachada-revestida', 'Fachada revestida com esquadrias de vidro'),
    ],
    demo: true,
  },
  {
    id: 'demo-03',
    name: 'Projeto demonstrativo 03',
    category: 'Corporativo',
    location: 'Localização a definir',
    summary: 'Fachada de geometria marcante — exemplo de card.',
    description:
      'Texto de exemplo. Descreva aqui o escopo da obra, os desafios técnicos, as soluções adotadas e o resultado entregue ao cliente.',
    images: [
      demoImage('fachada-geometrica', 'Edifício branco de fachada geométrica'),
      demoImage('perspectiva-torres', 'Perspectiva de torres espelhadas'),
    ],
    demo: true,
  },
  {
    id: 'demo-04',
    name: 'Projeto demonstrativo 04',
    category: 'Residencial',
    location: 'Localização a definir',
    summary: 'Edifício residencial vertical — exemplo de card.',
    description:
      'Texto de exemplo. Descreva aqui o escopo da obra, os desafios técnicos, as soluções adotadas e o resultado entregue ao cliente.',
    images: [demoImage('edificio-branco', 'Edifício residencial branco com volumes em balanço')],
    demo: true,
  },
  {
    id: 'demo-05',
    name: 'Projeto demonstrativo 05',
    category: 'Industrial',
    location: 'Localização a definir',
    summary: 'Instalação industrial — exemplo de card.',
    description:
      'Texto de exemplo. Descreva aqui o escopo da obra, os desafios técnicos, as soluções adotadas e o resultado entregue ao cliente.',
    images: [
      demoImage('instalacoes-industriais', 'Tubulações e equipamentos de uma instalação industrial'),
      demoImage('serralheria', 'Faíscas de corte metálico em ambiente industrial'),
    ],
    demo: true,
  },
  {
    id: 'demo-06',
    name: 'Projeto demonstrativo 06',
    category: 'Infraestrutura',
    location: 'Localização a definir',
    summary: 'Terraplenagem e infraestrutura — exemplo de card.',
    description:
      'Texto de exemplo. Descreva aqui o escopo da obra, os desafios técnicos, as soluções adotadas e o resultado entregue ao cliente.',
    images: [
      demoImage('terraplenagem', 'Máquinas de terraplenagem em área aberta'),
      demoImage('canteiro-fundacao', 'Canteiro de fundação visto do alto'),
    ],
    demo: true,
  },
]
