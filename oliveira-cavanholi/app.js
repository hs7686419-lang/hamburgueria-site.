/* Oliveira & Cavanholi — montagem do site a partir do config.js e interações.
   Todo texto vindo da configuração entra via textContent/setAttribute (nunca innerHTML). */
(function () {
  'use strict';
  var C = window.SITE_CONFIG;
  if (!C) { console.error('config.js não carregado'); return; }

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var enc = encodeURIComponent;
  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var BASE = document.body.getAttribute('data-base') || '';
  var SVGNS = 'http://www.w3.org/2000/svg';

  /* ---------- modo prévia (?previa=1): mostra itens ainda não confirmados ---------- */
  var PREVIA = /[?&]previa(=1|=true)?(&|$)/.test(location.search);
  try {
    if (PREVIA) sessionStorage.setItem('oc-previa', '1');
    else if (sessionStorage.getItem('oc-previa') === '1') PREVIA = true;
  } catch (e) {}

  var temWhats = !!(C.whatsapp && /^\d{10,15}$/.test(C.whatsapp.numero) && (C.whatsapp.confirmado || PREVIA));
  var end = C.endereco || {};
  var soDigital = !!end.atendimentoSomenteDigital;
  var temEndereco = !soDigital && !!end.logradouro && (end.confirmado || PREVIA);
  var enderecoLinha = [end.logradouro, end.bairro, end.cidade + ' — ' + end.uf, 'CEP ' + end.cep].join(', ');
  var enderecoBusca = [end.logradouro, end.bairro, end.cidade, end.uf, end.cep].join(', ');

  var pendencias = [];
  if (C.whatsapp && !C.whatsapp.confirmado) pendencias.push('WhatsApp (' + C.whatsapp.exibicao + ')');
  if (!end.confirmado && !soDigital) pendencias.push('Endereço de atendimento');
  if (!C.institucional.cnpj) pendencias.push('CNPJ (opcional)');
  if (pendencias.length) console.info('[Oliveira & Cavanholi] Itens aguardando confirmação (ocultos no site publicado; veja com ?previa=1):\n- ' + pendencias.join('\n- '));

  /* ---------- links oficiais ---------- */
  var L = {
    whatsapp: temWhats ? 'https://wa.me/' + C.whatsapp.numero + '?text=' + enc(C.whatsapp.mensagem) : '',
    email: 'mailto:' + C.email.endereco + '?subject=' + enc(C.email.assunto),
    instagram: C.instagram.url,
    maps: temEndereco ? 'https://www.google.com/maps/search/?api=1&query=' + enc(enderecoBusca) : '',
    site: C.marca.site
  };
  L.local = temEndereco ? L.maps : L.email;
  var waTexto = function (t) { return 'https://wa.me/' + C.whatsapp.numero + '?text=' + enc(t); };

  var T = {
    'marca.nome': C.marca.nome,
    'marca.descritor': C.marca.descritor,
    'whatsapp.exibicao': C.whatsapp.exibicao,
    'email.endereco': C.email.endereco,
    'instagram.handle': '@' + C.instagram.usuario,
    'local.texto': soDigital ? 'Atendimento on-line.' : temEndereco ? 'Veja como chegar.' : 'Endereço de atendimento em confirmação.',
    'local.valor': temEndereco ? end.logradouro + ' · ' + end.cidade + '/' + end.uf : soDigital ? 'Fale com a gente pelos canais digitais' : 'Consulte-nos pelos canais digitais',
    'local.acao': temEndereco ? 'Abrir no mapa' : 'Consultar por e-mail'
  };

  /* ---------- utilitários de DOM ---------- */
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === 'text') n.textContent = attrs[k];
      else if (k === 'class') n.className = attrs[k];
      else if (attrs[k] != null && attrs[k] !== false) n.setAttribute(k, attrs[k]);
    }
    (kids || []).forEach(function (c) { if (c) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  function svg(tag, attrs, kids) {
    var n = document.createElementNS(SVGNS, tag);
    for (var k in attrs || {}) n.setAttribute(k, attrs[k]);
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  function icon(name, fill) {
    return svg('svg', { class: 'icon' + (fill ? ' fill' : ''), 'aria-hidden': 'true' }, [svg('use', { href: '#i-' + name })]);
  }
  function setLink(a, key) {
    var href = L[key];
    if (!href) { a.hidden = true; return; }
    a.setAttribute('href', href);
    var externo = /^https?:/.test(href);
    if (externo) { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener'); }
    else { a.removeAttribute('target'); a.removeAttribute('rel'); }
  }

  /* ---------- 1. textos e links declarativos ---------- */
  $$('[data-text]').forEach(function (n) { var v = T[n.getAttribute('data-text')]; if (v != null) n.textContent = v; });
  $$('[data-href]').forEach(function (a) { setLink(a, a.getAttribute('data-href')); });
  $$('[data-pending]').forEach(function (b) {
    var k = b.getAttribute('data-pending');
    var pend = PREVIA && (k === 'whatsapp' ? !C.whatsapp.confirmado : (!end.confirmado && temEndereco));
    b.hidden = !pend;
  });

  /* ---------- 2. logotipo ---------- */
  function logoNode() {
    if (C.marca.logo) return el('img', { src: C.marca.logo, alt: '' });
    return svg('svg', { viewBox: '0 0 48 48', 'aria-hidden': 'true' }, [
      svg('defs', {}, [svg('linearGradient', { id: 'lg-gold', x1: '0', y1: '0', x2: '1', y2: '1' }, [
        svg('stop', { offset: '0', 'stop-color': '#E7CD94' }), svg('stop', { offset: '1', 'stop-color': '#9C7A36' })])]),
      svg('rect', { x: '1', y: '1', width: '46', height: '46', rx: '12', fill: '#0D1D36', stroke: 'url(#lg-gold)', 'stroke-width': '1.5' }),
      (function () { var t = svg('text', { x: '24', y: '31', 'text-anchor': 'middle', 'font-family': 'Cormorant Garamond, Georgia, serif', 'font-size': '19', 'font-weight': '700', fill: 'url(#lg-gold)' }); t.textContent = 'O&C'; return t; })()
    ]);
  }
  $$('[data-slot="logo"]').forEach(function (s) { s.appendChild(logoNode()); });

  /* ---------- 3. serviços: vitrine interativa ---------- */
  var tabs = $('[data-slot="svc-tabs"]'), panel = $('[data-slot="svc-panel"]');
  function irParaContato(servicoId) {
    var sel = $('#f-servico');
    if (sel && servicoId) sel.value = servicoId;
    var alvo = $('#contato');
    if (alvo) alvo.scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth' });
  }
  function mostraServico(i, foco) {
    var s = C.servicos[i];
    $$('[role="tab"]', tabs).forEach(function (b, j) {
      b.setAttribute('aria-selected', j === i ? 'true' : 'false');
      b.tabIndex = j === i ? 0 : -1;
      if (j === i && foco) b.focus();
    });
    panel.classList.remove('swap'); void panel.offsetWidth; panel.classList.add('swap');
    panel.textContent = '';
    var btn = el('button', { class: 'btn btn-gold', type: 'button' }, [icon('send'), 'Quero saber mais']);
    btn.addEventListener('click', function () { irParaContato(s.id); });
    panel.appendChild(el('div', { class: 'svc-glow', 'aria-hidden': 'true' }));
    panel.appendChild(el('span', { class: 'svc-num', 'aria-hidden': 'true', text: String(i + 1).padStart(2, '0') }));
    panel.appendChild(el('span', { class: 'ic' }, [icon(s.icone)]));
    panel.appendChild(el('h3', { text: s.titulo }));
    panel.appendChild(el('p', { text: s.resumo }));
    panel.appendChild(el('ul', { class: 'svc-items' }, s.itens.map(function (t) { return el('li', {}, [icon('check'), t]); })));
    panel.appendChild(el('div', { class: 'btn-row' }, [btn]));
    panel.setAttribute('aria-labelledby', 'tab-' + s.id);
  }
  if (tabs && panel) {
    C.servicos.forEach(function (s, i) {
      var b = el('button', { type: 'button', role: 'tab', id: 'tab-' + s.id, 'aria-controls': 'svc-panel' }, [
        el('span', { class: 'n', text: String(i + 1).padStart(2, '0') }), el('span', { class: 't', text: s.titulo }), icon('arrow')]);
      b.addEventListener('click', function () { mostraServico(i); });
      b.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
        if (d) { e.preventDefault(); mostraServico((i + d + C.servicos.length) % C.servicos.length, true); }
      });
      tabs.appendChild(b);
    });
    panel.id = 'svc-panel';
    mostraServico(0);
  }

  /* ---------- 4. ecossistema (SVG interativo) ---------- */
  (function ecossistema() {
    var root = $('[data-slot="eco"]'), info = $('[data-slot="eco-info"]');
    if (!root) return;
    root.setAttribute('viewBox', '0 0 600 600');
    var cx = 300, cy = 300, R = 200, n = C.servicos.length;
    var pts = C.servicos.map(function (s, i) {
      var a = -Math.PI / 2 + i * 2 * Math.PI / n;
      return { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a), s: s };
    });
    var gLines = svg('g', { class: 'eco-lines' }), gNodes = svg('g', {});
    root.appendChild(svg('circle', { class: 'eco-orbit', cx: cx, cy: cy, r: R }));
    root.appendChild(svg('circle', { class: 'eco-orbit faint', cx: cx, cy: cy, r: R * .55 }));
    root.appendChild(gLines); root.appendChild(gNodes);
    var lines = [];
    pts.forEach(function (p, i) {
      var q = pts[(i + 1) % n];
      var spoke = svg('path', { class: 'eco-line spoke', d: 'M' + cx + ' ' + cy + ' L' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) });
      var ring = svg('path', { class: 'eco-line ring', d: 'M' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) + ' Q' + (cx + (p.x + q.x - 2 * cx) * .75).toFixed(1) + ' ' + (cy + (p.y + q.y - 2 * cy) * .75).toFixed(1) + ' ' + q.x.toFixed(1) + ' ' + q.y.toFixed(1) });
      gLines.appendChild(spoke); gLines.appendChild(ring);
      lines.push({ el: spoke, a: -1, b: i }, { el: ring, a: i, b: (i + 1) % n });
    });
    function label(lines, x, y, cls) {
      var t = svg('text', { x: x, y: y, 'text-anchor': 'middle', class: cls });
      lines.forEach(function (ln, k) { var ts = svg('tspan', { x: x, dy: k ? '1.15em' : '0' }); ts.textContent = ln; t.appendChild(ts); });
      return t;
    }
    function quebra(t) { var w = t.split(' '); if (w.length < 2) return [t]; var h = Math.ceil(w.length / 2); return [w.slice(0, h).join(' '), w.slice(h).join(' ')]; }

    var center = svg('g', { class: 'eco-node center', tabindex: '0', role: 'button', 'aria-label': 'Sua empresa — centro do ecossistema' }, [
      svg('circle', { class: 'halo', cx: cx, cy: cy, r: 78 }),
      svg('circle', { class: 'core', cx: cx, cy: cy, r: 62 }),
      label(['Sua', 'empresa'], cx, cy - 4, 'eco-center-label')
    ]);
    gNodes.appendChild(center);
    var nodes = pts.map(function (p, i) {
      var g = svg('g', { class: 'eco-node', tabindex: '0', role: 'button', 'aria-label': p.s.titulo }, [
        svg('circle', { class: 'halo', cx: p.x, cy: p.y, r: 50 }),
        svg('circle', { class: 'core', cx: p.x, cy: p.y, r: 38 }),
        svg('use', { href: '#i-' + p.s.icone, x: p.x - 15, y: p.y - 15, width: 30, height: 30, class: 'eco-ic' }),
        label(quebra(p.s.titulo), p.x, p.y + 62, 'eco-label')
      ]);
      gNodes.appendChild(g);
      return g;
    });

    function ativa(i) {
      root.classList.toggle('has-active', i !== null);
      nodes.forEach(function (g, j) { g.classList.toggle('on', j === i); });
      center.classList.toggle('on', i === -1);
      lines.forEach(function (l) { l.el.classList.toggle('on', i !== null && (i === -1 ? l.a === -1 : (l.a === i || l.b === i))); });
      info.textContent = '';
      if (i === null || i === -1) {
        info.appendChild(el('span', { class: 'eyebrow', text: 'Visão integrada' }));
        info.appendChild(el('h3', { text: 'Sua empresa no centro' }));
        info.appendChild(el('p', { text: 'Contabilidade, finanças, pessoas e inteligência de dados conectadas, compartilhando informações para que a gestão enxergue o negócio como um todo.' }));
        return;
      }
      var s = C.servicos[i];
      var viz = [C.servicos[(i + n - 1) % n].titulo, C.servicos[(i + 1) % n].titulo];
      info.appendChild(el('span', { class: 'eyebrow', text: String(i + 1).padStart(2, '0') + ' · Serviço' }));
      info.appendChild(el('h3', { text: s.titulo }));
      info.appendChild(el('p', { text: s.resumo }));
      info.appendChild(el('p', { class: 'eco-conn' }, [icon('cycle'), 'Integra-se diretamente a ' + viz[0] + ' e ' + viz[1] + '.']));
      var b = el('button', { class: 'btn btn-outline', type: 'button' }, ['Ver detalhes', icon('arrow')]);
      b.addEventListener('click', function () { mostraServico(i); $('#servicos').scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth' }); });
      info.appendChild(el('div', { class: 'btn-row' }, [b]));
    }
    var fixo = null;
    function bind(g, i) {
      g.addEventListener('mouseenter', function () { ativa(i); });
      g.addEventListener('mouseleave', function () { ativa(fixo); });
      g.addEventListener('focus', function () { ativa(i); });
      g.addEventListener('click', function () { fixo = i; ativa(i); });
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fixo = i; ativa(i); } });
    }
    nodes.forEach(bind); bind(center, -1);
    ativa(null);
  })();

  /* ---------- 5. dashboard demonstrativo (dados fictícios) ---------- */
  (function dashboard() {
    var box = $('[data-slot="dash"]');
    if (!box) return;
    var meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    // Série fictícia fixa — apenas ilustrativa.
    var receita = [182, 176, 195, 201, 214, 208, 226, 239, 233, 248, 262, 279].map(function (v) { return v * 1000; });
    var despesas = [164, 171, 168, 179, 183, 190, 188, 197, 205, 201, 210, 216].map(function (v) { return v * 1000; });
    var composicao = [['Pessoal', 38], ['Operação', 24], ['Tributos', 18], ['Administrativo', 12], ['Outros', 8]];
    var cores = ['#E7CD94', '#C9A45C', '#8FA6CC', '#4F6A99', '#2A3E62'];
    var brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
    var pct = function (v) { return (v > 0 ? '+' : '') + v.toFixed(1).replace('.', ',') + '%'; };
    var periodo = 6, visto = false;

    var line = $('[data-chart="line"]', box), bars = $('[data-chart="bars"]', box), donut = $('[data-chart="donut"]', box);
    var tip = el('div', { class: 'chart-tip', hidden: true });
    line.parentNode.appendChild(tip);

    function animaNum(node, alvo, fmt) {
      if (REDUCE) { node.textContent = fmt(alvo); return; }
      var t0 = performance.now(), dur = 1100;
      (function f(t) { var k = Math.min(1, (t - t0) / dur); k = 1 - Math.pow(1 - k, 3); node.textContent = fmt(alvo * k); if (k < 1) requestAnimationFrame(f); })(t0);
    }
    function soma(a) { return a.reduce(function (x, y) { return x + y; }, 0); }

    function render() {
      var r = receita.slice(-periodo), d = despesas.slice(-periodo), m = meses.slice(-periodo);
      var res = r.map(function (v, i) { return v - d[i]; });
      var R = soma(r), D = soma(d), RES = R - D, MG = RES / R * 100;
      animaNum($('[data-kpi="receita"]', box), R, brl.format);
      animaNum($('[data-kpi="despesas"]', box), D, brl.format);
      animaNum($('[data-kpi="resultado"]', box), RES, brl.format);
      animaNum($('[data-kpi="margem"]', box), MG, function (v) { return v.toFixed(1).replace('.', ',') + '%'; });
      var var1 = (r[r.length - 1] / r[0] - 1) * 100, var2 = (d[d.length - 1] / d[0] - 1) * 100, var3 = (res[res.length - 1] / Math.max(1, res[0]) - 1) * 100;
      [['receita', var1, true], ['despesas', var2, false], ['resultado', var3, true]].forEach(function (k) {
        var e = $('[data-kpi-d="' + k[0] + '"]', box);
        e.textContent = pct(k[1]) + ' no período';
        e.className = (k[1] >= 0) === k[2] ? 'up' : 'down';
      });
      var mg = $('[data-kpi-d="margem"]', box); mg.textContent = 'resultado ÷ receita'; mg.className = '';

      // linhas
      var W = 520, H = 220, P = 14, max = Math.max.apply(null, r.concat(d)) * 1.08, min = Math.min.apply(null, r.concat(d)) * .9;
      var X = function (i) { return P + i * (W - 2 * P) / (r.length - 1); };
      var Y = function (v) { return H - P - (v - min) / (max - min) * (H - 2 * P); };
      function path(a) { return a.map(function (v, i) { return (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1); }).join(' '); }
      line.textContent = '';
      line.appendChild(svg('defs', {}, [svg('linearGradient', { id: 'ga', x1: 0, y1: 0, x2: 0, y2: 1 }, [svg('stop', { offset: 0, 'stop-color': '#C9A45C', 'stop-opacity': '.35' }), svg('stop', { offset: 1, 'stop-color': '#C9A45C', 'stop-opacity': '0' })])]));
      for (var g = 1; g < 4; g++) line.appendChild(svg('line', { class: 'grid', x1: 0, x2: W, y1: g * H / 4, y2: g * H / 4 }));
      line.appendChild(svg('path', { class: 'area', d: path(r) + ' L' + X(r.length - 1) + ' ' + H + ' L' + X(0) + ' ' + H + ' Z' }));
      var pa = svg('path', { class: 'ln a', d: path(r) }), pb = svg('path', { class: 'ln b', d: path(d) });
      line.appendChild(pb); line.appendChild(pa);
      var guide = svg('line', { class: 'guide', y1: 0, y2: H, x1: -100, x2: -100 });
      var dotA = svg('circle', { class: 'dot a', r: 5, cx: -100, cy: -100 }), dotB = svg('circle', { class: 'dot b', r: 5, cx: -100, cy: -100 });
      line.appendChild(guide); line.appendChild(dotA); line.appendChild(dotB);
      [pa, pb].forEach(function (p) {
        var len = p.getTotalLength ? p.getTotalLength() : 1000;
        p.style.strokeDasharray = len; p.style.strokeDashoffset = REDUCE ? 0 : len;
        requestAnimationFrame(function () { requestAnimationFrame(function () { p.style.strokeDashoffset = 0; }); });
      });
      line.onpointermove = function (e) {
        var b = line.getBoundingClientRect(), x = (e.clientX - b.left) / b.width * W;
        var i = Math.max(0, Math.min(r.length - 1, Math.round((x - P) / ((W - 2 * P) / (r.length - 1)))));
        guide.setAttribute('x1', X(i)); guide.setAttribute('x2', X(i));
        dotA.setAttribute('cx', X(i)); dotA.setAttribute('cy', Y(r[i]));
        dotB.setAttribute('cx', X(i)); dotB.setAttribute('cy', Y(d[i]));
        tip.hidden = false;
        tip.textContent = m[i] + ' · Receita ' + brl.format(r[i]) + ' · Despesas ' + brl.format(d[i]);
        var left = (X(i) / W) * b.width;
        tip.style.left = Math.max(8, Math.min(b.width - tip.offsetWidth - 8, left - tip.offsetWidth / 2)) + 'px';
      };
      line.onpointerleave = function () { tip.hidden = true; guide.setAttribute('x1', -100); guide.setAttribute('x2', -100); dotA.setAttribute('cx', -100); dotB.setAttribute('cx', -100); };
      var xs = $('[data-chart-x]', box), xs2 = $('[data-chart-x2]', box);
      [xs, xs2].forEach(function (c) { c.textContent = ''; m.forEach(function (t) { c.appendChild(el('span', { text: t })); }); });

      // barras (fluxo de caixa = receita - despesas)
      bars.textContent = '';
      var bmax = Math.max.apply(null, res.map(Math.abs)) * 1.15, bw = (W - 2 * P) / res.length;
      var zero = H / 2 + 40;
      bars.appendChild(svg('line', { class: 'grid', x1: 0, x2: W, y1: zero, y2: zero }));
      res.forEach(function (v, i) {
        var h = Math.abs(v) / bmax * (zero - P);
        var rect = svg('rect', { class: 'bar' + (v < 0 ? ' neg' : ''), x: (P + i * bw + bw * .2).toFixed(1), width: (bw * .6).toFixed(1), y: v >= 0 ? zero - h : zero, height: Math.max(2, h), rx: 4 });
        rect.style.animationDelay = (i * 60) + 'ms';
        var tt = svg('title'); tt.textContent = m[i] + ': ' + brl.format(v); rect.appendChild(tt);
        bars.appendChild(rect);
      });

      // rosca
      donut.textContent = '';
      var C2 = 2 * Math.PI * 46, acc = 0;
      donut.appendChild(svg('circle', { cx: 60, cy: 60, r: 46, class: 'donut-bg' }));
      composicao.forEach(function (c, i) {
        var len = c[1] / 100 * C2;
        var s = svg('circle', { cx: 60, cy: 60, r: 46, class: 'donut-seg', stroke: cores[i], 'stroke-dasharray': (REDUCE ? len : 0) + ' ' + C2, 'stroke-dashoffset': -acc, transform: 'rotate(-90 60 60)' });
        donut.appendChild(s);
        (function (s, len, i) { setTimeout(function () { s.setAttribute('stroke-dasharray', len + ' ' + C2); }, 150 + i * 120); })(s, len - 1.5, i);
        acc += len;
      });
      var tc = svg('text', { x: 60, y: 57, 'text-anchor': 'middle', class: 'donut-c' }); tc.textContent = brl.format(D / periodo).replace(/\s/g, ' ');
      var tl = svg('text', { x: 60, y: 73, 'text-anchor': 'middle', class: 'donut-l' }); tl.textContent = 'média/mês';
      donut.appendChild(tc); donut.appendChild(tl);
      var lg = $('[data-slot="donut-legend"]', box); lg.textContent = '';
      composicao.forEach(function (c, i) { var sw = el('i'); sw.style.background = cores[i]; lg.appendChild(el('li', {}, [sw, c[0], el('b', { text: c[1] + '%' })])); });
    }

    $$('[data-period]', box).forEach(function (b) {
      b.addEventListener('click', function () {
        periodo = +b.getAttribute('data-period');
        $$('[data-period]', box).forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
        render();
      });
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es, o) { es.forEach(function (e) { if (e.isIntersecting && !visto) { visto = true; box.classList.add('live'); render(); o.disconnect(); } }); }, { threshold: .25 }).observe(box);
    } else { box.classList.add('live'); render(); }
  })();

  /* ---------- 6. equipe ---------- */
  (function equipe() {
    var slot = $('[data-slot="equipe"]');
    if (!slot) return;
    if (C.equipe && C.equipe.length) {
      slot.appendChild(el('div', { class: 'team' }, C.equipe.map(function (p) {
        var ini = p.nome.split(' ').filter(Boolean).map(function (w) { return w[0]; }).slice(0, 2).join('');
        var foto = p.foto ? el('img', { src: p.foto, alt: 'Foto de ' + p.nome, loading: 'lazy', width: 320, height: 380 }) : el('span', { class: 'initials', 'aria-hidden': 'true', text: ini });
        return el('figure', { class: 'member tilt reveal' }, [el('div', { class: 'photo' }, [foto]), el('figcaption', {}, [el('b', { text: p.nome }), el('span', { text: p.cargo }), p.registro ? el('small', { text: p.registro }) : null])]);
      })));
      return;
    }
    // Sem nomes confirmados: apresenta a forma de atendimento, sem inventar pessoas.
    var cta = el('a', { class: 'btn btn-gold', href: '#contato' }, [icon('send'), 'Agende uma conversa']);
    slot.appendChild(el('div', { class: 'team-empty reveal' }, [
      el('div', {}, [
        el('h3', { text: 'Atendimento próximo, do diagnóstico ao acompanhamento' }),
        el('p', { text: 'Quer conhecer quem vai acompanhar a sua empresa? Converse com a gente e conheça a equipe da ' + C.marca.nome + ' de perto.' }),
        el('div', { class: 'btn-row' }, [cta])
      ]),
      el('ol', { class: 'team-steps' }, [
        ['Diagnóstico', 'Entendemos a realidade e os objetivos da empresa.'],
        ['Organização', 'Estruturamos rotinas e informações.'],
        ['Acompanhamento', 'Indicadores e orientação contínua para decidir.']
      ].map(function (s, i) { return el('li', {}, [el('span', { class: 'n', text: '0' + (i + 1) }), el('b', { text: s[0] }), el('span', { text: s[1] })]); }))
    ]));
    if (PREVIA) slot.appendChild(el('p', { class: 'previa-note', text: 'Prévia: cadastre os integrantes confirmados em config.js → equipe para exibir nomes e fotos.' }));
  })();

  /* ---------- 7. galeria do Instagram (somente imagens autorizadas) ---------- */
  (function galeria() {
    var g = $('[data-slot="galeria"]');
    if (!g) return;
    var itens = C.instagram.galeria || [];
    if (itens.length) {
      itens.forEach(function (p) {
        g.appendChild(el('a', { class: 'insta-tile', href: p.link || L.instagram, target: '_blank', rel: 'noopener', 'aria-label': (p.texto || 'Publicação') + ' — abrir no Instagram' }, [
          el('img', { src: p.imagem, alt: p.texto || '', loading: 'lazy' }), el('span', { class: 'over' }, [icon('ig')])]));
      });
      return;
    }
    ['Publicações', 'Conteúdos', 'Novidades'].forEach(function (t) {
      g.appendChild(el('a', { class: 'insta-tile empty', href: L.instagram, target: '_blank', rel: 'noopener', 'aria-label': t + ' no Instagram (abre em nova aba)' }, [icon('ig'), el('span', { text: t })]));
    });
  })();

  /* ---------- 8. localização ---------- */
  (function localizacao() {
    var slot = $('[data-slot="localizacao"]');
    if (!slot) return;
    var head = function (titulo, gold, texto) {
      return el('div', { class: 'section-head reveal' }, [el('span', { class: 'eyebrow', text: 'Localização' }),
        el('h2', {}, [titulo + ' ', el('span', { class: 'gold-text', text: gold })]), texto ? el('p', { text: texto }) : null]);
    };
    var canais = function () {
      var r = el('div', { class: 'btn-row' });
      if (L.whatsapp) r.appendChild(el('a', { class: 'btn btn-wa', href: L.whatsapp, target: '_blank', rel: 'noopener' }, [icon('wa', true), 'WhatsApp']));
      r.appendChild(el('a', { class: 'btn btn-gold', href: L.email }, [icon('mail'), 'E-mail']));
      r.appendChild(el('a', { class: 'btn btn-outline', href: L.instagram, target: '_blank', rel: 'noopener' }, [icon('ig'), 'Instagram']));
      return r;
    };
    if (!temEndereco) {
      slot.appendChild(head(soDigital ? 'Atendimento' : 'Fale com a', soDigital ? 'on-line' : 'gente',
        soDigital ? 'O atendimento é realizado de forma digital, pelos canais abaixo.' : 'O endereço de atendimento será publicado após confirmação. Enquanto isso, fale com a gente pelos canais digitais.'));
      var c = canais(); c.classList.add('reveal'); slot.appendChild(c);
      return;
    }
    slot.appendChild(head('Onde', 'estamos'));
    var loadBtn = el('button', { class: 'btn btn-outline', type: 'button' }, ['Carregar mapa aqui']);
    var box = el('div', { class: 'map-box reveal' }, [el('div', {}, [
      (function () { var s = icon('pin'); s.classList.add('pin'); return s; })(),
      el('p', { text: 'O mapa é carregado do Google Maps somente quando você pedir, para preservar sua privacidade.' }),
      el('div', { class: 'btn-row', style: 'justify-content:center' }, [loadBtn,
        el('a', { class: 'btn btn-gold', href: L.maps, target: '_blank', rel: 'noopener' }, [icon('external'), 'Abrir no Google Maps'])])
    ])]);
    loadBtn.addEventListener('click', function () {
      box.textContent = '';
      box.appendChild(el('iframe', { title: 'Mapa: ' + enderecoLinha, src: 'https://www.google.com/maps?q=' + enc(enderecoBusca) + '&output=embed', loading: 'lazy', referrerpolicy: 'no-referrer-when-downgrade', allowfullscreen: '' }));
    });
    var badge = (!end.confirmado && PREVIA) ? el('span', { class: 'badge', text: 'Prévia — endereço cadastral a confirmar com a empresa' }) : null;
    slot.appendChild(el('div', { class: 'map-wrap' }, [box, el('div', { class: 'addr reveal' }, [
      el('span', { class: 'eyebrow', text: 'Endereço' }), el('address', { text: enderecoLinha }), badge,
      el('a', { class: 'btn btn-outline', href: L.maps, target: '_blank', rel: 'noopener' }, [icon('pin'), 'Ver no Google Maps'])])]));
  })();

  /* ---------- 9. formulário ---------- */
  (function formulario() {
    var f = $('#contactForm');
    if (!f) return;
    var sel = $('#f-servico');
    C.servicos.forEach(function (s) { sel.appendChild(el('option', { value: s.id, text: s.titulo })); });
    sel.appendChild(el('option', { value: 'outro', text: 'Outro assunto' }));
    var ep = (C.formulario && C.formulario.endpoint) || '';
    var acts = $('[data-slot="form-actions"]'), hint = $('[data-slot="form-hint"]'), status = $('.form-status', f);
    $('[data-slot="form-modo"]').textContent = ep
      ? 'Sua mensagem é enviada diretamente à equipe.'
      : 'Sua mensagem é aberta no ' + (temWhats ? 'WhatsApp ou no ' : '') + 'seu aplicativo de e-mail para você conferir antes de enviar. Nada fica armazenado neste site.';
    if (ep) acts.appendChild(el('button', { class: 'btn btn-gold', type: 'submit', 'data-via': 'api' }, [icon('send'), 'Enviar mensagem']));
    if (temWhats) acts.appendChild(el('button', { class: 'btn ' + (ep ? 'btn-outline' : 'btn-wa'), type: 'submit', 'data-via': 'whatsapp' }, [icon('wa', true), 'Enviar pelo WhatsApp']));
    acts.appendChild(el('button', { class: 'btn ' + (ep || temWhats ? 'btn-outline' : 'btn-gold'), type: 'submit', 'data-via': 'email' }, [icon('mail'), 'Enviar por e-mail']));
    hint.textContent = ep ? '' : 'Campos sem “(opcional)” são obrigatórios.';

    var regras = {
      nome: function (v) { return v.trim().length >= 2 ? '' : 'Informe seu nome.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Informe um e-mail válido (ex.: nome@empresa.com.br).'; },
      telefone: function (v) { var d = v.replace(/\D/g, ''); return !d || (d.length >= 10 && d.length <= 13) ? '' : 'Informe o telefone com DDD, ou deixe em branco.'; },
      servico: function (v) { return v ? '' : 'Selecione o serviço de interesse.'; },
      mensagem: function (v) { return v.trim().length >= 10 ? '' : 'Escreva uma mensagem com pelo menos 10 caracteres.'; },
      consentimento: function (v, n) { return n.checked ? '' : 'É preciso concordar com o uso dos dados para enviarmos a resposta.'; }
    };
    function valida(n) {
      var r = regras[n.name]; if (!r) return true;
      var msg = r(n.value, n), field = n.closest('.field');
      field.classList.toggle('invalid', !!msg);
      $('.err', field).textContent = msg;
      n.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    }
    $$('input,select,textarea', f).forEach(function (n) {
      n.addEventListener('blur', function () { if (n.value || n.type === 'checkbox') valida(n); });
      n.addEventListener('input', function () { if (n.closest('.field').classList.contains('invalid')) valida(n); });
      n.addEventListener('change', function () { if (n.closest('.field').classList.contains('invalid')) valida(n); });
    });
    function msgStatus(tipo, texto) { status.className = 'form-status ' + tipo; status.textContent = texto; }
    function dados() {
      var d = {}; new FormData(f).forEach(function (v, k) { d[k] = String(v).trim(); });
      var s = C.servicos.filter(function (x) { return x.id === d.servico; })[0];
      d.servicoNome = s ? s.titulo : 'Outro assunto';
      return d;
    }
    function texto(d) {
      var dadosLinhas = ['Nome: ' + d.nome, d.empresa && 'Empresa: ' + d.empresa, 'E-mail: ' + d.email,
        d.telefone && 'Telefone/WhatsApp: ' + d.telefone, 'Serviço de interesse: ' + d.servicoNome].filter(Boolean);
      return ['Olá! Vim pelo site da ' + C.marca.nome + '.', dadosLinhas.join('\n'), d.mensagem].join('\n\n');
    }
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var via = (e.submitter && e.submitter.getAttribute('data-via')) || (ep ? 'api' : temWhats ? 'whatsapp' : 'email');
      var campos = $$('input,select,textarea', f), ok = true, primeiro = null;
      campos.forEach(function (n) { if (!valida(n)) { ok = false; primeiro = primeiro || n; } });
      if (!ok) { msgStatus('error', 'Revise os campos destacados.'); primeiro.focus(); return; }
      var d = dados();
      if (via === 'whatsapp') {
        window.open(waTexto(texto(d)), '_blank', 'noopener');
        msgStatus('ok', 'Abrimos o WhatsApp com a sua mensagem pronta. Para concluir, toque em enviar no aplicativo.');
      } else if (via === 'email') {
        location.href = 'mailto:' + C.email.endereco + '?subject=' + enc(C.email.assunto) + '&body=' + enc(texto(d));
        msgStatus('ok', 'Abrimos o seu aplicativo de e-mail com a mensagem pronta. Para concluir, clique em enviar. Se nada abrir, escreva para ' + C.email.endereco + '.');
      } else {
        var btn = e.submitter; if (btn) btn.disabled = true;
        msgStatus('', ''); status.className = 'form-status ok'; status.textContent = 'Enviando…';
        fetch(ep, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ nome: d.nome, empresa: d.empresa, email: d.email, telefone: d.telefone, servico: d.servicoNome, mensagem: d.mensagem, origem: location.href }) })
          .then(function (r) { if (!r.ok) throw new Error(r.status); f.reset(); msgStatus('ok', 'Mensagem enviada com sucesso! Retornaremos pelo contato informado.'); })
          .catch(function () { msgStatus('error', 'Não foi possível enviar agora. Tente novamente ou use o botão de e-mail' + (temWhats ? ' ou WhatsApp' : '') + '.'); })
          .then(function () { if (btn) btn.disabled = false; });
      }
    });
  })();

  /* ---------- 10. rodapé ---------- */
  (function rodape() {
    var ft = $('[data-slot="footer"]');
    if (!ft) return;
    var secoes = [['Início', 'inicio'], ['Sobre', 'sobre'], ['Serviços', 'servicos'], ['Ecossistema', 'ecossistema'], ['Dashboard', 'dashboard'], ['Equipe', 'equipe'], ['Conteúdos', 'conteudos'], ['Dúvidas', 'faq'], ['Contato', 'contato'], ['Localização', 'localizacao']];
    var li = function (n) { return el('li', {}, [n]); };
    var ext = function (href, kids) { return el('a', { href: href, target: '_blank', rel: 'noopener' }, kids); };
    var contato = [];
    if (L.whatsapp) contato.push(ext(L.whatsapp, [icon('wa', true), C.whatsapp.exibicao]));
    contato.push(el('a', { href: L.email }, [icon('mail'), C.email.endereco]));
    contato.push(ext(L.instagram, [icon('ig'), '@' + C.instagram.usuario]));
    if (temEndereco) contato.push(ext(L.maps, [icon('pin'), enderecoLinha]));
    contato.push(ext(L.site, [icon('globe'), C.marca.site.replace(/^https?:\/\//, '')]));

    var legal = [];
    if (C.institucional.cnpj) legal.push(el('span', { text: 'CNPJ ' + C.institucional.cnpj }));
    (C.institucional.registros || []).forEach(function (r) { legal.push(el('span', { text: r })); });

    var marca = el('a', { class: 'brand', href: BASE + '#inicio' }, [el('span', { class: 'brand-mark' }, [logoNode()]),
      el('span', { class: 'brand-name' }, [el('b', { text: C.marca.nome }), el('small', { text: C.marca.descritor })])]);
    ft.appendChild(el('div', { class: 'container' }, [
      el('div', { class: 'footer-grid' }, [
        el('div', { class: 'about-f' }, [marca,
          el('p', { text: 'Contabilidade consultiva e gestão empresarial para uma gestão mais organizada e orientada por informações.' }),
          el('a', { class: 'btn btn-outline', href: L.instagram, target: '_blank', rel: 'noopener' }, [icon('ig'), 'Acompanhe nosso Instagram'])]),
        el('nav', { 'aria-label': 'Seções do site' }, [el('h4', { text: 'Navegação' }), el('ul', {}, secoes.map(function (s) { return li(el('a', { href: BASE + '#' + s[1], text: s[0] })); }))]),
        el('div', {}, [el('h4', { text: 'Serviços' }), el('ul', {}, C.servicos.map(function (s) { return li(el('a', { href: BASE + '#servicos', text: s.titulo })); }))]),
        el('div', {}, [el('h4', { text: 'Contato' }), el('ul', { class: 'contact-list' }, contato.map(li))])
      ]),
      el('div', { class: 'footer-bottom' }, [
        el('span', { text: '© ' + new Date().getFullYear() + ' ' + C.marca.nome + ' — ' + C.marca.descritor + '. Todos os direitos reservados.' }),
        el('div', { class: 'legal' }, legal.concat([el('a', { href: 'politica-de-privacidade.html', text: 'Política de privacidade' })]))
      ])
    ]));
  })();

  /* ---------- 11. botão flutuante do WhatsApp ---------- */
  if (L.whatsapp) {
    document.body.appendChild(el('a', { class: 'wa-float', href: L.whatsapp, target: '_blank', rel: 'noopener', 'aria-label': 'Conversar pelo WhatsApp (abre em nova aba)' }, [icon('wa', true), el('span', { class: 'lbl', text: 'Fale pelo WhatsApp' })]));
  }
  if (PREVIA) document.body.appendChild(el('div', { class: 'previa-bar', role: 'note', text: 'Modo prévia — itens a confirmar estão visíveis. ' + (pendencias.length ? 'Pendências: ' + pendencias.join(', ') + '.' : '') }));

  /* ---------- 12. efeitos de rolagem e microinterações ---------- */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !REDUCE) {
    var ro = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); } }); }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (n) { ro.observe(n); });
  } else reveals.forEach(function (n) { n.classList.add('in'); });

  // link ativo no menu
  var navLinks = $$('.nav a, .nav-sm a');
  if ('IntersectionObserver' in window) {
    var no = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(function (s) { no.observe(s); });
  }

  // barra de progresso de leitura
  var bar = $('.scroll-progress span'), ticking = false;
  function onScroll() {
    ticking = false;
    var h = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.transform = 'scaleX(' + (h > 0 ? scrollY / h : 0) + ')';
    document.documentElement.classList.toggle('scrolled', scrollY > 30);
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  // inclinação 3D dos cartões e efeito magnético (somente mouse)
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !REDUCE) {
    document.addEventListener('pointermove', function (e) {
      var t = e.target.closest && e.target.closest('.tilt');
      if (t) {
        var b = t.getBoundingClientRect();
        t.style.setProperty('--ty', ((e.clientX - b.left) / b.width - .5) * 8 + 'deg');
        t.style.setProperty('--tx', -((e.clientY - b.top) / b.height - .5) * 8 + 'deg');
        t.style.setProperty('--mx', (e.clientX - b.left) + 'px'); t.style.setProperty('--my', (e.clientY - b.top) + 'px');
      }
      var m = e.target.closest && e.target.closest('.magnetic');
      if (m) { var r = m.getBoundingClientRect(); m.style.translate = ((e.clientX - r.left - r.width / 2) * .18) + 'px ' + ((e.clientY - r.top - r.height / 2) * .25) + 'px'; }
    }, { passive: true });
    document.addEventListener('pointerout', function (e) {
      var t = e.target.closest && e.target.closest('.tilt');
      if (t && !t.contains(e.relatedTarget)) { t.style.setProperty('--tx', '0deg'); t.style.setProperty('--ty', '0deg'); }
      var m = e.target.closest && e.target.closest('.magnetic');
      if (m && !m.contains(e.relatedTarget)) m.style.translate = '';
    });
  }

  // alternativa CSS 3D: inclinação da pilha do hero quando não há WebGL
  var stack = $('[data-stack]');
  if (stack && !REDUCE) addEventListener('pointermove', function (e) {
    if (document.documentElement.classList.contains('has-gl')) return;
    stack.style.setProperty('--rx', ((e.clientX / innerWidth) - .5) * 16 + 'deg');
    stack.style.setProperty('--ry', -((e.clientY / innerHeight) - .5) * 10 + 'deg');
  }, { passive: true });

  /* ---------- 13. experiência 3D (Three.js sob demanda) ---------- */
  (function carrega3D() {
    var canvas = $('#gl');
    if (!canvas) return;
    var conn = navigator.connection || {};
    var fraco = conn.saveData || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) || (navigator.deviceMemory && navigator.deviceMemory <= 2);
    var gl = null;
    try { gl = canvas.getContext('webgl2') || canvas.getContext('webgl'); } catch (e) {}
    if (!gl || fraco || /[?&]sem3d/.test(location.search)) { document.documentElement.classList.add('no-gl'); return; }
    // libera o contexto de teste; o Three.js cria o seu
    var lose = gl.getExtension('WEBGL_lose_context'); if (lose) lose.loseContext();
    var c2 = canvas.cloneNode(false); canvas.parentNode.replaceChild(c2, canvas);
    function script(src) { return new Promise(function (ok, err) { var s = document.createElement('script'); s.src = src; s.async = true; s.onload = ok; s.onerror = err; document.head.appendChild(s); }); }
    var go = function () {
      script('vendor/three.min.js').then(function () { return script('scene3d.js'); }).then(function () {
        if (window.OC3D && window.OC3D.start(c2, { reduce: REDUCE })) {
          document.documentElement.classList.add('has-gl');
          var h = $('[data-slot="gl-hint"]'); if (h) h.hidden = false;
        } else document.documentElement.classList.add('no-gl');
      }).catch(function () { document.documentElement.classList.add('no-gl'); });
    };
    if (document.readyState === 'complete') go(); else addEventListener('load', go);
  })();
})();
