# Dra. Evelyn Lara | Cirurgiã-Dentista — website

Site estático (HTML, CSS e JavaScript puro, sem build e sem dependências), no mesmo padrão do restante do repositório.

```bash
cd dra-evelyn-lara
python3 -m http.server 8000   # acesse http://localhost:8000
```

## Dados confirmados (já no `config.js`)

- **Dra. Evelyn Lara**, Cirurgiã-Dentista, **CRO-MG 60043**
- Rua Artur Bernardes, 265, Campo Belo – MG · segunda a sexta-feira, das 09h às 18h
- Instagram: [@dra_evilynlara](https://www.instagram.com/dra_evilynlara/)
- Convênios: Bradesco Dental e Odontoprev
- Destaques: 5 anos cuidando de sorrisos em Campo Belo; mais de 200 clareamentos realizados
- 10 tratamentos, em 4 categorias: clínico geral, limpeza, restaurações, endodontia, próteses, implantes, ortodontia, clareamento, facetas e harmonização orofacial

## Antes de publicar: pendências

Campos vazios aparecem marcados no modo `rascunho` e **somem** no modo `publicado`. Nada fictício vai ao ar.

| Item | Onde | Situação |
|---|---|---|
| WhatsApp oficial (DDI+DDD+número) | `contato.whatsapp` | **pendente**. Sem ele, o formulário oferece "Copiar mensagem" e "Enviar pelo Instagram", e o botão flutuante não aparece |
| Título "Especialista em clareamento dental" | `profissional.especialidade.confirmado` | **não publicado**. Pelas normas do CFO, "especialista" exige especialidade registrada no CRO, e não existe especialidade "clareamento" na lista do CFO (a mais próxima é Dentística). Confirmar antes de ativar |
| CEP e bairro | `endereco.cep`, `endereco.bairro` | opcionais; melhoram o Google Maps e os dados estruturados |
| Respostas do FAQ e texto "Sobre" | `faq`, `index.html#sobre` | revisar com a profissional |
| Fotos do consultório | `galeria` | sem fotos, a seção não aparece no site publicado |
| Depoimentos | `depoimentos` | só reais e autorizados por escrito |
| Política de privacidade | `privacidade.html` | texto-base **sem revisão jurídica**; completar os colchetes |
| Domínio | `dominio` + `og:image` absoluto + `robots.txt` | pendente |

Observação: o bordado do jaleco e o Instagram usam a grafia **"Evilyn"**, e o site usa **"Evelyn"** (como na capa e no nome profissional informado). Confirme a grafia oficial.

Depois disso, troque `modo: 'rascunho'` por `modo: 'publicado'`.

## Estrutura

| Arquivo | Função |
|---|---|
| `index.html` | Página única: hero, sobre, tratamentos, diferenciais, ambiente, depoimentos, vídeo de apresentação, agendamento, FAQ, contato e rodapé |
| `assets/css/styles.css` | Tokens de design (cores, tipografia, espaços, raios, sombras, transições) e todos os estilos, mobile-first |
| `assets/js/config.js` | **Configuração central** (dados da profissional, serviços, FAQ etc.) |
| `assets/js/main.js` | Menu, header, revelação ao rolar, formulário, WhatsApp, FAQ, galeria/lightbox, carrossel e dados estruturados |
| `privacidade.html` / `404.html` | Política de privacidade (texto-base) e página de erro |
| `assets/img/` | Capa original (AVIF/WebP em 800, 1200 e 1672 px), foto de jaleco da seção "Sobre" (480 e 768 px, sem recorte), imagem de compartilhamento e ícones |
| `assets/video/` | Vídeo de apresentação (WebM 0,9 MB / MP4 1,2 MB, 712×1280) e pôster |

## Primeira dobra (hero)

A capa enviada pela cliente aparece **inteira, sem recorte**, em largura total (proporção 1672×941). O título, a headline e o texto já fazem parte da arte; em HTML eles ficam visualmente ocultos no desktop, mas continuam disponíveis para leitores de tela e para o Google. No desktop (≥ 1024 px), o botão "Agende sua Consulta" real fica exatamente sobre o botão desenhado na arte, posicionado em unidades `cqw` para acompanhar qualquer largura, e "Conheça os tratamentos" fica ao lado. No celular e no tablet, a imagem também aparece inteira, e o texto e os botões vêm logo abaixo, em tamanho legível. O cabeçalho reproduz a variação de tom da borda superior da foto.

## Vídeo de apresentação

O vídeo enviado pela cliente (8 s, vertical, trilha musical sem fala) foi otimizado de 2,4 MB para 0,9 MB (WebM) e 1,2 MB (MP4). O arquivo original tinha faixas pretas de 3 a 4 px nas laterais nos primeiros 5,6 s, removidas na conversão. Nenhuma parte da imagem foi cortada. Comportamento:

- só é baixado quando a seção se aproxima da tela;
- toca sem som quando visível e pausa fora da tela;
- botões de pausar/reproduzir e de ativar o som, acessíveis por teclado;
- com "reduzir movimento" ou economia de dados, não toca sozinho.

## Agendamento

1. O formulário valida os campos (nome, telefone com DDD, tipo de atendimento e consentimento), aplica máscara ao telefone e evita envios duplicados.
2. Ao concluir, gera uma mensagem e mostra o botão **"Abrir WhatsApp e enviar"** (`wa.me`). O visitante decide se envia.
3. Os dados **não são armazenados** pelo site. O texto deixa claro que se trata de uma *solicitação*: a consulta só fica agendada após a confirmação do consultório.

Integração futura: o objeto `Agendamento.preparar()` em `main.js` é o ponto único de troca para uma agenda externa. `agendamento.urlAgendaExterna` exibe um link para agenda online, se existir.

## Qualidade verificada

- Sem rolagem horizontal em 360, 390, 430, 768, 1024, 1440 e 1920 px; sem erros de console.
- 65 verificações automatizadas (Playwright): menu, formulário, WhatsApp/Instagram, copiar mensagem, FAQ, tratamentos por categoria, carrossel, lightbox, vídeo, modos rascunho e publicado, JSON-LD e `prefers-reduced-motion`.
- Contraste AA nos pares de cor de texto principais.
- Core Web Vitals **não foram medidos** em produção. A imagem do hero tem `preload` e `fetchpriority="high"` e as demais usam lazy loading.

## Observações

- `404.html` usa caminhos relativos: funciona quando o site é servido na raiz do domínio.
- Analytics: não há nenhum instalado. Se for adicionado (`integracoes.googleAnalyticsId`), implemente também um aviso de cookies com consentimento antes de carregar o script.
- O mapa do Google só carrega quando o visitante clica em "Exibir mapa", o que evita cookies de terceiros sem ação do visitante.
