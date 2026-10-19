import { projectImage, type ImageRef } from './types'

// Seção "Sobre". Fatos confirmados: construtora de engenharia civil em
// Campo Belo - MG, com mais de dez anos de atuação, focada em obras
// residenciais e comerciais. Complete com a história oficial e a equipe.
export const about = {
  eyebrow: 'Sobre a 3D Engenharia',
  title: ['Precisão técnica.', 'Visão de futuro.'],
  lead:
    'A 3D Engenharia é uma construtora de engenharia civil sediada no centro de Campo Belo - MG. Com mais de dez anos de atuação, construiu uma sólida reputação na região pela seriedade e pela qualidade na entrega de projetos residenciais e comerciais.',
  /** Parágrafos adicionais (história, área de atuação, equipe). Deixe vazio para ocultar. */
  paragraphs: [
    'Cada obra é conduzida com planejamento, atenção aos detalhes e responsabilidade técnica — do primeiro estudo à entrega das chaves.',
  ] as string[],
  /** Fatos em destaque (somente informações confirmadas). */
  facts: [
    { value: '10+', label: 'anos de atuação' },
    { value: 'Residencial', label: 'e comercial' },
    { value: 'Campo Belo', label: 'MG e região' },
  ],
  /** Pilares — vêm do próprio texto institucional; ajuste conforme a empresa. */
  pillars: [
    { title: 'Planejamento', text: 'Cada etapa pensada antes de começar, com escopo, cronograma e recursos definidos.' },
    { title: 'Qualidade', text: 'Atenção aos detalhes e responsabilidade técnica do projeto à entrega.' },
    { title: 'Eficiência', text: 'Decisões orientadas aos objetivos do cliente, sem desperdício de tempo e recursos.' },
  ],
  images: {
    primary: projectImage('residencial-paris', 'paris-01', 'Fachada do Residencial Paris, obra da 3D Engenharia em Campo Belo - MG'),
    secondary: projectImage('residencial-paris', 'paris-02', 'Hall de entrada do Residencial Paris'),
  } satisfies Record<string, ImageRef>,
  /** Equipe — preencha quando houver dados oficiais. Lista vazia = bloco oculto. */
  team: [] as { name: string; role: string; photo?: ImageRef }[],
}
