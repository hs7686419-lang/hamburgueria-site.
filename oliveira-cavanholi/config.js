/* =====================================================================
   CONFIGURAÇÃO CENTRAL — Oliveira & Cavanholi
   Todos os contatos, links e dados institucionais do site saem daqui.
   Altere somente este arquivo; páginas e botões se atualizam sozinhos.

   REGRA DE PUBLICAÇÃO
   Itens com `confirmado: false` NÃO aparecem no site publicado.
   Para revisar o site com eles visíveis (com selo "a confirmar"),
   abra a página com ?previa=1 no endereço, ex.: index.html?previa=1
   Depois que a empresa confirmar, mude para `confirmado: true`.
   Não preencha campos vazios com dados não confirmados.
   ===================================================================== */
window.SITE_CONFIG = {
  marca: {
    nome: 'Oliveira & Cavanholi',
    descritor: 'Contabilidade Consultiva',
    // Caminho do logotipo oficial (SVG/PNG). Vazio = usa o monograma provisório "O&C".
    logo: '',
    site: 'https://oliveiraecavanholi.com.br'
  },

  whatsapp: {
    // Número internacional SOMENTE com dígitos (formato exigido por https://wa.me/).
    // Número associado ao registro de contabilidade: +55 31 99796-4653.
    // Existe outro número (+55 31 99758-0203) ligado a um registro de gestão
    // empresarial com o mesmo nome — NÃO trocar sem confirmação da empresa.
    numero: '5531997964653',
    exibicao: '+55 31 99796-4653',
    confirmado: false,
    mensagem: 'Olá! Conheci a Oliveira & Cavanholi pelo site e gostaria de saber mais sobre os serviços de contabilidade consultiva e gestão empresarial.'
  },

  email: {
    endereco: 'administrativo@oliveiraecavanholi.com.br',
    assunto: 'Solicitação de informações — Oliveira & Cavanholi',
    confirmado: true // publicado pela própria empresa
  },

  instagram: {
    usuario: 'oliveiraecavanholi',
    url: 'https://www.instagram.com/oliveiraecavanholi/',
    // Galeria de presença digital: SOMENTE imagens autorizadas pela empresa.
    // Coloque os arquivos em assets/instagram/ e liste-os assim:
    // { imagem: 'assets/instagram/post-1.jpg', texto: 'Descrição da imagem', link: 'https://www.instagram.com/p/XXXX/' }
    // Vazio = a seção mostra apenas o convite para o perfil (sem posts simulados).
    galeria: []
  },

  endereco: {
    logradouro: 'Rua Goiás, 161',
    bairro: 'Boa Vista',
    cidade: 'Sete Lagoas',
    uf: 'MG',
    cep: '35700-085',
    // Endereço CADASTRAL encontrado em registros. Só marque true depois que a
    // empresa confirmar que é endereço de atendimento ao público.
    confirmado: false,
    // Se o atendimento for exclusivamente digital, mude para true: o mapa some
    // e a seção passa a informar atendimento on-line.
    atendimentoSomenteDigital: false
  },

  institucional: {
    // Preencher SOMENTE após confirmação. Campos vazios não aparecem no site.
    cnpj: '',
    registros: [] // ex.: ['CRC-MG 000000/O-0'] — registros profissionais confirmados
  },

  // Equipe: preencha apenas com pessoas e cargos confirmados pela empresa.
  // { nome: 'Nome Sobrenome', cargo: 'Cargo', registro: 'CRC-MG ...', foto: 'assets/equipe/nome.jpg' }
  // Vazio = a seção apresenta a forma de trabalho, sem nomes inventados.
  equipe: [],

  // Serviços apresentados no site (descrições gerais — revisar com a empresa).
  // `icone` usa os símbolos definidos no topo do index.html (#i-...).
  servicos: [
    {
      id: 'contabilidade-consultiva',
      titulo: 'Contabilidade consultiva',
      icone: 'layers',
      resumo: 'A contabilidade como fonte de informação para decidir — não apenas para cumprir obrigações.',
      itens: ['Rotinas contábeis organizadas', 'Leitura gerencial dos números', 'Apoio às decisões do negócio']
    },
    {
      id: 'bpo-financeiro',
      titulo: 'BPO financeiro',
      icone: 'cycle',
      resumo: 'Terceirização das rotinas financeiras para que a gestão ganhe tempo, controle e previsibilidade.',
      itens: ['Contas a pagar e a receber', 'Conciliação e fluxo de caixa', 'Relatórios periódicos']
    },
    {
      id: 'gestao-de-pessoas',
      titulo: 'Gestão de pessoas',
      icone: 'users',
      resumo: 'Processos de pessoal organizados, com atenção às obrigações e ao cuidado com a equipe.',
      itens: ['Rotinas de departamento pessoal', 'Organização de informações da equipe', 'Apoio à gestão de pessoas']
    },
    {
      id: 'consultoria-financeira',
      titulo: 'Consultoria financeira',
      icone: 'chart',
      resumo: 'Análise da saúde financeira e apoio no planejamento para decisões mais seguras.',
      itens: ['Diagnóstico financeiro', 'Planejamento e orçamento', 'Indicadores de desempenho']
    },
    {
      id: 'inteligencia-empresarial',
      titulo: 'Inteligência empresarial',
      icone: 'spark',
      resumo: 'Dados reunidos em indicadores e painéis para enxergar o negócio com clareza.',
      itens: ['Indicadores e painéis gerenciais', 'Visão integrada das áreas', 'Informação para planejar o futuro']
    }
  ],

  formulario: {
    // Sem backend configurado, o formulário monta a mensagem e a envia pelo
    // WhatsApp ou pelo aplicativo de e-mail do visitante.
    // Para envio direto, informe a URL de um serviço que aceite POST JSON
    // (ex.: Formspree, Getform, uma função serverless própria). Veja o README.
    endpoint: ''
  }
};
