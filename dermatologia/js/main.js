(function () {
  'use strict';

  var WHATSAPP = '5535988766016';
  var MSG_PADRAO = 'Olá! Gostaria de agendar uma consulta com a Dra. Helena Ciacci.';

  document.documentElement.classList.add('js');

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

  // Botão flutuante some enquanto o CTA do hero está visível
  var flutuante = document.querySelector('.wa-float');
  var heroCta = document.querySelector('.hero .btn-pill');
  if (flutuante && heroCta && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      flutuante.classList.toggle('is-hidden', entries[0].isIntersecting);
    }).observe(heroCta);
  }
})();
