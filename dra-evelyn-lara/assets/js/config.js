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
    cro: '',
    /** UF do CRO, ex.: 'SP'. */
    croUf: '',
  },

  contato: {
    /** WhatsApp oficial só com dígitos, com DDI + DDD (ex.: '5511999999999'). Vazio = pendente. */
    whatsapp: '',
    /** Telefone fixo/celular para ligação, no formato de exibição (ex.: '(11) 3333-4444'). */
    telefone: '',
    email: '',
    instagram: '', // URL completa do perfil, ex.: 'https://instagram.com/usuario'
  },

  endereco: {
    /** Marque true SOMENTE depois que o endereço for validado pela profissional. */
    validado: false,
    logradouro: '', // 'Rua Exemplo, 123 — Sala 45'
    bairro: '',
    cidade: '',
    uf: '',
    cep: '',
    /** Link opcional do Google Maps; se vazio, é gerado a partir do endereço. */
    linkMaps: '',
  },

  /** Horários confirmados, ex.: [{ dias: 'Segunda a sexta', horas: '9h às 18h' }] */
  horarios: [],

  agendamento: {
    /** 'whatsapp' hoje. Ponto preparado para futura integração com agenda externa. */
    provedor: 'whatsapp',
    /** URL de um sistema de agendamento online, se um dia existir. Vazio = não exibido. */
    urlAgendaExterna: '',
  },

  /**
   * Tratamentos. ATENÇÃO: os itens com `demo: true` são EXEMPLOS de layout e
   * NÃO representam serviços confirmados. No modo 'publicado' eles são ocultados.
   * Para cada serviço confirmado pela profissional, remova `demo` (ou use false).
   */
  tratamentos: [
    {
      id: 'avaliacao',
      nome: 'Consulta de avaliação',
      resumo: 'Um primeiro encontro para ouvir você, examinar com calma e explicar cada possibilidade com clareza.',
      detalhe: 'Na avaliação são conversados seus objetivos, histórico e incômodos. A partir dela é definido, junto com você, o planejamento mais adequado ao seu caso.',
      icone: 'stethoscope',
      demo: true,
    },
    {
      id: 'prevencao',
      nome: 'Prevenção e limpeza',
      resumo: 'Cuidados periódicos para manter dentes e gengivas saudáveis ao longo do tempo.',
      detalhe: 'Consultas de manutenção com orientação de higiene personalizada, para que o cuidado continue também em casa.',
      icone: 'sparkle',
      demo: true,
    },
    {
      id: 'restauracoes',
      nome: 'Restaurações',
      resumo: 'Tratamento de dentes com cáries ou desgastes, buscando função e aparência natural.',
      detalhe: 'O material e a técnica são indicados após avaliação individual, sempre com explicação prévia de cada etapa.',
      icone: 'tooth',
      demo: true,
    },
    {
      id: 'estetica',
      nome: 'Estética do sorriso',
      resumo: 'Procedimentos para harmonizar o sorriso respeitando suas características naturais.',
      detalhe: 'As opções estéticas dependem de avaliação clínica. Nenhum resultado é prometido antes do planejamento individual.',
      icone: 'smile',
      demo: true,
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
      resposta: 'Preencha o formulário de agendamento nesta página ou fale diretamente pelo WhatsApp. A solicitação é enviada ao consultório e a data e o horário só ficam reservados após a confirmação.',
    },
    {
      pergunta: 'Como funciona a primeira avaliação?',
      resposta: 'É o momento de conversar sobre suas necessidades e expectativas, realizar o exame clínico e entender as opções de tratamento indicadas para o seu caso, com explicações claras sobre cada etapa.',
    },
    {
      pergunta: 'Quais tratamentos estão disponíveis?',
      resposta: 'Os tratamentos oferecidos estão descritos na seção Tratamentos. Se tiver dúvida sobre um procedimento específico, envie sua pergunta pelo WhatsApp.',
    },
    {
      pergunta: 'Como posso obter informações sobre valores?',
      resposta: 'Os valores dependem do planejamento definido após a avaliação individual. Para informações iniciais, entre em contato pelo WhatsApp.',
    },
    {
      pergunta: 'Onde fica o consultório?',
      resposta: '{endereco}',
    },
    {
      pergunta: 'Como entrar em contato?',
      resposta: 'Pelo formulário de agendamento, pelo botão de WhatsApp ou pelos canais listados na seção Contato.',
    },
  ],

  /** Integrações futuras. Deixe vazio até existir um ID real (e implemente aviso de cookies se usar analytics). */
  integracoes: {
    googleAnalyticsId: '',
    googleSiteVerification: '',
  },
};
