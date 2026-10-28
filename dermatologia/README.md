# Dra. Helena Ciacci — landing page

Site estático (HTML/CSS/JS puro, sem build), reconstruído a partir da referência visual do hero
("Sua pele, sua melhor versão.") e da linguagem editorial da peça "Skin booster".

```bash
cd dermatologia && python3 -m http.server 8000   # http://localhost:8000
```

| Arquivo | Função |
|---|---|
| `index.html` | Hero, Sobre/Formação, Áreas de atuação, destaque Skinbooster, Trabalhos (Instagram), Atendimento (endereços + CTA), footer |
| `css/style.css` | Design system (tokens no `:root`): slate de estúdio, champanhe, taupe editorial; Newsreader + Figtree |
| `js/main.js` | Links de WhatsApp com mensagem pré-preenchida, reveal sutil, botão flutuante |
| `assets/` | Fotos recortadas da referência (`dra-helena-hero.webp`, `dra-helena-retrato.webp`), OG image e favicon |

- **Trabalhos:** cole os links dos posts/reels em `INSTAGRAM_POSTS` (topo de `js/main.js`), na ordem desejada.
  A página usa o embed oficial do Instagram (script carregado só perto da seção). Com a lista vazia,
  a seção mostra um convite para o perfil @drahelenaciacci.
- WhatsApp: troque `WHATSAPP` / `MSG_PADRAO` em `js/main.js`. Um link com `data-msg` usa mensagem própria.
- Conteúdo baseado nas informações fornecidas; sem preços, depoimentos, números ou promessas de resultado.
  O texto evita afirmar título de especialista (usa "Médica · CRM-MG 93658").
- A foto do hero foi recortada da arte de referência (o trecho do título que sobrepunha o fundo foi removido).
  Para produção, prefira o arquivo original da sessão de fotos em alta resolução.
