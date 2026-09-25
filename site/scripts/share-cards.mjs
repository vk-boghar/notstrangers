// Generate static share cards (spec §5.7): 1080×1350 (Instagram) and 1200×630 (WhatsApp/OG),
// English + Tamil, into public/share/<lang>/<card>-<W>x<H>.png. Commit the PNGs.
//
// Rendered with headless Chromium (not Satori) because Chromium shapes Tamil script correctly.
// Numbers come from src/data/tidy.json — the same data the site uses. Stats only: never people,
// never case details.
//
//   npm run cards                        (uses CHROME_PATH or Playwright's bundled Chromium)
import { readFileSync, mkdirSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { chromium } from 'playwright-core';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const rows = JSON.parse(readFileSync(join(root, 'src/data/tidy.json'), 'utf8'));
const dict = { en: JSON.parse(readFileSync(join(root, 'src/i18n/en.json'), 'utf8')), ta: JSON.parse(readFileSync(join(root, 'src/i18n/ta.json'), 'utf8')) };
const siteTs = readFileSync(join(root, 'src/config/site.ts'), 'utf8');
const SITE_URL = siteTs.match(/SITE_URL = '([^']+)'/)[1];
const SITE_NAME = { en: siteTs.match(/SITE_NAME = '([^']+)'/)[1], ta: siteTs.match(/SITE_NAME_TA = '([^']+)'/)[1] };

const inFmt = (n) => new Intl.NumberFormat('en-IN').format(Math.round(n));
const t = (lang, key, vars = {}) => {
  const get = (d) => key.split('.').reduce((o, k) => o?.[k], d);
  const s = get(dict[lang]) ?? get(dict.en);
  if (typeof s !== 'string') throw new Error(`missing i18n ${key}`);
  return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
};
const one = (q) => {
  const r = rows.filter((x) => Object.entries(q).every(([k, v]) => x[k] === v));
  if (r.length !== 1) throw new Error(`expected 1 row for ${JSON.stringify(q)}, got ${r.length}`);
  return r[0];
};
const latest = (dataset, geo) => Math.max(...rows.filter((r) => r.dataset === dataset && r.geo_code === geo).map((r) => r.year));

// ── the numbers ─────────────────────────────────────────────────────────────
const ry = latest('pocso_relationship', 'IN');
const relT = one({ dataset: 'pocso_relationship', geo_code: 'IN', year: ry, dimension_value: 'total' });
const relK = one({ dataset: 'pocso_relationship', geo_code: 'IN', year: ry, dimension_value: 'known_total' });
const known100 = Math.round((relK.value / relT.value) * 100);
const sy = latest('pocso_total', 'IN');
const pocso = one({ dataset: 'pocso_total', geo_code: 'IN', year: sy, metric: 'cases' });
const days = sy % 4 === 0 ? 366 : 365;
const perDay = Math.round(pocso.value / days / 10) * 10;
const hc = one({ dataset: 'court_pendency', geo_code: 'TN', dimension_value: 'pending_trial' });

const src = (lang, r, extra = '') => `${t(lang, 'cards.source')}: ${r.source_org === 'NCRB' ? 'NCRB' : r.source_org === 'MADRAS_HC' ? (lang === 'ta' ? 'சென்னை உயர் நீதிமன்றம்' : 'Madras High Court') : r.source_org}, ${r.source_edition}${extra}`;
const CARDS = {
  hook: (lang) => ({
    stat: t(lang, 'home.hook_title', { n: known100 }),
    sub: t(lang, 'home.hook_sub'),
    action: t(lang, 'cards.hook_action'),
    source: src(lang, relT, ` (POCSO Sec 4 & 6, ${ry}: ${inFmt(relK.value)} / ${inFmt(relT.value)})`),
    waffle: known100,
  }),
  scale: (lang) => ({
    stat: t(lang, 'cards.scale_stat', { perday: perDay, year: sy }),
    sub: t(lang, 'cards.scale_note'),
    action: t(lang, 'cards.scale_action'),
    source: src(lang, pocso, ` — ${inFmt(pocso.value)} ${lang === 'ta' ? 'வழக்குகள்' : 'cases'} ÷ ${days}`),
  }),
  wait: (lang) => ({
    stat: t(lang, 'cards.wait_stat', { pending: inFmt(hc.value) }),
    sub: t(lang, 'cards.wait_sub'),
    action: t(lang, 'cards.wait_action'),
    source: src(lang, hc),
  }),
};

// ── template ────────────────────────────────────────────────────────────────
const font = (pkg, file) => pathToFileURL(join(root, 'node_modules/@fontsource', pkg, 'files', file)).href;
const fontCss = `
@font-face{font-family:NS;font-weight:400;src:url(${font('noto-sans', 'noto-sans-latin-400-normal.woff2')})}
@font-face{font-family:NS;font-weight:700;src:url(${font('noto-sans', 'noto-sans-latin-700-normal.woff2')})}
@font-face{font-family:NST;font-weight:400;src:url(${font('noto-sans-tamil', 'noto-sans-tamil-tamil-400-normal.woff2')})}
@font-face{font-family:NST;font-weight:700;src:url(${font('noto-sans-tamil', 'noto-sans-tamil-tamil-700-normal.woff2')})}`;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

