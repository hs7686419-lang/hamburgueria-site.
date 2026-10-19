> **Novo:** o site institucional da **3D Engenharia** (React + TypeScript + Three.js) está em [`3d-engenharia/`](3d-engenharia/README.md). O conteúdo abaixo é o projeto anterior (hamburgueria), mantido sem alterações.

# Brasa & Massa — landing page + hambúrguer 3D desmontável

Site estático (HTML/CSS/JS puro, sem build). Abra via servidor local, por exemplo:

```bash
python3 -m http.server 8000   # depois acesse http://localhost:8000
```

> Abrir `index.html` direto com `file://` também funciona; o carregamento do Three.js usa `<script>` clássico, não módulo.

## Estrutura

| Arquivo | Função |
|---|---|
| `index.html` | Página completa: header, hero, destaques, cardápio com filtros, **seção 3D "Descubra cada camada do sabor"**, produto em destaque, depoimentos, CTA final, footer e carrinho de pedido |
| `burger3d.js` | Cena 3D, controles, rótulos e interações da seção 3D (carregado sob demanda) |
| `vendor/three.min.js` | Three.js r149 (MIT), carregado só quando a seção 3D se aproxima da tela |

## Experiência 3D

- **Modelos 100% procedurais** (geometria e texturas geradas em código), com iluminação de estúdio, sombras suaves, tábua de ardósia e brasas ao fundo. Não há imagem fingindo ser 3D.
- **Clicar** no lanche (ou **arrastar** na primeira vez) desmonta em câmera lenta; arrastar/tocar gira 360°; pinça ou `Ctrl + scroll` dá zoom; o botão "Mudar ângulo" alterna a altura da câmera (útil no celular, onde o arraste vertical rola a página).
- **Clicar numa camada** (ou no rótulo/lista) destaca o ingrediente, aproxima a câmera e mostra nome + descrição.
- Botões: **Desmontar lanche**, **Montar novamente**, **Ver ingredientes**.
- Depois da demonstração aparece o cartão com **nome, descrição, preço e "Pedir agora"**, ligado ao carrinho (`Pedido.add`).
- Teclado: setas giram, `Enter` desmonta/monta, `Esc` fecha a camada selecionada.
- Respeita `prefers-reduced-motion`. Sem WebGL ou sem JS, a seção mostra a lista de ingredientes + botão de pedir.
- Desempenho: Three.js só é baixado quando a seção está a ~700 px da tela; o render pausa fora da tela/aba oculta; resolução limitada (2× desktop, 1.75× celular).

## Editar ingredientes (receitas)

Em `index.html`, procure por `RECEITAS_3D`. A chave é o `id` do lanche em `CARDAPIO`; `camadas` é listada **de cima para baixo**:

```js
'classic-smash': { camadas: [
  {tipo:'paoSuperior', nome:'Pão superior', desc:'Macio por dentro, dourado por fora.'},
  {tipo:'molho', cor:'especial', nome:'Molho especial', desc:'...'},
  ...
]}
```

Tipos de ingrediente disponíveis (`tipo`):
`paoSuperior` (opção `gergelim:true`), `paoInferior`, `smash`, `blend`, `cheddar`, `brie`, `picles`, `molho` (`cor`: `'especial'`, `'bbq'`, `'trufado'` ou `'#hex'`), `cebolaCaramelizada`, `bacon`, `cogumelo`, `alface`, `tomate`.

Para um lanche novo: adicione-o ao `CARDAPIO` e crie a entrada correspondente em `RECEITAS_3D` — a aba, os rótulos, o preço e o botão de pedir saem sozinhos.

**Importante:** só entraram ingredientes que constam no cardápio. O pão é inerente ao hambúrguer, mas o cardápio não diz o tipo — confirme e ajuste o texto (ex.: "Pão brioche tostado").

## Pedido

`Pedido.add(id)` é o ponto de integração de todos os botões "Pedir agora". Hoje ele alimenta um carrinho simples e finaliza por WhatsApp: defina `WHATSAPP_NUMERO` (ex.: `'5511999999999'`) em `index.html`. Se já existir outro sistema de pedidos, basta reimplementar `Pedido.add`.
