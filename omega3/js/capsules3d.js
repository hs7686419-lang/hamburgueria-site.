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
    { layer: 1, blur: 0.0024, iters: 1 },
    { layer: 2, blur: 0, iters: 0 },
    { layer: 3, blur: 0.0046, iters: 2 }
  ];
  var PAPER = '#F4F2EE';
  /* Abaixo desta largura (px CSS) do canvas usa a composição enxuta. */
  var COMPACT_W = 470;
  /* Esmaecimento das bordas do canvas: fração do menor lado (px CSS limitados). */
  var FEATHER = 0.09, FEATHER_MIN = 18, FEATHER_MAX = 72;

  /* Softgel: raio, meia-altura e expoente da superelipse do perfil. */
  var GEL_R = 0.215, GEL_H = 0.5, GEL_P = 2.35;

  /* Composição em coordenadas normalizadas do canvas (-1..1, y para cima),
     profundidade z em unidades de mundo (câmera em z = 11). Direção de arte
     pensada para o hero real (#hero-3d com inset -6% -8% do palco): o miolo
     fica para o frasco; a diagonal ↘ liga a cápsula grande desfocada (alto,
     esquerda) à cápsula "herói" nítida (baixo, direita), e nada fica sob os
     chips "Treino" / "Foco" / "Descanso" nem sob o selo "1g". Toda cápsula
     cabe em ±0,82 depois de flutuação, ponteiro e rolagem.
     [x, y, z, escala, giro no plano (graus), inclinação p/ câmera (graus),
      camada 0 fundo · 1 meio · 2 frente, compacto: 1 igual · 0 some · [x, y, escala]] */
  var LAYOUT = [
    // fundo — pequenas, levemente desfocadas; algumas passam atrás do frasco
    [0.36, 0.60, -5.0, 0.90, -40, 20, 0, 0],
    [-0.30, 0.16, -5.5, 0.85, 70, -14, 0, [-0.30, 0.02, 0.85]],
    [0.40, -0.30, -4.6, 0.90, -20, 28, 0, 0],
    [0.04, -0.78, -4.5, 0.85, 80, 20, 0, 0],
    [-0.14, 0.52, -5.2, 0.80, -24, 30, 0, 1],
    // plano médio (nítido) — hierarquia: uma herói, uma média, duas pequenas
    [0.57, -0.63, 1.2, 1.20, 72, 20, 1, [0.58, -0.64, 1.05]],
    [0.70, 0.10, 0.6, 0.95, -18, 30, 1, [0.70, 0.06, 0.90]],
    [-0.70, -0.20, 0.4, 0.82, 14, 36, 1, 1],
    [-0.14, 0.80, -0.6, 0.75, -70, 12, 1, 1],
    // primeiro plano — grande e desfocada, longe do frasco
    [-0.52, 0.63, 4.2, 0.70, 50, 20, 2, [-0.54, 0.64, 0.62]]
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
  function loseContext(gl) {
    try { var l = gl && gl.getExtension('WEBGL_lose_context'); if (l) l.loseContext(); } catch (e) { /* nada */ }
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
  /* Estúdio fotográfico claro: cúpula em gradiente quente + softboxes
     emissivas. Vira um env map PMREM para reflexos e clearcoat. O horizonte
     é claro para que a silhueta termine em reflexo, não em contorno escuro. */
  function studioEnvironment(renderer) {
    var env = new THREE.Scene(), trash = [];
    var dome = new THREE.SphereGeometry(30, 48, 24);
    var col = [], pos = dome.attributes.position, c = new THREE.Color();
    var top = new THREE.Color(0xF6EEE4), mid = new THREE.Color(0xB3A89C), low = new THREE.Color(0x3A2C20);
    for (var i = 0; i < pos.count; i++) {
      var y = pos.getY(i) / 30;
      if (y > 0) c.copy(mid).lerp(top, Math.pow(y, 0.7)); else c.copy(mid).lerp(low, Math.pow(-y, 0.6));
      col.push(c.r * 0.72, c.g * 0.72, c.b * 0.72);
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
  var GEL_VS = [
    'varying vec3 vN;', 'varying vec3 vV;',
    'void main(){',
    '  vec4 mv = modelViewMatrix * vec4(position, 1.0);',
    '  vN = normalize(normalMatrix * normal);',
    '  vV = normalize(-mv.xyz);',
    '  gl_Position = projectionMatrix * mv;',
    '}'
  ].join('\n');
  /* Núcleo do óleo das cápsulas nítidas: só é visto refratado através da
     casca (passe de transmissão). Miolo dourado quase incandescente, corpo
     âmbar profundo e um ponto cáustico embaixo/à direita (oposto à luz). */
  var CORE_FS = [
    'uniform vec3 uHot; uniform vec3 uDeep; uniform vec3 uCaustic; uniform vec3 uLight; uniform vec3 uBack;',
    'varying vec3 vN; varying vec3 vV;',
    'void main(){',
    '  vec3 n = normalize(vN), v = normalize(vV);',
    '  float f = clamp(dot(n, v), 0.0, 1.0);',
    '  vec3 c = mix(uDeep, uHot, pow(f, 2.4));',
    '  float k = pow(clamp(dot(n, normalize(v - uLight * 0.9)), 0.0, 1.0), 3.0);',
    '  c += uCaustic * k;',
    // a silhueta do núcleo se dissolve na cor de fundo: brilho difuso, sem contorno duro
    '  c = mix(uBack, c, smoothstep(0.0, 0.55, f));',
    '  gl_FragColor = vec4(c, 1.0);',
    '}'
  ].join('\n');
  /* Cápsulas desfocadas (fundo e frente): sombreamento barato, sem passe de
     transmissão — o desfoque esconde a refração. Saída linear pré-multiplicada
     com alfa parcial: o que está atrás (frasco, disco, outras cápsulas)
     continua visível através do gel. */
  var GEL_FS = [
    'uniform vec3 uHot; uniform vec3 uDeep; uniform vec3 uRim; uniform vec3 uLight; uniform float uFace;',
    'varying vec3 vN; varying vec3 vV;',
    'void main(){',
    '  vec3 n = normalize(vN), v = normalize(vV);',
    '  float f = clamp(dot(n, v), 0.0, 1.0);',
    '  vec3 body = mix(uDeep, uHot, pow(f, 1.8));',
    '  float k = pow(clamp(dot(n, normalize(v - uLight * 0.9)), 0.0, 1.0), 3.0);',
    '  body += uHot * 0.3 * k;',
    '  float rl = clamp(dot(reflect(-v, n), uLight), 0.0, 1.0);',
    '  float spec = pow(rl, 80.0) * 2.2 + pow(rl, 9.0) * 0.22;',
    '  float fr = pow(1.0 - f, 3.0);',
    '  float a = mix(uFace, 1.0, fr);',
    '  vec3 c = body * a + uRim * fr + vec3(1.0, 0.97, 0.92) * spec;',
    '  gl_FragColor = vec4(c, clamp(a + spec * 0.5, 0.0, 1.0));',
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
  /* Composição das camadas desfocadas: a textura está pré-multiplicada
     (fundo 0); desfaz a pré-multiplicação e converte para sRGB na saída. */
  var COMP_FS = [
    'uniform sampler2D tMap; varying vec2 vUv;',
    'void main(){',
    '  vec4 c = texture2D(tMap, vUv);',
    '  gl_FragColor = vec4(c.rgb / max(c.a, 0.0001), clamp(c.a, 0.0, 1.0));',
    '  #include <encodings_fragment>',
    '}'
  ].join('\n');
  /* Máscara final: multiplica o canvas (pré-multiplicado) por uma rampa
     suave junto às quatro bordas — nada termina numa linha reta. */
  var FEATHER_FS = [
    'uniform vec2 uF; varying vec2 vUv;',
    'void main(){',
    '  vec2 d = clamp(min(vUv, 1.0 - vUv) / uF, 0.0, 1.0);',
    '  d = d * d * (3.0 - 2.0 * d);',
    '  gl_FragColor = vec4(0.0, 0.0, 0.0, d.x * d.y);',
    '}'
  ].join('\n');

  /* Saída da casca nítida: alfa parcial dependente do ângulo (o fundo da
     página aparece através do corpo), opaca nas bordas e nos brilhos, e um
     leve brilho quente na silhueta em vez de contorno escuro. Com
     premultipliedAlpha o three multiplica o rgb pelo alfa no fim. */
  var SHELL_OUT = [
    'float capNV = saturate( dot( normal, normalize( vViewPosition ) ) );',
    'outgoingLight += uRimGlow * pow( 1.0 - capNV, 4.0 );',
    'vec3 capSpec = totalSpecular;',
    '#ifdef USE_CLEARCOAT',
    '  capSpec += clearcoatSpecular * material.clearcoat;',
    '#endif',
    'float capA = mix( uFaceAlpha, 1.0, pow( 1.0 - capNV, 2.0 ) );',
    'capA += ( 1.0 - capA ) * saturate( dot( capSpec, vec3( 0.2126, 0.7152, 0.0722 ) ) * 1.5 );',
    'gl_FragColor = vec4( outgoingLight, capA );'
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

  /* Agenda trabalho pesado fora do caminho da interação. */
  var idle = window.requestIdleCallback
    ? function (fn) { return window.requestIdleCallback(fn, { timeout: 250 }); }
    : function (fn) { return setTimeout(fn, 16); };
  var cancelIdle = window.cancelIdleCallback
    ? function (h) { window.cancelIdleCallback(h); }
    : function (h) { clearTimeout(h); };

  /* ============================================================== mount */
  function mount(container, options) {
    if (!container || container.nodeType !== 1) return null;
    options = options || {};
    var reduced = !!options.reducedMotion;

    var canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;display:block;pointer-events:none;' +
      'opacity:0;' + (reduced ? '' : 'transition:opacity .9s cubic-bezier(.2,.7,.2,1);');

    // Testa o contexto antes do three (que registra console.error ao falhar).
    // O MSAA vem do próprio contexto; o three recebe antialias:false para não
    // criar um alvo de transmissão multiamostrado (resolve extra por frame).
    var attrs = { alpha: true, antialias: true, depth: true, stencil: false, premultipliedAlpha: true,
      preserveDrawingBuffer: false, powerPreference: 'high-performance' };
    var gl = null;
    try { gl = canvas.getContext('webgl2', attrs) || canvas.getContext('webgl', attrs); } catch (e) { gl = null; }
    if (!gl) return null;

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, context: gl, alpha: true, antialias: false,
        premultipliedAlpha: true, stencil: false, powerPreference: 'high-performance' });
    } catch (e) { loseContext(gl); return null; }

    var api = null, cleanup = null;
    try { api = build(); } catch (err) {
      if (window.console) console.warn('[Capsules3D] falha ao iniciar a cena:', err);
      try {
        if (cleanup) cleanup();
        else { renderer.dispose(); renderer.forceContextLoss(); }
      } catch (e) { /* nada */ }
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
      var black = new THREE.Color(0x000000);

      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(FOV, 1, 0.5, 40);
      camera.position.set(0, 0, CAM_Z);
      var envRT = null, envBuilt = false;

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
        color: 0xFFEBC8,
        metalness: 0,
        roughness: 0.12,
        transmission: 1,
        ior: 1.45,
        thickness: 0.36,
        attenuationColor: new THREE.Color(0xE8900F),
        attenuationDistance: 0.5,
        clearcoat: 1,
        clearcoatRoughness: 0.04,
        specularIntensity: 1,
        envMapIntensity: 1.1,
        normalMap: seamTex,
        normalScale: new THREE.Vector2(0.3, 0.3),
        transparent: true,
        premultipliedAlpha: true
      });
      var shellU = {
        uEdgeThick: { value: 1.4 },  // caminho óptico maior perto da silhueta (moderado)
        uFaceAlpha: { value: 0.84 },
        uRimGlow: { value: new THREE.Color(0xFFE6BC).multiplyScalar(0.55) }
      };
      var patchOK = null;
      shellMat.onBeforeCompile = function (sh) {
        sh.uniforms.uEdgeThick = shellU.uEdgeThick;
        sh.uniforms.uFaceAlpha = shellU.uFaceAlpha;
        sh.uniforms.uRimGlow = shellU.uRimGlow;
        // os #include ainda não foram expandidos aqui: troca os chunks inteiros
        var tf = THREE.ShaderChunk.transmission_fragment;
        var tf2 = tf.replace('material.thickness = thickness;',
          'material.thickness = thickness * ( 1.0 + uEdgeThick * pow( 1.0 - saturate( dot( normal, normalize( vViewPosition ) ) ), 2.0 ) );');
        var fs = sh.fragmentShader;
        patchOK = tf2 !== tf && fs.indexOf('#include <transmission_fragment>') >= 0 &&
          fs.indexOf('#include <output_fragment>') >= 0 && fs.indexOf('totalSpecular') >= 0;
        sh.fragmentShader = 'uniform float uEdgeThick;\nuniform float uFaceAlpha;\nuniform vec3 uRimGlow;\n' +
          fs.replace('#include <transmission_fragment>', tf2).replace('#include <output_fragment>', SHELL_OUT);
      };
      var coreMat = new THREE.ShaderMaterial({
        uniforms: {
          uHot: { value: new THREE.Color(0xFFD25C).multiplyScalar(1.9) },
          uDeep: { value: new THREE.Color(0xC9780F).multiplyScalar(0.62) },
          uCaustic: { value: new THREE.Color(0xFFEDB0).multiplyScalar(1.5) },
          uLight: { value: lightView },
          uBack: { value: backdrop }
        },
        vertexShader: GEL_VS,
        fragmentShader: CORE_FS
      });
      // O núcleo só existe para o passe de transmissão: no canvas não pinta
      // nem grava profundidade (senão apareceria "por trás" da casca translúcida).
      coreMat.onBeforeRender = function (r) {
        var toRT = r.getRenderTarget() !== null;
        coreMat.colorWrite = toRT; coreMat.depthWrite = toRT;
      };
      var gelMat = new THREE.ShaderMaterial({
        uniforms: {
          uHot: { value: new THREE.Color(0xFFC23C).multiplyScalar(1.05) },
          uDeep: { value: new THREE.Color(0xC9780F).multiplyScalar(0.8) },
          uRim: { value: new THREE.Color(0xFFD9A0).multiplyScalar(0.3) },
          uLight: { value: lightView },
          uFace: { value: 0.82 }
        },
        vertexShader: GEL_VS,
        fragmentShader: GEL_FS,
        transparent: true,
        premultipliedAlpha: true
      });

      var shellGeo = softgelGeometry(GEL_R, GEL_H, GEL_P, 40, 30);
      var smallGeo = softgelGeometry(GEL_R, GEL_H, GEL_P, 24, 16);

      /* ----- cápsulas ----- */
      var R = rng(20249);
      var caps = LAYOUT.map(function (d, i) {
        var layer = d[6], pass = PASSES[layer], mesh;
        if (layer === 1) {
          mesh = new THREE.Mesh(shellGeo, shellMat);
          var core = new THREE.Mesh(smallGeo, coreMat);
          core.scale.setScalar(0.74);
          core.layers.set(pass.layer);
          mesh.add(core);
        } else {
          mesh = new THREE.Mesh(smallGeo, gelMat);
        }
        mesh.layers.set(pass.layer);
        scene.add(mesh);
        return {
          mesh: mesh, layer: layer, d: d, nx: d[0], ny: d[1], z: d[2], s: d[3],
          rz: d[4] * DEG, rx: d[5] * DEG, ry: R() * Math.PI * 2,
          px: 0, py: 0, inX: 0, inY: 0, k: 1,
          ph: R() * Math.PI * 2,
          bobW: 0.55 + R() * 0.35, bobA: 0.04 + R() * 0.04,
          wobA: 0.14 + R() * 0.1,
          roll: (R() < 0.5 ? -1 : 1) * (0.04 + R() * 0.06),
          spin: (R() < 0.5 ? -1 : 1) * (0.12 + R() * 0.16),
          delay: i * 0.05 + R() * 0.12
        };
      });
      var counts = PASSES.map(function () { return 0; });

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
      var featherMat = new THREE.ShaderMaterial({
        uniforms: { uF: { value: new THREE.Vector2(0.1, 0.1) } },
        vertexShader: QUAD_VS, fragmentShader: FEATHER_FS,
        transparent: true, blending: THREE.CustomBlending, blendEquation: THREE.AddEquation,
        blendSrc: THREE.ZeroFactor, blendDst: THREE.SrcAlphaFactor,
        depthTest: false, depthWrite: false, toneMapped: false
      });
      var quad = new THREE.Mesh(quadGeo, blurMat);
      quad.frustumCulled = false;
      var quadScene = new THREE.Scene();
      quadScene.add(quad);
      var quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

      /* ----- estado ----- */
      var W = 0, H = 0, dpr = 1, blurBase = 1, compact = null;
      var time = reduced ? 3.2 : 0, intro = reduced ? 1e3 : 0;
      var running = false, raf = 0, last = 0, inView = true, ready = false, destroyed = false, lost = false;
      var live = false, dirty = false, initH = 0, firstRaf = 0;
      var ptr = { x: 0, y: 0, tx: 0, ty: 0 };
      var scr = { v: 0, t: 0 };
      var box = { top: 0, h: 0, at: -1e9 }; // posição do container no documento (cache)
      var euler = new THREE.Euler(0, 0, 0, 'ZXY');
      var sizeK = 1;

      function layout() {
        var aspect = W / H, t = Math.tan(FOV * DEG / 2), i;
        compact = W < COMPACT_W;
        // palco muito estreito: cápsulas um pouco menores para não invadir o frasco
        sizeK = clamp(aspect / 0.9, 0.78, 1.06);
        for (i = 0; i < counts.length; i++) counts[i] = 0;
        for (i = 0; i < caps.length; i++) {
          var c = caps[i], d = c.d, alt = d[7], nx = d[0], ny = d[1], s = d[3];
          var show = !compact || alt !== 0;
          if (compact && alt && alt.length) { nx = alt[0]; ny = alt[1]; s = alt[2]; }
          c.mesh.visible = show;
          if (show) counts[c.layer]++;
          var hh = (CAM_Z - c.z) * t;
          c.px = nx * hh * aspect;
          c.py = ny * hh;
          c.s = s;
          // entrada: vem "de fora" do miolo
          c.inX = nx * 0.6; c.inY = ny * 0.4 - 0.5;
        }
      }

      function measure() {
        var r = container.getBoundingClientRect();
        box.top = r.top + (window.pageYOffset || 0);
        box.h = r.height;
        box.at = performance.now();
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
        var f = clamp(Math.min(W, H) * FEATHER, FEATHER_MIN, FEATHER_MAX);
        featherMat.uniforms.uF.value.set(f / W, f / H);
        layout();
        measure();
        readScroll();
        return true;
      }

      // Só lê pageYOffset; a posição do container vem do cache (sem layout forçado).
      function readScroll() {
        if (reduced) return;
        var vh = window.innerHeight || 1, y = window.pageYOffset || 0, docC = box.top + box.h / 2;
        // 0 no topo da página (hero) ou quando o palco está centralizado; cresce ao rolar
        var start = docC < vh ? 0 : docC - vh / 2;
        scr.t = clamp((y - start) / vh, -0.6, 0.6);
      }

      function update(dt, introDt) {
        time += dt; intro += introDt === undefined ? dt : introDt;
        var k = 1 - Math.exp(-dt * 3.2);
        ptr.x = lerp(ptr.x, ptr.tx, k); ptr.y = lerp(ptr.y, ptr.ty, k);
        scr.v = lerp(scr.v, scr.t, 1 - Math.exp(-dt * 5));

        // parallax: a câmera desliza; o plano z = 0 (frasco) fica como pivô
        var cx = ptr.x * 0.45, cy = -ptr.y * 0.32;
        camera.position.set(cx, cy - scr.v * 0.3, CAM_Z);
        camera.lookAt(0, -scr.v * 0.3, 0);
        camera.updateMatrixWorld();

        lightView.copy(key.position).normalize().transformDirection(camera.matrixWorldInverse);

        for (var i = 0; i < caps.length; i++) {
          var c = caps[i], m = c.mesh;
          if (!m.visible) continue;
          var e = easeOutCubic((intro - c.delay) / 1.5);
          var depth = (c.z + 6) / 11;              // 0 (fundo) … 1 (frente)
          var bob = Math.sin(time * c.bobW + c.ph) * c.bobA;
          // rolagem: a frente sobe mais rápido, mas com teto (não invade o frasco)
          var lift = clamp(scr.v * (0.25 + depth * 0.9), -0.6, 0.6);
          // a camada da frente acompanha parte do movimento da câmera:
          // o parallax dela fica contido e nunca a leva para cima do frasco
          var fol = c.layer === 2 ? 0.5 : 0;
          m.position.set(
            c.px + cx * fol + c.inX * (1 - e),
            c.py + cy * fol + bob + lift + c.inY * (1 - e),
            c.z
          );
          euler.set(
            c.rx + Math.sin(time * c.bobW * 0.7 + c.ph) * c.wobA + ptr.y * 0.16,
            c.ry + time * c.spin,
            c.rz + time * c.roll + scr.v * 0.4 * (c.roll < 0 ? -1 : 1) + ptr.x * 0.1 + (1 - e) * 0.8,
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
        if (!live || !W || !H || lost) return false;

        renderer.setRenderTarget(null);
        renderer.setClearColor(black, 0);
        renderer.clear(true, true, false);

        for (var i = 0; i < PASSES.length; i++) {
          var p = PASSES[i];
          if (!counts[i]) continue; // camada i ↔ passe i
          camera.layers.set(p.layer);
          if (!p.blur) {
            // Camada nítida direto no canvas. O passe de transmissão interno do
            // three limpa com a clear color atual: a cor do fundo da página.
            renderer.setRenderTarget(null);
            renderer.setClearColor(backdrop, 1);
            renderer.render(scene, camera);
            renderer.setClearColor(black, 0);
            continue;
          }
          // camada desfocada: meia resolução → gaussiana → compõe por cima
          renderer.setRenderTarget(rtA);
          renderer.setClearColor(black, 0);
          renderer.clear(true, true, false);
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
        // bordas esmaecidas
        renderer.setRenderTarget(null);
        quad.material = featherMat;
        renderer.render(quadScene, quadCam);
        return true;
      }

      /* Shader que falhou não lança erro no three: confere antes de esconder o
         fallback em CSS. Se algo deu errado, desmonta e deixa o fallback. */
      function healthy() {
        if (patchOK !== true || gl.isContextLost()) return false;
        var progs = renderer.info.programs || [];
        for (var i = 0; i < progs.length; i++) {
          var dg = progs[i].diagnostics;
          if (dg && dg.runnable === false) return false;
        }
        return true;
      }
      function afterDraw(drawn) {
        if (!drawn || ready || destroyed) return;
        if (!healthy()) { destroy(); return; }
        ready = true;
        canvas.style.opacity = '1';
        container.classList.add('is-ready');
      }

      function renderOnce() {
        if (destroyed || !live) return;
        update(0);
        afterDraw(draw());
      }

      /* ----- laço ----- */
      function frame(now) {
        raf = 0;
        if (!running) return;
        var raw = Math.max((now - last) / 1000, 0);
        last = now;
        if (now - box.at > 1000) { measure(); readScroll(); }
        // animação com passo limitado; a entrada usa o tempo real (não arrasta em GPU lenta)
        update(Math.min(raw, 0.05), Math.min(raw, 0.25));
        afterDraw(draw());
        if (running) raf = requestAnimationFrame(frame);
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
      function sync() {
        if (destroyed || !live) return;
        var active = inView && !document.hidden && !lost && W > 0;
        if (reduced) {
          if (active && dirty) { dirty = false; renderOnce(); }
          return;
        }
        if (active) start(); else stop();
      }

      /* ----- inicialização em fatias (evita uma tarefa longa no mount) ----- */
      var initQ = [
        function () { // 1) mapa de ambiente (PMREM)
          envRT = studioEnvironment(renderer); envBuilt = true;
          scene.environment = envRT.texture;
        },
        function () { // 2) compila os programas pesados (casca física, núcleo)
          resize();
          renderer.setRenderTarget(null);
          renderer.compile(scene, camera);
        },
        goLive
      ];
      // 3) primeiro frame no próximo quadro de animação
      function goLive() {
        firstRaf = requestAnimationFrame(function () {
          firstRaf = 0;
          if (destroyed) return;
          if (lost) { initQ.push(goLive); return; } // retoma no webglcontextrestored
          live = true;
          resize();
          if (inView && !document.hidden && W) renderOnce(); else dirty = true;
          sync();
        });
      }
      function runInit() {
        initH = 0;
        if (destroyed || lost || !initQ.length) return;
        initQ.shift()();
        if (initQ.length && !destroyed && !lost) initH = idle(runInit);
      }

      /* ----- eventos ----- */
      // redesenha já se estiver visível; senão, na próxima vez que aparecer
      function redraw() {
        if (!live) return;
        if (inView && !document.hidden) renderOnce(); else dirty = true;
        sync();
      }
      function onResize() {
        if (destroyed || !resize()) return;
        redraw(); // mudar o tamanho do canvas o apaga
      }
      // mudança de devicePixelRatio sem mudança de tamanho (outro monitor, zoom)
      var dprMQ = null;
      function armDpr() {
        if (dprMQ) {
          if (dprMQ.removeEventListener) dprMQ.removeEventListener('change', onDpr);
          else if (dprMQ.removeListener) dprMQ.removeListener(onDpr);
          dprMQ = null;
        }
        if (destroyed || !window.matchMedia) return;
        dprMQ = window.matchMedia('(resolution: ' + (window.devicePixelRatio || 1) + 'dppx)');
        if (dprMQ.addEventListener) dprMQ.addEventListener('change', onDpr);
        else if (dprMQ.addListener) dprMQ.addListener(onDpr);
      }
      function onDpr() { armDpr(); onResize(); }
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
        if (initH) { cancelIdle(initH); initH = 0; }
        // com o contexto perdido as exclusões no GL são no-ops silenciosos;
        // depois de restaurado, liberar objetos antigos gera avisos
        if (envRT) { envRT.dispose(); envRT = null; scene.environment = null; }
        container.classList.remove('is-ready'); ready = false;
        canvas.style.opacity = '0';
      }
      function onRestored() {
        if (destroyed) return;
        lost = false;
        // o conteúdo do env map (render target) se perdeu junto com o contexto
        if (envBuilt && !envRT) { envRT = studioEnvironment(renderer); scene.environment = envRT.texture; }
        if (live) redraw();
        else if (!initH && !firstRaf) initH = idle(runInit);
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
      armDpr();
      document.addEventListener('visibilitychange', onVisibility);
      canvas.addEventListener('webglcontextlost', onLost, false);
      canvas.addEventListener('webglcontextrestored', onRestored, false);
      if (!reduced) {
        window.addEventListener('pointermove', onPointer, { passive: true });
        window.addEventListener('scroll', onScroll, { passive: true });
      }

      cleanup = destroy;
      resize();
      initH = idle(runInit);

      function destroy() {
        if (destroyed) return;
        destroyed = true;
        stop();
        if (initH) { cancelIdle(initH); initH = 0; }
        if (firstRaf) { cancelAnimationFrame(firstRaf); firstRaf = 0; }
        if (ro) ro.disconnect(); else window.removeEventListener('resize', onResize);
        if (io) io.disconnect();
        armDpr(); // com destroyed = true só remove o ouvinte
        document.removeEventListener('visibilitychange', onVisibility);
        window.removeEventListener('pointermove', onPointer, { passive: true });
        window.removeEventListener('scroll', onScroll, { passive: true });
        canvas.removeEventListener('webglcontextlost', onLost, false);
        canvas.removeEventListener('webglcontextrestored', onRestored, false);

        shellGeo.dispose(); smallGeo.dispose(); quadGeo.dispose();
        shellMat.dispose(); coreMat.dispose(); gelMat.dispose();
        blurMat.dispose(); compMat.dispose(); featherMat.dispose();
        seamTex.dispose(); rtA.dispose(); rtB.dispose();
        if (envRT) envRT.dispose();
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
