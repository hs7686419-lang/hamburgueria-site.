/**
 * CONFIGURAÇÃO CENTRAL — Dra. Evelyn Lara | Cirurgiã-Dentista
 * ------------------------------------------------------------------
 * Todas as informações editáveis do site ficam aqui.
 *
 * REGRA DE OURO: só preencha com dados REAIS e CONFIRMADOS pela profissional.
 * Campos vazios ('' / [] / null) são tratados como PENDENTES:
 *   - modo 'rascunho'  → aparecem marcados como "pendente" / "exemplo";
 *   - modo 'publicado' → ficam ocultos (nada fictício vai ao ar).
 *
 * Antes de publicar: preencha os dados, revise os textos marcados como
 * rascunho e troque `modo` para 'publicado'.
 */
window.SITE_CONFIG = {
  /** 'rascunho' (pré-visualização, mostra pendências) | 'publicado' (oculta tudo que não foi confirmado) */
  modo: 'rascunho',

  /** Domínio definitivo, sem barra no final (ex.: 'https://www.draevelynlara.com.br'). Usado em canonical e dados estruturados. */
  dominio: '',

  profissional: {
    nome: 'Dra. Evelyn Lara',
    titulo: 'Cirurgiã-Dentista',
    /** Número de inscrição no CRO, ex.: '12345'. Obrigatório em publicidade odontológica — confirmar antes de publicar. */
    cro: '60043',
    /** UF do CRO, ex.: 'SP'. */
    croUf: 'MG',
    /**
     * Título de especialista. Pelas normas do CFO, "especialista" só pode ser divulgado com especialidade
     * registrada no CRO. Mantenha `confirmado: false` até a confirmação — no modo 'publicado' ele não aparece.
     */
    especialidade: { titulo: 'Especialista em clareamento dental', confirmado: false },
    /** Destaques divulgados pela profissional (exibidos na seção "Sobre"). */
    destaques: [
      { valor: '5 anos', texto: 'cuidando de sorrisos em Campo Belo' },
      { valor: '+200', texto: 'clareamentos realizados' },
    ],
  },

  contato: {
    /** WhatsApp oficial só com dígitos, com DDI + DDD (ex.: '5511999999999'). Vazio = pendente. */
    whatsapp: '',
    /** Telefone fixo/celular para ligação, no formato de exibição (ex.: '(11) 3333-4444'). */
    telefone: '',
    email: '',
    instagram: 'https://www.instagram.com/dra_evilynlara/', // URL completa do perfil
  },

  endereco: {
    /** Marque true SOMENTE depois que o endereço for validado pela profissional. */
    validado: true,
    logradouro: 'Rua Artur Bernardes, 265', // 'Rua Exemplo, 123 — Sala 45'
    bairro: '',
    cidade: 'Campo Belo',
    uf: 'MG',
    cep: '',
    /** Link opcional do Google Maps; se vazio, é gerado a partir do endereço. */
    linkMaps: '',
  },

  /**
   * Horários confirmados. `diasSchema`, `abre` e `fecha` alimentam os dados estruturados do Google
   * (dias em inglês, formato do schema.org).
   */
  horarios: [
    { dias: 'Segunda a sexta-feira', horas: '09h às 18h', diasSchema: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], abre: '09:00', fecha: '18:00' },
  ],

  /** Convênios atendidos, conforme divulgado pela profissional. Lista vazia = nada exibido. */
  convenios: ['Bradesco Dental', 'Odontoprev'],

  agendamento: {
    /** 'whatsapp' hoje. Ponto preparado para futura integração com agenda externa. */
    provedor: 'whatsapp',
    /** URL de um sistema de agendamento online, se um dia existir. Vazio = não exibido. */
    urlAgendaExterna: '',
  },

  /**
   * Tratamentos oferecidos (lista confirmada pela profissional).
   * `categoria` agrupa os itens na página, na ordem em que aparecem aqui.
   * Itens com `demo: true` seriam tratados como exemplo e ficariam ocultos no modo 'publicado'.
   */
  tratamentos: [
    {
      id: 'clinico-geral', categoria: 'Cuidado essencial', icone: 'stethoscope',
      nome: 'Clínico geral',
      resumo: 'Atendimento odontológico geral: avaliação, diagnóstico e orientação para cuidar da saúde da sua boca como um todo.',
      detalhe: 'É o ponto de partida do cuidado. A partir da avaliação, você entende o que precisa ser tratado e quais são as opções indicadas para o seu caso.',
    },
    {
      id: 'limpeza', categoria: 'Cuidado essencial', icone: 'shield',
      nome: 'Limpeza dentária',
      resumo: 'Limpeza profissional e orientação de higiene para manter dentes e gengivas saudáveis.',
      detalhe: 'Remove a placa e o tártaro que a escovação do dia a dia não alcança, com orientações personalizadas para o cuidado em casa.',
    },
    {
      id: 'restauracoes', categoria: 'Cuidado essencial', icone: 'tooth',
      nome: 'Restaurações dentárias',
      resumo: 'Restauração de dentes afetados por cáries, fraturas ou desgastes, buscando devolver forma e função.',
      detalhe: 'O material e a técnica são escolhidos após a avaliação, sempre com explicação prévia de cada etapa.',
    },
    {
      id: 'endodontia', categoria: 'Cuidado essencial', icone: 'canal',
      nome: 'Endodontia (tratamento de canal)',
      resumo: 'Tratamento do canal do dente quando a polpa está inflamada ou infectada, com o objetivo de preservar o dente.',
      detalhe: 'A indicação é confirmada na avaliação clínica, e cada etapa é explicada antes de começar.',
    },
    {
      id: 'proteses', categoria: 'Reabilitação oral', icone: 'bridge',
      nome: 'Próteses fixas e removíveis',
      resumo: 'Reposição de dentes ausentes com próteses fixas ou removíveis, para recuperar a mastigação e a estética do sorriso.',
      detalhe: 'O tipo de prótese é indicado de acordo com a sua saúde bucal, suas necessidades e preferências, e definido em conjunto após a avaliação.',
    },
    {
      id: 'implantes', categoria: 'Reabilitação oral', icone: 'implant',
      nome: 'Implantes dentários',
      resumo: 'Reposição de dentes ausentes com implantes, planejada a partir da avaliação da sua saúde bucal.',
      detalhe: 'A indicação depende da avaliação clínica e pode exigir exames complementares. O planejamento, as etapas e os prazos são conversados com você antes do início.',
    },
    {
      id: 'ortodontia', categoria: 'Ortodontia', icone: 'braces',
      nome: 'Ortodontia',
      resumo: 'Tratamento com aparelho ortodôntico para alinhar os dentes e ajustar a mordida.',
      detalhe: 'O tipo de aparelho e a duração do tratamento são definidos após a avaliação e variam de caso para caso.',
    },
    {
      id: 'clareamento', categoria: 'Estética', icone: 'sparkle',
      nome: 'Clareamento dental',
      resumo: 'Tratamento estético para clarear os dentes, com avaliação prévia e orientação em cada etapa.',
      detalhe: 'A indicação, a técnica e o número de sessões são definidos após avaliação da saúde dos seus dentes e gengivas. Os resultados variam de pessoa para pessoa e são conversados com você antes de começar.',
    },
    {
      id: 'facetas', categoria: 'Estética', icone: 'smile',
      nome: 'Facetas estéticas',
      resumo: 'Procedimento estético para melhorar a cor, o formato ou o alinhamento aparente dos dentes.',
      detalhe: 'A indicação, o material e a quantidade de facetas são definidos após avaliação e planejamento, respeitando as características do seu sorriso.',
    },
    {
      id: 'harmonizacao', categoria: 'Estética', icone: 'face',
      nome: 'Harmonização orofacial',
      resumo: 'Procedimentos para o equilíbrio estético e funcional da face, indicados após avaliação individual.',
      detalhe: 'Cada procedimento é indicado com critério, respeitando suas características e expectativas. Os resultados variam de pessoa para pessoa.',
    },
  ],

  /**
   * Fotos REAIS do consultório. Ex.:
   * { src: 'assets/img/consultorio-recepcao.webp', largura: 1200, altura: 900, alt: 'Recepção do consultório', legenda: 'Recepção' }
   */
  galeria: [],

  /**
   * Depoimentos REAIS e AUTORIZADOS por escrito para publicação. Ex.:
   * { texto: '...', autor: 'Nome autorizado', detalhe: 'Paciente desde 2024' }
   * Lista vazia = seção oculta no site público.
   */
  depoimentos: [],

  /** Perguntas frequentes — respostas em RASCUNHO, revisar com a profissional. {endereco} é substituído automaticamente. */
  faq: [
    {
      pergunta: 'Como posso agendar uma consulta?',
      resposta: 'Preencha o formulário de agendamento nesta página e envie a mensagem gerada ao consultório. A data e o horário só ficam reservados após a confirmação.',
    },
    {
      pergunta: 'Como funciona a primeira avaliação?',
      resposta: 'É o momento de conversar sobre suas necessidades e expectativas, realizar o exame clínico e entender as opções de tratamento indicadas para o seu caso, com explicações claras sobre cada etapa.',
    },
    {
      pergunta: 'Quais tratamentos estão disponíveis?',
      resposta: 'Os tratamentos oferecidos estão descritos na seção Tratamentos. Se tiver dúvida sobre um procedimento específico, envie sua pergunta pelos canais da seção Contato.',
    },
    {
      pergunta: 'Quais convênios são atendidos?',
      resposta: '{convenios}',
    },
    {
      pergunta: 'Como posso obter informações sobre valores?',
      resposta: 'Os valores dependem do planejamento definido após a avaliação individual. Para informações iniciais, entre em contato pelos canais da seção Contato.',
    },
    {
      pergunta: 'Onde fica o consultório e qual o horário de atendimento?',
      resposta: '{endereco}',
    },
    {
      pergunta: 'Como entrar em contato?',
      resposta: 'Pelo formulário de agendamento ou pelos canais listados na seção Contato, como o Instagram.',
    },
  ],

  /** Integrações futuras. Deixe vazio até existir um ID real (e implemente aviso de cookies se usar analytics). */
  integracoes: {
    googleAnalyticsId: '',
    googleSiteVerification: '',
  },
};
