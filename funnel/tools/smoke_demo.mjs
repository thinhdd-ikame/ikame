// Usage: node funnel/tools/smoke_demo.mjs <demo.html> <screens> [--allow-price-tokens]
import { chromium } from 'playwright';
import path from 'node:path';

const args = process.argv.slice(2);
const file = args[0];
const nArg = args[1];
const allowPriceTokens = args.includes('--allow-price-tokens');
const N = Number(nArg);

// Validate arguments
if (!file || !Number.isInteger(N) || N < 1) {
  console.log('Usage: node smoke_demo.mjs <demo.html> <screens> [--allow-price-tokens]');
  process.exit(2);
}

const browser = await chromium.launch();
const errors = [];
let screenChanged = false;
let lastText = '';

try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
  page.on('console', m => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
  page.on('requestfailed', r => { if (!r.url().includes('fonts.g')) errors.push(`requestfailed: ${r.url()}`); });

  await page.goto('file://' + path.resolve(file));
  await page.waitForTimeout(500);

  // Capture baseline text before first go() call
  lastText = await page.evaluate(() => document.body.innerText.trim());

  // Check if window.go is exposed
  const hasGo = await page.evaluate(() => typeof window.go === 'function');
  if (!hasGo) {
    errors.push('go() not exposed');
  } else {
    const blank = [], raw = [], overflow = [];
    for (let i = 1; i <= N; i++) {
      try {
        await page.evaluate(n => window.go(n), i);
      } catch (e) {
        errors.push(`go(${i}) threw: ${e.message}`);
        break;
      }
      await page.waitForTimeout(250);
      const info = await page.evaluate(() => ({
        text: document.body.innerText.trim(),
        wide: document.documentElement.scrollWidth > window.innerWidth,
      }));
      if (info.text.length < 10) blank.push(i);
      if (info.text !== lastText) screenChanged = true;
      lastText = info.text;
      if (info.text.includes('{{')) {
        // Check if there are any non-pricing tokens
        const allTokens = info.text.match(/\{\{[^}]+\}\}/g) || [];
        const hasOtherTokens = allTokens.some(t => !/^\{\{(price|renew|trial|plan|week|annual|offer|refund|rating|reviewer|country|app_|legal|real|badge|review)/i.test(t));
        if (!allowPriceTokens || hasOtherTokens) {
          raw.push(i);
        }
      }
      if (info.wide) overflow.push(i);
    }
    if (blank.length) errors.push(`blank screens: ${blank.join(',')}`);
    if (!screenChanged) errors.push('go() does not change screens');
    if (raw.length) errors.push(`raw {{token}} on screens: ${raw.join(',')}`);
    if (overflow.length) errors.push(`horizontal overflow at 390px on screens: ${overflow.join(',')}`);
  }
} finally {
  await browser.close();
}

console.log(errors.length ? errors.join('\n') : `OK ${N} screens`);
process.exit(errors.length ? 1 : 0);
