# Dra. Helena Ciacci — landing page

Site estático (HTML/CSS/JS puro, sem build), reconstruído a partir da referência visual do hero
("Sua pele, sua melhor versão.") e da linguagem editorial da peça "Skin booster".

```bash
cd dermatologia && python3 -m http.server 8000   # http://localhost:8000
```

| Arquivo | Função |
|---|---|
| `index.html` | Hero, Sobre/Formação, Áreas de atuação, destaque Skinbooster, Trabalhos, Atendimento (endereços + CTA), footer |
| `css/style.css` | Design system (tokens no `:root`): slate de estúdio, champanhe, taupe editorial; Newsreader + Figtree |
| `js/main.js` | Links de WhatsApp com mensagem pré-preenchida, reveal sutil, botão flutuante |
| `assets/` | Fotos recortadas da referência (`dra-helena-hero.webp`, `dra-helena-retrato.webp`), vídeos (`dra-helena-apresentacao.mp4`, `trabalho-*.mp4`, cada um com capa `.webp`), foto `retrato-consultorio.webp`, OG image e favicon |

- **Trabalhos:** vídeos e foto ficam hospedados no próprio site (sem o player do Instagram). Cada vídeo usa
  `<figure class="video video--plain" data-video>` com `poster`; só é baixado ao clicar em play e toca um por vez.
  Para incluir outro, copie um `<li class="works__item">` em `index.html` e troque os arquivos.
- WhatsApp: troque `WHATSAPP` / `MSG_PADRAO` em `js/main.js`. Um link com `data-msg` usa mensagem própria.
- Conteúdo baseado nas informações fornecidas; sem preços, depoimentos, números ou promessas de resultado.
  O texto evita afirmar título de especialista (usa "Médica · CRM-MG 93658").
- A foto do hero foi recortada da arte de referência (o trecho do título que sobrepunha o fundo foi removido).
  Para produção, prefira o arquivo original da sessão de fotos em alta resolução.
