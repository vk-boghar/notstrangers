// Dev helper: full-page screenshots at phone and desktop widths.
// usage: node scripts/screenshot.mjs <baseUrl> <outDir> <path> [<path>...]
import { chromium } from 'playwright-core';
const [base, out, ...paths] = process.argv.slice(2);
const exe = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const browser = await chromium.launch({ executablePath: exe });
for (const p of paths) {
  for (const [w, h, tag] of [[360, 740, 'm'], [1280, 900, 'd']]) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const errors = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(base + p, { waitUntil: 'networkidle' });
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    const name = `${out}/${p.replace(/\W+/g, '_') || 'root'}-${tag}.png`;
    await page.screenshot({ path: name, fullPage: true });
    console.log(name, `scrollWidth=${sw}`, errors.length ? 'ERRORS: ' + errors.join(' | ') : '');
    await page.close();
  }
}
await browser.close();
