/**
 * Dra. Evelyn Lara | Cirurgiã-Dentista — comportamento do site.
 * JavaScript puro, sem dependências. Todos os dados vêm de window.SITE_CONFIG (config.js).
 * O conteúdo principal está no HTML; aqui entram interações e as partes configuráveis.
 */
(function () {
  'use strict';

  var cfg = window.SITE_CONFIG || {};
  var isDraft = cfg.modo !== 'publicado';
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
  function digits(v) { return String(v || '').replace(/\D/g, ''); }
  function store(kind, key, value) {
    try {
      var s = window[kind];
      if (value === undefined) return s.getItem(key);
      s.setItem(key, value);
    } catch (e) { return null; }
  }

  /* ---------- dados derivados ---------- */
  var waNumber = digits(contato.whatsapp);
  var hasWhatsApp = waNumber.length >= 12; // DDI + DDD + número
  function waLink(message) { return 'https://wa.me/' + waNumber + '?text=' + encodeURIComponent(message); }
  function formatBrPhone(d) {
    d = digits(d);
    if (d.length > 11 && d.indexOf('55') === 0) d = d.slice(2);
    if (d.length === 11) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
    if (d.length === 10) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
    return d;
  }
  var hasAddress = !!(endereco.validado && endereco.logradouro && endereco.cidade);
  var addressText = hasAddress
    ? [endereco.logradouro, endereco.bairro, [endereco.cidade, endereco.uf].filter(Boolean).join(' - '), endereco.cep ? 'CEP ' + endereco.cep : '']
        .filter(Boolean).join(', ')
    : '';
  var mapsLink = hasAddress ? (endereco.linkMaps || 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(addressText)) : '';
  var croText = prof.cro && prof.croUf ? 'CRO-' + prof.croUf + ' ' + prof.cro : '';
  var visibleTreatments = (cfg.tratamentos || []).filter(function (t) { return isDraft || !t.demo; });

  function pendingSpan(text) { return h('span', { class: 'pending', text: text || 'A confirmar' }); }

  /* ---------- header: estado ao rolar + link ativo ---------- */
  var header = $('[data-header]');
  function onScrollHeader() { header.classList.toggle('is-solid', window.scrollY > 12); }
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  var navLinks = $$('.nav__link');
  if ('IntersectionObserver' in window) {
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
  }

  /* ---------- menu móvel ---------- */
  var toggle = $('[data-menu-toggle]');
  var menu = $('[data-menu]');
  var menuLabel = $('[data-menu-label]');
  function setMenu(open, returnFocus) {
    toggle.setAttribute('aria-expanded', String(open));
    menuLabel.textContent = open ? 'Fechar menu' : 'Abrir menu';
    menu.hidden = !open;
    document.body.classList.toggle('menu-open', open);
    if (open) { var first = $('a', menu); if (first) first.focus(); }
    else if (returnFocus) toggle.focus();
  }
  toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' || menu.hidden) return;
    setMenu(false, true);
  });
  menu.addEventListener('keydown', function (e) { // mantém o foco dentro do menu aberto
    if (e.key !== 'Tab') return;
    var items = $$('a, button', menu).concat([toggle]);
    var i = items.indexOf(document.activeElement);
    if (e.shiftKey && i === 0) { e.preventDefault(); toggle.focus(); }
    else if (!e.shiftKey && i === items.length - 2) { e.preventDefault(); toggle.focus(); }
  });
  window.matchMedia('(min-width: 1024px)').addEventListener('change', function (m) { if (m.matches) setMenu(false); });

  /* ---------- tratamentos ---------- */
  var ICONS = {
    tooth: '<path d="M7 3c-2.5 0-4 2-4 4.5 0 2 .8 3.4 1.4 5 .6 1.8.8 4 1.4 6.2.4 1.5 1 2.3 1.8 2.3 1.2 0 1.4-1.7 1.8-3.6.3-1.4.7-2.9 2.6-2.9s2.3 1.5 2.6 2.9c.4 1.9.6 3.6 1.8 3.6.8 0 1.4-.8 1.8-2.3.6-2.2.8-4.4 1.4-6.2.6-1.6 1.4-3 1.4-5C21 5 19.5 3 17 3c-2 0-3 1-5 1S9 3 7 3Z"/>',
    sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z"/><path d="M19 16l.7 1.8 1.8.7-1.8.7L19 21l-.7-1.8-1.8-.7 1.8-.7Z"/>',
    smile: '<circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01M15 9h.01"/>',
    stethoscope: '<path d="M5 3v6a5 5 0 0 0 10 0V3"/><path d="M10 14v2a5 5 0 0 0 10 0v-2"/><circle cx="20" cy="12" r="2"/>',
  };
  function icon(name) {
    var span = h('span', { class: 'treatment__icon', 'aria-hidden': 'true' });
    span.innerHTML = '<svg viewBox="0 0 24 24">' + (ICONS[name] || ICONS.tooth) + '</svg>';
    return span;
  }
  var treatmentList = $('[data-treatments]');
  visibleTreatments.forEach(function (t) {
    var titleId = 'trat-' + t.id;
    var title = h('h3', { class: 'treatment__title', id: titleId }, [icon(t.icone), t.nome, t.demo ? h('span', { class: 'badge', text: 'Exemplo' }) : null]);
    var more = t.detalhe ? h('details', { class: 'treatment__more' }, [
      h('summary', {}, ['Saber mais', h('span', { class: 'sr-only', text: ' sobre ' + t.nome })]),
      h('p', { class: 'treatment__detail', text: t.detalhe }),
    ]) : null;
    var cta = h('a', { class: 'link-arrow', href: '#agendamento', 'data-service': t.id }, ['Consultar disponibilidade', h('span', { class: 'sr-only', text: ' para ' + t.nome }), h('span', { 'aria-hidden': 'true', text: ' →' })]);
    treatmentList.appendChild(h('li', { class: 'treatment', 'data-reveal': '' }, [
      h('div', { class: 'treatment__head' }, [
        h('span', { class: 'treatment__num', 'aria-hidden': 'true' }),
        title,
        h('div', { class: 'treatment__body' }, [h('p', { class: 'treatment__summary', text: t.resumo }), more, h('div', { class: 'treatment__actions' }, [cta])]),
      ]),
    ]));
  });
  if (!visibleTreatments.length) $('[data-treatments-empty]').hidden = false;
  if (isDraft && visibleTreatments.some(function (t) { return t.demo; })) $('[data-demo-note]').hidden = false;

  /* opções do formulário seguem a lista real de serviços */
  var select = $('[data-service-select]');
  var genericFirst = !visibleTreatments.some(function (t) { return t.id === 'avaliacao'; });
  if (genericFirst) select.appendChild(h('option', { value: 'Primeira consulta / avaliação', text: 'Primeira consulta / avaliação' }));
  visibleTreatments.forEach(function (t) { select.appendChild(h('option', { value: t.nome, 'data-id': t.id, text: t.nome + (t.demo ? ' (exemplo)' : '') })); });
  select.appendChild(h('option', { value: 'Outro / quero orientação', text: 'Outro assunto / quero orientação' }));
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-service]');
    if (!a) return;
    var opt = $('option[data-id="' + a.getAttribute('data-service') + '"]', select);
    if (opt) { select.value = opt.value; clearError('tipo'); }
  });

  /* ---------- galeria + lightbox ---------- */
  var galleryItems = cfg.galeria || [];
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

  var lightbox = $('[data-lightbox]');
  var lbIndex = 0;
  var lbReturn = null;
  function showLightbox(i) {
    lbIndex = (i + galleryItems.length) % galleryItems.length;
    var g = galleryItems[lbIndex];
    var img = $('[data-lightbox-img]', lightbox);
    img.src = g.src; img.alt = g.alt || '';
    $('[data-lightbox-caption]', lightbox).textContent = g.legenda || '';
    var multi = galleryItems.length > 1;
    $('[data-lightbox-prev]', lightbox).hidden = !multi;
    $('[data-lightbox-next]', lightbox).hidden = !multi;
  }
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

  /* ---------- depoimentos (somente reais e autorizados) ---------- */
  var quotes = cfg.depoimentos || [];
  var tSection = $('[data-testimonials-section]');
  var track = $('[data-testimonials]');
  var carousel = $('[data-carousel]');
  if (quotes.length) {
    tSection.hidden = false;
    quotes.forEach(function (q, i) {
      track.appendChild(h('li', { class: 'quote', 'aria-roledescription': 'slide', 'aria-label': (i + 1) + ' de ' + quotes.length }, [
        h('blockquote', { class: 'quote__text' }, [h('p', { text: q.texto })]),
        h('p', { class: 'quote__author' }, [q.autor, q.detalhe ? h('span', { text: q.detalhe }) : null]),
      ]));
    });
    if (quotes.length > 1) {
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
        prev.disabled = carousel.scrollLeft <= 2;
        next.disabled = carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 2;
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
    }
  } else if (isDraft) {
    tSection.hidden = false;
    $('[data-testimonials-note]').hidden = false;
    carousel.removeAttribute('tabindex');
    track.appendChild(h('li', { class: 'quote quote--placeholder' }, [
      h('p', { class: 'quote__text', text: 'Espaço reservado para depoimentos reais de pacientes, publicados somente com autorização.' }),
      h('p', { class: 'quote__author', text: 'Sem depoimentos cadastrados' }),
    ]));
  }

  /* ---------- FAQ ---------- */
  var faq = $('[data-faq]');
  if (isDraft) $('.faq__intro').appendChild(h('p', { class: 'draft-note', html: '<strong>Respostas em rascunho.</strong> Revise cada resposta com a profissional antes de publicar (<code>faq</code> no <code>config.js</code>).' }));
  (cfg.faq || []).forEach(function (item, i) {
    var answer = h('div', { class: 'faq-item__answer' });
    if (item.resposta.indexOf('{endereco}') !== -1) {
      if (hasAddress) {
        answer.appendChild(h('p', {}, ['O consultório fica em ' + addressText + '. ', h('a', { href: mapsLink, target: '_blank', rel: 'noopener', text: 'Ver no Google Maps' })]));
      } else if (isDraft) {
        answer.appendChild(h('p', {}, [h('span', { class: 'badge', text: 'Pendente' }), 'O endereço será exibido aqui assim que for validado em config.js.']));
      } else {
        return; // sem endereço confirmado, a pergunta não é publicada
      }
    } else {
      answer.appendChild(h('p', { text: item.resposta }));
    }
    faq.appendChild(h('details', { class: 'faq-item', 'data-reveal': '', id: 'faq-' + (i + 1) }, [
      h('summary', {}, [h('span', { text: item.pergunta }), h('span', { class: 'faq-item__icon', 'aria-hidden': 'true' })]),
      answer,
    ]));
  });

  /* ---------- contato, mapa e rodapé ---------- */
  var list = $('[data-contact-list]');
  function row(label, content) { list.appendChild(h('div', { class: 'contact__item' }, [h('dt', { text: label }), h('dd', {}, [content])])); }
  if (hasWhatsApp) row('WhatsApp', h('a', { href: waLink('Olá! Vim pelo site e gostaria de informações sobre atendimento com a ' + prof.nome + '.'), target: '_blank', rel: 'noopener', text: formatBrPhone(waNumber) }));
  else if (isDraft) row('WhatsApp', pendingSpan('Número oficial a confirmar'));
  if (contato.telefone) row('Telefone', h('a', { href: 'tel:+55' + digits(contato.telefone), text: contato.telefone }));
  if (contato.email) row('E-mail', h('a', { href: 'mailto:' + contato.email, text: contato.email }));
  else if (isDraft) row('E-mail', pendingSpan());
  if (hasAddress) row('Endereço', document.createTextNode(addressText));
  else if (isDraft) row('Endereço', pendingSpan('Endereço a validar'));
  if ((cfg.horarios || []).length) {
    var hoursList = h('ul', {}, cfg.horarios.map(function (x) { return h('li', { text: x.dias + ': ' + x.horas }); }));
    row('Horários', hoursList);
  } else if (isDraft) row('Horários', pendingSpan('Horários a confirmar'));
  if (contato.instagram) row('Instagram', h('a', { href: contato.instagram, target: '_blank', rel: 'noopener', text: '@' + contato.instagram.replace(/\/+$/, '').split('/').pop() }));
  if (!list.children.length) list.hidden = true;

  var mapBox = $('[data-map]');
  if (hasAddress) {
    var mapsBtn = $('[data-maps-link]');
    mapsBtn.href = mapsLink; mapsBtn.hidden = false;
    // O mapa do Google só é carregado com um clique (evita cookies de terceiros sem ação do visitante).
    $('[data-map-placeholder-text]').textContent = addressText;
    var loadBtn = h('button', { class: 'btn btn--outline btn--sm', type: 'button', text: 'Exibir mapa (Google Maps)' });
    $('[data-map-placeholder]').appendChild(loadBtn);
    loadBtn.addEventListener('click', function () {
      mapBox.innerHTML = '';
      mapBox.appendChild(h('iframe', { src: 'https://www.google.com/maps?q=' + encodeURIComponent(addressText) + '&output=embed', title: 'Mapa com a localização do consultório', loading: 'lazy', referrerpolicy: 'no-referrer-when-downgrade' }));
    });
  } else if (!isDraft) {
    mapBox.hidden = true;
  }

  var fc = $('[data-footer-contact]');
  if (hasWhatsApp) fc.appendChild(h('li', {}, [h('a', { href: waLink('Olá! Vim pelo site e gostaria de informações.'), target: '_blank', rel: 'noopener', text: 'WhatsApp ' + formatBrPhone(waNumber) })]));
  if (contato.telefone) fc.appendChild(h('li', {}, [h('a', { href: 'tel:+55' + digits(contato.telefone), text: contato.telefone })]));
  if (contato.email) fc.appendChild(h('li', {}, [h('a', { href: 'mailto:' + contato.email, text: contato.email })]));
  if (hasAddress) fc.appendChild(h('li', {}, [h('a', { href: mapsLink, target: '_blank', rel: 'noopener', text: addressText })]));
  if (contato.instagram) fc.appendChild(h('li', {}, [h('a', { href: contato.instagram, target: '_blank', rel: 'noopener', text: 'Instagram' })]));
  fc.appendChild(h('li', {}, [h('a', { href: '#agendamento', text: 'Solicitar consulta' })]));
  if (isDraft && !hasWhatsApp && !contato.email && !hasAddress) fc.insertBefore(h('li', {}, [pendingSpan('Contatos oficiais a confirmar')]), fc.firstChild);

  if (croText) {
    var cro = $('[data-cro]'); cro.textContent = croText; cro.hidden = false;
    $('[data-footer-cro]').textContent = ' — ' + croText;
  } else if (isDraft) {
    $('[data-footer-cro]').textContent = ' — CRO-UF pendente de validação';
  }

  /* ---------- agenda externa (integração futura) ---------- */
  var agenda = (cfg.agendamento || {}).urlAgendaExterna;
  if (agenda) { var ag = $('[data-agenda-externa]'); $('a', ag).href = agenda; ag.hidden = false; }

  /* ---------- formulário de solicitação ---------- */
  var form = $('[data-booking-form]');
  var success = $('[data-form-success]');
  var submitBtn = $('[data-submit]');
  var statusEl = $('[data-form-status]');
  var touched = {};
  var busy = false;

  function maskPhone(v) {
    var d = digits(v);
    if (d.length > 11 && d.indexOf('55') === 0) d = d.slice(2);
    d = d.slice(0, 11);
    if (d.length <= 2) return d.length ? '(' + d : '';
    if (d.length <= 6) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
    if (d.length <= 10) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
    return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
  }
  function normalizePhone(v) {
    var d = digits(v);
    if (d.length > 11 && d.indexOf('55') === 0) d = d.slice(2);
    return d;
  }

  var validators = {
    nome: function (v) {
      v = v.trim();
      if (!v) return 'Informe seu nome.';
      if (v.length < 3 || !/[A-Za-zÀ-ÿ]/.test(v)) return 'Informe um nome válido.';
      return '';
    },
    telefone: function (v) {
      var d = normalizePhone(v);
      if (!d) return 'Informe um telefone ou WhatsApp para retorno.';
      if (d.length < 10 || d.length > 11) return 'Informe o número com DDD, por exemplo (11) 91234-5678.';
      if (/^0/.test(d) || Number(d.slice(0, 2)) < 11) return 'Verifique o DDD informado.';
      if (d.length === 11 && d.charAt(2) !== '9') return 'Celulares com 11 dígitos começam com 9 após o DDD.';
      if (/^(\d)\1+$/.test(d.slice(2))) return 'Verifique o número informado.';
      return '';
    },
    tipo: function (v) { return v ? '' : 'Selecione o tipo de atendimento.'; },
    consentimento: function (_, el) { return el.checked ? '' : 'Para continuar, autorize o uso dos dados para o contato.'; },
  };

  function field(name) { return form.elements[name]; }
  function setError(name, msg) {
    var el = field(name);
    var err = $('[data-error-for="' + name + '"]', form);
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    err.textContent = msg;
    err.hidden = !msg;
  }
  function clearError(name) { setError(name, ''); }
  function validate(name) {
    var el = field(name);
    var msg = validators[name](el.value, el);
    setError(name, msg);
    return !msg;
  }

  var phone = field('telefone');
  phone.addEventListener('input', function () {
    var atEnd = phone.selectionStart === phone.value.length;
    phone.value = maskPhone(phone.value);
    if (atEnd) phone.setSelectionRange(phone.value.length, phone.value.length);
    if (touched.telefone) validate('telefone');
  });
  Object.keys(validators).forEach(function (name) {
    var el = field(name);
    el.addEventListener('blur', function () { touched[name] = true; validate(name); });
    el.addEventListener(el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'input', function () { if (touched[name]) validate(name); });
  });

  function buildMessage(data) {
    var lines = [
      'Olá! Gostaria de solicitar um agendamento com a ' + (prof.nome || 'Dra. Evelyn Lara') + '.',
      '',
      'Nome: ' + data.nome,
      'Telefone: ' + formatBrPhone(data.telefone),
      'Atendimento: ' + data.tipo,
    ];
    if (data.periodo) lines.push('Período de preferência: ' + data.periodo);
    if (data.dia) lines.push('Dia de preferência: ' + data.dia);
    if (data.mensagem) lines.push('Mensagem: ' + data.mensagem);
    lines.push('', 'Enviado pelo site. Aguardo a confirmação de data e horário.');
    return lines.join('\n');
  }

  /** Ponto de integração: hoje encaminha via WhatsApp. Uma agenda externa pode substituir esta função. */
  var Agendamento = {
    preparar: function (data) {
      var message = buildMessage(data);
      return Promise.resolve({ message: message, url: hasWhatsApp ? waLink(message) : '' });
    },
  };

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (busy) return;
    var names = Object.keys(validators);
    var invalid = names.filter(function (n) { touched[n] = true; return !validate(n); });
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
      telefone: normalizePhone(phone.value),
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
        else $('[data-message-preview]').textContent = result.message;
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
    success.hidden = true;
    form.hidden = false;
    field('nome').focus();
  });
  if (!hasWhatsApp && !isDraft) {
    var pendingNote = $('[data-success-pending] .draft-note');
    pendingNote.innerHTML = 'Copie a mensagem abaixo e envie pelos canais da seção <a href="#contato">Contato</a>:';
  }

  /* ---------- WhatsApp flutuante ---------- */
  var waFloat = $('[data-wa-float]');
  if (hasWhatsApp) {
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
  }

  /* ---------- aviso de pré-visualização ---------- */
  if (isDraft && store('sessionStorage', 'el-draft-ok') !== '1') {
    var banner = $('[data-draft-banner]');
    banner.hidden = false;
    $('[data-draft-dismiss]').addEventListener('click', function () { banner.hidden = true; store('sessionStorage', 'el-draft-ok', '1'); });
  }

  /* ---------- revelação ao rolar ---------- */
  var revealEls = $$('[data-reveal]');
  if (!reduceMotion && 'IntersectionObserver' in window) {
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
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- SEO: canonical e dados estruturados (somente dados confirmados) ---------- */
  var base = (cfg.dominio || '').replace(/\/+$/, '');
  if (base) {
    document.head.appendChild(h('link', { rel: 'canonical', href: base + '/' }));
    document.head.appendChild(h('meta', { property: 'og:url', content: base + '/' }));
    var ogImg = $('meta[property="og:image"]');
    if (ogImg && !/^https?:/.test(ogImg.content)) ogImg.content = base + '/' + ogImg.content;
  }
  if ((cfg.integracoes || {}).googleSiteVerification) {
    document.head.appendChild(h('meta', { name: 'google-site-verification', content: cfg.integracoes.googleSiteVerification }));
  }
  var schema = {
    '@context': 'https://schema.org',
    '@type': 'Dentist',
    name: (prof.nome || 'Dra. Evelyn Lara') + ' | ' + (prof.titulo || 'Cirurgiã-Dentista'),
    description: 'Atendimento odontológico humanizado, com atenção aos detalhes e tratamentos personalizados.',
  };
  if (base) { schema.url = base + '/'; schema.image = base + '/assets/img/og-evelyn-lara.jpg'; }
  if (hasWhatsApp) schema.telephone = '+' + waNumber;
  else if (contato.telefone) schema.telephone = '+55' + digits(contato.telefone);
  if (contato.email) schema.email = contato.email;
  if (hasAddress) {
    schema.address = { '@type': 'PostalAddress', streetAddress: endereco.logradouro, addressLocality: endereco.cidade, addressRegion: endereco.uf, postalCode: endereco.cep, addressCountry: 'BR' };
  }
  if (contato.instagram) schema.sameAs = [contato.instagram];
  var confirmed = (cfg.tratamentos || []).filter(function (t) { return !t.demo; });
  if (confirmed.length) schema.availableService = confirmed.map(function (t) { return { '@type': 'MedicalProcedure', name: t.nome }; });
  document.head.appendChild(h('script', { type: 'application/ld+json', text: JSON.stringify(schema) }));
})();
