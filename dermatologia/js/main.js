(function () {
  'use strict';

  var WHATSAPP = '5535988766016';
  var MSG_PADRAO = 'Olá! Gostaria de agendar uma consulta com a Dra. Helena Ciacci.';

  document.documentElement.classList.add('js');

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
      document.querySelectorAll('[data-video] video').forEach(function (outro) {
        if (outro !== video && !outro.paused) outro.pause();
      });
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
