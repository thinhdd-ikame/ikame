// QA capture for funnel-content-writer engines (used by the qa-ui-test skill).
// Usage: node funnel/tools/qa_capture.mjs <funnel.html> <out-dir>
// 1) Deep-jumps every screen (?debug=1) at 375x667 and 430x932, test data name "test" / email "test@gmail.com",
//    screenshots each screen (long screens in ~780px scroll steps) and records automatic checks.
// 2) Walks the funnel from screen 1 like a user (no debug) and records where it gets stuck.
// Writes <out-dir>/screens/*.png and <out-dir>/capture.json. Deletes screens/ of earlier runs of the same funnel first;
// screens/ is temporary: delete it once the report is exported (qa-ui-test skill).
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const [file, out] = process.argv.slice(2);
if (!file || !out) { console.log('Usage: node qa_capture.mjs <funnel.html> <out-dir>'); process.exit(2); }
const url = 'file://' + path.resolve(file);
const shots = path.join(out, 'screens');
// new test round: drop screenshots left from earlier rounds of this funnel (all dated runs), then start clean
const funnelDir = path.dirname(path.resolve(out));
for (const run of fs.existsSync(funnelDir) ? fs.readdirSync(funnelDir) : []) {
  const old = path.join(funnelDir, run, 'screens');
  if (fs.existsSync(old)) fs.rmSync(old, { recursive: true, force: true });
}
fs.mkdirSync(shots, { recursive: true });
const VIEWPORTS = [{ tag: 'small', width: 375, height: 667 }, { tag: 'large', width: 430, height: 932 }];
const TEST = { name: 'test', email: 'test@gmail.com' };
const SAMPLE_IMG = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../funnel-development/nebula/soulmate-sketch/img/palm.jpg');

// screen list: family A exposes SCREENS {n:id}, family B exposes V {n:{id}} / FLOW [{id}]
const SCREEN_LIST = () => {
  try { if (typeof SCREENS === 'object') return Object.entries(SCREENS).map(([n, id]) => [+n, id]); } catch (e) {}
  try { if (typeof V === 'object') return Object.keys(V).map(n => [+n, V[n].id || V[n].key || String(n)]); } catch (e) {}
  try { if (Array.isArray(FLOW)) return FLOW.map((s, i) => [i + 1, s.id || String(i + 1)]); } catch (e) {}
  return [];
};

// automatic checks on the current screen
const CHECKS = () => {
  const vw = innerWidth, issues = [];
  const vis = el => { const r = el.getBoundingClientRect(), s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0; };
  const text = document.body.innerText;
  if (document.documentElement.scrollWidth > vw + 1) issues.push(`horizontal overflow: page ${document.documentElement.scrollWidth}px > ${vw}px`);
  const toks = text.match(/\{\{[^}]+\}\}/g); if (toks) issues.push('raw tokens: ' + [...new Set(toks)].join(' '));
  if (/\bMaya\b|demo@example\.com|undefined|NaN|\[object Object\]/.test(text)) issues.push('suspicious text: ' + (text.match(/\bMaya\b|demo@example\.com|undefined|NaN|\[object Object\]/g) || []).join(' '));
  for (const img of document.images) if (vis(img) && img.complete && img.naturalWidth === 0) issues.push('broken image: ' + (img.getAttribute('src') || '').slice(0, 60));
  for (const el of document.querySelectorAll('body *')) {
    if (!vis(el) || el.children.length > 0 && el.tagName !== 'BUTTON') continue;
    const s = getComputedStyle(el), r = el.getBoundingClientRect();
    const label = (el.innerText || el.getAttribute('aria-label') || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 50);
    if (el.innerText && el.innerText.trim() && (s.overflow.includes('hidden') || s.textOverflow === 'ellipsis') && el.scrollWidth > el.clientWidth + 2) issues.push(`text clipped: "${label}"`);
    if (el.innerText && el.innerText.trim() && (r.right > vw + 1 || r.left < -1)) issues.push(`text off-screen x: "${label}" [${Math.round(r.left)}..${Math.round(r.right)}]`);
  }
  for (const b of document.querySelectorAll('button, a, input, select, [data-a]')) {
    if (!vis(b)) continue; const r = b.getBoundingClientRect();
    if (r.height < 32 && (b.innerText || '').trim()) issues.push(`small tap target ${Math.round(r.width)}x${Math.round(r.height)}: "${(b.innerText || '').trim().slice(0, 30)}"`);
  }
  return [...new Set(issues)];
};

