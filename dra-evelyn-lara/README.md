# Dra. Evelyn Lara | Cirurgiã-Dentista — website

Site estático (HTML, CSS e JavaScript puro, sem build e sem dependências), no mesmo padrão do restante do repositório.

```bash
cd dra-evelyn-lara
python3 -m http.server 8000   # acesse http://localhost:8000
```

## Dados confirmados (já no `config.js`)

- **Dra. Evelyn Lara**, Cirurgiã-Dentista · Clínica Geral, **CRO-MG 60043**
- Rua Artur Bernardes, 265, Campo Belo – MG · segunda a sexta-feira, das 09h às 18h
- WhatsApp: (35) 99236-6122
- Instagram: [@dra_evilynlara](https://www.instagram.com/dra_evilynlara/)
- Convênios: Bradesco Dental e Odontoprev
- Destaques: 5 anos cuidando de sorrisos em Campo Belo; mais de 200 clareamentos realizados
- 10 tratamentos, em 4 categorias: clínica geral, limpeza, restaurações, tratamento de canal (endodontia), próteses, implantes, tratamento ortodôntico com aparelho, clareamento, facetas e harmonização orofacial

## Antes de publicar: pendências

Campos vazios aparecem marcados no modo `rascunho` e **somem** no modo `publicado`. Nada fictício vai ao ar.

| Item | Onde | Situação |
|---|---|---|
| E-mail profissional | `contato.email` | pendente (opcional) |
| Título "Especialista em clareamento dental" | `profissional.especialidade.confirmado` | **não publicado**. Pelas normas do CFO, "especialista" exige especialidade registrada no CRO, e não existe especialidade "clareamento" na lista do CFO (a mais próxima é Dentística). Confirmar antes de ativar |
| CEP e bairro | `endereco.cep`, `endereco.bairro` | opcionais; melhoram o Google Maps e os dados estruturados |
| Respostas do FAQ e texto "Sobre" | `faq`, `index.html#sobre` | revisar com a profissional |
| Fotos do consultório | `galeria` | sem fotos, a seção não aparece no site publicado |
| Depoimentos | `depoimentos` | só reais e autorizados por escrito |
| Política de privacidade | `privacidade.html` | texto-base **sem revisão jurídica**; completar os colchetes |
| Domínio | `dominio` + `og:image` absoluto + `robots.txt` | pendente |

**Qualificação "Clínica Geral" (`profissional.qualificacao`):** pelo Código de Ética Odontológica, áreas de atuação e procedimentos anunciados devem vir precedidos do título de especialidade registrada no CRO ou da qualificação de clínico geral. Por isso a linha "Cirurgiã-Dentista · Clínica Geral · CRO-MG 60043" aparece antes da lista de tratamentos, na legenda da foto e no rodapé. Se ela tiver especialidade registrada, informe para ajustar.

Grafia confirmada: **Evelyn Lara**. O perfil do Instagram continua sendo @dra_evilynlara, que é o endereço real dele.

### Para publicar

1. `config.js`: troque `modo: 'rascunho'` por `modo: 'publicado'`.
2. `index.html` e `privacidade.html`: troque `<meta name="robots" content="noindex, nofollow">` por `content="index, follow"`. A pré-visualização fica fora do Google de propósito.
3. Com o domínio definido, escreva no `<head>` do `index.html` o `og:image` com URL absoluta, o `og:url` e o `<link rel="canonical">`. Robôs de prévia de link (WhatsApp, Facebook) não executam JavaScript.
4. Rode `node tools/prerender.mjs` (veja abaixo).

## Estrutura

| Arquivo | Função |
|---|---|
| `index.html` | Página única: hero, sobre, tratamentos, diferenciais, ambiente, depoimentos, vídeo de apresentação, agendamento, FAQ, contato e rodapé |
| `assets/css/styles.css` | Tokens de design (cores, tipografia, espaços, raios, sombras, transições) e todos os estilos, mobile-first |
| `assets/js/config.js` | **Configuração central** (dados da profissional, serviços, FAQ etc.) |
| `assets/js/main.js` | Menu, header, revelação ao rolar, formulário, WhatsApp, FAQ, galeria/lightbox, carrossel e dados estruturados. Cada parte roda isolada, e uma falha não derruba as outras |
| `tools/prerender.mjs` | Grava no `index.html` o conteúdo publicado gerado a partir do `config.js` (serviços, endereço, CRO, horários, FAQ, JSON-LD) |
| `assets/fonts/` | Cormorant Garamond e Manrope (subset latino, licença OFL) hospedadas no próprio site |
| `privacidade.html` / `404.html` | Política de privacidade (texto-base) e página de erro |
| `assets/img/` | Capa original (AVIF/WebP em 800, 1200 e 1672 px), foto de jaleco da seção "Sobre" (480 e 768 px, sem recorte), imagem de compartilhamento e ícones |
| `assets/video/` | Vídeo de apresentação (WebM 0,9 MB / MP4 1,2 MB, 712×1280) e pôster |

## Pré-renderização (SEO)

Os dados vêm do `config.js`, e o `main.js` monta as seções. O Google executa JavaScript e vê tudo, mas outros robôs (Bing, prévias de link, buscadores de IA) leem só o HTML. Por isso o `index.html` já traz o conteúdo publicado entre marcadores `<!--pr:nome-->`. **Sempre que editar o `config.js`, rode:**

```bash
cd dra-evelyn-lara
node tools/prerender.mjs   # requer Playwright
```

O script abre o site em modo publicado e grava o resultado no HTML. Rodar de novo sem mudanças não altera nada. Se você esquecer de rodá-lo, os visitantes continuam vendo o conteúdo certo; só a versão estática fica desatualizada. Se o `config.js` tiver erro de sintaxe, o site mantém essa versão pré-renderizada em vez de quebrar.

## Primeira dobra (hero)

A capa enviada pela cliente aparece **inteira, sem recorte**, em largura total (proporção 1672×941). O título, a headline e o texto já fazem parte da arte; em HTML eles ficam visualmente ocultos no desktop, mas continuam disponíveis para leitores de tela e para o Google. No desktop (≥ 1024 px), o botão "Agende sua Consulta" real fica exatamente sobre o botão desenhado na arte, posicionado em unidades `cqw` para acompanhar qualquer largura, e "Conheça os tratamentos" fica ao lado. No celular e no tablet, a imagem também aparece inteira, e o texto e os botões vêm logo abaixo, em tamanho legível. O cabeçalho reproduz a variação de tom da borda superior da foto.

## Vídeo de apresentação

O vídeo enviado pela cliente (8 s, vertical, trilha musical sem fala) foi otimizado de 2,4 MB para 0,9 MB (WebM) e 1,2 MB (MP4). O arquivo original tinha faixas pretas de 3 a 4 px nas laterais nos primeiros 5,6 s, removidas na conversão. Nenhuma parte da imagem foi cortada. Comportamento:

- o pôster só carrega quando a seção se aproxima da tela;
- o vídeo só é baixado se puder tocar sozinho (sem som, quando visível) ou quando o visitante clica em reproduzir;
- pausa fora da tela; botões de pausar/reproduzir e de som, acessíveis por teclado;
- com "reduzir movimento" ou economia de dados, não toca nem baixa sozinho.

## Agendamento

1. O formulário valida os campos (nome, telefone com DDD, tipo de atendimento e consentimento) e evita envios duplicados. O telefone aceita formatos colados como "+55 37 99988-7766" ou "037 ...", confere o DDD e as regras de fixo e celular, e mantém o cursor no lugar.
2. Ao concluir, gera uma mensagem. Com WhatsApp configurado, mostra **"Abrir WhatsApp e enviar"** (`wa.me`). Sem ele, mostra **"Copiar mensagem"** e **"Enviar pelo Instagram"**. O visitante decide se envia.
3. O formulário nunca é enviado pela URL. Sem JavaScript, ele fica oculto e aparece a alternativa pelo Instagram.
4. Os dados **não são armazenados** pelo site. O texto deixa claro que se trata de uma *solicitação*: a consulta só fica agendada após a confirmação do consultório.

Integração futura: o objeto `Agendamento.preparar()` em `main.js` é o ponto único de troca para uma agenda externa. `agendamento.urlAgendaExterna` exibe um link para agenda online, se existir.

## Qualidade verificada

- Sem rolagem horizontal em 360, 390, 430, 768, 1024, 1440 e 1920 px; sem erros de console.
- 112 verificações automatizadas (Playwright): menu, formulário, telefone, WhatsApp real e fluxo sem WhatsApp, Instagram, copiar mensagem, FAQ, tratamentos, carrossel, lightbox, vídeo, modos rascunho e publicado, JSON-LD, site sem JavaScript, falha do `main.js` ou do `config.js`, 404 em caminhos aninhados e `prefers-reduced-motion`.
- Revisão independente em 5 frentes (conformidade CFO/LGPD, acessibilidade WCAG 2.2, visual, JavaScript, performance/SEO), com cada achado verificado antes de ser corrigido.
- Contraste AA nos pares de cor de texto principais.
- Core Web Vitals **não foram medidos** em produção. A imagem do hero tem `preload` e `fetchpriority="high"` e as demais usam lazy loading.

## Observações

- `404.html` usa caminhos absolutos (`/assets/...`): o site deve ficar na raiz do domínio.
- Analytics: não há nenhum instalado. Se for adicionado (`integracoes.googleAnalyticsId`), implemente também um aviso de cookies com consentimento antes de carregar o script.
- O mapa do Google só carrega quando o visitante clica em "Exibir mapa", o que evita cookies de terceiros sem ação do visitante. As fontes ficam no próprio site, sem conexão com o Google.
