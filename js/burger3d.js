/* ==========================================================================
   Brasa & Massa — Hambúrguer 3D desmontável
   Three.js r149 (vendor/three.min.js). Todos os modelos são procedurais:
   geometria + texturas geradas em código, sem arquivos de imagem/modelo.

   Este arquivo só cuida da cena e da interação. As receitas (ingredientes)
   ficam em index.html (RECEITAS_3D) e o preço/nome/descrição vêm do
   CARDAPIO — nada é duplicado aqui.
   ========================================================================== */
(function () {
  'use strict';
  var THREE = window.THREE;
  if (!THREE) return;
  if (THREE.ColorManagement) THREE.ColorManagement.legacyMode = false;

  var V2 = THREE.Vector2, V3 = THREE.Vector3;
  var TAU = Math.PI * 2;
  var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var IS_MOBILE = window.matchMedia && matchMedia('(max-width: 760px), (pointer: coarse)').matches;

  /* ---------------------------------------------------------------- utils */
  function clamp(x, a, b) { return Math.min(b, Math.max(a, x)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function mod(a, n) { return ((a % n) + n) % n; }
  function smoother(t) { t = clamp(t, 0, 1); return t * t * t * (t * (t * 6 - 15) + 10); }
  function smooth(a, b, x) { return smoother((x - a) / (b - a)); }
  function mix3(a, b, t, o) { o[0] = lerp(a[0], b[0], t); o[1] = lerp(a[1], b[1], t); o[2] = lerp(a[2], b[2], t); }
  function hex(h) { return [(h >> 16) & 255, (h >> 8) & 255, h & 255]; }
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* Ruído de valor periódico (as texturas ladrilham sem emenda). */
  var perm = (function () {
    var r = rng(1337), p = [], i, j, t;
    for (i = 0; i < 256; i++) p[i] = i;
    for (i = 255; i > 0; i--) { j = Math.floor(r() * (i + 1)); t = p[i]; p[i] = p[j]; p[j] = t; }
    return p;
  })();
  function lat(x, y) { return perm[(perm[x & 255] + y) & 255] / 255; }
  function n2p(x, y, P) {
    var xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    var u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    var x0 = mod(xi, P), x1 = mod(xi + 1, P), y0 = mod(yi, P), y1 = mod(yi + 1, P);
    return lerp(lerp(lat(x0, y0), lat(x1, y0), u), lerp(lat(x0, y1), lat(x1, y1), u), v);
  }
  function fbm(x, y, oct, P) {
    var s = 0, a = 0.5, f = 1, n = 0;
    for (var i = 0; i < oct; i++) { s += a * n2p(x * f, y * f, P * f); n += a; f *= 2; a *= 0.5; }
    return s / n;
  }
  /* Irregularidade periódica em função do ângulo (bordas "orgânicas"). */
  function ragged(seed, kMin, kMax) {
    var r = rng(seed), ks = [], ph = [], am = [], tot = 0, k;
    for (k = kMin; k <= kMax; k++) { ks.push(k); ph.push(r() * TAU); var a = 1 / Math.sqrt(k); am.push(a); tot += a; }
    return function (ang) {
      var s = 0;
      for (var i = 0; i < ks.length; i++) s += am[i] * Math.sin(ks[i] * ang + ph[i]);
      return s / tot * 1.6;
    };
  }

  /* ------------------------------------------------------------ texturas */
  var TEX = {};
  function pixelTex(size, fn, srgb) {
    var c = document.createElement('canvas'); c.width = c.height = size;
    var g = c.getContext('2d'), img = g.createImageData(size, size), d = img.data, o = [0, 0, 0], i = 0;
    for (var y = 0; y < size; y++) for (var x = 0; x < size; x++) {
      fn(x / size, y / size, o);
      d[i++] = clamp(o[0], 0, 255); d[i++] = clamp(o[1], 0, 255); d[i++] = clamp(o[2], 0, 255); d[i++] = 255;
    }
    g.putImageData(img, 0, 0);
    var t = new THREE.CanvasTexture(c);
    if (srgb !== false) t.encoding = THREE.sRGBEncoding;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 4;
    return t;
  }
  var TS = IS_MOBILE ? 256 : 512;
  var c1 = [0, 0, 0], c2 = [0, 0, 0];

  function texOf(name, build) { return TEX[name] || (TEX[name] = build()); }

  function texBun() {
    return texOf('bun', function () {
      var pale = hex(0xE6B56E), mid = hex(0xC98A3E), dark = hex(0x9A5522);
      return pixelTex(TS, function (u, v, o) {
        var n = fbm(u * 8, v * 3, 4, 8), m = fbm(u * 24 + 3, v * 9, 3, 24);
        var t = clamp(v * 0.9 + (n - 0.5) * 0.28, 0, 1);
        mix3(pale, mid, smooth(0.1, 0.65, t), c1); mix3(c1, dark, smooth(0.7, 1, t) * 0.4, o);
        var sp = m > 0.7 ? (m - 0.7) * 3 : 0;               // manchinhas claras (farinha)
        o[0] += sp * 40; o[1] += sp * 32; o[2] += sp * 14;
      });
    });
  }
  function texBunBump() {
    return texOf('bunb', function () {
      return pixelTex(TS, function (u, v, o) {
        var n = fbm(u * 16, v * 5, 3, 16) * 255; o[0] = o[1] = o[2] = n;
      }, false);
    });
  }
  function texCrumb() {
    return texOf('crumb', function () {
      var cream = hex(0xF1D9A2), toast = hex(0xD38C34), pore = hex(0xBE904F);
      return pixelTex(TS, function (u, v, o) {
        var d = Math.hypot(u - 0.5, v - 0.5) * 2, n = fbm(u * 9, v * 9, 4, 9);
        var t = clamp(smooth(0.15, 1, d) * 0.95 + (n - 0.5) * 0.5, 0, 1);
        mix3(cream, toast, t, o);
        var p = n2p(u * 48, v * 48, 48);
        if (p > 0.68) { var k = (p - 0.68) * 3.2; mix3(o, pore, clamp(k, 0, 0.8), o); }
      });
    });
  }
  function texPatty(grill) {
    return texOf('patty' + grill, function () {
      var a = hex(0x4C2A1A), b = hex(0x7B4A2B), ch = hex(0x23140D);
      return pixelTex(TS, function (u, v, o) {
        var n = fbm(u * 10, v * 10, 5, 10), s = n2p(u * 60, v * 60, 60);
        mix3(a, b, smooth(0.25, 0.75, n), o);
        var d = Math.hypot(u - 0.5, v - 0.5) * 2;
        mix3(o, ch, smooth(0.78, 1.0, d) * 0.85, o);        // borda mais tostada
        if (n < 0.3) mix3(o, ch, 0.4 * smooth(0.3, 0.2, n) + 0.15, o);                  // manchas queimadas
        if (s > 0.76) { o[0] += 18; o[1] += 10; o[2] += 4; }            // pontinhos de gordura
        if (grill) {
          var g = ((u + v) * 7) % 1; var w = Math.abs(g - 0.5);
          if (w < 0.1 + (n - 0.5) * 0.06) mix3(o, ch, 0.7, o);
        }
      });
    });
  }
  function texPattyBump() {
    return texOf('pattyb', function () {
      return pixelTex(TS, function (u, v, o) {
        var n = fbm(u * 16, v * 16, 5, 16) * 255; o[0] = o[1] = o[2] = n;
      }, false);
    });
  }
  function texBacon() {
    return texOf('bacon', function () {
      var m1 = hex(0x7D2316), m2 = hex(0xB4442B), f1 = hex(0xF2D9C2), f2 = hex(0xE5B396), br = hex(0x4A1B0E);
      return pixelTex(TS, function (u, v, o) {
        var n = fbm(u * 6, v * 6, 4, 6);
        var w = v + 0.05 * Math.sin(u * 22 + n * 5) + (n - 0.5) * 0.08;
        var band = Math.floor(w * 5), f = w * 5 - band;
        if (band % 2 === 0) mix3(m1, m2, n, o); else mix3(f1, f2, n, o);
        var edge = Math.min(f, 1 - f);
        if (edge < 0.12) mix3(o, br, (0.12 - edge) * 5, o);   // contorno crocante
        var tip = smooth(0.82, 1, Math.abs(u - 0.5) * 2);
        mix3(o, br, tip * 0.5, o);
      });
    });
  }
  function texTomato() {
    return texOf('tomato', function () {
      var skin = hex(0xB8281B), flesh = hex(0xDD4A33), gel = hex(0xE9A857), seed = hex(0xF3E2A9);
      return pixelTex(TS, function (u, v, o) {
        var x = u - 0.5, y = v - 0.5, r = Math.hypot(x, y) * 2, a = Math.atan2(y, x);
        var n = fbm(u * 6, v * 6, 3, 6);
        if (r > 0.9) { mix3(skin, flesh, 0.2, o); return; }
        mix3(flesh, skin, smooth(0.5, 0.9, r) * 0.6, o);
        var lobe = Math.abs(Math.sin(a * 1.5 + 0.4));       // 3 lóculos
        var inL = r > 0.28 && r < 0.72 && lobe > 0.3;
        if (inL) { mix3(o, gel, 0.75, o); if (n2p(u * 26, v * 26, 26) > 0.72) mix3(o, seed, 0.9, o); }
        if (r < 0.22) mix3(o, hex(0xF0BE86), 0.7, o);
      });
    });
  }
  function texPickle() {
    return texOf('pickle', function () {
      var skin = hex(0x41591B), flesh = hex(0x9DB544), core = hex(0xD8E39A), seed = hex(0xF4F2C8);
      return pixelTex(TS, function (u, v, o) {
        var r = Math.hypot(u - 0.5, v - 0.5) * 2, n = fbm(u * 8, v * 8, 3, 8);
        if (r > 0.9) { o[0] = skin[0]; o[1] = skin[1]; o[2] = skin[2]; return; }
        mix3(flesh, skin, smooth(0.6, 0.9, r) * 0.7, o);
        mix3(o, core, smooth(0.55, 0.2, r) * 0.8, o);
        var a = Math.atan2(v - 0.5, u - 0.5);
        if (r > 0.18 && r < 0.46 && Math.sin(a * 6) > 0.55) mix3(o, seed, 0.8, o);
        o[0] += (n - 0.5) * 24; o[1] += (n - 0.5) * 24;
      });
    });
  }
  function texLettuce() {
    return texOf('lettuce', function () {
      var dk = hex(0x4E8F22), lt = hex(0xA6D357), vein = hex(0xD7EE9B);
      return pixelTex(TS, function (u, v, o) {
        var n = fbm(u * 5, v * 5, 4, 5), r = 1 - Math.abs(2 * fbm(u * 9 + 2, v * 9, 3, 9) - 1);
        mix3(dk, lt, smooth(0.2, 0.8, n), o);
        mix3(o, vein, Math.pow(r, 6) * 0.9, o);
      });
    });
  }
  function texBrie() {
    return texOf('brie', function () {
      var cr = hex(0xF0DFA9), rind = hex(0xFBF6E6), sp = hex(0xD9C07A);
      return pixelTex(TS, function (u, v, o) {
        var r = Math.hypot(u - 0.5, v - 0.5) * 2, n = fbm(u * 7, v * 7, 4, 7);
        mix3(cr, sp, smooth(0.35, 0.7, n) * 0.6, o);
        mix3(o, rind, smooth(0.9, 0.97, r), o);
      });
    });
  }
  function texMushroom() {
    return texOf('mush', function () {
      var flesh = hex(0xD9C6A3), gill = hex(0xA88A62), skin = hex(0x8A6440), stem = hex(0xE6D8BC);
      var tex = pixelTex(TS, function (u, v, o) {
        var x = (u - 0.5) * 0.8, y = (0.5 - v) * 0.8;       // espaço da fatia (u,v -> x,y)
        var n = fbm(u * 10, v * 10, 3, 10);
        var cy = y - 0.03, rx = x / 0.34, ry = cy / 0.27, r = Math.hypot(rx, ry);
        if (cy > -0.02) {                                            // chapéu
          mix3(flesh, gill, 0.15 + n * 0.25, o);
          var ang = Math.atan2(ry, rx), lam = Math.abs(Math.sin(ang * 26));
          if (r > 0.2 && r < 0.72 && lam > 0.86) mix3(o, gill, 0.5, o);   // lamelas
          mix3(o, skin, smooth(0.66, 0.93, r) * 0.85, o);               // casca
        } else { mix3(stem, flesh, n, o); if (Math.abs(Math.sin(x * 70)) > 0.93) mix3(o, gill, 0.25, o); }
      });
      tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping; tex.repeat.set(1 / 0.8, 1 / 0.8); tex.offset.set(0.5, 0.5);   // UVs da extrusão são x,y da fatia (centrados em 0)
      return tex;
    });
  }
  function texSlate() {
    return texOf('slate', function () {
      return pixelTex(TS, function (u, v, o) {
        var n = fbm(u * 6, v * 6, 5, 6);
        var k = 16 + n * 22; o[0] = k * 1.1; o[1] = k * 0.95; o[2] = k * 0.85;
      });
    });
  }
  function texGlow() {
    return texOf('glow', function () {
      var c = document.createElement('canvas'); c.width = c.height = 256;
      var g = c.getContext('2d'), gr = g.createRadialGradient(128, 128, 0, 128, 128, 128);
      gr.addColorStop(0, 'rgba(242,140,22,0.55)'); gr.addColorStop(0.45, 'rgba(185,46,36,0.22)'); gr.addColorStop(1, 'rgba(58,9,8,0)');
      g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
      var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t;
    });
  }

  /* ------------------------------------------------------------ geometria */
  function planarUV(geo, R) {
    var p = geo.attributes.position, uv = new Float32Array(p.count * 2);
    for (var i = 0; i < p.count; i++) { uv[i * 2] = p.getX(i) / (2 * R) + 0.5; uv[i * 2 + 1] = p.getZ(i) / (2 * R) + 0.5; }
    geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  }
  function fixLatheSeam(geo, segs, pts) {
    var n = geo.attributes.normal, v = new V3(), w = new V3();
    for (var j = 0; j < pts; j++) {
      var a = j, b = segs * pts + j;
      v.fromBufferAttribute(n, a); w.fromBufferAttribute(n, b); v.add(w).normalize();
      n.setXYZ(a, v.x, v.y, v.z); n.setXYZ(b, v.x, v.y, v.z);
    }
  }
  function lathe(profile, segs, deform) {
    var geo = new THREE.LatheGeometry(profile, segs), p = geo.attributes.position, o = { x: 0, y: 0, z: 0 };
    if (deform) {
      for (var i = 0; i < p.count; i++) {
        o.x = p.getX(i); o.y = p.getY(i); o.z = p.getZ(i);
        deform(o); p.setXYZ(i, o.x, o.y, o.z);
      }
    }
    geo.computeVertexNormals();
    var N = profile.length, nn = geo.attributes.normal;
    for (var sI = 0; sI <= segs; sI++) {            // polos: normal limpa (sem "estrela" de facetas)
      if (profile[0].x < 0.01) nn.setXYZ(sI * N, 0, -1, 0);
      if (profile[N - 1].x < 0.01) nn.setXYZ(sI * N + N - 1, 0, 1, 0);
    }
    fixLatheSeam(geo, segs, profile.length);
    return geo;
  }
  /* pontos intermediários no perfil: superfícies planas deformáveis precisam de malha densa */
  function ringsAt(y, r1, r0, n) { var a = []; for (var i = 0; i < n; i++) a.push(new V2(lerp(r1, r0, i / n), y)); return a; }
  function polarGrid(R, rings, segs, fn) {
    var pos = [], uv = [], idx = [], o = { x: 0, y: 0, z: 0 }, i, j;
    for (i = 0; i <= rings; i++) for (j = 0; j <= segs; j++) {
      fn(i / rings, (j / segs) * TAU, o);
      pos.push(o.x, o.y, o.z); uv.push(o.x / (2 * R) + 0.5, o.z / (2 * R) + 0.5);
    }
    for (i = 0; i < rings; i++) for (j = 0; j < segs; j++) {
      var a = i * (segs + 1) + j, b = a + segs + 1;
      idx.push(a, a + 1, b, b, a + 1, b + 1);
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx); g.computeVertexNormals();
    var n = g.attributes.normal, v = new V3(), w = new V3();
    for (i = 0; i <= rings; i++) {
      var s = i * (segs + 1), e = s + segs;
      v.fromBufferAttribute(n, s); w.fromBufferAttribute(n, e); v.add(w).normalize();
      n.setXYZ(s, v.x, v.y, v.z); n.setXYZ(e, v.x, v.y, v.z);
    }
    return g;
  }
  function merge(list) {
    var pos = [], nor = [], col = [], idx = [], off = 0, hasCol = !!list[0].attributes.color;
    list.forEach(function (g) {
      var p = g.attributes.position, n = g.attributes.normal, c = g.attributes.color, i;
      for (i = 0; i < p.count; i++) {
        pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i));
        if (hasCol) col.push(c.getX(i), c.getY(i), c.getZ(i));
      }
      var ix = g.index;
      for (i = 0; i < ix.count; i++) idx.push(ix.getX(i) + off);
      off += p.count;
    });
    var m = new THREE.BufferGeometry();
    m.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    m.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    if (hasCol) m.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    m.setIndex(idx);
    return m;
  }

  /* ---------------------------------------------------- construtores de camada
     Cada construtor devolve { g: Group, h: espessura, rim: raio p/ a linha-guia }.
     A origem do grupo é o centro vertical da camada. */
  var BUILD = {};
  function phys(o) { return new THREE.MeshPhysicalMaterial(o); }
  function mesh(geo, mat, noShadow) {
    var m = new THREE.Mesh(geo, mat); m.castShadow = !noShadow; m.receiveShadow = true; return m;
  }

  function bunProfile(R, H, top) {
    var pts = [], i, N = 26;
    if (top) {
      pts.push(new V2(R * 0.93, 0), new V2(R * 0.995, 0.035));
      for (i = 2; i <= N; i++) {
        var t = (i / N) * Math.PI / 2;
        pts.push(new V2(R * Math.pow(Math.cos(t), 0.8) * 0.995 + 0.0001, 0.035 + (H - 0.035) * Math.pow(Math.sin(t), 0.85)));
      }
    } else {
      pts.push(new V2(0.0001, 0), new V2(R * 0.82, 0), new V2(R * 0.95, 0.05), new V2(R * 1.0, 0.16), new V2(R * 1.01, 0.28), new V2(R * 0.985, H - 0.03), new V2(R * 0.93, H));
    }
    return pts;
  }
  BUILD.paoSuperior = function (o) {
    var R = 1.1, H = 0.84, rg = ragged(11, 2, 5), rg2 = ragged(12, 2, 4), g = new THREE.Group();
    var geo = lathe(bunProfile(R, H, true), 80, function (p) {
      var a = Math.atan2(p.z, p.x), r = Math.hypot(p.x, p.z);
      var k = 1 + 0.014 * rg(a) * smooth(0.3, 1, r / R), n = fbm(p.x * 1.6 + 8, p.z * 1.6 + 8, 3, 64) - 0.5;
      var wr = smooth(0.05, 0.7, r / R);
      p.x *= k; p.z *= k; p.y = p.y * (1 + wr * (0.035 * rg2(a) + 0.05 * n)) + 0.04 * p.x * wr;
      p.y -= H / 2;
    });
    var crust = phys({ map: texBun(), bumpMap: texBunBump(), bumpScale: 0.3, roughness: 0.5, clearcoat: 0.35, clearcoatRoughness: 0.4, envMapIntensity: 0.8 });
    g.add(mesh(geo, crust));
    var cg = new THREE.CircleGeometry(R * 0.945, 64); cg.rotateX(Math.PI / 2); cg.translate(0, -H / 2 + 0.002, 0);
    g.add(mesh(cg, phys({ map: texCrumb(), roughness: 0.9, envMapIntensity: 0.35 })));
    if (o.gergelim) {
      var r = rng(5), sg = new THREE.SphereGeometry(0.03, 8, 6); sg.scale(1, 0.5, 2);
      var im = new THREE.InstancedMesh(sg, phys({ color: 0xF2E3B8, roughness: 0.5 }), 70), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
      for (var i = 0; i < 70; i++) {
        var rr = Math.sqrt(r()) * R * 0.62, aa = r() * TAU, x = Math.cos(aa) * rr, z = Math.sin(aa) * rr;
        var y = H * Math.pow(Math.sin(Math.acos(clamp(Math.pow(rr / R, 1.25), 0, 1))), 0.85) - H / 2 + 0.01;
        e.set(0, r() * TAU, (r() - 0.5) * 0.4); q.setFromEuler(e); m4.compose(new V3(x, y, z), q, new V3(1, 1, 1)); im.setMatrixAt(i, m4);
      }
      im.castShadow = true; g.add(im);
    }
    return { g: g, h: H, rim: R };
  };
  BUILD.paoInferior = function () {
    var R = 1.08, H = 0.42, rg = ragged(21, 2, 5), g = new THREE.Group();
    var geo = lathe(bunProfile(R, H, false), 80, function (p) {
      var a = Math.atan2(p.z, p.x), k = 1 + 0.012 * rg(a);
      p.x *= k; p.z *= k; p.y -= H / 2;
    });
    g.add(mesh(geo, phys({ map: texBun(), bumpMap: texBunBump(), bumpScale: 0.25, roughness: 0.55, clearcoat: 0.25, clearcoatRoughness: 0.45, envMapIntensity: 0.75 })));
    var cg = new THREE.CircleGeometry(R * 0.93, 64); cg.rotateX(-Math.PI / 2); cg.translate(0, H / 2 - 0.002, 0);
    g.add(mesh(cg, phys({ map: texCrumb(), roughness: 0.9, envMapIntensity: 0.35 })));
    return { g: g, h: H, rim: R };
  };

  function patty(kind) {
    var smash = kind === 'smash', r0 = smash ? 1.08 : 1.0, h = smash ? 0.17 : 0.34;
    var rg = ragged(smash ? 31 : 32, 3, 11), rg2 = ragged(33, 2, 6), pts = [], i;
    var cr = r0 * (smash ? 0.1 : 0.12), cx = r0 - cr;
    pts.push(new V2(0.0001, -h / 2));
    for (i = 0; i <= 10; i++) { var an = -Math.PI / 2 + (i / 10) * Math.PI; pts.push(new V2(cx + cr * Math.cos(an), (h / 2) * Math.sin(an))); }
    for (i = 1; i <= 12; i++) { var q = 1 - i / 12; pts.push(new V2(Math.max(0.0001, cx * q), h / 2 + (smash ? 0.01 : 0.045) * (1 - q * q))); }
    var geo = lathe(pts, 96, function (p) {
      var a = Math.atan2(p.z, p.x), r = Math.hypot(p.x, p.z), w = smooth(0.55, 1, r / r0);
      var k = 1 + w * (smash ? 0.075 : 0.025) * rg(a);
      var lump = (fbm(p.x * 2.2 + 9, p.z * 2.2 + 9, 4, 64) - 0.5) * (smash ? 0.07 : 0.09);
      p.x *= k; p.z *= k;
      if (p.y > 0) p.y += lump + (smash ? w * 0.03 * rg2(a) : 0);
      p.y -= 0;
    });
    planarUV(geo, r0 * 1.08);
    var m = phys({ map: texPatty(!smash), bumpMap: texPattyBump(), bumpScale: smash ? 1.6 : 1.2, roughness: 0.6, clearcoat: 0.22, clearcoatRoughness: 0.5, envMapIntensity: 0.7 });
    var g = new THREE.Group(); g.add(mesh(geo, m));
    return { g: g, h: h + (smash ? 0.01 : 0.045), rim: r0 };
  }
  BUILD.smash = function () { return patty('smash'); };
  BUILD.blend = function () { return patty('blend'); };

  function melt(Rbox, th, seed, droop, color, rindy) {
    var geo = new THREE.BoxGeometry(Rbox * 2, th, Rbox * 2, 40, 1, 40), p = geo.attributes.position, rg = ragged(seed, 3, 7);
    for (var i = 0; i < p.count; i++) {
      var x = p.getX(i), z = p.getZ(i), y = p.getY(i), r = Math.hypot(x, z), a = Math.atan2(z, x);
      var ex = Math.max(0, r - 0.78);
      y -= droop * Math.pow(ex, 1.45) * (1 + 0.12 * rg(a));
      y += (fbm(x * 1.4 + 7, z * 1.4 + 7, 2, 64) - 0.5) * 0.02;
      p.setXYZ(i, x, y, z);
    }
    geo.computeVertexNormals();
    return geo;
  }
  BUILD.cheddar = function () {
    var geo = melt(1.0, 0.075, 41, 0.5), g = new THREE.Group();
    var m = phys({ color: 0xEE8E14, roughness: 0.34, clearcoat: 0.7, clearcoatRoughness: 0.25, envMapIntensity: 0.85 });
    m.emissive = new THREE.Color(0x4A2400); m.emissiveIntensity = 0.2;
    g.add(mesh(geo, m));
    return { g: g, h: 0.075, rim: 1.0 };
  };
  BUILD.brie = function () {
    var r0 = 1.0, h = 0.11, rg = ragged(51, 2, 6), g = new THREE.Group();
    var pts = [new V2(0.0001, -h / 2)].concat(ringsAt(-h / 2, r0 * 0.12, r0 * 0.94, 9).slice(1), [new V2(r0 * 0.94, -h / 2), new V2(r0, -h / 2 + 0.025), new V2(r0, h / 2 - 0.025), new V2(r0 * 0.94, h / 2)], ringsAt(h / 2, r0 * 0.94, 0.0001, 12).slice(1), [new V2(0.0001, h / 2)]);
    var geo = lathe(pts, 80, function (p) {
      var a = Math.atan2(p.z, p.x), r = Math.hypot(p.x, p.z), k = 1 + 0.07 * rg(a) * smooth(0.4, 1, r / r0);
      p.x *= k; p.z *= k;
      p.y -= 0.55 * Math.pow(Math.max(0, r - 0.6), 1.7) * (1 + 0.5 * rg(a * 2 + 1));
      p.y += (fbm(p.x * 2 + 3, p.z * 2 + 3, 3, 64) - 0.5) * 0.04;
    });
    planarUV(geo, r0 * 1.08);
    g.add(mesh(geo, phys({ map: texBrie(), roughness: 0.42, clearcoat: 0.45, clearcoatRoughness: 0.4, sheen: 0.4, sheenColor: new THREE.Color(0xFFF3C8), envMapIntensity: 0.95 })));
    return { g: g, h: h, rim: r0 };
  };
  BUILD.picles = function () {
    var g = new THREE.Group(), r = rng(61), spots = [[0, 0]], i;
    for (i = 0; i < 6; i++) { var a = i / 6 * TAU + 0.3; spots.push([Math.cos(a) * 0.62, Math.sin(a) * 0.62]); }
    var side = phys({ color: 0x4B6A1D, roughness: 0.4, clearcoat: 0.5 });
    var cap = phys({ map: texPickle(), roughness: 0.28, clearcoat: 0.8, clearcoatRoughness: 0.2, envMapIntensity: 1.1 });
    cap.emissive = new THREE.Color(0x2D4010); cap.emissiveIntensity = 0.3;
    spots.forEach(function (s, k) {
      var rg = ragged(70 + k, 4, 9), geo = new THREE.CylinderGeometry(0.3, 0.3, 0.05, 40, 1), p = geo.attributes.position;
      for (var j = 0; j < p.count; j++) {
        var x = p.getX(j), z = p.getZ(j), y = p.getY(j), a = Math.atan2(z, x), kk = 1 + 0.06 * rg(a);
        p.setXYZ(j, x * kk, y + (Math.hypot(x, z) > 0.25 ? 0.012 * Math.sin(a * 14) : 0), z * kk);
      }
      geo.computeVertexNormals();
      var m = mesh(geo, [side, cap, cap]); m.position.set(s[0], (r() - 0.5) * 0.015, s[1]); m.rotation.y = r() * TAU;
      m.rotation.z = (r() - 0.5) * 0.12; m.rotation.x = (r() - 0.5) * 0.12; g.add(m);
    });
    return { g: g, h: 0.07, rim: 0.95 };
  };

  var SAUCES = {
    especial: { c: 0xE9A97B, rough: 0.28, e: 0x5A2A12, ei: 0.25 },
    bbq: { c: 0x3B170A, rough: 0.1, e: 0x1A0600, ei: 0.2 },
    trufado: { c: 0x3A2A20, rough: 0.2, e: 0x120A06, ei: 0.1, flecks: true }
  };
  BUILD.molho = function (o) {
    var S = SAUCES[o.cor] || { c: o.cor ? parseInt(String(o.cor).replace('#', ''), 16) : 0xE9A97B, rough: 0.25, e: 0x000000, ei: 0 };
    var r0 = 0.84, h = 0.1, rg = ragged(81, 3, 8), g = new THREE.Group(), r = rng(82), i;
    var pts = [new V2(0.0001, -h / 2), new V2(r0 * 0.9, -h / 2), new V2(r0, -h * 0.1), new V2(r0 * 0.93, h / 2)].concat(ringsAt(h / 2 + 0.01, r0 * 0.93, 0.0001, 10).slice(1), [new V2(0.0001, h / 2 + 0.025)]);
    var geo = lathe(pts, 72, function (p) {
      var a = Math.atan2(p.z, p.x), k = 1 + 0.09 * rg(a); p.x *= k; p.z *= k;
      p.y += (fbm(p.x * 3 + 5, p.z * 3 + 5, 3, 64) - 0.5) * 0.03;
    });
    var m = phys({ color: S.c, roughness: S.rough, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.3 });
    m.emissive = new THREE.Color(S.e); m.emissiveIntensity = S.ei;
    g.add(mesh(geo, m));
    for (i = 0; i < 6; i++) {
      var a = r() * TAU, len = 0.03 + r() * 0.08, rad = 0.036 + r() * 0.016, rr = r0 * (0.86 + 0.08 * rg(a));
      var dg = new THREE.SphereGeometry(rad, 14, 12); dg.scale(1, 1 + len / rad * 0.55, 1);   // gota alongada
      var dm = mesh(dg, m); dm.position.set(Math.cos(a) * rr, -h / 2 - len * 0.45, Math.sin(a) * rr); g.add(dm);
    }
    if (S.flecks) {
      var fm = phys({ color: 0x0B0705, roughness: 0.6 }), fg = new THREE.SphereGeometry(0.014, 6, 5);
      for (i = 0; i < 46; i++) {
        var fa = r() * TAU, fr = Math.sqrt(r()) * r0 * 0.85, f = new THREE.Mesh(fg, fm);
        f.scale.set(1 + r(), 0.5, 1 + r()); f.position.set(Math.cos(fa) * fr, h / 2 + 0.018, Math.sin(fa) * fr); g.add(f);
      }
    }
    return { g: g, h: h + 0.025, rim: r0 };
  };

  BUILD.cebolaCaramelizada = function () {
    var r = rng(91), list = [], tint = new THREE.Color(), i, j;
    for (i = 0; i < 80; i++) {
      var a = r() * TAU, rr = Math.sqrt(r()) * 0.88, x = Math.cos(a) * rr, z = Math.sin(a) * rr, ang = r() * TAU, len = 0.4 + r() * 0.5, c = [];
      for (j = 0; j < 7; j++) {
        var t = j / 6; c.push(new V3(x + Math.cos(ang) * (t - 0.5) * len + Math.sin(t * 6 + i) * 0.04, (r() - 0.5) * 0.05 + Math.sin(t * Math.PI) * 0.025, z + Math.sin(ang) * (t - 0.5) * len + Math.cos(t * 5 + i) * 0.04));
      }
      var tg = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(c), 14, 0.032 + r() * 0.016, 6, false);
      tint.setHex(r() > 0.4 ? 0xC7771F : 0x8E4A14).offsetHSL(0, 0, (r() - 0.5) * 0.08);
      var cols = new Float32Array(tg.attributes.position.count * 3);
      for (j = 0; j < cols.length; j += 3) { cols[j] = tint.r; cols[j + 1] = tint.g; cols[j + 2] = tint.b; }
      tg.setAttribute('color', new THREE.BufferAttribute(cols, 3));
      list.push(tg);
    }
    var g = new THREE.Group();
    g.add(mesh(merge(list), phys({ vertexColors: true, roughness: 0.25, clearcoat: 0.8, clearcoatRoughness: 0.2, envMapIntensity: 1.1 })));
    return { g: g, h: 0.14, rim: 0.88 };
  };

  BUILD.bacon = function () {
    var g = new THREE.Group(), cfg = [[-0.5, -0.28, 0.1], [0, 0.04, -0.06], [0.52, 0.3, 0.14]];
    var m = phys({ map: texBacon(), roughness: 0.35, clearcoat: 0.55, clearcoatRoughness: 0.3, envMapIntensity: 1.0, side: THREE.DoubleSide, bumpMap: texPattyBump(), bumpScale: 0.4 });
    cfg.forEach(function (c, k) {
      var geo = new THREE.PlaneGeometry(2.05, 0.46, 70, 10), p = geo.attributes.position, rg = ragged(100 + k, 3, 8);
      geo.rotateX(-Math.PI / 2);
      for (var i = 0; i < p.count; i++) {
        var x = p.getX(i), z = p.getZ(i), u = x / 2.05 + 0.5, v = z / 0.46;
        var w = 1 + 0.12 * Math.sin(x * 7 + k * 2) + 0.05 * rg(x * 3);
        var y = 0.05 * Math.sin(x * 6 + k * 1.7) + 0.028 * Math.sin(x * 15 + k) + 0.04 * v * v * Math.sin(x * 4 + k);
        p.setXYZ(i, x, y, z * w + 0.1 * Math.sin(x * 2.4 + k * 3) * (1 - Math.abs(u - 0.5)));
      }
      geo.computeVertexNormals();
      var s = mesh(geo, m); s.rotation.y = c[1]; s.position.set(0, c[2] * 0.2, c[0]); g.add(s);
    });
    return { g: g, h: 0.16, rim: 1.0 };
  };

  BUILD.cogumelo = function () {
    var g = new THREE.Group(), r = rng(111);
    var sh = new THREE.Shape(), pt = [], q;
    for (q = 0; q <= 24; q++) { var ta = Math.PI * (1 - q / 24); pt.push(new V2(Math.cos(ta) * 0.34, 0.03 + Math.sin(ta) * 0.27 * (1 - 0.1 * Math.cos(ta * 2)))); }   // chapéu
    pt.push(new V2(0.16, 0.0), new V2(0.12, -0.12), new V2(0.115, -0.26), new V2(0.07, -0.32), new V2(-0.07, -0.32), new V2(-0.115, -0.26), new V2(-0.12, -0.12), new V2(-0.16, 0.0));
    sh.setFromPoints(pt);
    var geo = new THREE.ExtrudeGeometry(sh, { depth: 0.032, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.01, bevelSegments: 2 });
    geo.translate(0, 0, -0.022); geo.rotateX(-Math.PI / 2);
    var flesh = phys({ map: texMushroom(), roughness: 0.5, clearcoat: 0.3, clearcoatRoughness: 0.5 });
    var skin = phys({ color: 0x7C5A38, roughness: 0.55, clearcoat: 0.25 });
    var spots = [[0.0, 0.05], [0.7, 0.1], [-0.7, -0.05], [0.32, 0.68], [-0.34, 0.66], [0.36, -0.6], [-0.38, -0.62]];
    spots.forEach(function (s, k) {
      var m = mesh(geo, [flesh, skin]); m.position.set(s[0], (r() - 0.5) * 0.04, s[1]); m.rotation.y = (k % 2 ? 1 : -1) * (0.25 + r() * 0.5) + (k > 3 ? Math.PI : 0); var sc = 1.18 + r() * 0.15; m.scale.set(sc, 1, sc); g.add(m);
    });
    return { g: g, h: 0.1, rim: 1.0 };
  };

  BUILD.alface = function () {
    var R = 1.3, rg = ragged(121, 5, 12), g = new THREE.Group();
    var geo = polarGrid(R, 22, 120, function (t, a, o) {
      var rr = t * R * (1 + 0.12 * rg(a) * t), w = 0.075 * smooth(0.1, 1, t);
      o.x = Math.cos(a) * rr; o.z = Math.sin(a) * rr;
      o.y = w * Math.sin(a * 13 + t * 4) + 0.035 * Math.sin(a * 7 - t * 9) * t + (fbm(o.x * 3 + 4, o.z * 3 + 4, 3, 64) - 0.5) * 0.05;
    });
    var m = phys({ map: texLettuce(), roughness: 0.4, clearcoat: 0.4, clearcoatRoughness: 0.35, side: THREE.DoubleSide, envMapIntensity: 1.0 });
    m.emissive = new THREE.Color(0x1C3A0A); m.emissiveIntensity = 0.35;
    g.add(mesh(geo, m));
    return { g: g, h: 0.18, rim: 1.2 };
  };

  BUILD.tomate = function () {
    var g = new THREE.Group(), side = phys({ color: 0xB8281B, roughness: 0.3, clearcoat: 0.9 });
    var cap = phys({ map: texTomato(), roughness: 0.25, clearcoat: 0.9, clearcoatRoughness: 0.15, envMapIntensity: 1.1 });
    cap.emissive = new THREE.Color(0x5A0E08); cap.emissiveIntensity = 0.3;
    [[-0.38, -0.2], [0.42, -0.08], [0.0, 0.5]].forEach(function (s, k) {
      var rg = ragged(130 + k, 3, 6), geo = new THREE.CylinderGeometry(0.66, 0.66, 0.1, 44, 1), p = geo.attributes.position;
      for (var j = 0; j < p.count; j++) { var a = Math.atan2(p.getZ(j), p.getX(j)), kk = 1 + 0.03 * rg(a); p.setX(j, p.getX(j) * kk); p.setZ(j, p.getZ(j) * kk); }
      geo.computeVertexNormals();
      var m = mesh(geo, [side, cap, cap]); m.position.set(s[0], k * 0.012, s[1]); m.rotation.y = k * 1.9; g.add(m);
    });
    return { g: g, h: 0.13, rim: 1.0 };
  };

  /* --------------------------------------------------------------- cena */
  function envScene() {
    var s = new THREE.Scene();
    s.add(new THREE.Mesh(new THREE.BoxGeometry(24, 24, 24), new THREE.MeshBasicMaterial({ color: 0x120D0A, side: THREE.BackSide })));
    function panel(w, h, pos, col, k) {
      var c = new THREE.Color(col); c.multiplyScalar(k);
      var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide }));
      m.position.set(pos[0], pos[1], pos[2]); m.lookAt(0, 0, 0); s.add(m);
    }
    panel(7, 4, [-7, 7, 6], 0xFFEBD2, 6);      // softbox principal
    panel(2, 9, [8, 3, 3], 0xFFE0BC, 3.5);        // faixa lateral
    panel(8, 3, [0, 9, -3], 0xFFFFFF, 4);       // topo
    panel(6, 3, [-4, 2, -9], 0xFF8A2A, 5);      // contraluz alaranjado
    panel(10, 5, [0, -6, 4], 0x3A1D0C, 2);      // rebatedor do chão
    return s;
  }

  /* ------------------------------------------------------------ aplicação */
  function init() {
    var root = document.getElementById('camadas');
    if (!root) return;
    var $ = function (s) { return root.querySelector(s); };
    var stage = $('[data-b3d="stage"]'), canvas = $('[data-b3d="canvas"]'), svg = $('[data-b3d="lines"]'),
      labelsEl = $('[data-b3d="labels"]'), selEl = $('[data-b3d="sel"]'), tabsEl = $('[data-b3d="tabs"]'),
      ingEl = $('[data-b3d="ings"]'), buyEl = $('[data-b3d="buy"]'), loadEl = $('[data-b3d="loading"]'), hintEl = $('[data-b3d="hint"]'),
      liveEl = $('[data-b3d="live"]');
    var RECIPES = window.RECEITAS_3D || {}, MENU = window.CARDAPIO || [];
    var ids = Object.keys(RECIPES);
    if (!ids.length) return;

    /* ----- renderer ----- */
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (e) { return fail(); }
    function fail() { root.classList.add('b3d-fallback'); if (loadEl) loadEl.hidden = true; showIngredients(true); revealBuy(true); }
    canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); console.warn('[b3d] contexto WebGL perdido'); });
    canvas.addEventListener('webglcontextrestored', function () { console.warn('[b3d] contexto WebGL restaurado'); requestRender(); });
    renderer.setClearColor(0x000000, 0);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    var maxDpr = IS_MOBILE ? 1.75 : 2;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(31, 1, 0.1, 80);
    var pm = new THREE.PMREMGenerator(renderer);
    scene.environment = pm.fromScene(envScene(), 0.03).texture;
    pm.dispose();

    var api = { timeScale: 1 };
    var key = new THREE.DirectionalLight(0xFFE7C6, 1.7);
    key.position.set(3.5, 9, 5); key.castShadow = true;
    var sc = key.shadow.camera; sc.left = -3.4; sc.right = 3.4; sc.top = 9; sc.bottom = -3; sc.near = 1; sc.far = 28;
    key.shadow.mapSize.set(IS_MOBILE ? 1024 : 2048, IS_MOBILE ? 1024 : 2048);
    key.shadow.bias = -0.0005; key.shadow.normalBias = 0.025;
    scene.add(key);
    var rim = new THREE.DirectionalLight(0xFF9A3C, 1.5); rim.position.set(-6, 5, -7); scene.add(rim);
    var fill = new THREE.DirectionalLight(0xC9D6FF, 0.3); fill.position.set(-7, 3, 5); scene.add(fill);

    /* tábua de ardósia + brilho quente embaixo (profundidade) */
    var board = new THREE.Mesh(new THREE.CylinderGeometry(2.05, 2.15, 0.16, 72),
      phys({ map: texSlate(), roughness: 0.7, metalness: 0.05, clearcoat: 0.1, envMapIntensity: 0.4 }));
    board.position.y = -0.08; board.receiveShadow = true; scene.add(board);
    var glow = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), new THREE.MeshBasicMaterial({ map: texGlow(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    glow.rotation.x = -Math.PI / 2; glow.position.y = -0.2; scene.add(glow);

    /* brasas flutuando ao fundo */
    var NP = IS_MOBILE ? 36 : 70, pp = new Float32Array(NP * 3), pr = rng(9), pgeo = new THREE.BufferGeometry();
    for (var pi = 0; pi < NP; pi++) { var pa = pr() * TAU, prr = 2.2 + pr() * 3.5; pp[pi * 3] = Math.cos(pa) * prr; pp[pi * 3 + 1] = pr() * 9 - 1; pp[pi * 3 + 2] = Math.sin(pa) * prr; }
    pgeo.setAttribute('position', new THREE.BufferAttribute(pp, 3));
    var embers = new THREE.Points(pgeo, new THREE.PointsMaterial({ color: 0xF28C16, size: 0.05, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true }));
    scene.add(embers);

    /* ----- estado ----- */
    var layers = [], burger = new THREE.Group(); scene.add(burger);
    var cur = null, expT = 0, expV = 0, selected = -1, hover = -1, intro = REDUCED ? 1 : 0;
    var exploded = false, demoDone = false, armedDrag = true, dragAccum = 0;
    var az = 0.55, el = 0.3, azVel = 0.0, zoom = 1, lastInput = -99, t0 = performance.now() / 1000;
    var camT = new V3(0, 1, 0), camD = 8, lookAt = new V3();
    var W = 1, H = 1, visible = false, rafId = 0, last = 0;
    var GAP = 0.66;

    function disposeLayers() {
      layers.forEach(function (L) {
        L.g.traverse(function (o) {
          if (o.geometry) o.geometry.dispose();
          var m = o.material; if (m) (Array.isArray(m) ? m : [m]).forEach(function (x) { x.dispose(); });
        });
        burger.remove(L.g);
      });
      layers = [];
    }
    function layerMats(L) {
      var arr = [];
      L.g.traverse(function (o) {
        if (!o.material) return;
        (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (m) {
          if (arr.indexOf(m) < 0) { if (!m.userData.base && m.color) m.userData.base = m.color.clone(); if (!m.userData.em && m.emissive) { m.userData.em = m.emissive.clone(); m.userData.emi = m.emissiveIntensity; } arr.push(m); }
        });
      });
      return arr;
    }

    function buildRecipe(id) {
      disposeLayers();
      var rec = RECIPES[id], list = rec.camadas.slice().reverse(), cum = 0.0;   // receita é listada de cima p/ baixo
      list.forEach(function (c, i) {
        var b = BUILD[c.tipo]; if (!b) { console.warn('Tipo de ingrediente desconhecido:', c.tipo); return; }
        var o = b(c), L = { g: o.g, h: o.h, rim: o.rim, data: c, i: i, rest: cum + o.h / 2, side: 1, dim: 0, hl: 0, y: 0, tp: 0 };
        cum += o.h + 0.004;
        L.g.traverse(function (m) { if (m.isMesh || m.isInstancedMesh) m.userData.layer = i; });
        burger.add(L.g); layers.push(L);
      });
      // índice de exibição: topo = 0
      var n = layers.length;
      layers.forEach(function (L, i) { L.disp = n - 1 - i; L.side = (L.disp % 2 === 0) ? 1 : -1; L.mats = layerMats(L); });
      L_height = cum;
      expT = 0; expV = 0; exploded = false; selected = -1; hover = -1;
      intro = REDUCED ? 1 : 0;
      buildLabels(); buildIngredients(); updateUI();
    }
    var L_height = 2;

    /* ----- rótulos (HTML) + linhas (SVG) ----- */
    var labelEls = [], lineEls = [], dotEls = [];
    function buildLabels() {
      labelsEl.textContent = ''; svg.textContent = ''; labelEls = []; lineEls = []; dotEls = [];
      layers.forEach(function (L) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'b3d-lb ' + (L.side > 0 ? 'r' : 'l');
        b.innerHTML = '<span class="n"></span><b></b><p></p>';
        b.children[0].textContent = String(L.disp + 1).padStart(2, '0');
        b.children[1].textContent = L.data.nome; b.children[2].textContent = L.data.desc;
        b.addEventListener('click', function () { select(L.i); });
        labelsEl.appendChild(b); labelEls.push(b);
        var ln = document.createElementNS('http://www.w3.org/2000/svg', 'polyline'), dt = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dt.setAttribute('r', '3.5'); svg.appendChild(ln); svg.appendChild(dt); lineEls.push(ln); dotEls.push(dt);
      });
      measureLabels();
    }
    function measureLabels() { labelEls.forEach(function (e) { e._h = e.offsetHeight; e._w = e.offsetWidth; }); }
    function buildIngredients() {
      ingEl.textContent = '';
      var ol = document.createElement('ol'); ol.className = 'b3d-ing';
      layers.slice().sort(function (a, b) { return a.disp - b.disp; }).forEach(function (L) {
        var li = document.createElement('li'), b = document.createElement('button');
        b.type = 'button'; b.innerHTML = '<b></b><span></span>';
        b.children[0].textContent = L.data.nome; b.children[1].textContent = L.data.desc;
        b.addEventListener('click', function () { select(L.i); root.querySelector('[data-b3d="stage"]').scrollIntoView({ block: 'nearest', behavior: REDUCED ? 'auto' : 'smooth' }); });
        li.appendChild(b); ol.appendChild(li);
      });
      ingEl.appendChild(ol);
    }
    function showIngredients(on) {
      ingEl.hidden = !on;
      var b = $('[data-b3d-act="ingredients"]'); if (b) { b.setAttribute('aria-expanded', String(on)); b.classList.toggle('on', on); }
    }

    /* ----- ações ----- */
    function explode() {
      if (exploded) return; exploded = true; expT = 1; armedDrag = false; hintEl.classList.add('gone'); updateUI();
      if (liveEl) liveEl.textContent = 'Lanche desmontado. Toque em uma camada para ver o ingrediente.';
    }
    function assemble() {
      if (!exploded) return; exploded = false; expT = 0; deselect(true); updateUI();
      if (liveEl) liveEl.textContent = 'Lanche montado novamente.';
    }
    function select(i) {
      if (!layers[i]) return;
      if (!exploded) explode();
      selected = i; revealSel(layers[i]); updateUI();
      if (liveEl) liveEl.textContent = layers[i].data.nome + '. ' + layers[i].data.desc;
    }
    function deselect(silent) { if (selected < 0) return; selected = -1; selEl.classList.remove('on'); if (!silent) updateUI(); }
    function revealSel(L) {
      selEl.querySelector('b').textContent = L.data.nome;
      selEl.querySelector('p').textContent = L.data.desc;
      selEl.querySelector('.k').textContent = 'Camada ' + (L.disp + 1) + ' de ' + layers.length;
      selEl.classList.add('on');
    }
    function updateUI() {
      root.classList.toggle('is-exploded', exploded);
      root.classList.toggle('has-sel', selected >= 0);
      var be = $('[data-b3d-act="explode"]'), ba = $('[data-b3d-act="assemble"]');
      if (be) be.hidden = exploded; if (ba) ba.hidden = !exploded;
      labelEls.forEach(function (el, i) { el.classList.toggle('sel', i === selected); });
    }

    /* ----- compra ----- */
    var buyShown = false;
    function item() { for (var i = 0; i < MENU.length; i++) if (MENU[i].id === cur) return MENU[i]; return null; }
    function fmt(c) { return (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
    function fillBuy() {
      var it = item(); if (!it) return;
      buyEl.querySelector('[data-b3d="buy-name"]').textContent = it.nome;
      buyEl.querySelector('[data-b3d="buy-desc"]').textContent = it.desc;
      buyEl.querySelector('[data-b3d="buy-price"]').textContent = fmt(it.preco);
      var btn = buyEl.querySelector('[data-b3d="buy-btn"]'); btn.dataset.id = it.id;
    }
    function revealBuy(force) {
      if (buyShown && !force) return; buyShown = true; fillBuy(); buyEl.classList.add('on'); buyEl.setAttribute('aria-hidden', 'false');
    }
    buyEl.querySelector('[data-b3d="buy-btn"]').addEventListener('click', function () {
      if (window.Pedido) window.Pedido.add(this.dataset.id, true);
    });

    /* abas */
    tabsEl.textContent = '';
    ids.forEach(function (id) {
      var it = MENU.filter(function (m) { return m.id === id; })[0], b = document.createElement('button');
      b.type = 'button'; b.setAttribute('role', 'tab'); b.dataset.id = id; b.textContent = it ? it.nome : id;
      b.addEventListener('click', function () { setBurger(id); });
      tabsEl.appendChild(b);
    });
    function setBurger(id) {
      if (cur === id) return;
      cur = id;
      Array.prototype.forEach.call(tabsEl.children, function (b) { var on = b.dataset.id === id; b.setAttribute('aria-selected', String(on)); b.classList.toggle('on', on); });
      selEl.classList.remove('on'); buildRecipe(id); fillBuy(); azVel = 0;
      hintEl.classList.remove('gone'); armedDrag = true; dragAccum = 0; hintEl.classList.toggle('gone', false);
    }

    /* ----- controles ----- */
    var dpr = 1;
    function resize() {
      var r = stage.getBoundingClientRect(); W = Math.max(2, Math.round(r.width)); H = Math.max(2, Math.round(r.height));
      dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      renderer.setPixelRatio(dpr); renderer.setSize(W, H, false);
      camera.aspect = W / H; camera.updateProjectionMatrix();
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      measureLabels();
      requestRender();
    }
    if (window.ResizeObserver) new ResizeObserver(resize).observe(stage); else window.addEventListener('resize', resize);

    var ptrs = {}, pinch0 = 0, zoom0 = 1, down = null;
    canvas.addEventListener('pointerdown', function (e) {
      canvas.setPointerCapture(e.pointerId);
      ptrs[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ks = Object.keys(ptrs);
      if (ks.length === 2) { pinch0 = dist2(); zoom0 = zoom; down = null; }
      else down = { x: e.clientX, y: e.clientY, t: performance.now(), moved: 0, id: e.pointerId };
      azVel = 0; markInput(); canvas.classList.add('grabbing');
    });
    function dist2() { var k = Object.keys(ptrs), a = ptrs[k[0]], b = ptrs[k[1]]; return Math.hypot(a.x - b.x, a.y - b.y); }
    canvas.addEventListener('pointermove', function (e) {
      var p = ptrs[e.pointerId];
      if (!p) { hoverAt(e.clientX, e.clientY, e.pointerType); return; }
      var dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
      if (Object.keys(ptrs).length === 2) { if (pinch0) zoom = clamp(zoom0 * dist2() / pinch0, 0.55, 1.6); markInput(); requestRender(); return; }
      if (!down) return;
      down.moved += Math.abs(dx) + Math.abs(dy);
      if (down.moved > 5) {
        az -= dx * 0.0085; el = clamp(el + dy * 0.006, -0.12, 1.4); azVel = -dx * 0.0085 * 60 * 0.6; markInput();
        dragAccum += Math.abs(dx) + Math.abs(dy);
        if (armedDrag && dragAccum > 90 && !exploded) explode();   // arrastar também desmonta (1ª vez)
        requestRender();
      }
    });
    function endPtr(e) {
      var p = ptrs[e.pointerId]; if (!p) return;
      delete ptrs[e.pointerId]; pinch0 = 0; canvas.classList.remove('grabbing');
      if (down && down.id === e.pointerId && down.moved <= 6 && performance.now() - down.t < 450 && e.type === 'pointerup') click(e.clientX, e.clientY);
      down = null; markInput();
    }
    canvas.addEventListener('pointerup', endPtr); canvas.addEventListener('pointercancel', endPtr);
    canvas.addEventListener('wheel', function (e) {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault(); zoom = clamp(zoom * Math.exp(-e.deltaY * 0.0022), 0.55, 1.6); markInput(); requestRender();
    }, { passive: false });
    canvas.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { az += 0.12; } else if (e.key === 'ArrowRight') { az -= 0.12; }
      else if (e.key === 'ArrowUp') { el = clamp(el + 0.1, -0.12, 1.4); } else if (e.key === 'ArrowDown') { el = clamp(el - 0.1, -0.12, 1.4); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); exploded ? assemble() : explode(); }
      else if (e.key === 'Escape') { deselect(); } else return;
      markInput(); requestRender();
    });
    function markInput() { lastInput = performance.now() / 1000; }

    var ray = new THREE.Raycaster(), ndc = new V2();
    function pick(cx, cy) {
      var r = canvas.getBoundingClientRect();
      ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      var objs = []; layers.forEach(function (L) { L.g.traverse(function (o) { if (o.isMesh) objs.push(o); }); });
      var hit = ray.intersectObjects(objs, false);
      return hit.length ? hit[0].object.userData.layer : -1;
    }
    function click(cx, cy) {
      var i = pick(cx, cy);
      if (!exploded) { explode(); return; }
      if (i >= 0) { if (i === selected) deselect(); else select(i); } else deselect();
    }
    var hoverPending = null;
    function hoverAt(cx, cy, type) {
      if (type !== 'mouse') return; hoverPending = [cx, cy]; requestRender();
    }
    window.addEventListener('blur', function () { ptrs = {}; });

    /* botões */
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-b3d-act]'); if (!b) return;
      var a = b.getAttribute('data-b3d-act');
      if (a === 'explode') explode();
      else if (a === 'assemble') assemble();
      else if (a === 'ingredients') showIngredients(ingEl.hidden);
      else if (a === 'angle') { var p = [0.3, 0.02, 1.2]; var k = p.findIndex(function (v) { return Math.abs(v - el) < 0.12; }); el = p[(k + 1) % p.length]; markInput(); }
      else if (a === 'close') deselect();
      requestRender();
    });

    /* ----- loop ----- */
    function requestRender() { if (visible && !rafId) { last = performance.now(); rafId = requestAnimationFrame(frame); } }
    function setVisible(v) { visible = v; if (v) requestRender(); else { cancelAnimationFrame(rafId); rafId = 0; } }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { setVisible(en[0].isIntersecting); }, { rootMargin: '80px' }).observe(stage); else setVisible(true);
    document.addEventListener('visibilitychange', function () { if (document.hidden) { cancelAnimationFrame(rafId); rafId = 0; } else requestRender(); });

    var tmp = new V3(), right = new V3(), sph = new V3();
    var tanH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    function fitDist(wUnits, hUnits, fracW, fracH) {
      var dh = hUnits / (2 * tanH * fracH), dw = wUnits / (2 * tanH * camera.aspect * fracW);
      return Math.max(dh, dw);
    }
    function damp(a, b, k, dt) { return lerp(a, b, 1 - Math.exp(-k * dt)); }

    function frame(now) {
      rafId = 0;
      var dt = Math.min(0.05, (now - last) / 1000) * api.timeScale; last = now;
      var t = now / 1000, i, L;

      // progresso global: explosão em câmera lenta
      var dur = REDUCED ? 0.35 : (expT > expV ? 2.7 : 2.2);
      if (expV !== expT) { var s = dt / dur; expV = expT > expV ? Math.min(expT, expV + s) : Math.max(expT, expV - s); }
      if (intro < 1) intro = Math.min(1, intro + dt / 1.9);

      var n = layers.length, stag = 0.55, total = L_height;
      for (i = 0; i < n; i++) {
        L = layers[i];
        var dly = stag * ((n - 1 - i) / Math.max(1, n - 1));
        var p = smoother((expV * (1 + stag) - dly));
        L.tp = p;
        var ex = L.rest + i * GAP * (1 + 0.0);
        var y = lerp(L.rest, ex, p);
        // entrada: camadas "caem" e assentam, de baixo para cima
        var ip = smoother(intro * 1.7 - (i / Math.max(1, n)) * 0.7);
        y += (1 - ip) * (7 + i * 0.6);
        var bob = (exploded ? 1 : 0) * smooth(0.6, 1, p) * 0.035 * Math.sin(t * 1.15 + i * 1.3);
        L.y = y + bob; L.g.position.y = L.y;
        // destaque / esmaecer
        var targetDim = selected >= 0 && selected !== i ? 1 : 0, targetHl = (selected === i) ? 1 : (hover === i && selected < 0 ? 0.45 : 0);
        L.dim = damp(L.dim, targetDim, 6, dt); L.hl = damp(L.hl, targetHl, 8, dt);
        var pulse = 0.72 + 0.28 * Math.sin(t * 3.2);
        for (var k = 0; k < L.mats.length; k++) {
          var m = L.mats[k];
          if (m.userData.base) m.color.copy(m.userData.base).multiplyScalar(1 - 0.62 * L.dim);
          if (m.emissive) { m.emissive.copy(m.userData.em).lerp(HL, L.hl * 0.3); m.emissiveIntensity = m.userData.emi + L.hl * (0.06 + 0.05 * pulse); }
        }
      }

      // câmera
      var e = smoother(expV);
      var topY = L_height + (n - 1) * GAP, midA = L_height * 0.5, midE = topY * 0.5 - 0.25;
      var narrow = W < 620;
      var dA = fitDist(2.6, L_height + 0.5, narrow ? 0.8 : 0.52, 0.62), dE = fitDist(2.6, topY + 1.1, narrow ? 0.52 : 0.4, 0.9);
      var gD = lerp(dA, dE, e), gT = lerp(midA, midE, e), shift = 0;
      if (selected >= 0) {
        var SL = layers[selected];
        gD = Math.max(fitDist(2.7, 1.1, narrow ? 0.88 : 0.62, 0.42), 4.6); gT = SL.y; shift = gD * 0.085;
      }
      gD /= zoom;
      var introZ = 1 + (1 - smoother(intro)) * 0.55;
      camD = damp(camD, gD * introZ, selected >= 0 ? 4 : 2.6, dt);
      camT.y = damp(camT.y, gT - shift, selected >= 0 ? 4.5 : 2.6, dt);
      // rotação automática lenta quando o visitante não interage
      var idle = t - lastInput > 2.2;
      if (!REDUCED && idle && selected < 0) azVel = damp(azVel, 0.16, 1.2, dt);
      else if (!Object.keys(ptrs).length) azVel = damp(azVel, 0, 3.2, dt);
      if (!Object.keys(ptrs).length || !down) az += azVel * dt;
      var cosE = Math.cos(el), sinE = Math.sin(el);
      camera.position.set(camT.x + Math.sin(az) * cosE * camD, camT.y + sinE * camD, camT.z + Math.cos(az) * cosE * camD);
      camera.lookAt(camT.x, camT.y, camT.z);
      camera.updateMatrixWorld();

      // brasas
      var pa = embers.geometry.attributes.position;
      for (i = 0; i < NP; i++) {
        var yy = pa.getY(i) + dt * (0.12 + (i % 5) * 0.03); if (yy > 8) yy = -1; pa.setY(i, yy);
        pa.setX(i, pa.getX(i) + Math.sin(t * 0.4 + i) * dt * 0.05);
      }
      pa.needsUpdate = true;

      if (hoverPending) { hover = pick(hoverPending[0], hoverPending[1]); canvas.style.cursor = hover >= 0 || !exploded ? 'pointer' : ''; hoverPending = null; }

      renderer.render(scene, camera);
      overlay(e);

      if (expV >= 1 && exploded && !demoDone) {
        if (!frame.t1) frame.t1 = t;
        if (t - frame.t1 > 1.6) { demoDone = true; revealBuy(); }
      }
      if (visible) rafId = requestAnimationFrame(frame);
    }
    var HL = new THREE.Color(0xFFB02E);

    /* posiciona rótulos e linhas */
    function overlay(e) {
      var showLabels = e > 0.62 && selected < 0;
      labelsEl.classList.toggle('show', showLabels);
      svg.classList.toggle('show', showLabels);
      if (!showLabels && selected < 0) return;
      right.set(camera.matrixWorld.elements[0], 0, camera.matrixWorld.elements[2]).normalize();
      var cols = { 1: [], '-1': [] }, mob = W < 620, padX = mob ? 6 : 18;
      layers.forEach(function (L, i) {
        tmp.set(0, L.y, 0).addScaledVector(right, L.side * L.rim * 0.9).project(camera);
        L.ax = (tmp.x * 0.5 + 0.5) * W; L.ay = (-tmp.y * 0.5 + 0.5) * H; L.cy = L.ay;
        cols[L.side].push(L);
      });
      [1, -1].forEach(function (sd) {
        var c = cols[sd].sort(function (a, b) { return a.ay - b.ay; }), prevB = 6;
        c.forEach(function (L) {
          var h = labelEls[L.i]._h || 60, top = Math.max(prevB, L.ay - h / 2); L.cy = top + h / 2; prevB = top + h + 6;
        });
        var over = prevB - (H - 6);          // sobrou além da base: empurra tudo p/ cima
        if (over > 0) for (var k = c.length - 1; k >= 0; k--) { c[k].cy -= over; }
      });
      layers.forEach(function (L, i) {
        var el_ = labelEls[i], w = el_._w || 220, h = el_._h || 60, x = L.side > 0 ? W - padX - w : padX, y = L.cy - h / 2;
        el_.style.transform = 'translate(' + x + 'px,' + y + 'px)';
        var ex = L.side > 0 ? x : x + w;
        lineEls[i].setAttribute('points', ex + ',' + L.cy + ' ' + (L.ax + L.side * 26) + ',' + L.cy + ' ' + L.ax + ',' + L.ay);
        dotEls[i].setAttribute('cx', L.ax); dotEls[i].setAttribute('cy', L.ay);
      });
    }

    // inicialização
    resize();
    setBurger(ids[0]);
    canvas.tabIndex = 0;
    if (loadEl) loadEl.hidden = true;
    root.classList.add('b3d-ready');
    markInput(); lastInput = -99;
    requestRender();

    // API pública (usada também nos testes automatizados)
    api.explode = explode; api.assemble = assemble; api.select = select; api.setBurger = setBurger;
    api.state = function () { return { exploded: exploded, selected: selected, expV: expV, cur: cur, layers: layers.length, size: [W, H] }; };
    api.camera = function (a, e_) { if (a != null) az = a; if (e_ != null) el = e_; markInput(); requestRender(); };
    root._b3d = api;
  }

  window.BurgerExperience = { init: init };
})();
