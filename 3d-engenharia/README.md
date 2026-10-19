# 3D Engenharia — site institucional

Site institucional premium com hero 3D interativo (edifício procedural em Three.js / React Three Fiber).

**Stack:** React 18 + TypeScript + Vite · Tailwind CSS · React Three Fiber / drei (Three.js) · Framer Motion · Lenis (rolagem suave) · Lucide (ícones).

## Rodar localmente

Pré-requisito: Node.js 18 ou superior.

```bash
cd 3d-engenharia
npm install
npm run dev        # http://localhost:5173
```

Para testar a versão de produção:

```bash
npm run build      # checa tipos + gera dist/
npm run preview    # http://localhost:4173
```

## Publicar

`npm run build` gera a pasta `dist/` (site estático: `index.html`, `privacidade/index.html`, `assets/`, `images/`). Ela pode ser hospedada em qualquer serviço de arquivos estáticos:

- **Vercel**: importe o repositório → *Root Directory* `3d-engenharia` → framework *Vite* (build `npm run build`, saída `dist`).
- **Netlify**: *Base directory* `3d-engenharia`, *Build command* `npm run build`, *Publish directory* `3d-engenharia/dist`.
- **Hospedagem tradicional (cPanel/FTP)**: envie o conteúdo de `dist/` para a pasta pública (`public_html`).

Configure as variáveis de ambiente no painel da hospedagem (ou em `.env`, veja `.env.example`) **antes** do build:

| Variável | Para quê |
|---|---|
| `VITE_FORM_ENDPOINT` | URL que recebe o formulário via POST JSON (Formspree, Getform, API própria). Sem ela, o formulário **não envia** e avisa o visitante. |
| `VITE_WHATSAPP_NUMBER` | Número oficial com DDI+DDD, só dígitos (ex.: `5511999999999`). Sem ele, o botão flutuante não aparece em produção. |

Depois de publicar, ajuste em `index.html` a imagem `og:image` (1200×630) e, se quiser, descomente o `Sitemap` em `public/robots.txt`.

## Onde editar o conteúdo

| O quê | Arquivo |
|---|---|
| Nome, logo, e-mail, telefone, endereço, horário, redes sociais, WhatsApp, endpoint do formulário, modelo 3D oficial | `src/config/site.ts` |
| Textos da primeira tela | `src/content/hero.ts` |
| Sobre (história, pilares, fotos, equipe) | `src/content/about.ts` |
| Serviços (título, descrição, ícone, imagem, link) | `src/content/services.ts` |
| Portfólio (nome, categoria, localização, ano, descrição, imagens) | `src/content/projects.ts` |
| Diferenciais | `src/content/differentials.ts` |
| Política de privacidade (modelo, revisar com o jurídico) | `src/components/PrivacyPage.tsx` |

Campos de contato vazios simplesmente não aparecem. Nada foi inventado: **telefone, e-mail, endereço e redes sociais estão em branco** até serem preenchidos.

### Logo
A logo foi **redesenhada em vetor** a partir da imagem oficial (esfera vermelha com o "3", arco azul do "D" e "ENGENHARIA"):

- `public/brand/logo.svg` — versão original (fundos claros)
- `public/brand/logo-negativo.svg` — versão para fundos escuros (texto branco)
- `public/favicon.svg` — símbolo
- `src/components/ui/Logo.tsx` — a mesma logo embutida no site (cabeçalho horizontal e rodapé empilhado)

Se a empresa tiver o arquivo vetorial original (AI/EPS/SVG/PDF), substitua os arquivos acima ou defina `logo.src` em `src/config/site.ts` para usar o arquivo oficial.

### Serviços e vídeos
Os serviços oficiais (**Execução de obras**, **Administração de obras** e **Venda de imóveis**) estão em `src/content/services.ts`. Cada card toca no fundo um trecho curto e mudo (`public/videos/*-loop.mp4` + `.webm`), que só é baixado quando o card aparece na tela, e tem o botão "Assistir ao vídeo", que abre o vídeo completo com som (`residencial-alamedas.mp4`, `residencial-paris.mp4`). Os vídeos de obra também aparecem nos detalhes do portfólio (campo `video` em `src/content/projects.ts`).

