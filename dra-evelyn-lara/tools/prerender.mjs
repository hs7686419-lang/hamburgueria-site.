/**
 * Pré-renderização do conteúdo publicado dentro do index.html.
 *
 * Por quê: serviços, endereço, CRO, horários, FAQ e dados estruturados vêm do config.js e são
 * montados pelo main.js. Visitantes e o Google (que executa JavaScript) veem tudo normalmente, mas
 * robôs que não executam JavaScript veriam essas áreas vazias. Este script abre o site num navegador
 * sem interface, em modo 'publicado', e grava o resultado dessas áreas no próprio index.html,
 * entre os marcadores <!--pr:nome--> ... <!--/pr:nome-->.
 *
 * Uso (depois de editar o config.js):
 *   node tools/prerender.mjs
 * Requer o Playwright (npx playwright) ou a variável PLAYWRIGHT_MODULE apontando para ele.
 * É opcional: sem rodá-lo, o site continua correto para os visitantes; só a versão estática fica desatualizada.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const INDEX = path.join(ROOT, 'index.html');

// área do HTML → seletor do elemento correspondente
const REGIONS = {
  schema: '#schema-ld',
  caption: '.about__caption',
  facts: '[data-facts]',
  specialty: '[data-specialty]',
  qualification: '[data-treatments-qualification]',
  treatments: '[data-treatments]',
  select: '[data-service-select]',
  faq: '[data-faq]',
  contact: '[data-contact-list]',
  maps: '[data-maps-link]',
  'footer-contact': '[data-footer-contact]',
  'footer-legal': '[data-footer-legal]',
};

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.avif': 'image/avif', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.webm': 'video/webm' };

async function loadPlaywright() {
  try { return await import('playwright'); } catch { /* tenta o caminho configurado */ }
  const fallback = process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright/index.mjs';
  return import(fallback);
}

function serve() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let url = decodeURIComponent(req.url.split('?')[0]);
      if (url.endsWith('/')) url += 'index.html';
      const file = path.join(ROOT, url);
      if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
      fs.readFile(file, (err, data) => {
        if (err) { res.writeHead(404); return res.end('not found'); }
        res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
        res.end(data);
      });
    }).listen(0, '127.0.0.1', () => resolve(server));
  });
}

const { chromium } = await loadPlaywright();
const server = await serve();
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {})
  .catch(() => chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }));

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  // força o modo publicado: só dados confirmados entram no HTML estático
  await page.route('**/assets/js/config.js', async (route) => {
    const src = fs.readFileSync(path.join(ROOT, 'assets/js/config.js'), 'utf8');
    await route.fulfill({ contentType: 'text/javascript', body: src + "\n;window.SITE_CONFIG.modo = 'publicado';\n" });
  });
  await page.goto(`${base}/index.html`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.documentElement.classList.contains('reveal-ready'));
  if (errors.length) throw new Error('Erros no main.js: ' + errors.join(' | '));

  const html = await page.evaluate((regions) => {
    const out = {};
    for (const [key, sel] of Object.entries(regions)) {
      const el = document.querySelector(sel);
      if (!el) { out[key] = null; continue; }
      const clone = el.cloneNode(true);
      // remove o estado de animação gerado em tempo de execução
      [clone, ...clone.querySelectorAll('*')].forEach((n) => {
        n.classList && n.classList.remove('is-in');
        if (n.getAttribute && /^\s*--d:/.test(n.getAttribute('style') || '')) n.removeAttribute('style');
        if (n.getAttribute && n.getAttribute('class') === '') n.removeAttribute('class');
      });
      out[key] = clone.outerHTML;
    }
    return out;
  }, REGIONS);

  let src = fs.readFileSync(INDEX, 'utf8');
  const missing = [];
  for (const [key, markup] of Object.entries(html)) {
    const re = new RegExp(`(<!--pr:${key}-->)[\\s\\S]*?(<!--/pr:${key}-->)`);
    if (!markup || !re.test(src)) { missing.push(key); continue; }
    src = src.replace(re, (_, open, close) => open + markup + close);
  }
  fs.writeFileSync(INDEX, src);
  console.log(`Pré-renderizado: ${Object.keys(html).length - missing.length} áreas.` + (missing.length ? ` Não encontradas: ${missing.join(', ')}` : ''));
  if (missing.length) process.exitCode = 1;
} finally {
  await browser.close();
  server.close();
}