function html(lang, c, W, H) {
  const tall = H > W;
  const ta = lang === 'ta';
  const statSize = tall ? (ta ? 64 : 84) : (ta ? 44 : 58);
  const waffle = c.waffle !== undefined
    ? `<svg viewBox="0 0 200 200" width="${tall ? 260 : 200}" height="${tall ? 260 : 200}" style="flex:none">${Array.from({ length: 100 }, (_, i) => {
        const x = (i % 10) * 20 + 10, y = Math.floor(i / 10) * 20 + 10;
        return i < c.waffle ? `<circle cx="${x}" cy="${y}" r="7" fill="#0e5a53"/>` : `<circle cx="${x}" cy="${y}" r="6" fill="none" stroke="#62676d" stroke-width="2"/>`;
      }).join('')}</svg>` : '';
  return `<!doctype html><html lang="${ta ? 'ta' : 'en'}"><head><meta charset="utf-8"><style>${fontCss}
  *{box-sizing:border-box;margin:0}
  body{width:${W}px;height:${H}px;background:#f7f3ec;color:#1e2124;font-family:NS,NST;padding:${tall ? 80 : 56}px;display:flex;flex-direction:column;gap:${tall ? 36 : 22}px;overflow:hidden}
  .brand{display:flex;align-items:center;gap:14px;font-weight:700;font-size:${tall ? 30 : 24}px;color:#0e5a53}
  .main{display:flex;gap:40px;align-items:center;flex-direction:${tall ? 'column' : 'row'};align-items:${tall ? 'flex-start' : 'center'}}
  h1{font-size:${statSize}px;line-height:${ta ? 1.4 : 1.12};font-weight:700;letter-spacing:${ta ? 0 : -1}px}
  .sub{font-size:${tall ? 34 : 24}px;line-height:1.45;color:#454a50}
  .act{background:#e2efec;border-radius:18px;padding:${tall ? '28px 32px' : '18px 24px'};font-size:${tall ? 32 : 22}px;line-height:1.45;font-weight:700;color:#0b4a44}
  .foot{margin-top:auto;display:flex;justify-content:space-between;align-items:flex-end;gap:24px;font-size:${tall ? 22 : 16}px;color:#62676d;line-height:1.4}
  .url{font-weight:700;color:#1e2124;white-space:nowrap}
  </style></head><body>
  <div class="brand"><svg width="34" height="34" viewBox="0 0 22 22"><circle cx="6" cy="11" r="4" fill="#0e5a53"/><circle cx="16" cy="11" r="4" fill="none" stroke="#0e5a53" stroke-width="2"/></svg>${esc(SITE_NAME[lang])}</div>
  <div class="main">${waffle}<div style="display:flex;flex-direction:column;gap:${tall ? 28 : 16}px"><h1>${esc(c.stat)}</h1>${c.sub ? `<p class="sub">${esc(c.sub)}</p>` : ''}</div></div>
  <div class="act">${esc(c.action)}</div>
  <div class="foot"><span>${esc(c.source)}</span><span class="url">${esc(SITE_URL.replace(/^https?:\/\//, ''))}</span></div>
  </body></html>`;
}

const exe = process.env.CHROME_PATH || undefined;
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const tmpDir = mkdtempSync(join(tmpdir(), 'cards-'));
for (const lang of ['en', 'ta']) {
  const out = join(root, 'public/share', lang);
  mkdirSync(out, { recursive: true });
  for (const [name, make] of Object.entries(CARDS)) {
    for (const [W, H] of [[1080, 1350], [1200, 630]]) {
      const page = await browser.newPage({ viewport: { width: W, height: H } });
      // Load from a file:// URL so the local @font-face files resolve (setContent can't reach file://).
      const tmp = join(tmpDir, `${lang}-${name}-${W}.html`);
      writeFileSync(tmp, html(lang, make(lang), W, H));
      await page.goto(pathToFileURL(tmp).href, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      const fams = await page.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family));
      if (!fams.length) throw new Error('share cards: web fonts failed to load');
      // Shrink the headline (then the sub-line) until everything fits — long Tamil strings vary a lot.
      const overflow = await page.evaluate(() => {
        const over = () => document.body.scrollHeight > window.innerHeight + 1;
        const h1 = document.querySelector('h1'), sub = document.querySelector('.sub'), svg = document.querySelector('svg + div')?.previousElementSibling;
        for (let i = 0; i < 20 && over(); i++) {
          h1.style.fontSize = parseFloat(getComputedStyle(h1).fontSize) * 0.94 + 'px';
          if (sub && i > 4) sub.style.fontSize = parseFloat(getComputedStyle(sub).fontSize) * 0.95 + 'px';
          if (svg && svg.tagName === 'svg' && i > 8) { svg.setAttribute('width', +svg.getAttribute('width') * 0.9); svg.setAttribute('height', +svg.getAttribute('height') * 0.9); }
        }
        return over();
      });
      const file = join(out, `${name}-${W}x${H}.png`);
      await page.screenshot({ path: file });
      console.log(`${overflow ? '⚠ OVERFLOW ' : '✓ '}${file.replace(root + '/', '')}`);
      await page.close();
    }
  }
}
await browser.close();
rmSync(tmpDir, { recursive: true, force: true });
