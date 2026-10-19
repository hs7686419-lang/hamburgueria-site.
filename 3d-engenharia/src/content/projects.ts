import { demoImage, projectImage, type ImageRef } from './types'

/**
 * Portfólio. Itens com `demo: true` são DEMONSTRATIVOS (fotos de banco de
 * imagens, sem relação com obras da 3D Engenharia) — substitua pelas obras reais.
 * Itens sem `demo` são obras reais da empresa.
 *
 * A grade assimétrica é montada automaticamente pela ordem da lista.
 */
export interface Project {
  id: string
  name: string
  category: string
  location: string
  year?: string
  /** Situação da obra (ex.: "Entregue", "Em execução"). */
  status?: string
  /** Vídeo da obra (abre no player a partir dos detalhes). */
  video?: { src: string; poster?: string; title: string }
  summary: string
  description: string
  images: ImageRef[]
  demo?: boolean
}

const paris = (n: string, alt: string) => projectImage('residencial-paris', `paris-${n}`, alt)

export const projects: Project[] = [
  {
    id: 'residencial-paris',
    name: 'Residencial Paris',
    category: 'Residencial',
    location: 'Campo Belo - MG',
    status: 'Entregue',
    summary: 'Empreendimento residencial finalizado e 100% vendido na planta.',
    description:
      'Edifício residencial entregue pela 3D Engenharia, com todas as unidades vendidas ainda na planta. As áreas comuns reúnem hall de entrada com projeto de iluminação e marcenaria metálica, espaço gourmet com churrasqueira, área de convivência, jardim, elevador em aço inox e circulações com acabamento contemporâneo.',
    images: [
      paris('01', 'Fachada do Residencial Paris, edifício de cinco pavimentos com varandas envidraçadas'),
      paris('02', 'Hall de entrada com montantes metálicos pretos, plantas e iluminação embutida'),
      paris('03', 'Hall amplo com piso porcelanato claro e divisórias metálicas'),
      paris('04', 'Circulação com sofá e escada de acesso aos pavimentos'),
      paris('05', 'Escada com guarda-corpo metálico preto e corrimão'),
      paris('06', 'Espaço gourmet com churrasqueira, parede de tijolinhos e luminárias pendentes'),
      paris('07', 'Área de convivência coberta com sofás de madeira'),
      paris('08', 'Jardim lateral com piso drenante e vegetação tropical'),
      paris('09', 'Elevador com acabamento em aço inox'),
      paris('10', 'Hall dos apartamentos com porta de madeira e escada'),
    ],
    video: { src: '/videos/residencial-paris.mp4', poster: '/videos/residencial-paris-poster.webp', title: 'Tour pelo Residencial Paris' },
  },
  {
    id: 'residencial-alamedas',
    name: 'Residencial Alamedas',
    category: 'Residencial',
    location: 'Campo Belo - MG',
    status: 'Em execução',
    summary: 'Condomínio residencial de apartamentos em construção.',
    description:
      'Condomínio residencial com blocos de apartamentos em três pavimentos, executado pela 3D Engenharia em alvenaria estrutural. A obra está em andamento — assista ao vídeo para acompanhar a evolução e conhecer o projeto.',
    images: [
      projectImage('residencial-alamedas', 'alamedas-01', 'Vista aérea dos blocos do Residencial Alamedas em construção'),
      projectImage('residencial-alamedas', 'alamedas-02', 'Blocos em alvenaria estrutural vistos de drone'),
      projectImage('residencial-alamedas', 'alamedas-03', 'Detalhe da alvenaria estrutural de um dos blocos'),
      projectImage('residencial-alamedas', 'alamedas-04', 'Perspectiva ilustrativa do Residencial Alamedas concluído'),
    ],
    video: { src: '/videos/residencial-alamedas.mp4', poster: '/videos/residencial-alamedas-poster.webp', title: 'Residencial Alamedas — obra em execução' },
  },
  {
    id: 'demo-01',
    name: 'Projeto demonstrativo 01',
    category: 'Comercial',
    location: 'Campo Belo - MG (exemplo)',
    summary: 'Edifício comercial — exemplo de card.',
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
    location: 'Campo Belo - MG (exemplo)',
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
    category: 'Comercial',
    location: 'Campo Belo - MG (exemplo)',
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
    location: 'Campo Belo - MG (exemplo)',
    summary: 'Edifício residencial vertical — exemplo de card.',
    description:
      'Texto de exemplo. Descreva aqui o escopo da obra, os desafios técnicos, as soluções adotadas e o resultado entregue ao cliente.',
    images: [demoImage('edificio-branco', 'Edifício residencial branco com volumes em balanço')],
    demo: true,
  },
  {
    id: 'demo-05',
    name: 'Projeto demonstrativo 05',
    category: 'Comercial',
    location: 'Campo Belo - MG (exemplo)',
    summary: 'Espaço comercial — exemplo de card.',
    description:
      'Texto de exemplo. Descreva aqui o escopo da obra, os desafios técnicos, as soluções adotadas e o resultado entregue ao cliente.',
    images: [
      demoImage('interior-corporativo', 'Interior comercial amplo e iluminado'),
      demoImage('fachada-revestida', 'Fachada revestida com esquadrias de vidro'),
    ],
    demo: true,
  },
  {
    id: 'demo-06',
    name: 'Projeto demonstrativo 06',
    category: 'Residencial',
    location: 'Campo Belo - MG (exemplo)',
    summary: 'Obra em execução — exemplo de card.',
    description:
      'Texto de exemplo. Descreva aqui o escopo da obra, os desafios técnicos, as soluções adotadas e o resultado entregue ao cliente.',
    images: [
      demoImage('armacao-estrutura', 'Equipe trabalhando na armação de uma estrutura'),
      demoImage('canteiro-fundacao', 'Canteiro de fundação visto do alto'),
    ],
    demo: true,
  },
]
