# Ômega 3 1g · Oficialfarma — landing page

Página de produto para o **Ômega 3 1g (60 cápsulas) da Oficialfarma**, pensada para um público jovem, ativo e em busca de equilíbrio. Conceito: **"Equilíbrio é o novo shape."**

Site estático (HTML/CSS/JS puro, sem build). Abra via servidor local:

```bash
cd omega3
python3 -m http.server 8000   # depois acesse http://localhost:8000
```

> Abrir `index.html` direto com `file://` também funciona (os scripts são clássicos, não módulos).

## Estrutura

| Arquivo | Função |
|---|---|
| `index.html` | Página completa: header, hero com frasco + cápsulas 3D, faixa animada, manifesto, benefícios (bento), rotina 24h, check-in de equilíbrio, produto com calculadora, dúvidas, CTA final, rodapé com avisos legais e barra de compra no celular |
| `css/style.css` | Design system (tokens em `:root`) e todos os estilos, mobile-first, com `prefers-reduced-motion` |
| `js/main.js` | Interações: menu, reveals, manifesto palavra a palavra, relógio da rotina, check-in, calculadora, barra de compra e carregamento sob demanda do 3D |
| `js/capsules3d.js` | Cápsulas softgel douradas em 3D (Three.js) flutuando atrás do frasco no hero |
| `vendor/three.min.js` | Three.js r149 (MIT), baixado só depois que a página termina de carregar |
| `assets/` | Logo e símbolo Oficialfarma (SVG), favicon, recorte do frasco sem fundo (`omega3-frasco.webp`) e imagem de compartilhamento (`og-omega3.jpg`) |

## Configurar a loja

No topo de `js/main.js`:

```js
var CONFIG = {
  linkCompra: '',   // URL da página de compra. Vazio: os botões levam até a seção #produto
  whatsapp: '',     // ex.: '5511999999999'. Preenchido, mostra o botão e manda a quantidade escolhida
  preco: null,      // ex.: 49.9. Preenchido, mostra preço por frasco e total na calculadora
  capsulasPorFrasco: 60,
  maxFrascos: 6
};
```

- Sem `linkCompra` e com `whatsapp`, o botão **Comprar agora** abre o WhatsApp com a quantidade escolhida.
- Ao publicar, troque `assets/og-omega3.jpg` na tag `og:image` pela **URL absoluta** (redes sociais não leem caminho relativo).

## O que foi usado e o que falta confirmar

Informações usadas: Ômega 3, **1g por cápsula**, **60 cápsulas**, marca Oficialfarma, frasco vermelho, e os quatro pilares da arte da marca (triglicerídeos, função cerebral, visão, pele).

**Não foram inventados** preço, quantidade de EPA/DHA, origem do óleo, modo de uso, certificações nem frete. A página remete à embalagem e a profissionais nesses pontos. Se quiser exibir esses dados, preencha com o que estiver no rótulo.

### Alegações (revisar com o regulatório)

- A única alegação funcional usada é a de ômega 3 aprovada pela ANVISA (IN 28/2018), com a frase obrigatória: *"auxilia na manutenção de níveis saudáveis de triglicerídeos, desde que associado a uma alimentação equilibrada e hábitos de vida saudáveis"*. Ela exige quantidade mínima de EPA+DHA por porção. **Confirme que o produto atende.**
- Cérebro, visão e pele aparecem como **informação educativa** (onde o DHA está presente no corpo), sem prometer efeito. A arte original fala em "protege a visão" e "reduz inflamações", que não estão na lista de alegações permitidas. Por isso foram suavizadas.
- O rodapé traz os avisos obrigatórios de suplemento alimentar (RDC 243/2018).
- O check-in de equilíbrio é lúdico, avisa que não é diagnóstico e não usa dados pessoais: nada é enviado nem salvo.

## Acessibilidade e desempenho

- HTML semântico, link "pular para o conteúdo", foco visível, abas e formulários com ARIA e teclado (setas no relógio da rotina).
- Com `prefers-reduced-motion`, as animações param e o 3D vira um quadro estático.
- O frasco do hero é pré-carregado. O 3D só é baixado depois do `load`, quando o navegador fica ocioso, e não carrega com economia de dados ou sem WebGL. Nesses casos ficam as cápsulas em CSS.
- O render 3D pausa fora da tela ou com a aba oculta.
