/**
 * Diferenciais — textos-base editáveis. Não inclua certificações, números ou
 * resultados que não estejam confirmados.
 */
export type DifferentialIcon = 'experience' | 'quality' | 'planning' | 'service' | 'organization' | 'deadline' | 'safety'

export const differentials: { title: string; text: string; icon: DifferentialIcon }[] = [
  {
    title: 'Experiência local',
    text: 'Mais de dez anos de atuação em Campo Belo e região, com reputação construída na seriedade e na qualidade das entregas.',
    icon: 'experience',
  },
  {
    title: 'Qualidade técnica',
    text: 'Projetos e execução conduzidos com rigor técnico, revisão criteriosa e atenção a cada detalhe.',
    icon: 'quality',
  },
  {
    title: 'Planejamento',
    text: 'Etapas, recursos e riscos mapeados antes do início, para que cada decisão seja tomada com clareza.',
    icon: 'planning',
  },
  {
    title: 'Atendimento',
    text: 'Comunicação direta e transparente, com acompanhamento próximo das necessidades do cliente.',
    icon: 'service',
  },
  {
    title: 'Compromisso com prazos',
    text: 'Cronogramas realistas, acompanhados de perto e ajustados com antecedência quando necessário.',
    icon: 'deadline',
  },
  {
    title: 'Segurança e responsabilidade',
    text: 'Responsabilidade técnica e atenção às normas de segurança em todas as atividades.',
    icon: 'safety',
  },
]

export const differentialsIntro = {
  eyebrow: 'Diferenciais',
  title: ['O que orienta', 'cada projeto.'],
  text: 'Princípios de trabalho que sustentam a relação com o cliente — do primeiro estudo à entrega.',
}
