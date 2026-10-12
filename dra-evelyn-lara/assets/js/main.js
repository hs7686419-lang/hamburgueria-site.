/**
 * Dra. Evelyn Lara | Cirurgiã-Dentista — comportamento do site.
 * JavaScript puro, sem dependências. Os dados vêm de window.SITE_CONFIG (config.js).
 *
 * Robustez: cada parte roda isolada em run(); uma falha em uma seção não impede as outras
 * (formulário, menu, revelação ao rolar). O HTML já traz o conteúdo publicado pré-renderizado
 * (tools/prerender.mjs); aqui ele é re-renderizado a partir do config (e, no rascunho, com as pendências).
 */
(function () {
  'use strict';

  var root = document.documentElement;
  var cfgLoaded = !!window.SITE_CONFIG;
  if (!cfgLoaded) console.error('[site] config.js não carregou (ou tem erro de sintaxe). Mantendo o conteúdo pré-renderizado do HTML.');
  var cfg = window.SITE_CONFIG || {};
  var isDraft = cfgLoaded && cfg.modo !== 'publicado';
  var contato = cfg.contato || {};
  var prof = cfg.profissional || {};
  var endereco = cfg.endereco || {};
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- utilitários ---------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function h(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'text') node.textContent = attrs[k];
      else if (k === 'html') node.innerHTML = attrs[k];
      else if (attrs[k] !== null && attrs[k] !== undefined && attrs[k] !== false) node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return node;
  }
  function clear(node) { while (node && node.firstChild) node.removeChild(node.firstChild); return node; }
  function digits(v) { return String(v || '').replace(/\D/g, ''); }
  function store(kind, key, value) {
    try {
      var s = window[kind];
      if (value === undefined) return s.getItem(key);
      s.setItem(key, value);
    } catch (e) { return null; }
  }
  function listPt(items) { return items.length > 1 ? items.slice(0, -1).join(', ') + ' e ' + items[items.length - 1] : items.join(''); }
  function pendingSpan(text) { return h('span', { class: 'pending', text: text || 'A confirmar' }); }

  var failures = [];
  function run(name, fn) {
    try { fn(); } catch (err) { failures.push(name); console.error('[site] falha em "' + name + '":', err); }
  }
  function revealAll() { $$('[data-reveal]').forEach(function (el) { el.classList.add('is-in'); }); }
  // rede de segurança: qualquer erro não tratado mostra todo o conteúdo
  window.addEventListener('error', revealAll);

  /* ---------- telefones brasileiros ---------- */
  var VALID_DDD = '11 12 13 14 15 16 17 18 19 21 22 24 27 28 31 32 33 34 35 37 38 41 42 43 44 45 46 47 48 49 51 53 54 55 61 62 63 64 65 66 67 68 69 71 73 74 75 77 79 81 82 83 84 85 86 87 88 89 91 92 93 94 95 96 97 98 99'.split(' ');
  /** Devolve DDD + número (sem DDI 55, zero de tronco ou código de operadora). */
  function brNational(v) {
    var d = digits(v);
    var trunk = /^0/.test(d);
    d = d.replace(/^0+/, '');
    if (!trunk && d.length >= 12 && d.slice(0, 2) === '55') d = d.slice(2);
    else if (trunk && d.length >= 12) d = d.slice(2); // 0 + operadora (2 dígitos) + DDD + número
    return d;
  }
  /** Mensagem de erro ('' quando válido) para um número nacional. */
  function phoneProblem(d) {
    if (!d) return 'Informe um telefone ou WhatsApp para retorno.';
    if (d.length < 10 || d.length > 11) return 'Informe o número com DDD, por exemplo (37) 91234-5678.';
    if (VALID_DDD.indexOf(d.slice(0, 2)) === -1) return 'Verifique o DDD informado.';
    if (d.length === 11 && d.charAt(2) !== '9') return 'Celulares têm 9 dígitos e começam com 9 após o DDD.';
    if (d.length === 10 && !/[2-5]/.test(d.charAt(2))) return 'Celulares têm 9 dígitos após o DDD. Confira se falta algum número.';
    if (/^(\d)\1+$/.test(d.slice(2))) return 'Verifique o número informado.';
    return '';
  }
  function formatBr(d) {
    if (d.length === 11) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
    if (d.length === 10) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
    return d;
  }

  /* ---------- dados derivados ---------- */
  var waNational = brNational(contato.whatsapp);
  var hasWhatsApp = !!contato.whatsapp && !phoneProblem(waNational);
  var waInvalid = !!contato.whatsapp && !hasWhatsApp;
  if (waInvalid) console.warn('[site] contato.whatsapp inválido em config.js: "' + contato.whatsapp + '". Use DDD + número, por exemplo 5537999990000.');
  var waNumber = hasWhatsApp ? '55' + waNational : '';
  function waLink(message) { return 'https://wa.me/' + waNumber + '?text=' + encodeURIComponent(message); }
  var telNational = brNational(contato.telefone);
  var hasTel = !!contato.telefone && !phoneProblem(telNational);

  var hasAddress = !!(endereco.validado && endereco.logradouro && endereco.cidade);
  var NB = ' ';
  var addressText = hasAddress
    ? [endereco.logradouro, endereco.bairro, [endereco.cidade, endereco.uf].filter(Boolean).join(NB + '–' + NB), endereco.cep ? 'CEP' + NB + endereco.cep : '']
        .filter(Boolean).join(', ')
    : '';
  var mapsQuery = addressText.replace(/ /g, ' ') + ', Brasil';
  var mapsLink = hasAddress ? (endereco.linkMaps || 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(mapsQuery)) : '';
  var croText = prof.cro && prof.croUf ? 'CRO-' + prof.croUf + NB + prof.cro : '';
  var qualificacao = prof.qualificacao || '';
  var horarios = cfg.horarios || [];
  var hoursText = horarios.map(function (x) { return x.dias + ', ' + x.horas; }).join('; ');
  var convenios = cfg.convenios || [];
  function parseInstagram(v) {
    if (!v) return '';
    var s = String(v).trim();
    try { s = new URL(/^https?:/i.test(s) ? s : 'https://www.instagram.com/' + s.replace(/^@/, '')).pathname; } catch (e) { /* mantém o texto */ }
    var seg = s.split('/').filter(Boolean)[0] || '';
    return seg.replace(/^@/, '').replace(/[^A-Za-z0-9._]/g, '');
  }
  var igUser = parseInstagram(contato.instagram);
  var igUrl = igUser ? 'https://www.instagram.com/' + igUser + '/' : '';
  var esp = prof.especialidade;
  var treatments = (cfg.tratamentos || []).filter(function (t) { return t && t.nome && (isDraft || !t.demo); })
    .map(function (t, i) { return Object.assign({}, t, { id: String(t.id || 'servico-' + (i + 1)).replace(/[^A-Za-z0-9_-]/g, '-') }); });

  /* ---------- header: estado ao rolar + link ativo ---------- */
  run('header', function () {
    var header = $('[data-header]');
    var onScrollHeader = function () { header.classList.toggle('is-solid', window.scrollY > 12); };
    onScrollHeader();
    window.addEventListener('scroll', onScrollHeader, { passive: true });

    var navLinks = $$('.nav__link');
    if (!('IntersectionObserver' in window)) return;
    var sectionIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        navLinks.forEach(function (a) {
          if (a.getAttribute('href') === '#' + e.target.id) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach(function (a) { var s = $(a.getAttribute('href')); if (s) sectionIo.observe(s); });
  });

  /* ---------- menu móvel ---------- */
  run('menu', function () {
    var toggle = $('[data-menu-toggle]');
    var menu = $('[data-menu]');
    var menuLabel = $('[data-menu-label]');
    var background = ['main', '.site-footer', '.draft-banner', '.wa-float', '.skip-link'];
    var setMenu = function (open, returnFocus) {
      toggle.setAttribute('aria-expanded', String(open));
      menuLabel.textContent = open ? 'Fechar menu' : 'Abrir menu';
      menu.hidden = !open;
      document.body.classList.toggle('menu-open', open);
      // o restante da página fica inerte enquanto o menu está aberto
      background.forEach(function (s) { var n = $(s); if (n) n.inert = open; });
      if (open) { var first = $('a', menu); if (first) first.focus(); }
      else if (returnFocus) toggle.focus();
    };
    toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) setMenu(false, true);
    });
    menu.addEventListener('keydown', function (e) { // mantém o foco entre o menu e o botão
      if (e.key !== 'Tab') return;
      var items = $$('a, button', menu).concat([toggle]);
      var i = items.indexOf(document.activeElement);
      if (e.shiftKey && i === 0) { e.preventDefault(); toggle.focus(); }
      else if (!e.shiftKey && i === items.length - 2) { e.preventDefault(); toggle.focus(); }
    });
    var mq = window.matchMedia('(min-width: 1024px)');
    var onMq = function (m) { if (m.matches) setMenu(false); };
    if (mq.addEventListener) mq.addEventListener('change', onMq); else if (mq.addListener) mq.addListener(onMq);
  });

  /* ---------- tratamentos ---------- */
  var ICONS = {
    tooth: '<path d="M7 3c-2.5 0-4 2-4 4.5 0 2 .8 3.4 1.4 5 .6 1.8.8 4 1.4 6.2.4 1.5 1 2.3 1.8 2.3 1.2 0 1.4-1.7 1.8-3.6.3-1.4.7-2.9 2.6-2.9s2.3 1.5 2.6 2.9c.4 1.9.6 3.6 1.8 3.6.8 0 1.4-.8 1.8-2.3.6-2.2.8-4.4 1.4-6.2.6-1.6 1.4-3 1.4-5C21 5 19.5 3 17 3c-2 0-3 1-5 1S9 3 7 3Z"/>',
    sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z"/><path d="M19 16l.7 1.8 1.8.7-1.8.7L19 21l-.7-1.8-1.8-.7 1.8-.7Z"/>',
    smile: '<circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01M15 9h.01"/>',
    stethoscope: '<path d="M5 3v6a5 5 0 0 0 10 0V3"/><path d="M10 14v2a5 5 0 0 0 10 0v-2"/><circle cx="20" cy="12" r="2"/>',
    shield: '<path d="M12 3 4 6v6c0 5 3.4 8.3 8 9 4.6-.7 8-4 8-9V6Z"/><path d="m9 12 2 2 4-4"/>',
    canal: '<path d="M7 3c-2.5 0-4 2-4 4.5 0 2 .8 3.4 1.4 5 .6 1.8.8 4 1.4 6.2.4 1.5 1 2.3 1.8 2.3 1.2 0 1.4-1.7 1.8-3.6.3-1.4.7-2.9 2.6-2.9s2.3 1.5 2.6 2.9c.4 1.9.6 3.6 1.8 3.6.8 0 1.4-.8 1.8-2.3.6-2.2.8-4.4 1.4-6.2.6-1.6 1.4-3 1.4-5C21 5 19.5 3 17 3c-2 0-3 1-5 1S9 3 7 3Z"/><path d="M10 9.5v5M14 9.5v5"/>',
    bridge: '<path d="M3 7.5C3 6.1 4.1 5 5.5 5h13C19.9 5 21 6.1 21 7.5V10c0 1.2-.8 2-1.8 2L18 19h-2l-1-5h-1.5l-1 5h-1l-1-5H9l-1 5H6l-1.2-7C3.8 12 3 11.2 3 10Z"/>',
    implant: '<path d="M7 3h10l-1.5 5h-7Z"/><path d="M12 8v13"/><path d="M9 11h6M9.5 14h5M10 17h4"/>',
    braces: '<rect x="3" y="8" width="18" height="8" rx="4"/><path d="M3 12h18M8 10v4M12 10v4M16 10v4"/>',
    face: '<path d="M12 3c-4 0-7 3-7 7.5C5 16 8.5 21 12 21s7-5 7-10.5C19 6 16 3 12 3Z"/><path d="M9.5 15.5s1 1 2.5 1 2.5-1 2.5-1M9 10.5h.01M15 10.5h.01"/>',
  };
  function icon(name) {
    var span = h('span', { class: 'treatment__icon', 'aria-hidden': 'true' });
    span.innerHTML = '<svg viewBox="0 0 24 24">' + (ICONS[name] || ICONS.tooth) + '</svg>';
    return span;
  }
  function treatmentItem(t, headingTag) {
    var title = h(headingTag, { class: 'treatment__title', id: 'trat-' + t.id }, [icon(t.icone), h('span', { text: t.nome }), t.demo ? h('span', { class: 'badge', text: 'Exemplo' }) : null]);
    var more = t.detalhe ? h('details', { class: 'treatment__more' }, [
      h('summary', {}, ['Saber mais', h('span', { class: 'sr-only', text: ' sobre ' + t.nome })]),
      h('p', { class: 'treatment__detail', text: t.detalhe }),
    ]) : null;
    var cta = h('a', { class: 'link-arrow', href: '#agendamento', 'data-service': t.id }, ['Consultar disponibilidade', h('span', { class: 'sr-only', text: ' para ' + t.nome }), h('span', { 'aria-hidden': 'true', text: ' →' })]);
    return h('li', { class: 'treatment', 'data-reveal': '' }, [
      h('div', { class: 'treatment__head' }, [
        h('span', { class: 'treatment__num', 'aria-hidden': 'true' }),
        title,
        h('div', { class: 'treatment__body' }, [h('p', { class: 'treatment__summary', text: t.resumo || '' }), more, h('div', { class: 'treatment__actions' }, [cta])]),
      ]),
    ]);
  }

  if (cfgLoaded) run('tratamentos', function () {
    var wrap = clear($('[data-treatments]'));
    // agrupa por categoria, na ordem de aparição no config
    var hasCats = treatments.some(function (t) { return t.categoria; });
    var groups = [];
    treatments.forEach(function (t) {
      var name = hasCats ? (t.categoria || 'Outros tratamentos') : '';
      var g = groups.filter(function (x) { return x.name === name; })[0];
      if (!g) { g = { name: name, items: [] }; groups.push(g); }
      g.items.push(t);
    });
    if (hasCats && groups.length > 1) {
      wrap.appendChild(h('nav', { class: 'treatments__nav', 'aria-label': 'Categorias de tratamento' }, [
        h('ul', {}, groups.map(function (g, i) { return h('li', {}, [h('a', { href: '#trat-cat-' + (i + 1), text: g.name })]); })),
      ]));
    }
    groups.forEach(function (g, i) {
      var listEl = h('ol', { class: 'treatments__list' }, g.items.map(function (t) { return treatmentItem(t, hasCats ? 'h4' : 'h3'); }));
      if (!hasCats) { wrap.appendChild(listEl); return; }
      var headId = 'trat-cat-' + (i + 1);
      wrap.appendChild(h('section', { class: 'treatment-group', 'aria-labelledby': headId + '-t', id: headId }, [
        h('h3', { class: 'treatment-group__title', id: headId + '-t', text: g.name }),
        listEl,
      ]));
    });
    // qualificação antes das áreas de atuação (exigência do Código de Ética Odontológica)
    var qual = $('[data-treatments-qualification]');
    qual.textContent = [prof.nome, prof.titulo, qualificacao, croText].filter(Boolean).join(' · ');
    qual.hidden = !treatments.length;
    $('[data-treatments-empty]').hidden = treatments.length > 0;
    $('[data-demo-note]').hidden = !(isDraft && treatments.some(function (t) { return t.demo; }));
  });

  /* opções do formulário seguem a lista real de serviços */
  if (cfgLoaded) run('select-servicos', function () {
    var select = clear($('[data-service-select]'));
    select.appendChild(h('option', { value: '', text: 'Selecione uma opção' }));
    if (!treatments.some(function (t) { return t.id === 'avaliacao'; })) select.appendChild(h('option', { value: 'Primeira consulta / avaliação', text: 'Primeira consulta / avaliação' }));
    treatments.forEach(function (t) { select.appendChild(h('option', { value: t.nome, 'data-id': t.id, text: t.nome + (t.demo ? ' (exemplo)' : '') })); });
    select.appendChild(h('option', { value: 'Outro / quero orientação', text: 'Outro assunto / quero orientação' }));
  });

  /* ---------- destaques, qualificação, CRO e especialidade (seção Sobre) ---------- */
  if (cfgLoaded) run('sobre', function () {
    var factsEl = clear($('[data-facts]'));
    (prof.destaques || []).forEach(function (f) {
      factsEl.appendChild(h('li', { class: 'about__fact' }, [h('span', { class: 'about__fact-value', text: f.valor }), h('span', { class: 'about__fact-text', text: f.texto })]));
    });
    factsEl.hidden = !factsEl.children.length;

    var cro = $('[data-cro]');
    cro.textContent = croText;
    cro.hidden = !croText;
    $$('[data-qualificacao]').forEach(function (n) { n.textContent = qualificacao ? ' · ' + qualificacao : ''; });

    var espEl = clear($('[data-specialty]'));
    espEl.hidden = true;
    if (esp && esp.titulo) {
      if (esp.confirmado) { espEl.textContent = esp.titulo + (croText ? ' — ' + croText : ''); espEl.hidden = false; }
      else if (isDraft) {
        // o título não confirmado não é impresso nem na pré-visualização
        espEl.appendChild(h('span', { class: 'badge', text: 'Pendente' }));
        espEl.appendChild(document.createTextNode('Título de especialista aguardando confirmação no CRO. Ele não aparece no site publicado.'));
        espEl.hidden = false;
      }
    }
  });

  /* ---------- galeria + lightbox ---------- */
  var galleryItems = cfg.galeria || [];
  run('galeria', function () {
    var gallerySection = $('[data-gallery-section]');
    var gallery = $('[data-gallery]');
    if (galleryItems.length) {
      gallerySection.hidden = false;
      galleryItems.forEach(function (g, i) {
        var img = h('img', { src: g.src, alt: g.alt || '', width: g.largura, height: g.altura, loading: 'lazy', decoding: 'async' });
        var btn = h('button', { class: 'gallery__btn', type: 'button', 'data-index': i, 'aria-label': 'Ampliar foto: ' + (g.alt || g.legenda || 'consultório') }, [img]);
        gallery.appendChild(h('li', { class: 'gallery__item', 'data-reveal': '' }, [btn, g.legenda ? h('span', { class: 'gallery__caption', 'aria-hidden': 'true', text: g.legenda }) : null]));
      });
    } else if (isDraft) {
      gallerySection.hidden = false;
      $('[data-gallery-note]').hidden = false;
      ['Recepção', 'Consultório', 'Sala de espera', 'Detalhes do ambiente', 'Atendimento'].forEach(function (label) {
        gallery.appendChild(h('li', { class: 'gallery__item' }, [h('div', { class: 'gallery__placeholder', text: 'Foto real: ' + label })]));
      });
    }
    if (!galleryItems.length) return;

    var lightbox = $('[data-lightbox]');
    var lbIndex = 0;
    var lbReturn = null;
    var showLightbox = function (i) {
      lbIndex = (i + galleryItems.length) % galleryItems.length;
      var g = galleryItems[lbIndex];
      var img = $('[data-lightbox-img]', lightbox);
      img.src = g.src; img.alt = g.alt || '';
      $('[data-lightbox-caption]', lightbox).textContent = g.legenda || '';
      var multi = galleryItems.length > 1;
      $('[data-lightbox-prev]', lightbox).hidden = !multi;
      $('[data-lightbox-next]', lightbox).hidden = !multi;
    };
    gallery.addEventListener('click', function (e) {
      var b = e.target.closest('.gallery__btn');
      if (!b || typeof lightbox.showModal !== 'function') return;
      lbReturn = b;
      showLightbox(Number(b.getAttribute('data-index')));
      lightbox.showModal();
    });
    $('[data-lightbox-close]', lightbox).addEventListener('click', function () { lightbox.close(); });
    $('[data-lightbox-prev]', lightbox).addEventListener('click', function () { showLightbox(lbIndex - 1); });
    $('[data-lightbox-next]', lightbox).addEventListener('click', function () { showLightbox(lbIndex + 1); });
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) lightbox.close(); });
    lightbox.addEventListener('keydown', function (e) {
      if (galleryItems.length < 2) return;
      if (e.key === 'ArrowLeft') showLightbox(lbIndex - 1);
      if (e.key === 'ArrowRight') showLightbox(lbIndex + 1);
    });
    lightbox.addEventListener('close', function () { if (lbReturn) lbReturn.focus(); });
  });

  /* ---------- depoimentos (somente reais e autorizados) ---------- */
  run('depoimentos', function () {
    var quotes = cfg.depoimentos || [];
    var tSection = $('[data-testimonials-section]');
    var track = $('[data-testimonials]');
    var carousel = $('[data-carousel]');
    if (!quotes.length) {
      if (!isDraft) return;
      tSection.hidden = false;
      $('[data-testimonials-note]').hidden = false;
      carousel.removeAttribute('tabindex');
      carousel.removeAttribute('role');
      carousel.removeAttribute('aria-roledescription');
      carousel.removeAttribute('aria-label');
      track.appendChild(h('li', { class: 'quote quote--placeholder' }, [
        h('p', { class: 'quote__text', text: 'Espaço reservado para depoimentos reais de pacientes, publicados somente com autorização.' }),
        h('p', { class: 'quote__author', text: 'Sem depoimentos cadastrados' }),
      ]));
      return;
    }
    tSection.hidden = false;
    quotes.forEach(function (q, i) {
      track.appendChild(h('li', { class: 'quote', 'aria-roledescription': 'slide', 'aria-label': (i + 1) + ' de ' + quotes.length }, [
        h('blockquote', { class: 'quote__text' }, [h('p', { text: q.texto })]),
        h('p', { class: 'quote__author' }, [q.autor, q.detalhe ? h('span', { text: q.detalhe }) : null]),
      ]));
    });
    if (quotes.length < 2) return;
    var controls = $('[data-carousel-controls]');
    var prev = $('[data-carousel-prev]');
    var next = $('[data-carousel-next]');
    controls.hidden = false;
    var step = function (dir) {
      var card = $('.quote', track);
      var gap = parseFloat(getComputedStyle(track).columnGap) || 16;
      carousel.scrollBy({ left: dir * (card.getBoundingClientRect().width + gap), behavior: reduceMotion ? 'auto' : 'smooth' });
    };
    var update = function () {
      var atStart = carousel.scrollLeft <= 2;
      var atEnd = carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 2;
      // não desabilita o botão focado sem antes levar o foco para o outro
      if (atEnd && document.activeElement === next) prev.focus();
      if (atStart && document.activeElement === prev) next.focus();
      prev.disabled = atStart;
      next.disabled = atEnd;
    };
    prev.addEventListener('click', function () { step(-1); });
    next.addEventListener('click', function () { step(1); });
    carousel.addEventListener('scroll', update, { passive: true });
    carousel.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    });
    window.addEventListener('resize', update);
    update();
  });

  /* ---------- FAQ ---------- */
  if (cfgLoaded) run('faq', function () {
    var faq = clear($('[data-faq]'));
    if (isDraft) $('.faq__intro').appendChild(h('p', { class: 'draft-note', html: '<strong>Respostas em rascunho.</strong> Revise cada resposta com a profissional antes de publicar (<code>faq</code> no <code>config.js</code>).' }));
    (cfg.faq || []).forEach(function (item, i) {
      if (!item || !item.pergunta) return;
      var resposta = String(item.resposta || '');
      var answer = h('div', { class: 'faq-item__answer' });
      if (resposta.indexOf('{convenios}') !== -1) {
        if (convenios.length) {
          answer.appendChild(h('p', { text: 'São atendidos os convênios ' + listPt(convenios) + '. Ao agendar, informe o seu plano para confirmar a cobertura do atendimento.' }));
        } else if (isDraft) {
          answer.appendChild(h('p', {}, [h('span', { class: 'badge', text: 'Pendente' }), 'Informe os convênios em config.js.']));
        } else {
          return;
        }
      } else if (resposta.indexOf('{endereco}') !== -1) {
        if (hasAddress) {
          answer.appendChild(h('p', {}, ['O consultório fica na ' + addressText + '. ', h('a', { href: mapsLink, target: '_blank', rel: 'noopener', text: 'Ver no Google Maps' })]));
          if (hoursText) answer.appendChild(h('p', { text: 'Horário de atendimento: ' + hoursText + '.' }));
        } else if (isDraft) {
          answer.appendChild(h('p', {}, [h('span', { class: 'badge', text: 'Pendente' }), 'O endereço será exibido aqui assim que for validado em config.js.']));
        } else {
          return; // sem endereço confirmado, a pergunta não é publicada
        }
      } else if (resposta) {
        answer.appendChild(h('p', { text: resposta }));
      } else {
        return;
      }
      faq.appendChild(h('details', { class: 'faq-item', 'data-reveal': '', id: 'faq-' + (i + 1) }, [
        h('summary', {}, [h('span', { text: item.pergunta }), h('span', { class: 'faq-item__icon', 'aria-hidden': 'true' })]),
        answer,
      ]));
    });
  });

  /* ---------- contato, mapa e rodapé ---------- */
  if (cfgLoaded) run('contato', function () {
    var list = clear($('[data-contact-list]'));
    var row = function (label, content) { list.appendChild(h('div', { class: 'contact__item' }, [h('dt', { text: label }), h('dd', {}, [content])])); };
    if (hasWhatsApp) row('WhatsApp', h('a', { href: waLink('Olá! Vim pelo site e gostaria de informações sobre atendimento com a ' + prof.nome + '.'), target: '_blank', rel: 'noopener', text: formatBr(waNational) }));
    else if (isDraft) row('WhatsApp', pendingSpan(waInvalid ? 'Número inválido em config.js' : 'Número oficial a confirmar'));
    if (hasTel) row('Telefone', h('a', { href: 'tel:+55' + telNational, text: formatBr(telNational) }));
    if (contato.email) row('E-mail', h('a', { href: 'mailto:' + contato.email, text: contato.email }));
    else if (isDraft) row('E-mail', pendingSpan());
    if (hasAddress) row('Endereço', document.createTextNode(addressText));
    else if (isDraft) row('Endereço', pendingSpan('Endereço a validar'));
    if (horarios.length) row('Horários', h('ul', {}, horarios.map(function (x) { return h('li', { text: x.dias + ', ' + x.horas }); })));
    else if (isDraft) row('Horários', pendingSpan('Horários a confirmar'));
    if (convenios.length) row('Convênios', document.createTextNode(convenios.join(NB + '· ')));
    if (igUser) row('Instagram', h('a', { href: igUrl, target: '_blank', rel: 'noopener', text: '@' + igUser }));
    list.hidden = !list.children.length;

    var mapsBtn = $('[data-maps-link]');
    mapsBtn.hidden = !hasAddress;
    if (hasAddress) mapsBtn.href = mapsLink;

    var mapBox = $('[data-map]');
    if (hasAddress) {
      // O mapa do Google só é carregado com um clique (evita conexões e cookies de terceiros sem ação do visitante).
      $('[data-map-placeholder-text]').textContent = addressText;
      var loadBtn = h('button', { class: 'btn btn--outline btn--sm', type: 'button', text: 'Exibir mapa (Google Maps)' });
      $('[data-map-placeholder]').appendChild(loadBtn);
      loadBtn.addEventListener('click', function () {
        var frame = h('iframe', { src: 'https://www.google.com/maps?q=' + encodeURIComponent(mapsQuery) + '&output=embed', title: 'Mapa com a localização do consultório', loading: 'lazy', referrerpolicy: 'no-referrer-when-downgrade' });
        clear(mapBox).appendChild(frame);
        frame.focus();
      });
    } else if (!isDraft) {
      mapBox.hidden = true;
    }

    var fc = clear($('[data-footer-contact]'));
    if (hasWhatsApp) fc.appendChild(h('li', {}, [h('a', { href: waLink('Olá! Vim pelo site e gostaria de informações.'), target: '_blank', rel: 'noopener', text: 'WhatsApp ' + formatBr(waNational) })]));
    if (hasTel) fc.appendChild(h('li', {}, [h('a', { href: 'tel:+55' + telNational, text: formatBr(telNational) })]));
    if (contato.email) fc.appendChild(h('li', {}, [h('a', { href: 'mailto:' + contato.email, text: contato.email })]));
    if (hasAddress) fc.appendChild(h('li', {}, [h('a', { href: mapsLink, target: '_blank', rel: 'noopener', text: addressText })]));
    if (hoursText) fc.appendChild(h('li', {}, [h('span', { class: 'site-footer__hours', text: hoursText })]));
    if (igUser) fc.appendChild(h('li', {}, [h('a', { href: igUrl, target: '_blank', rel: 'noopener', text: 'Instagram @' + igUser })]));
    fc.appendChild(h('li', {}, [h('a', { href: '#agendamento', text: 'Solicitar consulta' })]));
    if (isDraft && !hasWhatsApp && !contato.email && !hasAddress) fc.insertBefore(h('li', {}, [pendingSpan('Contatos oficiais a confirmar')]), fc.firstChild);

    var footerCro = $('[data-footer-cro]');
    if (croText) footerCro.textContent = ' — ' + croText;
    else footerCro.textContent = isDraft ? ' — CRO pendente de validação' : '';
  });

  /* ---------- agenda externa (integração futura) ---------- */
  run('agenda-externa', function () {
    var agenda = (cfg.agendamento || {}).urlAgendaExterna;
    if (agenda) { var ag = $('[data-agenda-externa]'); $('a', ag).href = agenda; ag.hidden = false; }
  });

  /* ---------- formulário de solicitação ---------- */
  run('formulario', function () {
    var form = $('[data-booking-form]');
    var success = $('[data-form-success]');
    var submitBtn = $('[data-submit]');
    var statusEl = $('[data-form-status]');
    var select = $('[data-service-select]');
    var copyBtn = $('[data-copy-message]');
    var touched = {};
    var submitted = false;
    var busy = false;

    var field = function (name) { return form.elements[name]; };
    var setError = function (name, msg) {
      var el = field(name);
      var err = $('[data-error-for="' + name + '"]', form);
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      err.textContent = msg;
      err.hidden = !msg;
    };
    var validators = {
      nome: function (v) {
        v = v.trim();
        if (!v) return 'Informe seu nome.';
        if (v.length < 3 || !/[A-Za-zÀ-ÿ]/.test(v)) return 'Informe um nome válido.';
        return '';
      },
      telefone: function (v) { return phoneProblem(brNational(v)); },
      tipo: function (v) { return v ? '' : 'Selecione o tipo de atendimento.'; },
      consentimento: function (_, el) { return el.checked ? '' : 'Para continuar, autorize o uso dos dados para o contato.'; },
    };
    var validate = function (name) {
      var el = field(name);
      var msg = validators[name](el.value, el);
      setError(name, msg);
      return !msg;
    };

    // "Consultar disponibilidade" pré-seleciona o serviço
    document.addEventListener('click', function (e) {
      var a = e.target.closest('[data-service]');
      if (!a) return;
      var id = a.getAttribute('data-service');
      var opt = $$('option', select).filter(function (o) { return o.getAttribute('data-id') === id; })[0];
      if (opt) { select.value = opt.value; setError('tipo', ''); }
    });

    // máscara do telefone preservando a posição do cursor
    var phone = field('telefone');
    var maskPhone = function (v) {
      var d = brNational(v).slice(0, 11);
      if (d.length <= 2) return d.length ? '(' + d : '';
      if (d.length <= 6) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
      if (d.length <= 10) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
      return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
    };
    phone.addEventListener('input', function () {
      var raw = phone.value;
      var caret = phone.selectionStart == null ? raw.length : phone.selectionStart;
      var allDigits = digits(raw).length;
      var national = brNational(raw).slice(0, 11).length;
      var before = digits(raw.slice(0, caret)).length - Math.max(0, allDigits - national);
      var masked = maskPhone(raw);
      phone.value = masked;
      if (caret >= raw.length) { phone.setSelectionRange(masked.length, masked.length); }
      else {
        var pos = 0, seen = 0;
        while (pos < masked.length && seen < Math.max(0, before)) { if (/\d/.test(masked.charAt(pos))) seen++; pos++; }
        phone.setSelectionRange(pos, pos);
      }
      if (touched.telefone) validate('telefone');
    });
    Object.keys(validators).forEach(function (name) {
      var el = field(name);
      // só acusa erro ao sair do campo depois que algo foi digitado (ou após tentar enviar)
      el.addEventListener('blur', function () {
        var typed = el.type === 'checkbox' ? false : !!el.value.trim();
        if (submitted || typed) { touched[name] = true; validate(name); }
      });
      el.addEventListener(el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'input', function () { if (touched[name]) validate(name); });
    });

    var buildMessage = function (data) {
      var lines = [
        'Olá! Gostaria de solicitar um agendamento com a ' + (prof.nome || 'Dra. Evelyn Lara') + '.',
        '',
        'Nome: ' + data.nome,
        'Telefone: ' + formatBr(data.telefone).replace(/ /g, ' '),
        'Atendimento: ' + data.tipo,
      ];
      if (data.periodo) lines.push('Período de preferência: ' + data.periodo);
      if (data.dia) lines.push('Dia de preferência: ' + data.dia);
      if (data.mensagem) lines.push('Mensagem: ' + data.mensagem);
      lines.push('', 'Enviado pelo site. Aguardo a confirmação de data e horário.');
      return lines.join('\n');
    };

    /** Ponto de integração: hoje encaminha via WhatsApp (ou copiar/Instagram). Uma agenda externa pode substituir esta função. */
    var Agendamento = {
      preparar: function (data) {
        var message = buildMessage(data);
        return Promise.resolve({ message: message, url: hasWhatsApp ? waLink(message) : '' });
      },
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (busy) return;
      submitted = true;
      var invalid = Object.keys(validators).filter(function (n) { touched[n] = true; return !validate(n); });
      if (invalid.length) {
        statusEl.textContent = 'Há ' + invalid.length + (invalid.length > 1 ? ' campos' : ' campo') + ' para corrigir.';
        field(invalid[0]).focus();
        return;
      }
      busy = true;
      submitBtn.setAttribute('aria-busy', 'true');
      submitBtn.disabled = true;
      $('.btn__label', submitBtn).textContent = 'Preparando…';
      statusEl.textContent = 'Preparando sua solicitação.';

      var data = {
        nome: field('nome').value.trim().replace(/\s+/g, ' '),
        telefone: brNational(phone.value),
        tipo: field('tipo').value,
        periodo: (form.querySelector('input[name="periodo"]:checked') || {}).value || '',
        dia: field('dia').value.trim(),
        mensagem: field('mensagem').value.trim(),
      };

      Agendamento.preparar(data).then(function (result) {
        setTimeout(function () { // breve pausa para o estado de carregamento ser perceptível
          $('[data-success-whatsapp]').hidden = !result.url;
          $('[data-success-pending]').hidden = !!result.url;
          if (result.url) $('[data-whatsapp-open]').href = result.url;
          $('[data-message-preview]').textContent = result.message;
          form.hidden = true;
          success.hidden = false;
          success.focus();
          busy = false;
          submitBtn.removeAttribute('aria-busy');
          submitBtn.disabled = false;
          $('.btn__label', submitBtn).textContent = 'Preparar solicitação';
        }, reduceMotion ? 0 : 450);
      });
    });

    $('[data-form-edit]').addEventListener('click', function () {
      copyBtn.textContent = 'Copiar mensagem';
      $('[data-copy-status]').textContent = '';
      success.hidden = true;
      form.hidden = false;
      field('nome').focus();
    });

    // textos honestos conforme o canal disponível
    if (hasWhatsApp) {
      $('[data-booking-lead]').textContent = 'Preencha seus dados e a sua solicitação será encaminhada pelo WhatsApp ao consultório.';
      $('[data-booking-step2]').textContent = 'Sua mensagem é aberta no WhatsApp, pronta para enviar.';
    } else {
      $('[data-booking-step2]').textContent = igUser ? 'Você copia a mensagem e a envia pelo Instagram do consultório.' : 'Você copia a mensagem e a envia ao consultório.';
      $('[data-pending-note]').hidden = !isDraft;
      if (igUser) {
        var dm = $('[data-instagram-dm]');
        dm.href = 'https://ig.me/m/' + encodeURIComponent(igUser);
        dm.hidden = false;
        $('[data-pending-instructions]').textContent = 'Copie a mensagem abaixo e envie pelo Instagram @' + igUser + ':';
      }
    }

    var copyStatus = $('[data-copy-status]');
    var preview = $('[data-message-preview]');
    var execCopy = function () {
      try {
        var range = document.createRange(); range.selectNodeContents(preview);
        var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
        var ok = document.execCommand('copy');
        sel.removeAllRanges();
        return ok;
      } catch (err) { return false; }
    };
    copyBtn.addEventListener('click', function () {
      var done = function (ok) {
        copyStatus.textContent = ok ? 'Mensagem copiada.' : 'Não foi possível copiar automaticamente. Selecione o texto acima e copie.';
        if (ok) copyBtn.textContent = 'Mensagem copiada';
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(preview.textContent).then(function () { done(true); }, function () { done(execCopy()); });
      } else {
        done(execCopy());
      }
    });
  });

  /* ---------- WhatsApp flutuante ---------- */
  if (hasWhatsApp) run('whatsapp-flutuante', function () {
    var waFloat = $('[data-wa-float]');
    waFloat.href = waLink('Olá! Vim pelo site e gostaria de informações sobre atendimento com a ' + prof.nome + '.');
    waFloat.hidden = false;
    var blockers = new Set();
    var hero = $('.hero');
    var refreshFloat = function () {
      var pastHero = window.scrollY > hero.offsetHeight * 0.6;
      waFloat.classList.toggle('is-visible', pastHero && blockers.size === 0);
    };
    if ('IntersectionObserver' in window) {
      // some sobre o formulário e o rodapé para não cobrir campos, botões ou avisos
      var floatIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) blockers.add(en.target); else blockers.delete(en.target); });
        refreshFloat();
      }, { rootMargin: '0px 0px -80px 0px' });
      [$('#agendamento'), $('.site-footer')].forEach(function (n) { floatIo.observe(n); });
    }
    window.addEventListener('scroll', refreshFloat, { passive: true });
    refreshFloat();
  });

  /* ---------- aviso de pré-visualização ---------- */
  if (isDraft) run('aviso-rascunho', function () {
    if (store('sessionStorage', 'el-draft-ok') === '1') return;
    var pend = [];
    if (!hasWhatsApp) pend.push(waInvalid ? 'WhatsApp (número inválido)' : 'WhatsApp');
    if (!contato.email) pend.push('e-mail');
    if (!croText) pend.push('CRO');
    if (!hasAddress) pend.push('endereço');
    if (esp && esp.titulo && !esp.confirmado) pend.push('título de especialista');
    var banner = $('[data-draft-banner]');
    $('[data-draft-text]').textContent = pend.length ? ' — pendente: ' + listPt(pend) + '. ' : ' — revise os textos antes de publicar. ';
    banner.hidden = false;
    // o aviso fixo não pode esconder o elemento focado
    var pad = function () { root.style.scrollPaddingBottom = banner.hidden ? '' : (banner.offsetHeight + 24) + 'px'; };
    pad();
    window.addEventListener('resize', pad);
    $('[data-draft-dismiss]').addEventListener('click', function () {
      banner.hidden = true; pad();
      store('sessionStorage', 'el-draft-ok', '1');
    });
  });

  /* ---------- vídeo de apresentação ---------- */
  run('video', function () {
    var video = $('[data-intro-video]');
    if (!video) return;
    var playBtn = $('[data-video-toggle]');
    var soundBtn = $('[data-video-sound]');
    var videoLoaded = false;
    var userPaused = false;
    var saveData = !!(navigator.connection && navigator.connection.saveData);
    var canAutoplay = !reduceMotion && !saveData;
    var setPoster = function () {
      var p = video.getAttribute('data-poster');
      if (p && !video.getAttribute('poster')) video.setAttribute('poster', p);
    };
    var loadVideo = function () {
      if (videoLoaded) return;
      videoLoaded = true;
      setPoster();
      $$('source[data-src]', video).forEach(function (s) { s.src = s.getAttribute('data-src'); });
      video.load();
    };
    var syncVideoUi = function () {
      var playing = !video.paused && !video.ended;
      playBtn.setAttribute('data-on', String(playing));
      $('[data-video-toggle-label]').textContent = playing ? 'Pausar vídeo' : 'Reproduzir vídeo';
      soundBtn.setAttribute('data-on', String(!video.muted));
      $('[data-video-sound-label]').textContent = video.muted ? 'Ativar som do vídeo' : 'Desativar som do vídeo';
    };
    var play = function () { loadVideo(); var p = video.play(); if (p && p.catch) p.catch(function () { syncVideoUi(); }); };
    ['play', 'pause', 'volumechange', 'ended'].forEach(function (ev) { video.addEventListener(ev, syncVideoUi); });
    playBtn.addEventListener('click', function () {
      if (video.paused) { userPaused = false; play(); }
      else { userPaused = true; video.pause(); }
    });
    soundBtn.addEventListener('click', function () {
      video.muted = !video.muted;
      if (!video.muted && video.paused) { userPaused = false; play(); }
    });
    if ('IntersectionObserver' in window) {
      // perto da tela: mostra o pôster; o vídeo só é baixado se puder tocar sozinho (ou quando o visitante pedir)
      var nearIo = new IntersectionObserver(function (entries) {
        if (!entries.some(function (e) { return e.isIntersecting; })) return;
        setPoster();
        if (canAutoplay) loadVideo();
        nearIo.disconnect();
      }, { rootMargin: '400px 0px' });
      nearIo.observe(video);
      // toca (sem som) quando visível e pausa fora da tela, sem sobrescrever a escolha do visitante
      var viewIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { if (canAutoplay && !userPaused) play(); }
          else if (!video.paused) video.pause();
        });
      }, { threshold: 0.35 });
      viewIo.observe(video);
    } else {
      setPoster();
    }
    syncVideoUi();
  });

  /* ---------- SEO: canonical e dados estruturados (somente dados confirmados) ---------- */
  if (cfgLoaded) run('seo', function () {
    var base = (cfg.dominio || '').replace(/\/+$/, '');
    if (base && !$('link[rel="canonical"]')) document.head.appendChild(h('link', { rel: 'canonical', href: base + '/' }));
    if (base && !$('meta[property="og:url"]')) document.head.appendChild(h('meta', { property: 'og:url', content: base + '/' }));
    if ((cfg.integracoes || {}).googleSiteVerification && !$('meta[name="google-site-verification"]')) {
      document.head.appendChild(h('meta', { name: 'google-site-verification', content: cfg.integracoes.googleSiteVerification }));
    }
    if (!isDraft) {
      var robots = $('meta[name="robots"]');
      if (robots && /noindex/i.test(robots.content)) console.warn('[site] modo "publicado", mas o index.html ainda tem <meta name="robots" content="noindex">. Troque para "index, follow" para aparecer no Google.');
    }
    var schema = {
      '@context': 'https://schema.org',
      '@type': 'Dentist',
      name: prof.nome || 'Dra. Evelyn Lara',
      description: 'Atendimento odontológico humanizado, com atenção aos detalhes e tratamentos personalizados.',
    };
    if (base) { schema.url = base + '/'; schema.image = base + '/assets/img/og-evelyn-lara.jpg'; }
    if (hasWhatsApp) schema.telephone = '+' + waNumber;
    else if (hasTel) schema.telephone = '+55' + telNational;
    if (contato.email) schema.email = contato.email;
    if (hasAddress) {
      schema.address = { '@type': 'PostalAddress', streetAddress: endereco.logradouro, addressLocality: endereco.cidade, addressRegion: endereco.uf, addressCountry: 'BR' };
      if (endereco.cep) schema.address.postalCode = endereco.cep;
    }
    var ohs = horarios.filter(function (x) { return x.diasSchema && x.abre && x.fecha; });
    if (ohs.length) schema.openingHoursSpecification = ohs.map(function (x) { return { '@type': 'OpeningHoursSpecification', dayOfWeek: x.diasSchema, opens: x.abre, closes: x.fecha }; });
    if (croText) schema.identifier = { '@type': 'PropertyValue', propertyID: 'CRO-' + prof.croUf, value: String(prof.cro) };
    if (igUrl) schema.sameAs = [igUrl];
    var confirmed = (cfg.tratamentos || []).filter(function (t) { return t && t.nome && !t.demo; });
    if (confirmed.length) {
      schema.hasOfferCatalog = {
        '@type': 'OfferCatalog',
        name: 'Tratamentos',
        itemListElement: confirmed.map(function (t) { return { '@type': 'Offer', itemOffered: { '@type': 'Service', name: t.nome } }; }),
      };
    }
    var ld = $('#schema-ld') || document.head.appendChild(h('script', { type: 'application/ld+json', id: 'schema-ld' }));
    ld.textContent = JSON.stringify(schema);
  });

  /* ---------- revelação ao rolar (por último: inclui o conteúdo gerado acima) ---------- */
  run('revelacao', function () {
    var revealEls = $$('[data-reveal]');
    if (reduceMotion || !('IntersectionObserver' in window)) { revealAll(); return; }
    revealEls.forEach(function (el) {
      var siblings = $$(':scope > [data-reveal]', el.parentNode);
      el.style.setProperty('--d', Math.min(siblings.indexOf(el), 6) * 80 + 'ms');
    });
    var revealIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        revealIo.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { revealIo.observe(el); });
  });
  if (failures.indexOf('revelacao') !== -1) revealAll();
  root.classList.add('reveal-ready');
})();
