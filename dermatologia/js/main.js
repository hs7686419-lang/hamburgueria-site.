(function () {
  'use strict';

  var WHATSAPP = '5535988766016';
  var MSG_PADRAO = 'Olá! Gostaria de agendar uma consulta com a Dra. Helena Ciacci.';

  // Seção "Trabalhos": cole aqui os links dos posts do Instagram, na ordem de exibição.
  // Aceita posts (/p/...) e reels (/reel/...). Lista vazia esconde a grade.
  var INSTAGRAM_POSTS = [
    'https://www.instagram.com/reel/DaBLqorJgLE/', // cirurgia de pele
    'https://www.instagram.com/reel/DVzMRfNiUG6/', // "Doutora, precisa tirar?"
    'https://www.instagram.com/p/DT3waofkmFS/', // retratos corporativos (post do fotógrafo)
    // 'https://www.instagram.com/p/XXXXXXXXXXX/',
  ];

  document.documentElement.classList.add('js');

  // Trabalhos: monta os embeds oficiais e só baixa o script do Instagram perto da seção
  var works = document.querySelector('[data-works]');
  var posts = INSTAGRAM_POSTS.map(function (url) {
    var m = String(url).match(/instagram\.com\/(?:[\w.]+\/)?(p|reel|tv)\/([\w-]+)/);
    return m && 'https://www.instagram.com/' + m[1] + '/' + m[2] + '/';
  }).filter(Boolean);

  if (works && posts.length) {
    posts.forEach(function (url) {
      var li = document.createElement('li');
      li.className = 'works__item';
      var bq = document.createElement('blockquote');
      bq.className = 'instagram-media';
      bq.setAttribute('data-instgrm-permalink', url + '?utm_source=ig_embed');
      bq.setAttribute('data-instgrm-version', '14');
      var a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = 'Ver publicação no Instagram';
      bq.appendChild(a);
      li.appendChild(bq);
      works.appendChild(li);
    });
    works.hidden = false;

    var carregarEmbed = function () {
      if (window.instgrm) { window.instgrm.Embeds.process(); return; }
      var s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.instagram.com/embed.js';
      document.body.appendChild(s);
    };
    if ('IntersectionObserver' in window) {
      var obsWorks = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { obsWorks.disconnect(); carregarEmbed(); }
      }, { rootMargin: '800px 0px' });
      obsWorks.observe(works);
    } else {
      carregarEmbed();
    }
  }

  // Links de WhatsApp com mensagem pré-preenchida (data-msg sobrescreve a padrão)
  document.querySelectorAll('.js-wa').forEach(function (a) {
    var msg = a.getAttribute('data-msg') || MSG_PADRAO;
    a.href = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(msg);
  });

  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();

  // Reveal sutil ao rolar
  var itens = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    itens.forEach(function (el) { io.observe(el); });
  } else {
    itens.forEach(function (el) { el.classList.add('is-in'); });
  }

  // Vídeo de apresentação: só baixa e toca (com som) quando a pessoa clica
  document.querySelectorAll('[data-video]').forEach(function (fig) {
    var video = fig.querySelector('video');
    var botao = fig.querySelector('.video__play');
    if (!video || !botao) return;
    botao.addEventListener('click', function () {
      video.controls = true;
      fig.classList.add('is-playing');
      var p = video.play();
      if (p && p.catch) p.catch(function () { fig.classList.remove('is-playing'); });
    });
    video.addEventListener('ended', function () {
      video.controls = false;
      video.load(); // volta para a capa
      fig.classList.remove('is-playing');
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting && !video.paused) video.pause();
      }, { threshold: 0.15 }).observe(fig);
    }
  });

  // Botão flutuante some enquanto o CTA do hero está visível
  var flutuante = document.querySelector('.wa-float');
  var heroCta = document.querySelector('.hero .btn-pill');
  if (flutuante && heroCta && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      flutuante.classList.toggle('is-hidden', entries[0].isIntersecting);
    }).observe(heroCta);
  }
})();
