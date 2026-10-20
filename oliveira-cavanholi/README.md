# Oliveira & Cavanholi — Contabilidade Consultiva

Site estático (HTML/CSS/JS puro, sem build), com experiência 3D em Three.js.

```bash
python3 -m http.server 8000   # depois acesse http://localhost:8000
```

## Arquivos

| Arquivo | Função |
|---|---|
| `config.js` | **Única fonte** de contatos, links, endereço, serviços, equipe, CNPJ/registros e formulário |
| `index.html` | Página: hero 3D, sobre, serviços, interlúdio, ecossistema, dashboard, equipe, conteúdos/Instagram, FAQ, contato, localização, rodapé |
| `app.js` | Monta conteúdos a partir do `config.js` e cuida de links, formulário, ecossistema, dashboard, animações e do carregamento do 3D |
| `scene3d.js` | Cena 3D (núcleo azul-marinho, malha de dados e anéis dourados, anel de barras, partículas, iluminação e reflexos) |
| `styles.css` | Identidade azul-marinho, preto, dourado e branco |
| `politica-de-privacidade.html` | Política de privacidade (modelo — revisar antes de publicar) |
| `vendor/three.min.js` | Three.js r149 (MIT) |

## Antes de publicar — confirmar com a empresa

Itens com `confirmado: false` **não aparecem** no site publicado. Para revisar o site com eles visíveis, com o selo "A confirmar", abra `index.html?previa=1`.

- **WhatsApp**: `+55 31 99796-4653` (associado ao registro de contabilidade). Também existe `+55 31 99758-0203`, ligado a um registro de gestão empresarial com o mesmo nome. Confirme qual é o correto e marque `whatsapp.confirmado: true`. Isso ativa o botão flutuante, os botões e o envio do formulário pelo WhatsApp.
- **Endereço**: Rua Goiás, 161, Boa Vista, Sete Lagoas — MG, CEP 35700-085 é o endereço *cadastral*. Só marque `endereco.confirmado: true` se ele for o local de atendimento ao público. Se o atendimento for só digital, use `atendimentoSomenteDigital: true`.
- **CNPJ e registros profissionais** (`institucional`): aparecem no rodapé só quando preenchidos.
- **Equipe** (`equipe`): nomes, cargos e fotos confirmados (fotos em `assets/equipe/`).
- **Galeria do Instagram** (`instagram.galeria`): somente imagens autorizadas, salvas em `assets/instagram/`. Não há integração automática com a API do Instagram; os blocos levam ao perfil oficial.
- **Logotipo** (`marca.logo`): por enquanto é usado o monograma provisório "O&C".
- **Textos dos serviços e FAQ**: são descrições gerais; revise com a empresa.
- **Política de privacidade**: modelo técnico; revisar e completar com a identificação do controlador.

O e-mail `administrativo@oliveiraecavanholi.com.br`, o Instagram e o site são dados publicados pela própria empresa.

## Formulário de contato

Sem backend, o formulário valida os campos e abre o **WhatsApp** (quando confirmado) ou o **aplicativo de e-mail** do visitante, já com a mensagem montada. O site não armazena nada.

Para envio direto, defina `formulario.endpoint` com a URL de um serviço que aceite `POST` JSON (ex.: Formspree: `https://formspree.io/f/SEU_ID`, ou uma função serverless própria). O corpo enviado é `{nome, empresa, email, telefone, servico, mensagem, origem}`. Quando o endpoint é definido, aparece o botão "Enviar mensagem", com retorno de sucesso ou de erro. Depois disso, atualize a política de privacidade com o fornecedor.

## Experiência 3D e desempenho

- Objeto 3D real (Three.js): geometrias, materiais metálicos/clearcoat, reflexos de um estúdio procedural (PMREM), luzes douradas e azuis. Não usa imagens nem arquivos HDR.
- Gira sozinho e reage ao **cursor**. No celular, **arrastar na horizontal** sobre o hero gira o objeto sem travar a rolagem. **Clicar/tocar** no objeto dispara um pulso dos anéis e barras.
- **Transições cinematográficas**: o canvas é fixo, e o objeto desliza para uma pose diferente em cada seção (`data-pose`: `hero`, `left`, `right`, `center`, `far`). As poses ficam em `scene3d.js → POSES`.
- O Three.js é carregado só depois do `load`. A animação pausa com a aba oculta e cai para 30 fps quando o objeto fica atrás dos painéis. A resolução é limitada (1,75× desktop, 1,5× celular) e reduzida automaticamente em aparelhos lentos.
- **Alternativa leve** (cartão 3D em CSS): usada sem WebGL, com economia de dados, em aparelhos com ≤ 2 núcleos ou ≤ 2 GB de memória, ou com `?sem3d`. `prefers-reduced-motion` desliga os movimentos automáticos.

## Dashboard

A seção "Dashboard demonstrativo" usa **dados fictícios** fixos em `app.js` (`dashboard()`), identificados como tal na página.
