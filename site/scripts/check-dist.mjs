// Post-build guardrails — run automatically by `npm run build`. Fails the build (exit 1) if the
// built site breaks one of the spec's hard rules (§1 non-goals, §6 performance, §10 acceptance).
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const site = readFileSync(join(root, 'src/config/site.ts'), 'utf8');
const NOINDEX = /export const NOINDEX = true/.test(site);
const PREVENTION_REVIEWED = /PREVENTION_CONTENT_REVIEWED = true/.test(site);

const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const files = walk(dist);
const html = files.filter((f) => f.endsWith('.html'));
const errors = [];
const warn = [];
const fail = (f, msg) => errors.push(`${relative(dist, f)}: ${msg}`);

const TRACKERS = /google-analytics|googletagmanager|gtag\(|fbq\(|facebook\.net|hotjar|clarity\.ms|doubleclick|segment\.io|mixpanel/i;
const EXTERNAL_ASSET = /<(script|img|iframe|link)\b[^>]*\b(src|href)=["']https?:\/\/(?![^"']*(cybercrime\.gov\.in|ncpcr\.gov\.in))[^"']+["'][^>]*>/gi;

for (const f of html) {
  const s = readFileSync(f, 'utf8');
  const name = relative(dist, f);
  // 1. noindex until review is done
  if (NOINDEX && !/<meta name="robots" content="noindex,nofollow"/.test(s)) fail(f, 'missing noindex meta');
  // 2. no trackers, no cookies, no third-party assets
  if (TRACKERS.test(s)) fail(f, 'tracker signature found');
  // Cookies never. On-device storage only on /learn (progress + family plan, never sent anywhere).
  const isLearn = /^(en|ta)\/learn\//.test(name);
  if (/document\.cookie|sessionStorage/.test(s)) fail(f, 'cookie / session storage access found');
  if (!isLearn && /localStorage/.test(s)) fail(f, 'localStorage outside /learn');
  for (const m of s.matchAll(EXTERNAL_ASSET)) {
    if (/^<link\b/i.test(m[0]) && /rel=["'](canonical|alternate)["']/i.test(m[0])) continue;
    fail(f, `third-party asset: ${m[0].slice(0, 120)}`);
  }
  // 3. no photos of people — the site ships no raster images in pages at all
  if (/<img\b/i.test(s)) fail(f, '<img> found — this site uses no photos (spec §6)');
  // 4. JS budget: inline scripts only, small
  const js = [...s.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]).join('');
  const budget = isLearn ? 9000 : 6000;
  if (js.length > budget) fail(f, `inline JS ${js.length} bytes > ${budget} budget`);
  if (/<script\b[^>]*\bsrc=/i.test(s)) fail(f, 'external <script src> found');
  // 5. page weight (HTML incl. inlined CSS) — 3G budget
  if (s.length > 180_000) warn.push(`${name}: HTML ${Math.round(s.length / 1024)} KB`);

  // 6. story-page content rules (§10)
  if (/^(en|ta)\/index\.html$/.test(name)) {
    const caveats = (s.match(/class="caveat"/g) || []).length;
    if (caveats < 3) fail(f, `only ${caveats} "only reported cases" caveats on the story page`);
    if (!/who_explainer|friends, online friends|நண்பர்கள், இணைய நண்பர்கள்/.test(s)) fail(f, 'relationship explainer missing');
    if (!/(Last verified|கடைசியாகச் சரிபார்த்தது)/.test(s)) fail(f, 'helplines "last verified" date missing');
    const cites = (s.match(/class="cite"/g) || []).length;
    if (cites < 6) fail(f, `only ${cites} source citations on the story page`);
    const tables = (s.match(/class="table-alt"/g) || []).length;
    if (tables < 3) fail(f, `only ${tables} accessible table alternatives`);
  }
  if (isLearn) {
    if (!/tel:1098/.test(s)) fail(f, 'learn page must link Childline 1098');
  }
  // Review status lives on the About page (not as a banner on every page).
  if (/^(en|ta)\/about\/index\.html$/.test(name) && !PREVENTION_REVIEWED && !/(Review status|சரிபார்ப்பு நிலை)/.test(s)) fail(f, 'About page must state review status');
  // 6b. parent guide must stay marked DRAFT until reviewed, and must show helplines
  if (/^(en|ta)\/guide\/index\.html$/.test(name)) {
    if (!/tel:1098/.test(s)) fail(f, 'parent guide must link Childline 1098');
  }
}

// 7. robots.txt matches NOINDEX
const robots = readFileSync(join(dist, 'robots.txt'), 'utf8');
if (NOINDEX && !/Disallow: \//.test(robots)) errors.push('robots.txt must disallow all while NOINDEX');

// 8. every Tamil key exists (fallbacks are allowed at runtime, but we want to know)
const keys = (o, p = '') => Object.entries(o).flatMap(([k, v]) => (k.startsWith('_') ? [] : typeof v === 'object' ? keys(v, `${p}${k}.`) : [`${p}${k}`]));
const en = new Set(keys(JSON.parse(readFileSync(join(root, 'src/i18n/en.json'), 'utf8'))));
const ta = new Set(keys(JSON.parse(readFileSync(join(root, 'src/i18n/ta.json'), 'utf8'))));
const missingTa = [...en].filter((k) => !ta.has(k));
if (missingTa.length) warn.push(`Tamil strings missing (English fallback shown): ${missingTa.join(', ')}`);

// 9. CSV downloads + share cards exist
if (!existsSync(join(dist, 'data/all_data.csv'))) errors.push('data/all_data.csv missing — run `npm run data`');
for (const l of ['en', 'ta']) for (const c of ['hook', 'scale', 'wait']) for (const sz of ['1080x1350', '1200x630'])
  if (!existsSync(join(dist, `share/${l}/${c}-${sz}.png`))) warn.push(`share card missing: share/${l}/${c}-${sz}.png — run \`npm run cards\``);

const total = files.reduce((s, f) => s + statSync(f).size, 0);
console.log(`check-dist: ${html.length} pages, ${Math.round(total / 1024)} KB total`);
warn.forEach((w) => console.log(`  ⚠ ${w}`));
if (errors.length) {
  console.error('✗ check-dist failed:');
  errors.forEach((e) => console.error(`  - ${e}`));
  process.exit(1);
}
console.log('✓ check-dist passed');