Para trocar um vídeo, use MP4 (H.264 + AAC) com `-movflags +faststart`. Para os loops, gere também a versão `.webm` (VP9) de mesmo nome, por exemplo:

```bash
ffmpeg -i bruto.mp4 -ss 5 -t 8 -vf scale=540:-2 -an -c:v libx264 -crf 28 -movflags +faststart nome-loop.mp4
ffmpeg -i nome-loop.mp4 -c:v libvpx-vp9 -crf 38 -b:v 0 -an nome-loop.webm
```

### Obras reais
O **Residencial Alamedas** (em execução; imagens tiradas do vídeo da obra) e o **Residencial Paris** (fotos do post oficial no Instagram @3dengenhariacb) está em `public/images/projetos/residencial-paris/` e é o primeiro item do portfólio; suas fotos também aparecem em "Sobre" e no serviço "Obras residenciais". Para adicionar outra obra: crie uma pasta em `public/images/projetos/`, gere as versões `-1600.webp` e `-800.webp` e cadastre-a em `src/content/projects.ts` com `projectImage(...)` (sem `demo: true`).

### Fotografias demonstrativas
As demais imagens são **ilustrativas, de banco de imagens** (Unsplash, ver `public/images/demo/CREDITOS.md`) e estão identificadas no site com selos "Conteúdo demonstrativo" / "Foto ilustrativa". Para trocar, salve as fotos em `public/images/` (de preferência em WebP, larguras de 1600 e 800 px) e atualize os caminhos nos arquivos de `src/content/`. Quando todo o conteúdo for real, desligue os selos com `showDemoBadges: false` em `src/config/site.ts`.

### Modelo 3D oficial
Por padrão, o hero mostra um edifício **procedural** (gerado em código, sem arquivos para baixar). Para usar um modelo oficial: exporte em `.glb` (idealmente comprimido com Draco/Meshopt, até ~5 MB), salve em `public/models/` e defina `hero3d.modelUrl: '/models/edificio.glb'` (ajuste `modelScale` para a altura ficar em torno de 6–8 unidades). Se o arquivo falhar ao carregar, o site volta automaticamente para o modelo procedural.

## Experiência 3D: como funciona

- **Animação de entrada**: o traçado técnico é desenhado, os pavimentos sobem um a um acompanhados de um anel de "scan", as janelas acendem e a câmera recua de forma cinematográfica.
- **Mouse**: a câmera ajusta a perspectiva (parallax); fundo, edifício e interface se movem em profundidades diferentes; as coordenadas técnicas acompanham o cursor.
- **Arrastar**: gira o modelo dentro de limites (±35° na horizontal, pequena inclinação vertical), que volta suavemente ao repouso.
- **Celular**: arraste horizontal gira o modelo e o vertical rola a página normalmente; sem sombras em tempo real, com resolução limitada.
- **Teclado**: com a área 3D em foco, as setas giram o modelo.
- **Desempenho**: o código 3D (~250 KB gzip) é carregado sob demanda; o render pausa quando o hero sai da tela; peças repetidas usam *instancing*.
- **Alternativas**: sem WebGL, ou se a cena falhar (inclusive perda de contexto da GPU), aparece um desenho técnico em SVG; `prefers-reduced-motion` desativa animações contínuas e a introdução.

## Estrutura

```
src/
  config/site.ts          dados institucionais e integrações
  content/                textos e listas editáveis
  components/
    three/                cena 3D (Scene, Building, fallback, estado compartilhado)
    sections/             Hero, About, Services, Projects (+ modal), Differentials, Contact
    layout/               Header, Footer, WhatsAppButton
    ui/                   Button, Reveal, Parallax, ResponsiveImage, Logo, ícones
  hooks/  lib/            rolagem suave, media queries, detecção de WebGL
privacidade/index.html    página da política de privacidade
```
