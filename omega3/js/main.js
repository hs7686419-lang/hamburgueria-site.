/* Ômega 3 1g · Oficialfarma — interações da página */
(function () {
  'use strict';

  // ===== Configuração da loja (edite aqui) =====
  var CONFIG = {
    linkCompra: '',      // URL da página de compra na loja. Vazio: os botões levam até a seção #produto
    whatsapp: '',        // DDI+DDD+número, só dígitos (ex.: '5511999999999'). Vazio esconde o botão
    preco: null,         // preço por frasco em reais (ex.: 49.9). null esconde o preço
    capsulasPorFrasco: 60,
    maxFrascos: 6
  };

  var doc = document;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  var $ = function (sel, ctx) { return (ctx || doc).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var brl = window.Intl ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }) : null;
  var money = function (v) { return brl ? brl.format(v) : 'R$ ' + v.toFixed(2).replace('.', ','); };

  // Anima um número de "from" até "to" dentro de el
  function tweenNumber(el, from, to, ms) {
    if (reduceMotion.matches || from === to) { el.textContent = to; return; }
    var t0 = null;
    if (el._raf) cancelAnimationFrame(el._raf);
    function step(t) {
      if (!t0) t0 = t;
      var p = clamp((t - t0) / ms, 0, 1);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (p < 1) el._raf = requestAnimationFrame(step);
    }
    el._raf = requestAnimationFrame(step);
  }

  /* ---------- Links de compra ---------- */
  function whatsappUrl(qtd) {
    var msg = 'Olá! Quero ' + qtd + (qtd > 1 ? ' frascos' : ' frasco') + ' de Ômega 3 1g Oficialfarma (60 cápsulas).';
    return 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(msg);
  }
  if (CONFIG.linkCompra) {
    $$('[data-buy]').forEach(function (a) {
      a.href = CONFIG.linkCompra;
      a.target = '_blank';
      a.rel = 'noopener';
    });
  }

  /* ---------- Header + menu mobile ---------- */
  var header = $('#header');
  var nav = $('#nav');
  var toggle = $('#menu-toggle');
  var toggleLabel = toggle ? $('.sr-only', toggle) : null;

  function setMenu(open, restoreFocus) {
    if (!toggle) return;
    toggle.setAttribute('aria-expanded', String(open));
    if (toggleLabel) toggleLabel.textContent = open ? 'Fechar menu' : 'Abrir menu';
    nav.classList.toggle('is-open', open);
    header.classList.toggle('menu-open', open);
    doc.body.classList.toggle('no-scroll', open);
    if (open) {
      var first = $('a', nav);
      if (first) setTimeout(function () { first.focus(); }, 60);
    } else if (restoreFocus) {
      toggle.focus();
    }
  }
  if (toggle) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) setMenu(false, true);
      // mantém o foco dentro do menu aberto
      if (e.key === 'Tab' && nav.classList.contains('is-open')) {
        var items = [toggle].concat($$('a', nav));
        var i = items.indexOf(doc.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
        else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
      }
    });
    window.matchMedia('(min-width: 901px)').addEventListener('change', function (mq) {
      if (mq.matches) setMenu(false);
    });
  }

  /* ---------- Scroll: header, manifesto, parallax do frasco ---------- */
  var manifesto = $('[data-words]');
  var words = [];
  if (manifesto) {
    var accent = /^(básico,|todo|dia:)$/;
    var html = manifesto.textContent.trim().split(/\s+/).map(function (w) {
      return '<span class="w' + (accent.test(w) ? ' w--accent' : '') + '">' + w + '</span>';
    }).join(' ');
    manifesto.setAttribute('aria-label', manifesto.textContent.trim());
    manifesto.innerHTML = html;
    $$('.w', manifesto).forEach(function (w) { w.setAttribute('aria-hidden', 'true'); });
    words = $$('.w', manifesto);
  }

  var heroBottle = $('#hero-bottle');
  var heroStage = $('#hero-stage');
  var tilt = { x: 0, y: 0, tx: 0, ty: 0, scroll: 0 };
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var y = window.scrollY || window.pageYOffset;
      header.classList.toggle('is-scrolled', y > 12);

      if (words.length) {
        var vh = window.innerHeight;
        var r = manifesto.getBoundingClientRect();
        var p = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.3), 0, 1);
        var lit = Math.round(p * words.length);
        for (var i = 0; i < words.length; i++) words[i].classList.toggle('is-lit', i < lit);
      }
      tilt.scroll = Math.min(y, 900);
      requestTilt();
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  // Inclinação do frasco seguindo o ponteiro (só mouse/trackpad)
  var tiltRaf = 0;
  function requestTilt() {
    if (!heroBottle || reduceMotion.matches || tiltRaf) return;
    tiltRaf = requestAnimationFrame(renderTilt);
  }
  function renderTilt() {
    tiltRaf = 0;
    tilt.x += (tilt.tx - tilt.x) * 0.08;
    tilt.y += (tilt.ty - tilt.y) * 0.08;
    var lift = tilt.scroll * -0.06;
    heroBottle.style.transform = 'translate(-50%, -50%) translate3d(' + (tilt.x * 10).toFixed(2) + 'px,' + (tilt.y * 8 + lift).toFixed(2) + 'px,0) ' +
      'perspective(900px) rotateY(' + (tilt.x * 8).toFixed(2) + 'deg) rotateX(' + (-tilt.y * 6).toFixed(2) + 'deg)';
    if (Math.abs(tilt.tx - tilt.x) > 0.002 || Math.abs(tilt.ty - tilt.y) > 0.002) requestTilt();
  }
  if (heroStage && finePointer.matches) {
    window.addEventListener('pointermove', function (e) {
      if (window.scrollY > window.innerHeight) return;
      tilt.tx = clamp((e.clientX / window.innerWidth) * 2 - 1, -1, 1);
      tilt.ty = clamp((e.clientY / window.innerHeight) * 2 - 1, -1, 1);
      requestTilt();
    }, { passive: true });
  }

  /* ---------- Reveal + contadores ---------- */
  var revealEls = $$('[data-reveal]');
  var counters = $$('[data-count]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-visible');
        io.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });

    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        tweenNumber(en.target, 0, parseInt(en.target.getAttribute('data-count'), 10), 1400);
        cio.unobserve(en.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Link ativo no menu ---------- */
  var navLinks = $$('.nav__list a');
  if ('IntersectionObserver' in window && navLinks.length) {
    var byId = {};
    navLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var a = byId[en.target.id];
        if (!a) return;
        if (en.isIntersecting) {
          navLinks.forEach(function (l) { l.classList.remove('is-active'); l.removeAttribute('aria-current'); });
          a.classList.add('is-active');
          a.setAttribute('aria-current', 'true');
        } else if (a.classList.contains('is-active')) {
          a.classList.remove('is-active');
          a.removeAttribute('aria-current');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(byId).forEach(function (id) { var s = doc.getElementById(id); if (s) sio.observe(s); });
  }

  /* ---------- Rotina (abas + relógio) ---------- */
  var tabs = $$('.routine__tab');
  var dial = $('.dial');
  var hand = $('#dial-hand');
  var handAngle = 0;
  var autoTimer = null;
  var userTouched = false;

  function selectTab(tab, focus) {
    tabs.forEach(function (t, i) {
      var on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      doc.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      if (on && dial) dial.setAttribute('data-active', String(i));
    });
    // gira sempre pelo caminho mais curto
    var target = parseFloat(tab.getAttribute('data-angle')) || 0;
    var diff = ((target - (handAngle % 360)) % 360 + 540) % 360 - 180;
    handAngle += diff;
    if (hand) hand.style.setProperty('--angle', handAngle + 'deg');
    if (focus) tab.focus();
  }
  if (tabs.length) {
    if (dial) dial.setAttribute('data-active', '0');
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { userTouched = true; stopAuto(); selectTab(tab); });
      tab.addEventListener('keydown', function (e) {
        var n = tabs.length, j = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % n;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i - 1 + n) % n;
        else if (e.key === 'Home') j = 0;
        else if (e.key === 'End') j = n - 1;
        if (j === null) return;
        e.preventDefault();
        userTouched = true; stopAuto();
        selectTab(tabs[j], true);
      });
    });

    // avança sozinho enquanto a seção está na tela, até a pessoa interagir
    var routine = $('#rotina');
    function stopAuto() { clearInterval(autoTimer); autoTimer = null; }
    function startAuto() {
      if (autoTimer || userTouched || reduceMotion.matches) return;
      autoTimer = setInterval(function () {
        var cur = tabs.findIndex(function (t) { return t.getAttribute('aria-selected') === 'true'; });
        selectTab(tabs[(cur + 1) % tabs.length]);
      }, 5200);
    }
    if (routine && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries[0].isIntersecting ? startAuto() : stopAuto();
      }, { threshold: 0.35 }).observe(routine);
      routine.addEventListener('pointerenter', stopAuto);
      routine.addEventListener('pointerleave', function () { if (!userTouched) startAuto(); });
      routine.addEventListener('focusin', stopAuto);
    }
  }

  /* ---------- Check-in de equilíbrio ---------- */
  var quiz = $('#quiz');
  if (quiz) {
    var QUESTIONS = ['treino', 'sono', 'peixe', 'foco'];
    var TIPS = {
      treino: ['Comece com 2 treinos por semana — caminhada rápida também conta.', 'Que tal encaixar um 3º treino curto, de 30 minutos?'],
      sono: ['Sono é treino invisível: tente ganhar 30 minutos por noite.', 'Mire em 7h ou mais: tela longe 30 minutos antes de deitar.'],
      peixe: ['Peixe cerca de 2x por semana é a dica clássica. Quando não rola, o ômega 3 em cápsula ajuda a complementar — de preferência com orientação de um nutricionista.', 'Falta pouco: mais uma refeição com peixe por semana já faz diferença no prato.'],
      foco: ['Teste blocos de 50 minutos de foco com 10 de pausa.', 'Água por perto e pausas curtas ajudam a manter o ritmo.']
    };
    var EXTRA = [
      'Constância é o que faz resultado: mantenha o que já funciona.',
      'Deixe o ômega 3 junto da refeição principal pra virar ritual.',
      'Chame alguém pra fazer o check-in e equilibrar junto.'
    ];
    var bar = $('#quiz-bar');
    var submit = $('#quiz-submit');
    var result = $('#quiz-result');
    var ring = $('#result-ring');
    var CIRC = 2 * Math.PI * 52;
    var lastScore = 0;

    function answers() {
      var a = {};
      QUESTIONS.forEach(function (q) {
        var c = quiz.querySelector('input[name="' + q + '"]:checked');
        if (c) a[q] = parseInt(c.value, 10);
      });
      return a;
    }
    quiz.addEventListener('change', function () {
      var n = Object.keys(answers()).length;
      bar.style.width = (n / QUESTIONS.length * 100) + '%';
      submit.disabled = n < QUESTIONS.length;
    });
    quiz.addEventListener('submit', function (e) {
      e.preventDefault();
      var a = answers();
      if (Object.keys(a).length < QUESTIONS.length) return;
      var total = QUESTIONS.reduce(function (s, q) { return s + a[q]; }, 0);
      var score = 12 + total * 11; // 12 a 100
      lastScore = score;

      var label, text;
      if (score >= 78) { label = 'Equilíbrio raiz'; text = 'Sua rotina tá redonda. Agora o jogo é manter a constância — e cuidar do que não aparece no espelho.'; }
      else if (score >= 45) { label = 'No caminho certo'; text = 'Você já tem uma boa base. Com alguns ajustes, o equilíbrio vira padrão.'; }
      else { label = 'Em construção'; text = 'Todo shape começa do zero. Escolha um hábito por vez — o importante é começar.'; }

      var tips = QUESTIONS.filter(function (q) { return a[q] < 2; })
        .sort(function (x, y) { return a[x] - a[y]; })
        .map(function (q) { return TIPS[q][a[q]]; });
      for (var i = 0; tips.length < 3 && i < EXTRA.length; i++) tips.push(EXTRA[i]);
      tips = tips.slice(0, 3);

      $('#result-label').textContent = label;
      $('#result-text').textContent = text;
      var ul = $('#result-tips');
      ul.innerHTML = '';
      tips.forEach(function (t) { var li = doc.createElement('li'); li.textContent = t; ul.appendChild(li); });
      $('#share-toast').textContent = '';

      quiz.hidden = true;
      result.hidden = false;
      ring.style.strokeDasharray = CIRC.toFixed(2);
      ring.style.strokeDashoffset = CIRC.toFixed(2);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { ring.style.strokeDashoffset = (CIRC * (1 - score / 100)).toFixed(2); });
      });
      tweenNumber($('#result-num'), 0, score, 1400);
      result.focus({ preventScroll: true });
      var top = result.getBoundingClientRect().top;
      if (top < 80 || top > window.innerHeight * 0.6) result.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'center' });
    });

    $('#quiz-reset').addEventListener('click', function () {
      quiz.reset();
      bar.style.width = '0%';
      submit.disabled = true;
      result.hidden = true;
      quiz.hidden = false;
      var first = $('input', quiz);
      if (first) first.focus();
    });

    $('#quiz-share').addEventListener('click', function () {
      var toast = $('#share-toast');
      var url = location.href.split('#')[0] + '#checkin';
      var text = 'Fiz o check-in de equilíbrio da Oficialfarma e tirei ' + lastScore + '/100. Bora ver o seu?';
      if (navigator.share) {
        navigator.share({ title: 'Check-in de equilíbrio', text: text, url: url }).catch(function () {});
      } else if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text + ' ' + url).then(function () {
          toast.textContent = 'Copiado! É só colar onde quiser.';
        }, function () { toast.textContent = text; });
      } else {
        toast.textContent = text;
      }
    });
  }

  /* ---------- Calculadora de constância ---------- */
  var calc = $('.calc');
  if (calc) {
    var qty = 1;
    var qtyOut = $('#qty');
    var minus = $('#qty-minus');
    var plus = $('#qty-plus');
    var daysEl = $('#days');
    var daysBar = $('#days-bar');
    var hint = $('#days-hint');
    var priceEl = $('#price');
    var wa = $('#whatsapp-btn');
    var lastDays = CONFIG.capsulasPorFrasco;

    function caps() {
      var c = calc.querySelector('input[name="caps"]:checked');
      return c ? parseInt(c.value, 10) : 1;
    }
    function updateCalc() {
      var c = caps();
      var days = Math.floor(qty * CONFIG.capsulasPorFrasco / c);
      tweenNumber(daysEl, lastDays, days, 500);
      lastDays = days;
      daysBar.style.width = Math.min(days / 180, 1) * 100 + '%';
      qtyOut.textContent = qty;
      minus.disabled = qty <= 1;
      plus.disabled = qty >= CONFIG.maxFrascos;
      hint.textContent = qty + (qty > 1 ? ' frascos' : ' frasco') + ' · ' + c + (c > 1 ? ' cápsulas' : ' cápsula') + ' por dia. ' +
        'Use conforme a recomendação de consumo da embalagem ou do seu nutricionista/médico.';
      if (typeof CONFIG.preco === 'number') {
        priceEl.hidden = false;
        priceEl.innerHTML = '';
        priceEl.appendChild(doc.createTextNode(money(CONFIG.preco * qty)));
        var small = doc.createElement('small');
        small.textContent = qty > 1 ? qty + ' × ' + money(CONFIG.preco) : 'por frasco';
        priceEl.appendChild(small);
      }
      if (CONFIG.whatsapp && wa) {
        wa.hidden = false;
        wa.href = whatsappUrl(qty);
      }
    }
    calc.addEventListener('change', updateCalc);
    minus.addEventListener('click', function () { if (qty > 1) { qty--; updateCalc(); } });
    plus.addEventListener('click', function () { if (qty < CONFIG.maxFrascos) { qty++; updateCalc(); } });
    updateCalc();

    // sem loja configurada, o botão principal abre o WhatsApp (se houver)
    var mainBuy = $('[data-buy-main]');
    if (!CONFIG.linkCompra && CONFIG.whatsapp && mainBuy) {
      mainBuy.target = '_blank';
      mainBuy.rel = 'noopener';
      mainBuy.addEventListener('click', function () { mainBuy.href = whatsappUrl(qty); });
    }
  }

  /* ---------- Barra de compra fixa (mobile) ---------- */
  var buybar = $('#buybar');
  if (buybar && 'IntersectionObserver' in window) {
    var hiders = ['#topo', '#produto', '.final-cta', '.site-footer'].map(function (s) { return $(s); }).filter(Boolean);
    var showing = {};
    var buyLink = $('a', buybar);
    var bio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { showing[hiders.indexOf(en.target)] = en.isIntersecting; });
      var hide = Object.keys(showing).some(function (k) { return showing[k]; });
      buybar.classList.toggle('is-visible', !hide);
      buybar.setAttribute('aria-hidden', String(hide));
      buyLink.tabIndex = hide ? -1 : 0;
    }, { threshold: 0 });
    hiders.forEach(function (el) { bio.observe(el); });
  }

  /* ---------- 3D (carregado sob demanda) ---------- */
  function webglOk() {
    try {
      var c = doc.createElement('canvas');
      var gl = c.getContext('webgl2') || c.getContext('webgl');
      if (!gl) return false;
      var lose = gl.getExtension('WEBGL_lose_context');
      if (lose) lose.loseContext();
      return true;
    } catch (e) { return false; }
  }
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = doc.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = resolve;
      s.onerror = reject;
      doc.head.appendChild(s);
    });
  }
  function init3D() {
    var el = $('#hero-3d');
    if (!el || !window.Promise || !webglOk()) return;
    var conn = navigator.connection;
    if (conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || ''))) return;
    (window.THREE ? Promise.resolve() : loadScript('vendor/three.min.js'))
      .then(function () { return window.Capsules3D ? null : loadScript('js/capsules3d.js'); })
      .then(function () {
        if (window.Capsules3D) window.Capsules3D.mount(el, { reducedMotion: reduceMotion.matches });
      })
      .catch(function () { /* fica o fallback em CSS */ });
  }
  function whenIdle(fn) {
    if ('requestIdleCallback' in window) requestIdleCallback(fn, { timeout: 2500 });
    else setTimeout(fn, 300);
  }
  if (doc.readyState === 'complete') whenIdle(init3D);
  else window.addEventListener('load', function () { whenIdle(init3D); });

  /* ---------- Ano no rodapé ---------- */
  var year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
