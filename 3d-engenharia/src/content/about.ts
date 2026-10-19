import { demoImage, type ImageRef } from './types'

// Seção "Sobre" — o texto é uma sugestão inicial. Substitua pela história oficial,
// área de atuação, diferenciais e equipe da empresa.
export const about = {
  eyebrow: 'Sobre a 3D Engenharia',
  title: ['Precisão técnica.', 'Visão de futuro.'],
  lead:
    'A 3D Engenharia tem como proposta desenvolver soluções de engenharia com foco em planejamento, qualidade e eficiência. Cada projeto deve ser conduzido com atenção aos detalhes, responsabilidade técnica e compromisso com os objetivos do cliente.',
  /** Parágrafos adicionais (história, área de atuação, equipe). Deixe vazio para ocultar. */
  paragraphs: [
    'Espaço reservado para a história oficial da empresa: como começou, onde atua e quais tipos de projeto conduz.',
  ] as string[],
  /** Pilares — vêm do próprio texto institucional; ajuste conforme a empresa. */
  pillars: [
    { title: 'Planejamento', text: 'Cada etapa pensada antes de começar, com escopo, cronograma e recursos definidos.' },
    { title: 'Qualidade', text: 'Atenção aos detalhes e responsabilidade técnica do projeto à entrega.' },
    { title: 'Eficiência', text: 'Decisões orientadas aos objetivos do cliente, sem desperdício de tempo e recursos.' },
  ],
  images: {
    primary: demoImage('planta-desenho', 'Profissional desenhando uma planta técnica sobre a prancheta'),
    secondary: demoImage('armacao-estrutura', 'Equipe trabalhando na armação de uma estrutura em altura'),
  } satisfies Record<string, ImageRef>,
  /** Equipe — preencha quando houver dados oficiais. Lista vazia = bloco oculto. */
  team: [] as { name: string; role: string; photo?: ImageRef }[],
}
