/* ==========================================================================
   Oficialfarma · Ômega 3 — cápsulas softgel 3D do hero
   Three.js r149 (vendor/three.min.js, global THREE). Tudo é procedural:
   geometria, mapa de ambiente, normal map da costura e shaders auxiliares.

   Contrato:
     window.Capsules3D.mount(container, { reducedMotion }) → { destroy() } | null
   - Cria o próprio <canvas> transparente (aria-hidden, pointer-events:none).
   - Adiciona .is-ready ao container depois do primeiro frame desenhado.
   - Retorna null (sem lançar erro) se o WebGL não estiver disponível.
   Opcional: options.backdrop (cor CSS) — cor do fundo "visto" através das
   cápsulas; se omitida, é lida do primeiro ancestral com fundo opaco.
   ========================================================================== */
(function () {
  'use strict';

  var NOOP = { mount: function () { return null; } };
  var THREE = window.THREE;
  if (!THREE || !THREE.WebGLRenderer || !THREE.LatheGeometry) { window.Capsules3D = NOOP; return; }
  if (THREE.ColorManagement) THREE.ColorManagement.legacyMode = false;

  var DEG = Math.PI / 180;
  var FOV = 28, CAM_Z = 11;
  /* Passes de desenho, de trás para frente. blur = desfoque (profundidade de
     campo falsa) relativo à altura do palco; 0 = direto no canvas, nítido. */
  var PASSES = [
    { layer: 1, blur: 0.0022, iters: 1 },
    { layer: 2, blur: 0, iters: 0 },
    { layer: 3, blur: 0.0042, iters: 2 }
  ];
  var PAPER = '#F4F2EE';

  /* Softgel: raio, meia-altura e expoente da superelipse do perfil. */
  var GEL_R = 0.215, GEL_H = 0.5, GEL_P = 2.35;

  /* Composição em coordenadas normalizadas do palco (-1..1), profundidade z
     em unidades de mundo (câmera em z = 11). O miolo (~40%) fica livre para
     a foto do frasco, que fica por cima do canvas.
     [x, y, z, escala, giro no plano (graus), inclinação p/ câmera (graus), camada 0 fundo · 1 meio · 2 frente] */
  var LAYOUT = [
    // fundo — menores, distantes, levemente desfocadas
    [-0.38, 0.86, -4.5, 0.90, 38, 18, 0],
    [0.52, 0.72, -5.0, 0.85, -62, -14, 0],
    [-0.92, 0.10, -4.0, 0.90, 82, 28, 0],
    [0.95, -0.18, -5.5, 0.85, -18, 34, 0],
    [0.30, -0.86, -4.6, 0.85, 22, -24, 0],
    // plano médio (nítido) — moldura em volta do frasco
    [-0.72, 0.50, 0.4, 1.15, -32, 26, 1],
    [0.80, 0.30, 0.0, 1.00, 56, -20, 1],
    [0.62, -0.40, 1.0, 1.25, -64, 14, 1],
    [-0.66, -0.48, 0.6, 1.00, 14, 36, 1],
    [0.10, 0.84, -1.2, 0.85, 76, 10, 1],
    [-0.30, -0.88, 1.6, 1.05, -16, -30, 1],
    // primeiro plano — grandes, desfocadas, cortadas pela borda
    [-0.86, -0.84, 5.0, 1.00, 40, 22, 2],
    [0.92, 0.80, 4.6, 0.95, -36, -26, 2]
  ];

  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeOutCubic(t) { t = clamp(t, 0, 1); return 1 - Math.pow(1 - t, 3); }
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ------------------------------------------------------------ geometria */
  /* Perfil de softgel oblonga (superelipse girada): mais "cheia" que a
     CapsuleGeometry. Pontos com espaçamento cossenoidal (densos nas pontas) e
     normais analíticas — sem facetas nem costura de sombreamento. */
  function softgelGeometry(r, h, p, radial, rings) {
    var pts = [], e = 2 / p, i;
    for (i = 0; i <= rings; i++) {
      var t = -Math.PI / 2 + Math.PI * (0.5 - 0.5 * Math.cos(Math.PI * i / rings));
      var c = Math.cos(t), s = Math.sin(t);
      var x = (i === 0 || i === rings) ? 0 : r * Math.pow(Math.abs(c), e);
      pts.push(new THREE.Vector2(x, h * (s < 0 ? -1 : 1) * Math.pow(Math.abs(s), e)));
    }
    var geo = new THREE.LatheGeometry(pts, radial);
    var pos = geo.attributes.position, nor = geo.attributes.normal, n = new THREE.Vector3();
    for (i = 0; i < pos.count; i++) {
      var X = pos.getX(i), Y = pos.getY(i), Z = pos.getZ(i), rho = Math.sqrt(X * X + Z * Z);
      if (rho < 1e-6) n.set(0, Y < 0 ? -1 : 1, 0);
      else {
        var nr = Math.pow(rho / r, p - 1) / r;
        n.set(nr * X / rho, (Y < 0 ? -1 : 1) * Math.pow(Math.abs(Y) / h, p - 1) / h, nr * Z / rho).normalize();
      }
      nor.setXYZ(i, n.x, n.y, n.z);
    }
    return geo;
  }

  /* Normal map 1D da costura longitudinal da softgel (u = 0 e u = 0,5). */
  function seamNormalMap() {
    var W = 512, data = new Uint8Array(W * 4), w = 0.0065;
    for (var i = 0; i < W; i++) {
      var u = (i + 0.5) / W, d = ((u + 0.25) % 0.5) - 0.25, q = d / w;
      var nx = -2 * q * Math.exp(-q * q) * 0.9, l = Math.sqrt(nx * nx + 1);
      data[i * 4] = Math.round((nx / l * 0.5 + 0.5) * 255);
      data[i * 4 + 1] = 128;
      data[i * 4 + 2] = Math.round((1 / l * 0.5 + 0.5) * 255);
      data[i * 4 + 3] = 255;
    }
    var tex = new THREE.DataTexture(data, W, 1);
    tex.wrapS = THREE.RepeatWrapping;
    tex.magFilter = THREE.LinearFilter;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.generateMipmaps = true;
    tex.needsUpdate = true;
    return tex;
  }

  /* ------------------------------------------------ ambiente procedural */
  /* Estúdio fotográfico mínimo: cúpula em gradiente quente + softboxes
     emissivas. Vira um env map PMREM para reflexos e clearcoat. */
  function studioEnvironment(renderer) {
    var env = new THREE.Scene(), trash = [];
    var dome = new THREE.SphereGeometry(30, 48, 24);
    var col = [], pos = dome.attributes.position, c = new THREE.Color();
    var top = new THREE.Color(0xF2E8DC), mid = new THREE.Color(0x8C8178), low = new THREE.Color(0x24170E);
    for (var i = 0; i < pos.count; i++) {
      var y = pos.getY(i) / 30;
      if (y > 0) c.copy(mid).lerp(top, Math.pow(y, 0.7)); else c.copy(mid).lerp(low, Math.pow(-y, 0.55));
      col.push(c.r * 0.7, c.g * 0.7, c.b * 0.7);
    }
    dome.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    var domeMat = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide });
    env.add(new THREE.Mesh(dome, domeMat));
    trash.push(dome, domeMat);

    var plane = new THREE.PlaneGeometry(1, 1);
    trash.push(plane);
    function panel(w, h, x, y, z, hex, k) {
      var m = new THREE.MeshBasicMaterial({ color: hex, side: THREE.DoubleSide });
      m.color.multiplyScalar(k);
      var p = new THREE.Mesh(plane, m);
      p.scale.set(w, h, 1); p.position.set(x, y, z); p.lookAt(0, 0, 0);
      env.add(p); trash.push(m);
    }
    panel(9, 6, -7, 9, 9, 0xFFF3E2, 12);     // softbox principal (alto, esquerda, frente)
    panel(1.4, 14, -12, 1, 3, 0xFFFFFF, 14); // tira vertical esquerda — riscos longos de brilho
    panel(1.1, 12, 12, 0, -2, 0xFFE9CC, 8); // tira direita
    panel(12, 2, 0, 13, -1, 0xFFFFFF, 4);   // teto
    panel(8, 8, 3, 2, -14, 0xFFB45A, 5);    // contraluz quente (aro)

    var pm = new THREE.PMREMGenerator(renderer);
    var rt = pm.fromScene(env, 0.03);
    pm.dispose();
    trash.forEach(function (o) { o.dispose(); });
    return rt;
  }

  /* --------------------------------------------------------- shaders */
  /* Núcleo do óleo: só é visto refratado através da casca (passe de
     transmissão). Centro dourado claro, bordas âmbar profundo e um ponto
     cáustico no lado oposto à luz principal. */
  var CORE_VS = [
    'varying vec3 vN;', 'varying vec3 vV;',
    'void main(){',
    '  vec4 mv = modelViewMatrix * vec4(position, 1.0);',
    '  vN = normalize(normalMatrix * normal);',
    '  vV = normalize(-mv.xyz);',
    '  gl_Position = projectionMatrix * mv;',
    '}'
  ].join('\n');
  var CORE_FS = [
    'uniform vec3 uHot; uniform vec3 uDeep; uniform vec3 uCaustic; uniform vec3 uLight; uniform vec3 uBack;',
    'varying vec3 vN; varying vec3 vV;',
    'void main(){',
    '  vec3 n = normalize(vN), v = normalize(vV);',
    '  float f = clamp(dot(n, v), 0.0, 1.0);',
    '  vec3 c = mix(uDeep, uHot, pow(f, 1.35));',
    '  float k = pow(clamp(dot(n, normalize(v - uLight * 0.85)), 0.0, 1.0), 6.0);',
    '  c += uCaustic * k;',
    // a silhueta do núcleo se dissolve na cor de fundo: brilho difuso, sem contorno duro
    '  c = mix(uBack, c, smoothstep(0.0, 0.6, f));',
    '  gl_FragColor = vec4(c, 1.0);',
    '}'
  ].join('\n');

  var QUAD_VS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
  /* Gaussiana separável de 9 amostras com interpolação linear. */
  var BLUR_FS = [
    'uniform sampler2D tMap; uniform vec2 uDir; varying vec2 vUv;',
    'void main(){',
    '  vec4 c = texture2D(tMap, vUv) * 0.2270270270;',
    '  c += texture2D(tMap, vUv + uDir * 1.3846153846) * 0.3162162162;',
    '  c += texture2D(tMap, vUv - uDir * 1.3846153846) * 0.3162162162;',
    '  c += texture2D(tMap, vUv + uDir * 3.2307692308) * 0.0702702703;',
    '  c += texture2D(tMap, vUv - uDir * 3.2307692308) * 0.0702702703;',
    '  gl_FragColor = c;',
    '}'
  ].join('\n');
  /* Composição do primeiro plano: a textura está pré-multiplicada (fundo 0);
     desfaz a pré-multiplicação e converte para sRGB na saída. */
  var COMP_FS = [
    'uniform sampler2D tMap; varying vec2 vUv;',
    'void main(){',
    '  vec4 c = texture2D(tMap, vUv);',
    '  gl_FragColor = vec4(c.rgb / max(c.a, 0.0001), clamp(c.a, 0.0, 1.0));',
    '  #include <encodings_fragment>',
    '}'
  ].join('\n');

  /* Cor de fundo efetiva atrás do container (para o passe de transmissão). */
  function readBackdrop(el, override) {
    var c = new THREE.Color();
    if (override != null) { try { c.set(override); return c; } catch (e) { /* segue */ } }
    for (var n = el; n && n.nodeType === 1; n = n.parentElement) {
      var m = /rgba?\(([^)]+)\)/.exec(getComputedStyle(n).backgroundColor || '');
      if (!m) continue;
      var p = m[1].split(/[\s,\/]+/).filter(Boolean).map(parseFloat);
      if (p.length >= 3 && (p.length < 4 || p[3] > 0.6)) {
        c.setStyle('rgb(' + Math.round(p[0]) + ',' + Math.round(p[1]) + ',' + Math.round(p[2]) + ')');
        return c;
      }
    }
    return c.set(PAPER);
  }

  /* ============================================================== mount */
  function mount(container, options) {
    if (!container || container.nodeType !== 1) return null;
    options = options || {};
    var reduced = !!options.reducedMotion;

    var canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.setAttribute('tabindex', '-1');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;' +
      'opacity:0;' + (reduced ? '' : 'transition:opacity .9s cubic-bezier(.2,.7,.2,1);');

    // Testa o contexto antes do three (que registra console.error ao falhar).
    var attrs = { alpha: true, antialias: true, depth: true, stencil: false, premultipliedAlpha: true,
      preserveDrawingBuffer: false, powerPreference: 'high-performance' };
    var gl = null;
    try { gl = canvas.getContext('webgl2', attrs) || canvas.getContext('webgl', attrs); } catch (e) { gl = null; }
    if (!gl) return null;

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, context: gl, alpha: true, antialias: true,
        premultipliedAlpha: true, stencil: false, powerPreference: 'high-performance' });
    } catch (e) { return null; }

    var api = null;
    try { api = build(); } catch (err) {
      if (window.console) console.warn('[Capsules3D] falha ao iniciar a cena:', err);
      try { renderer.dispose(); renderer.forceContextLoss(); } catch (e) { /* nada */ }
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      container.classList.remove('is-ready');
      return null;
    }
    return api;

    function build() {
      renderer.setClearColor(0x000000, 0);
      renderer.autoClear = false;
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;
      renderer.physicallyCorrectLights = true;
      container.appendChild(canvas);

      var backdrop = readBackdrop(container, options.backdrop);
      var transparentBlack = new THREE.Color(0x000000);

      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(FOV, 1, 0.5, 40);
      camera.position.set(0, 0, CAM_Z);

      var envRT = studioEnvironment(renderer);
      scene.environment = envRT.texture;

      // Luzes diretas só geram brilho especular (a transmissão substitui o difuso).
      var key = new THREE.DirectionalLight(0xFFF2DE, 3.2);
      key.position.set(-4, 6, 6);
      var rim = new THREE.DirectionalLight(0xFFB04A, 5.0);
      rim.position.set(5, 3, -6);
      var fill = new THREE.DirectionalLight(0xFFFFFF, 1.2);
      fill.position.set(6, -2, 5);
      [key, rim, fill].forEach(function (l) { l.layers.enableAll(); scene.add(l); });
      var lightView = new THREE.Vector3();

      /* ----- materiais ----- */
      var seamTex = seamNormalMap();
      var shellMat = new THREE.MeshPhysicalMaterial({
        color: 0xFFEFD0,
        metalness: 0,
        roughness: 0.12,
        transmission: 1,
        ior: 1.45,
        thickness: 0.38,
        attenuationColor: new THREE.Color(0xEA9218),
        attenuationDistance: 0.52,
        clearcoat: 1,
        clearcoatRoughness: 0.035,
        specularIntensity: 1,
        envMapIntensity: 1.1,
        normalMap: seamTex,
        normalScale: new THREE.Vector2(0.3, 0.3)
      });
      // Caminho óptico maior perto da silhueta → bordas âmbar mais profundas.
      var edgeThick = { value: 3.2 };
      shellMat.onBeforeCompile = function (sh) {
        sh.uniforms.uEdgeThick = edgeThick;
        // os #include ainda não foram expandidos aqui: troca o chunk inteiro
        sh.fragmentShader = 'uniform float uEdgeThick;\n' + sh.fragmentShader.replace(
          '#include <transmission_fragment>',
          THREE.ShaderChunk.transmission_fragment.replace(
            'material.thickness = thickness;',
            'material.thickness = thickness * ( 1.0 + uEdgeThick * pow( 1.0 - saturate( dot( normal, normalize( vViewPosition ) ) ), 2.0 ) );'
          )
        );
      };
      var coreMat = new THREE.ShaderMaterial({
        uniforms: {
          uHot: { value: new THREE.Color(0xFFF4D0).multiplyScalar(2.0) },
          uDeep: { value: new THREE.Color(0xB05008) },
          uCaustic: { value: new THREE.Color(0xFFF8E0).multiplyScalar(2.2) },
          uLight: { value: lightView },
          uBack: { value: backdrop }
        },
        vertexShader: CORE_VS,
        fragmentShader: CORE_FS
      });

      var gelGeo = softgelGeometry(GEL_R, GEL_H, GEL_P, 48, 36);

      /* ----- cápsulas ----- */
      var R = rng(20249);
      var counts = PASSES.map(function () { return 0; });
      var caps = LAYOUT.map(function (d, i) {
        var pass = PASSES[d[6]];
        var shell = new THREE.Mesh(gelGeo, shellMat);
        var core = new THREE.Mesh(gelGeo, coreMat);
        core.scale.setScalar(0.72);
        shell.add(core);
        shell.layers.set(pass.layer); core.layers.set(pass.layer);
        counts[d[6]]++;
        scene.add(shell);
        return {
          mesh: shell, nx: d[0], ny: d[1], z: d[2], s: d[3],
          rz: d[4] * DEG, rx: d[5] * DEG, ry: R() * Math.PI * 2,
          px: 0, py: 0,
          ph: R() * Math.PI * 2,
          bobW: 0.55 + R() * 0.35, bobA: 0.05 + R() * 0.05,
          wobA: 0.16 + R() * 0.12,
          roll: (R() < 0.5 ? -1 : 1) * (0.05 + R() * 0.08),
          spin: (R() < 0.5 ? -1 : 1) * (0.12 + R() * 0.16),
          delay: i * 0.045 + R() * 0.12,
          // deslocamento de entrada: vem "de fora" do miolo
          inX: d[0] * 0.6, inY: d[1] * 0.4 - 0.5
        };
      });

      /* ----- pós: desfoque das camadas de fundo e de frente ----- */
      var isGL2 = renderer.capabilities.isWebGL2;
      var halfOK = renderer.extensions.has('EXT_color_buffer_half_float') ||
        (isGL2 && renderer.extensions.has('EXT_color_buffer_float'));
      var rtType = halfOK ? THREE.HalfFloatType : THREE.UnsignedByteType;
      var rtA = new THREE.WebGLRenderTarget(1, 1, { type: rtType, depthBuffer: true, stencilBuffer: false });
      var rtB = new THREE.WebGLRenderTarget(1, 1, { type: rtType, depthBuffer: false, stencilBuffer: false });
      var quadGeo = new THREE.PlaneGeometry(2, 2);
      var blurMat = new THREE.ShaderMaterial({
        uniforms: { tMap: { value: null }, uDir: { value: new THREE.Vector2() } },
        vertexShader: QUAD_VS, fragmentShader: BLUR_FS,
        blending: THREE.NoBlending, depthTest: false, depthWrite: false, toneMapped: false
      });
      var compMat = new THREE.ShaderMaterial({
        uniforms: { tMap: { value: null } },
        vertexShader: QUAD_VS, fragmentShader: COMP_FS,
        transparent: true, depthTest: false, depthWrite: false, toneMapped: false
      });
      var quad = new THREE.Mesh(quadGeo, blurMat);
      quad.frustumCulled = false;
      var quadScene = new THREE.Scene();
      quadScene.add(quad);
      var quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

      /* ----- estado ----- */
      var W = 0, H = 0, dpr = 1, blurBase = 1;
      var time = reduced ? 3.2 : 0, intro = reduced ? 1e3 : 0;
      var running = false, raf = 0, last = 0, inView = true, ready = false, destroyed = false, lost = false;
      var ptr = { x: 0, y: 0, tx: 0, ty: 0 };
      var scr = { v: 0, t: 0 };
      var euler = new THREE.Euler(0, 0, 0, 'ZXY');
      var sizeK = 1;

      function layout() {
        var aspect = W / H, t = Math.tan(FOV * DEG / 2);
        // palco muito estreito: cápsulas um pouco menores para não invadir o frasco
        sizeK = clamp(aspect / 0.9, 0.78, 1.08);
        for (var i = 0; i < caps.length; i++) {
          var c = caps[i], hh = (CAM_Z - c.z) * t;
          c.px = c.nx * hh * aspect;
          c.py = c.ny * hh;
        }
      }

      function resize() {
        var w = container.clientWidth, h = container.clientHeight;
        if (!w || !h) return false;
        var small = (window.innerWidth || w) < 768;
        var nd = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2);
        if (w === W && h === H && nd === dpr) return false;
        W = w; H = h; dpr = nd;
        renderer.setPixelRatio(dpr);
        renderer.setSize(W, H, false);
        camera.aspect = W / H;
        camera.updateProjectionMatrix();
        var bw = Math.max(1, Math.round(W * dpr / 2)), bh = Math.max(1, Math.round(H * dpr / 2));
        rtA.setSize(bw, bh); rtB.setSize(bw, bh);
        blurBase = H * dpr / 2;
        layout();
        readScroll();
        return true;
      }

      function readScroll() {
        if (reduced) return;
        var r = container.getBoundingClientRect(), vh = window.innerHeight || 1;
        scr.t = clamp((vh / 2 - (r.top + r.height / 2)) / vh, -1, 1);
      }

      function update(dt) {
        time += dt; intro += dt;
        var k = 1 - Math.exp(-dt * 3.2);
        ptr.x = lerp(ptr.x, ptr.tx, k); ptr.y = lerp(ptr.y, ptr.ty, k);
        scr.v = lerp(scr.v, scr.t, 1 - Math.exp(-dt * 5));

        // parallax: a câmera desliza; o plano z = 0 (frasco) fica como pivô
        camera.position.set(ptr.x * 0.55, -ptr.y * 0.4 - scr.v * 0.35, CAM_Z);
        camera.lookAt(0, -scr.v * 0.35, 0);

        lightView.copy(key.position).normalize().transformDirection(camera.matrixWorldInverse);

        for (var i = 0; i < caps.length; i++) {
          var c = caps[i], m = c.mesh;
          var e = easeOutCubic((intro - c.delay) / 1.5);
          var depth = (c.z + 6) / 11;              // 0 (fundo) … 1 (frente)
          var bob = Math.sin(time * c.bobW + c.ph) * c.bobA;
          var lift = scr.v * (0.4 + depth * 1.6);  // rolagem: a frente sobe mais rápido
          m.position.set(
            c.px + c.inX * (1 - e),
            c.py + bob + lift + c.inY * (1 - e),
            c.z
          );
          euler.set(
            c.rx + Math.sin(time * c.bobW * 0.7 + c.ph) * c.wobA + ptr.y * 0.18,
            c.ry + time * c.spin,
            c.rz + time * c.roll + scr.v * 0.5 * (c.roll < 0 ? -1 : 1) + ptr.x * 0.12 + (1 - e) * 0.8,
            'ZXY'
          );
          m.quaternion.setFromEuler(euler);
          m.scale.setScalar(c.s * sizeK * lerp(0.55, 1, e));
        }
      }

      function blurPass(src, dst, dx, dy, spread) {
        blurMat.uniforms.tMap.value = src.texture;
        blurMat.uniforms.uDir.value.set(dx * spread / src.width, dy * spread / src.height);
        quad.material = blurMat;
        renderer.setRenderTarget(dst);
        renderer.render(quadScene, quadCam);
      }

      function draw() {
        if (!W || !H || lost) return;
        camera.updateMatrixWorld();

        // Canvas transparente; a cor de fundo só é usada pelo passe de transmissão
        // do three (que limpa com a clear color atual) — assim o vidro "vê" a página.
        renderer.setRenderTarget(null);
        renderer.setClearColor(transparentBlack, 0);
        renderer.clear(true, true, false);

        for (var i = 0; i < PASSES.length; i++) {
          var p = PASSES[i];
          if (!counts[i]) continue;
          camera.layers.set(p.layer);
          if (!p.blur) {
            renderer.setRenderTarget(null);
            renderer.setClearColor(backdrop, 1);
            renderer.render(scene, camera);
            continue;
          }
          // camada desfocada: meia resolução → gaussiana → compõe por cima
          renderer.setRenderTarget(rtA);
          renderer.setClearColor(transparentBlack, 0);
          renderer.clear(true, true, false);
          renderer.setClearColor(backdrop, 1);
          renderer.render(scene, camera);
          var spread = Math.max(0.6, blurBase * p.blur);
          for (var k = 0; k < p.iters; k++) {
            blurPass(rtA, rtB, 1, 0, spread);
            blurPass(rtB, rtA, 0, 1, spread);
            spread *= 0.55;
          }
          renderer.setRenderTarget(null);
          compMat.uniforms.tMap.value = rtA.texture;
          quad.material = compMat;
          renderer.render(quadScene, quadCam);
        }
        renderer.setClearColor(transparentBlack, 0);

        if (!ready) {
          ready = true;
          canvas.style.opacity = '1';
          container.classList.add('is-ready');
        }
      }

      function renderOnce() {
        if (destroyed) return;
        update(0);
        draw();
      }

      /* ----- laço ----- */
      function frame(now) {
        raf = 0;
        if (!running) return;
        var dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        update(Math.max(dt, 0));
        draw();
        raf = requestAnimationFrame(frame);
      }
      function start() {
        if (running) return;
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
      function stop() {
        running = false;
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
      }
      var dirty = false;
      function sync() {
        if (destroyed) return;
        var active = inView && !document.hidden && !lost && W > 0;
        if (reduced) {
          if (active && dirty) { dirty = false; renderOnce(); }
          return;
        }
        if (active) start(); else stop();
      }

      /* ----- eventos ----- */
      function onResize() {
        if (destroyed) return;
        if (!resize()) return;
        // redesenha já: mudar o tamanho do canvas o apaga
        if (inView && !document.hidden) renderOnce(); else dirty = true;
        sync();
      }
      function onPointer(e) {
        var vw = window.innerWidth || 1, vh = window.innerHeight || 1;
        ptr.tx = clamp(e.clientX / vw * 2 - 1, -1, 1);
        ptr.ty = clamp(e.clientY / vh * 2 - 1, -1, 1);
      }
      function onScroll() { readScroll(); }
      function onVisibility() { sync(); }
      function onLost(e) {
        e.preventDefault();
        lost = true; stop();
        container.classList.remove('is-ready'); ready = false;
      }
      function onRestored() {
        lost = false; dirty = true;
        renderOnce();
        sync();
      }

      var ro = null, io = null;
      if (window.ResizeObserver) { ro = new ResizeObserver(onResize); ro.observe(container); }
      else window.addEventListener('resize', onResize);
      if (window.IntersectionObserver) {
        io = new IntersectionObserver(function (entries) {
          inView = entries[entries.length - 1].isIntersecting;
          sync();
        }, { rootMargin: '120px 0px' });
        io.observe(container);
      }
      document.addEventListener('visibilitychange', onVisibility);
      canvas.addEventListener('webglcontextlost', onLost, false);
      canvas.addEventListener('webglcontextrestored', onRestored, false);
      if (!reduced) {
        window.addEventListener('pointermove', onPointer, { passive: true });
        window.addEventListener('scroll', onScroll, { passive: true });
      }

      // Primeiro frame imediato (se já houver tamanho); o resto segue o laço.
      if (resize()) renderOnce(); else dirty = true;
      sync();

      function destroy() {
        if (destroyed) return;
        destroyed = true;
        stop();
        if (ro) ro.disconnect(); else window.removeEventListener('resize', onResize);
        if (io) io.disconnect();
        document.removeEventListener('visibilitychange', onVisibility);
        window.removeEventListener('pointermove', onPointer, { passive: true });
        window.removeEventListener('scroll', onScroll, { passive: true });
        canvas.removeEventListener('webglcontextlost', onLost, false);
        canvas.removeEventListener('webglcontextrestored', onRestored, false);

        gelGeo.dispose(); quadGeo.dispose();
        shellMat.dispose(); coreMat.dispose(); blurMat.dispose(); compMat.dispose();
        seamTex.dispose(); envRT.dispose(); rtA.dispose(); rtB.dispose();
        scene.environment = null;
        renderer.dispose();
        try { renderer.forceContextLoss(); } catch (e) { /* nada */ }
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
        container.classList.remove('is-ready');
      }

      return { destroy: destroy };
    }
  }

  window.Capsules3D = { mount: mount };
})();