// biggest scrollable element (or the document) for paging long screens
const SCROLLER = () => {
  let best = null, bestH = 0;
  for (const el of document.querySelectorAll('*')) {
    const s = getComputedStyle(el);
    if (/(auto|scroll)/.test(s.overflowY) && el.scrollHeight > el.clientHeight + 20 && el.clientHeight > 200 && el.scrollHeight > bestH) { best = el; bestH = el.scrollHeight; }
  }
  if (best) { best.setAttribute('data-qa-scroller', '1'); return { sel: '[data-qa-scroller="1"]', h: best.scrollHeight, ch: best.clientHeight }; }
  const d = document.scrollingElement; return { sel: null, h: d.scrollHeight, ch: innerHeight };
};

const browser = await chromium.launch();
const result = { file: path.resolve(file), screens: [], walk: null, errors: [] };
try {
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(`pageerror: ${e.message}`));
    page.on('console', m => { if (m.type() === 'error') errs.push(`console: ${m.text()}`); });
    await page.goto(url + '?debug=1');
    await page.waitForTimeout(600);
    const list = await page.evaluate(SCREEN_LIST);
    if (!list.length) { result.errors.push(`${vp.tag}: no screen list found`); await ctx.close(); continue; }
    for (const [n, id] of list) {
      errs.length = 0;
      await page.evaluate(({ n, TEST }) => {
        try { sessionStorage.removeItem('ikf_age_block'); } catch (e) {}
        try { if (typeof fillTo === 'function') fillTo(n, true); } catch (e) {}
        try { S.u18 = false; if ('name' in S) S.name = TEST.name; if ('email' in S) S.email = TEST.email; } catch (e) {}
        (window.IkFunnel && window.IkFunnel.go ? window.IkFunnel.go : go)(n);
        try { if ('name' in S) S.name = TEST.name; if ('email' in S) S.email = TEST.email; } catch (e) {}
      }, { n, TEST }).catch(e => errs.push('go threw: ' + e.message));
      await page.waitForTimeout(900);
      const cur = await page.evaluate(() => { try { return S.i; } catch (e) { return null; } });
      const issues = await page.evaluate(CHECKS);
      const sc = await page.evaluate(SCROLLER);
      const base = `${String(n).padStart(2, '0')}-${id}-${vp.tag}`;
      const files = [];
      const steps = Math.min(8, Math.max(1, Math.ceil((sc.h - sc.ch) / 780) + 1));
      for (let k = 0; k < steps; k++) {
        if (k) { await page.evaluate(({ sel, y }) => { const el = sel ? document.querySelector(sel) : document.scrollingElement; if (el) el.scrollTop = y; }, { sel: sc.sel, y: k * 780 }); await page.waitForTimeout(1200); }
        const f = steps > 1 ? `${base}-p${k + 1}.png` : `${base}.png`;
        await page.screenshot({ path: path.join(shots, f) });
        files.push(f);
      }
      if (sc.sel) await page.evaluate(sel => { const el = document.querySelector(sel); if (!el) return; el.scrollTop = 0; el.removeAttribute('data-qa-scroller'); }, sc.sel);
      result.screens.push({ n, id, viewport: vp.tag, landedOn: cur, files, issues: [...issues, ...errs] });
    }
    await ctx.close();
  }

  // real walk from screen 1 at 375x667
  const ctx = await browser.newContext({ viewport: VIEWPORTS[0], deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const walkErr = [];
  page.on('pageerror', e => walkErr.push(`pageerror: ${e.message}`));
  await page.goto(url);
  await page.waitForTimeout(800);
  const ids = Object.fromEntries((await page.evaluate(SCREEN_LIST)).map(([n, id]) => [n, id]));
  const path_ = []; let stuck = 0, last = null; const uploaded = new Set(); const log = [];
  for (let step = 0; step < 80; step++) {
    const i = await page.evaluate(() => { try { return S.i; } catch (e) { return null; } });
    const id = ids[i] || String(i);
    if (i !== last) { path_.push(id); stuck = 0; last = i; } else stuck++;
    const isPay = await page.evaluate(() => /Due today/i.test(document.body.innerText));
    if (isPay) { path_[path_.length - 1] += ' (paywall)'; }
    if (/paywall/.test(id) || isPay || stuck > 14) break;
    // photo upload screens: feed a sample image to the first file input once per screen
    if (await page.locator('input[type=file]').count() && !uploaded.has(i)) {
      uploaded.add(i);
      await page.locator('input[type=file]').first().setInputFiles(SAMPLE_IMG).catch(() => {});
      await page.waitForTimeout(1500);
      continue;
    }
    await page.evaluate(async TEST => {
      const vis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden'; };
      const setVal = (el, v) => { const p = Object.getPrototypeOf(el); Object.getOwnPropertyDescriptor(p, 'value').set.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); };
      for (const el of document.querySelectorAll('textarea')) if (vis(el) && !el.value) setVal(el, 'What should I know about my love life this year?');
      for (const el of document.querySelectorAll('input')) {
        if (!vis(el) || el.value) continue;
        const hint = ((el.type || '') + ' ' + (el.name || '') + ' ' + (el.placeholder || '') + ' ' + (el.id || '')).toLowerCase();
        if (/email/.test(hint)) setVal(el, TEST.email);
        else if (/city|place|born|town/.test(hint)) setVal(el, 'London');
        else if (el.type === 'checkbox') { if (!el.checked) el.click(); }
        else if (el.id === 'msg') setVal(el, 'hi');
        else if (el.type === 'text' || el.type === '' ) setVal(el, TEST.name);
      }
      // one select at a time: some engines re-render the row after each change, detaching the old nodes
      for (let k = 0; k < 6; k++) {
        const el = [...document.querySelectorAll('select')].find(s => vis(s) && !s.value);
        if (!el) break;
        const opts = [...el.options].filter(o => o.value);
        if (!opts.length) break;
        const yr = opts.find(o => /^(1990|1994)$/.test(o.value));
        setVal(el, (yr || opts[Math.min(3, opts.length - 1)]).value);
        await new Promise(r => setTimeout(r, 120));
      }
    }, TEST);
    await page.waitForTimeout(400);
    const clicked = await page.evaluate(() => {
      const vis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom > 0 && getComputedStyle(el).visibility !== 'hidden'; };
      const first = sel => [...document.querySelectorAll(sel)].find(vis);
      let at = null; try { at = S.i; } catch (e) {}
      const sug = first('[data-a="city"]'); if (sug && window.__qaCityAt !== at) { window.__qaCityAt = at; sug.click(); return 'city'; }
      let picked = 0; try { picked = (S.picks || []).length; } catch (e) {}
      window.__qaDrawn = window.__qaDrawn || new Set();
      const draw = [...document.querySelectorAll('[data-a="draw"]:not(.used)')].find(d => vis(d) && !window.__qaDrawn.has(d.dataset.v));
      let need = 3; try { if (typeof N === 'function') need = +N() || 3; } catch (e) {}
      if (draw && picked < need) { window.__qaDrawn.add(draw.dataset.v); draw.click(); return 'draw'; }
      const multi = first('[data-a="multi"]:not(.on):not(.sel)'); if (multi && !document.querySelector('[data-a="multi"].on, [data-a="multi"].sel')) { multi.click(); return 'multi'; }
      // chat screens: send what was typed into the message box
      const msg = document.getElementById('msg'), send = first('[data-a="send"]');
      if (msg && vis(msg) && msg.value.trim() && send && !send.disabled) { send.click(); return 'send'; }
      // options: pick once per screen, then move on with the CTA
      const pick = first('[data-a="pick"]'); if (pick && window.__qaPickAt !== at) { window.__qaPickAt = at; pick.click(); return 'pick'; }
      // primary CTA: the widest enabled button, lowest on screen
      const hit = b => { const r = b.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2; if (y < 0 || y > innerHeight) return false; const e = document.elementFromPoint(x, y); return e && (e === b || b.contains(e)); };
      // option groups (several buttons sharing one data-a): choose the first option once per screen
      const groups = {};
      for (const el of document.querySelectorAll('[data-a]')) if (vis(el) && el.dataset.a !== 'back') (groups[el.dataset.a] = groups[el.dataset.a] || []).push(el);
      const optKey = Object.keys(groups).find(k => groups[k].length >= 2 && !['year', 'send', 'city', 'draw', 'help', 'legal'].includes(k) && groups[k].some(hit));
      if (optKey && window.__qaOptAt !== at) { window.__qaOptAt = at; const o = groups[optKey].find(hit); o.click(); return 'opt:' + optKey; }
      const grouped = new Set(Object.keys(groups).filter(k => groups[k].length >= 2));
      const cands = [...document.querySelectorAll('button, [data-a]')].filter(b => vis(b) && hit(b) && !grouped.has(b.dataset.a) && !b.disabled && !b.classList.contains('ghost') && b.dataset.a !== 'back' && b.getBoundingClientRect().width >= innerWidth * 0.6 && (b.innerText || '').trim());
      // prefer "move on" buttons, avoid ones that open a file picker / camera; then the lowest on screen
      const score = b => { const t = (b.innerText || '').toLowerCase(); return /upload|gallery|take a photo|camera|retake/.test(t) ? -1 : /continue|next|start|see|get|unlock|use|done|turn|reveal|let|say|send|save|open|go\b/.test(t) ? 1 : 0; };
      cands.sort((x, y) => score(y) - score(x) || y.getBoundingClientRect().bottom - x.getBoundingClientRect().bottom);
      if (!cands.length) { // CTA pushed below the fold (e.g. after an "Other" text field opens): scroll to it like a user would
        const below = [...document.querySelectorAll('button, [data-a]')].filter(b => vis(b) && !grouped.has(b.dataset.a) && !b.disabled && !b.classList.contains('ghost') && b.dataset.a !== 'back' && b.getBoundingClientRect().width >= innerWidth * 0.6 && b.getBoundingClientRect().top >= innerHeight - 80 && (b.innerText || '').trim());
        for (const b of below) { b.scrollIntoView({ block: 'center' }); if (hit(b)) { cands.push(b); break; } }
      }
      const cta = cands[0] || [...document.querySelectorAll('button.btn, .btn, [data-a="next"], [data-a="go"], [data-a="email"]')].filter(b => vis(b) && !b.disabled && !b.classList.contains('ghost')).pop();
      if (cta) { cta.click(); return 'cta:' + (cta.innerText || '').trim().slice(0, 30); }
      const any = first('[data-a]:not([data-a="back"])'); if (any) { any.click(); return 'any:' + any.dataset.a; }
      const btn = [...document.querySelectorAll('button')].find(b => vis(b) && !b.disabled && b.dataset.a !== 'back' && (b.innerText || '').trim()); if (btn) { btn.click(); return 'btn:' + btn.innerText.trim().slice(0, 20); }
      return null;
    });
    log.push(`${id}: ${clicked}`);
    await page.waitForTimeout(clicked ? 900 : 2500);
  }
  await page.screenshot({ path: path.join(shots, `walk-end-${path_[path_.length - 1]}.png`) });
  result.walk = { path: path_, reachedPaywall: path_.some(x => /paywall/.test(x)), stuckAt: stuck > 14 ? path_[path_.length - 1] : null, errors: walkErr, log: log.slice(-25) };
  await ctx.close();
} finally {
  await browser.close();
}
fs.writeFileSync(path.join(out, 'capture.json'), JSON.stringify(result, null, 2));
const flagged = result.screens.filter(s => s.issues.length);
console.log(`${path.basename(path.dirname(path.resolve(file)))}: ${result.screens.length} captures, ${flagged.length} with auto-issues, walk ${result.walk?.reachedPaywall ? 'reached paywall' : 'STUCK at ' + result.walk?.stuckAt}`);
