/* Oliveira & Cavanholi — cena 3D (Three.js r149, global THREE).
   Objeto central: núcleo azul-marinho envolto por malha de dados dourada,
   anéis giroscópicos e um anel de barras (gráfico circular), com partículas.
   O objeto muda de pose conforme a seção visível (transições cinematográficas). */
(function () {
  'use strict';
  window.OC3D = { start: start };

  function start(canvas, opts) {
    var THREE = window.THREE;
    if (!THREE) return false;
    var REDUCE = !!(opts && opts.reduce);
    var isMobile = function () { return innerWidth / Math.max(1, innerHeight) < 1.05 || innerWidth < 760; };

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: (window.devicePixelRatio || 1) < 2, alpha: true, powerPreference: 'high-performance' });
    } catch (e) { return false; }
    var maxDPR = isMobile() ? 1.5 : 1.75;
    var dpr = Math.min(window.devicePixelRatio || 1, maxDPR);
    renderer.setPixelRatio(dpr);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setClearColor(0x000000, 0);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(38, 1, .1, 60);
    camera.position.set(0, 0, 8);

    /* ---- ambiente para reflexos (estúdio procedural, sem arquivos HDR) ---- */
    var pmrem = new THREE.PMREMGenerator(renderer);
    var env = new THREE.Scene();
    env.add(new THREE.Mesh(new THREE.BoxGeometry(12, 12, 12), new THREE.MeshBasicMaterial({ color: 0x050b16, side: THREE.BackSide })));
    function painel(cor, k, w, h, pos, look) {
      var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(cor).multiplyScalar(k), side: THREE.DoubleSide }));
      m.position.set(pos[0], pos[1], pos[2]); m.lookAt(look[0], look[1], look[2]); env.add(m);
    }
    painel(0xffffff, 3.2, 8, 3, [0, 5.5, 1], [0, 0, 0]);      // softbox superior
    painel(0xE7CD94, 2.6, 3, 7, [-5.5, 0, 2], [0, 0, 0]);    // rebatedor dourado
    painel(0x6f8fc7, 1.6, 3, 6, [5.5, -.5, -1], [0, 0, 0]);  // contraluz azul
    painel(0xffffff, 1.2, 4, 1, [0, -5, 3], [0, 0, 0]);
    scene.environment = pmrem.fromScene(env, .035).texture;
    pmrem.dispose();

    /* ---- luzes ---- */
    scene.add(new THREE.AmbientLight(0x22385f, .45));
    var key = new THREE.DirectionalLight(0xfff1d6, 1.8); key.position.set(4, 5, 6); scene.add(key);
    var goldL = new THREE.PointLight(0xC9A45C, 2.2, 14); goldL.position.set(-3.5, 1.2, 3); scene.add(goldL);
    var blueL = new THREE.PointLight(0x4f6a99, 2, 14); blueL.position.set(3, -2, -3); scene.add(blueL);

    /* ---- materiais ---- */
    var navy = new THREE.MeshPhysicalMaterial({ color: 0x0b1a33, metalness: .55, roughness: .16, clearcoat: 1, clearcoatRoughness: .08, envMapIntensity: 1.5 });
    var gold = new THREE.MeshStandardMaterial({ color: 0xD4AF62, metalness: 1, roughness: .22, envMapIntensity: 1.6 });
    var goldSoft = new THREE.MeshStandardMaterial({ color: 0xC9A45C, metalness: .9, roughness: .35, envMapIntensity: 1.2 });
    var navyBar = new THREE.MeshStandardMaterial({ color: 0x16294a, metalness: .7, roughness: .3, envMapIntensity: 1.2 });

    /* ---- hierarquia: pose (rolagem) > tilt (cursor) > objeto ---- */
    var pose = new THREE.Group(), tilt = new THREE.Group(), obj = new THREE.Group();
    scene.add(pose); pose.add(tilt); tilt.add(obj);
    obj.rotation.x = .25;

    // núcleo
    var core = new THREE.Mesh(new THREE.SphereGeometry(.68, 64, 40), navy);
    obj.add(core);
    // faixa equatorial dourada no núcleo
    var band = new THREE.Mesh(new THREE.TorusGeometry(.69, .025, 16, 96), gold);
    band.rotation.x = Math.PI / 2; obj.add(band);

    // malha de dados (icosaedro): arestas douradas + nós
    var ico = new THREE.IcosahedronGeometry(1.18, 1);
    var edges = new THREE.LineSegments(new THREE.EdgesGeometry(ico), new THREE.LineBasicMaterial({ color: 0xE7CD94, transparent: true, opacity: .55 }));
    var shell = new THREE.Group(); shell.add(edges); obj.add(shell);
    var vpos = ico.attributes.position, uniq = {}, verts = [];
    for (var i = 0; i < vpos.count; i++) {
      var k = vpos.getX(i).toFixed(3) + ',' + vpos.getY(i).toFixed(3) + ',' + vpos.getZ(i).toFixed(3);
      if (!uniq[k]) { uniq[k] = 1; verts.push(new THREE.Vector3(vpos.getX(i), vpos.getY(i), vpos.getZ(i))); }
    }
    var nodes = new THREE.InstancedMesh(new THREE.SphereGeometry(.045, 12, 8), gold, verts.length);
    var m4 = new THREE.Matrix4();
    verts.forEach(function (v, j) { m4.makeTranslation(v.x, v.y, v.z); nodes.setMatrixAt(j, m4); });
    shell.add(nodes);

    // anéis giroscópicos
    var rings = [];
    [[1.62, .022, .9, .2], [1.82, .016, -.4, 1.1], [2.02, .012, 1.3, -.6]].forEach(function (r, j) {
      var g = new THREE.Group();
      var t = new THREE.Mesh(new THREE.TorusGeometry(r[0], r[1], 16, 160), j === 0 ? gold : goldSoft);
      g.add(t);
      // pequena "pérola" que percorre o anel
      var p = new THREE.Mesh(new THREE.SphereGeometry(r[1] * 3.2, 16, 12), gold); p.position.x = r[0]; g.add(p);
      g.rotation.set(r[2], r[3], 0);
      obj.add(g); rings.push({ g: g, t: t, speed: (j % 2 ? -1 : 1) * (.25 + j * .12) });
    });

    // anel de barras (gráfico circular de dados)
    var NB = 44, R = 2.55, barGeo = new THREE.BoxGeometry(.075, 1, .075); barGeo.translate(0, .5, 0);
    var bars = new THREE.InstancedMesh(barGeo, navyBar, NB), caps = new THREE.InstancedMesh(new THREE.BoxGeometry(.09, .03, .09), gold, NB);
    var heights = [];
    for (var b = 0; b < NB; b++) heights.push(.18 + .55 * (.5 + .5 * Math.sin(b * .55)) * (.6 + .4 * Math.sin(b * 1.7 + 1)));
    var barRing = new THREE.Group(); barRing.add(bars); barRing.add(caps);
    barRing.position.y = -.05; barRing.rotation.x = .08;
    obj.add(barRing);
    var tmpQ = new THREE.Quaternion(), tmpS = new THREE.Vector3(), tmpP = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
    function layoutBars(time, boost) {
      for (var i = 0; i < NB; i++) {
        var a = i / NB * Math.PI * 2;
        var h = heights[i] * (1 + .18 * Math.sin(time * 1.4 + i * .4) * (REDUCE ? 0 : 1)) * (1 + boost * 1.2);
        tmpP.set(Math.cos(a) * R, -h / 2, Math.sin(a) * R);
        tmpQ.setFromAxisAngle(up, -a);
        tmpS.set(1, h, 1);
        m4.compose(tmpP, tmpQ, tmpS); bars.setMatrixAt(i, m4);
        tmpP.y = h / 2 + .015; tmpS.set(1, 1, 1);
        m4.compose(tmpP, tmpQ, tmpS); caps.setMatrixAt(i, m4);
      }
      bars.instanceMatrix.needsUpdate = true; caps.instanceMatrix.needsUpdate = true;
    }
    layoutBars(0, 0);

    // brilho atrás do objeto (sprite com gradiente gerado em canvas)
    var gc = document.createElement('canvas'); gc.width = gc.height = 128;
    var gx = gc.getContext('2d'), grad = gx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(201,164,92,.55)'); grad.addColorStop(.35, 'rgba(79,106,153,.22)'); grad.addColorStop(1, 'rgba(5,11,22,0)');
    gx.fillStyle = grad; gx.fillRect(0, 0, 128, 128);
    var glowTex = new THREE.CanvasTexture(gc); glowTex.encoding = THREE.sRGBEncoding;
    var glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    glow.scale.set(7.5, 7.5, 1); glow.position.z = -1.2; tilt.add(glow);

    // poeira dourada
    var NP = isMobile() ? 260 : 520, pp = new Float32Array(NP * 3);
    for (var q = 0; q < NP; q++) {
      var rr = 3 + Math.random() * 5, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
      pp[q * 3] = rr * Math.sin(ph) * Math.cos(th); pp[q * 3 + 1] = rr * Math.cos(ph) * .7; pp[q * 3 + 2] = rr * Math.sin(ph) * Math.sin(th) - 2;
    }
    var pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.Float32BufferAttribute(pp, 3));
    var dust = new THREE.Points(pg, new THREE.PointsMaterial({ color: 0xE7CD94, size: .035, transparent: true, opacity: .55, depthWrite: false, blending: THREE.AdditiveBlending }));
    scene.add(dust);

    /* ---- poses por seção ---- */
    var POSES = {
      desk: { hero: [2.05, -.1, 0, 1], left: [-3.4, .1, -.5, .78], right: [3.4, .1, -.5, .78], center: [-3.1, 0, 0, .95], far: [0, 0, -3, .62] },
      mob: { hero: [0, 1.7, -.6, .5], left: [-1.6, 1.6, -1.5, .5], right: [1.6, 1.6, -1.5, .5], center: [0, .9, 0, .62], far: [0, 0, -3, .5] }
    };
    var sections = Array.prototype.slice.call(document.querySelectorAll('[data-pose]'));
    var cur = { x: 0, y: 0, z: 0, s: 1 }, target = { x: 0, y: 0, z: 0, s: 1 }, poseName = 'hero';
    function lerTarget() {
      var mid = innerHeight / 2, name = 'hero';
      for (var i = 0; i < sections.length; i++) {
        var r = sections[i].getBoundingClientRect();
        if (r.top <= mid && r.bottom >= mid) { name = sections[i].getAttribute('data-pose'); break; }
        if (r.top > mid) break;
        name = sections[i].getAttribute('data-pose');
      }
      poseName = name;
      var p = (isMobile() ? POSES.mob : POSES.desk)[name] || POSES.desk.hero;
      target.x = p[0]; target.y = p[1]; target.z = p[2]; target.s = p[3];
    }
    lerTarget();
    cur.x = target.x; cur.y = target.y; cur.z = target.z; cur.s = target.s;

    /* ---- interação: cursor, toque, rolagem, clique ---- */
    var mouse = { x: 0, y: 0 }, tiltT = { x: 0, y: 0 }, spinVel = 0, burst = 0, lastScroll = scrollY;
    var hero = document.getElementById('inicio');
    var ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), wp = new THREE.Vector3();
    function hit(cx, cy) {
      ndc.set(cx / innerWidth * 2 - 1, -(cy / innerHeight) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      obj.getWorldPosition(wp);
      return ray.ray.distanceToPoint(wp) < 1.25 * cur.s;
    }
    addEventListener('pointermove', function (e) {
      if (e.pointerType === 'mouse') {
        mouse.x = e.clientX / innerWidth * 2 - 1; mouse.y = e.clientY / innerHeight * 2 - 1;
        if (hero && poseName === 'hero') {
          var interativo = e.target.closest && e.target.closest('a,button,input,select,textarea,label');
          hero.style.cursor = !interativo && hero.contains(e.target) && hit(e.clientX, e.clientY) ? 'pointer' : '';
        }
      }
    }, { passive: true });
    // toque: arrastar na horizontal sobre o hero gira o objeto (sem bloquear a rolagem vertical)
    var touch = null;
    if (hero) {
      hero.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') touch = { x: e.clientX, y: e.clientY }; }, { passive: true });
      hero.addEventListener('pointermove', function (e) {
        if (!touch || e.pointerType === 'mouse') return;
        var dx = e.clientX - touch.x, dy = e.clientY - touch.y;
        spinVel += dx * .0035; tiltT.x = Math.max(-.5, Math.min(.5, tiltT.x + dy * .002));
        touch.x = e.clientX; touch.y = e.clientY;
      }, { passive: true });
      ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) { hero.addEventListener(ev, function () { touch = null; }, { passive: true }); });
      hero.addEventListener('click', function (e) {
        if (e.target.closest('a,button')) return;
        if (hit(e.clientX, e.clientY)) { burst = 1; spinVel += .6; }
      });
    }
    addEventListener('scroll', function () {
      var d = scrollY - lastScroll; lastScroll = scrollY;
      if (!REDUCE) spinVel += Math.max(-40, Math.min(40, d)) * .0009;
      lerTarget();
    }, { passive: true });

    /* ---- tamanho ---- */
    var lastW = 0, lastH = 0;
    function resize() {
      var w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
      if (w === lastW && Math.abs(h - lastH) < 2) return;
      lastW = w; lastH = h;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.fov = w / h < .8 ? 48 : 38;
      camera.updateProjectionMatrix();
      lerTarget();
    }
    addEventListener('resize', resize); resize();

    /* ---- laço de animação com orçamento de desempenho ---- */
    var clock = new THREE.Clock(), t = 0, running = true, frame = 0, ms = 0, samples = 0, slowChecked = false, raf;
    function loop() {
      raf = requestAnimationFrame(loop);
      var dt = Math.min(clock.getDelta(), .05);
      frame++;
      // fora do hero/interlúdio o objeto fica atrás de painéis: 30 fps bastam
      var foco = poseName === 'hero' || poseName === 'center';
      if (!foco && frame % 2) return;
      t += dt;

      var k = REDUCE ? 1 : 1 - Math.exp(-dt * 2.6);
      cur.x += (target.x - cur.x) * k; cur.y += (target.y - cur.y) * k; cur.z += (target.z - cur.z) * k; cur.s += (target.s - cur.s) * k;
      pose.position.set(cur.x, cur.y, cur.z); pose.scale.setScalar(cur.s);

      if (!touch) { tiltT.x += (mouse.y * .32 - tiltT.x) * .05; tiltT.y += (mouse.x * .5 - tiltT.y) * .05; }
      tilt.rotation.x += (tiltT.x - tilt.rotation.x) * .08;
      tilt.rotation.y += (tiltT.y - tilt.rotation.y) * .08;

      spinVel *= Math.pow(.04, dt);
      var auto = REDUCE ? 0 : .18;
      obj.rotation.y += (auto + spinVel) * dt * 1.6;
      shell.rotation.y -= (REDUCE ? 0 : .12) * dt; shell.rotation.z += (REDUCE ? 0 : .05) * dt;
      rings.forEach(function (r) { r.t.rotation.z += r.speed * dt * (REDUCE ? 0 : 1) * (1 + burst * 3); r.g.scale.setScalar(1 + burst * .28); });
      barRing.rotation.y -= (REDUCE ? 0 : .06) * dt;
      layoutBars(t, burst);
      if (!REDUCE) { obj.position.y = Math.sin(t * .9) * .08; dust.rotation.y += dt * .015; }
      burst *= Math.pow(.15, dt);
      if (burst < .002) burst = 0;
      goldL.intensity = 2.2 + burst * 4;

      camera.position.x += (mouse.x * .25 - camera.position.x) * .03;
      camera.position.y += (-mouse.y * .18 - camera.position.y) * .03;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);

      // se o aparelho estiver lento, reduz resolução e partículas
      // (intervalo real entre quadros: inclui o tempo de GPU)
      if (!slowChecked && foco && frame > 30) {
        ms += dt * 1000; samples++;
        if (samples >= 90) {
          slowChecked = true;
          if (ms / samples > 26) { renderer.setPixelRatio(1); dust.visible = false; lastW = 0; resize(); }
        }
      }
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden && running) { running = false; cancelAnimationFrame(raf); }
      else if (!document.hidden && !running) { running = true; clock.getDelta(); loop(); }
    });
    loop();
    return true;
  }
})();
