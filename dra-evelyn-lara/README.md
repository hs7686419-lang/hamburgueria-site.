# Dra. Evelyn Lara | Cirurgiã-Dentista — website

Site estático (HTML, CSS e JavaScript puro, sem build e sem dependências), no mesmo padrão do restante do repositório.

```bash
cd dra-evelyn-lara
python3 -m http.server 8000   # acesse http://localhost:8000
```

## Antes de publicar — checklist obrigatório

Tudo que é editável fica em **`assets/js/config.js`**. Campos vazios são tratados como *pendentes*: aparecem marcados no modo `rascunho` e **somem** no modo `publicado`. Nada fictício vai ao ar.

| Item | Onde | Situação atual |
|---|---|---|
| WhatsApp oficial (DDI+DDD+número) | `contato.whatsapp` | **pendente**: sem ele não há botão flutuante e o formulário só mostra a mensagem gerada |
| CRO e UF | `profissional.cro`, `profissional.croUf` | **pendente**: a publicidade odontológica deve trazer nome e número de inscrição no CRO (normas do CFO) |
| Endereço validado | `endereco.*` + `validado: true` | **pendente** |
| Horários, e-mail, Instagram | `horarios`, `contato.*` | **pendentes** |
| Lista real de tratamentos | `tratamentos` | os 4 itens atuais são **exemplos** (`demo: true`) e ficam ocultos no modo publicado |
| Respostas do FAQ | `faq` | **rascunho**, revisar com a profissional |
| Texto da seção "Sobre" | `index.html` (`#sobre`) | texto-base neutro, revisar |
| Fotos do consultório | `galeria` | sem fotos, a seção não aparece no site publicado |
| Depoimentos | `depoimentos` | só reais e autorizados por escrito; sem eles a seção não aparece |
| Política de privacidade | `privacidade.html` | texto-base **sem revisão jurídica**; completar os trechos entre colchetes |
| Domínio | `dominio` + `og:image` absoluto e `canonical` no `<head>` + `robots.txt` | pendente |

Depois disso, troque `modo: 'rascunho'` por `modo: 'publicado'`.

## Estrutura

| Arquivo | Função |
|---|---|
| `index.html` | Página única: hero, sobre, tratamentos, diferenciais, ambiente, depoimentos, agendamento, FAQ, contato e rodapé |
| `assets/css/styles.css` | Tokens de design (cores, tipografia, espaços, raios, sombras, transições) e todos os estilos, mobile-first |
| `assets/js/config.js` | **Configuração central** (dados da profissional, serviços, FAQ etc.) |
| `assets/js/main.js` | Menu, header, revelação ao rolar, formulário, WhatsApp, FAQ, galeria/lightbox, carrossel e dados estruturados |
| `privacidade.html` / `404.html` | Política de privacidade (texto-base) e página de erro |
| `assets/img/` | Capa original da cliente (AVIF/WebP em 800, 1200 e 1672 px), retrato da seção "Sobre", imagem de compartilhamento e ícones |

## Primeira dobra (hero)

A capa enviada pela cliente aparece **inteira, sem recorte**, em largura total (proporção 1672×941). O título, a headline e o texto já fazem parte da arte; em HTML eles ficam visualmente ocultos no desktop, mas continuam disponíveis para leitores de tela e para o Google. No desktop (≥ 1024 px), o botão "Agende sua Consulta" real fica exatamente sobre o botão desenhado na arte, posicionado em unidades `cqw` para acompanhar qualquer largura, e "Conheça os tratamentos" fica ao lado. No celular e no tablet, a imagem também aparece inteira, e o texto e os botões vêm logo abaixo, em tamanho legível. O cabeçalho reproduz a variação de tom da borda superior da foto.

## Agendamento

1. O formulário valida os campos (nome, telefone com DDD, tipo de atendimento e consentimento), aplica máscara ao telefone e evita envios duplicados.
2. Ao concluir, gera uma mensagem e mostra o botão **"Abrir WhatsApp e enviar"** (`wa.me`). O visitante decide se envia.
3. Os dados **não são armazenados** pelo site. O texto deixa claro que se trata de uma *solicitação*: a consulta só fica agendada após a confirmação do consultório.

Integração futura: o objeto `Agendamento.preparar()` em `main.js` é o ponto único de troca para uma agenda externa. `agendamento.urlAgendaExterna` exibe um link para agenda online, se existir.

## Qualidade verificada

- Sem rolagem horizontal em 360, 390, 430, 768, 1024, 1440 e 1920 px; sem erros de console.
- 39 verificações automatizadas (Playwright) de menu, formulário, WhatsApp, FAQ, carrossel, lightbox, modos rascunho e publicado, JSON-LD e `prefers-reduced-motion`.
- Contraste AA nos pares de cor de texto principais.
- Core Web Vitals **não foram medidos** em produção. A imagem do hero tem `preload` e `fetchpriority="high"` e as demais usam lazy loading.

## Observações

- `404.html` usa caminhos relativos: funciona quando o site é servido na raiz do domínio.
- Analytics: não há nenhum instalado. Se for adicionado (`integracoes.googleAnalyticsId`), implemente também um aviso de cookies com consentimento antes de carregar o script.
- O mapa do Google só carrega quando o visitante clica em "Exibir mapa", o que evita cookies de terceiros sem ação do visitante.
