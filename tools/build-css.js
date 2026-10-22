#!/usr/bin/env node
/**
 * Kezza Clinic — CSS bundler (zero dependencies).
 *
 * Each page used to load 6–9 separate render-blocking stylesheets. This script
 * concatenates each page's stylesheets IN THEIR ORIGINAL ORDER (so the cascade
 * is unchanged), minifies them conservatively, and writes one file per page type:
 *
 *     frontend/css/bundle-<name>.min.css
 *
 * It also creates optimized critical and deferred bundles for high-traffic landing
 * pages (e.g. index.html) to eliminate unused CSS rules and keep initial paint instant:
 *
 *     frontend/css/bundle-home-critical.min.css
 *     frontend/css/bundle-home-deferred.min.css
 *
 * It then rewrites every page's <link> tags to point at its bundle with a
 * content hash (?v=abc12345), so browsers re-download only when CSS changes.
 *
 * Keep editing the normal source files in frontend/css/ — then run:
 *
 *     npm run build:css      (or: node tools/build-css.js)
 */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { buildFaSubset } = require('./build-fa-subset.js');

const ROOT = path.resolve(__dirname, '..');
const FE = path.join(ROOT, 'frontend');
const CONFIG = path.join(__dirname, 'css-bundles.json');

// ── Conservative minifier ────────────────────────────────────────────
// Strips comments and collapses whitespace; removes spaces only next to
// { } ; , and inside ( ). Strings and url(...) are copied verbatim.
// Deliberately does NOT touch ":" "+" ">" "~" so selectors and calc() are safe.
function minify(css) {
  let out = '';
  let i = 0;
  const n = css.length;
  const TIGHT_BEFORE = new Set(['{', '}', ';', ',', ')']);
  const TIGHT_AFTER = new Set(['{', '}', ';', ',', '(', '']);
  let pendingSpace = false;
  const emit = (s) => {
    if (pendingSpace) {
      const prev = out.slice(-1);
      if (!TIGHT_AFTER.has(prev) && !TIGHT_BEFORE.has(s[0])) out += ' ';
      pendingSpace = false;
    }
    if (s === '}' && out.endsWith(';')) out = out.slice(0, -1); // last ; before }
    out += s;
  };
  while (i < n) {
    const c = css[i];
    if (c === '/' && css[i + 1] === '*') {                        // comment
      const end = css.indexOf('*/', i + 2);
      const stop = end === -1 ? n : end + 2;
      if (css[i + 2] === '!') emit(css.slice(i, stop));             // keep /*! licences */
      // other comments vanish without adding whitespace (".a/**/.b" means ".a.b")
      i = stop;
      continue;
    }
    if (c === '"' || c === "'") {                                   // string
      let j = i + 1;
      while (j < n && css[j] !== c) { if (css[j] === '\\') j++; j++; }
      emit(css.slice(i, j + 1));
      i = j + 1;
      continue;
    }
    if ((c === 'u' || c === 'U') && css.slice(i, i + 4).toLowerCase() === 'url(') {
      let j = i + 4;
      while (j < n && /\s/.test(css[j])) j++;
      if (css[j] === '"' || css[j] === "'") {
        const q = css[j++];
        while (j < n && css[j] !== q) { if (css[j] === '\\') j++; j++; }
        j++;
      }
      const k = css.indexOf(')', j);
      const end = k === -1 ? n : k + 1;
      emit(css.slice(i, end));
      i = end;
      continue;
    }
    if (c === ' ' || c === '\n' || c === '\r' || c === '\t' || c === '\f') {
      pendingSpace = true;
      i++;
      continue;
    }
    emit(c);
    i++;
  }
  return out.trim() + '\n';
}

function bundleCss(files) {
  const hoisted = [];
  const body = files.map((rel) => {
    let css = fs.readFileSync(path.join(FE, rel), 'utf8').replace(/^﻿/, '');
    // @charset / @import must stay at the very top of the combined file
    css = css.replace(/@charset\s+[^;]+;|@import\s+[^;]+;/gi, (m) => { hoisted.push(m); return ''; });
    return `/* ${rel} */\n${css}`;
  }).join('\n');
  const charset = hoisted.filter((h) => /^@charset/i.test(h)).slice(0, 1);
  const imports = hoisted.filter((h) => /^@import/i.test(h));
  return minify([...charset, ...imports, body].join('\n'));
}

function hash(s) { return crypto.createHash('md5').update(s).digest('hex').slice(0, 8); }

// Split CSS into top-level blocks for AST-free rule filtering
function splitCssBlocks(css) {
  const blocks = [];
  let i = 0;
  const n = css.length;
  while (i < n) {
    if (css.slice(i, i + 2) === '/*') {
      const end = css.indexOf('*/', i + 2);
      i = end === -1 ? n : end + 2;
      continue;
    }
    if (css[i] === '@') {
      const brace = css.indexOf('{', i);
      if (brace === -1) break;
      const header = css.slice(i, brace).trim();
      let depth = 1;
      let j = brace + 1;
      while (j < n && depth > 0) {
        if (css[j] === '{') depth++;
        else if (css[j] === '}') depth--;
        j++;
      }
      blocks.push({ header, body: css.slice(brace + 1, j - 1), raw: css.slice(i, j) });
      i = j;
      continue;
    }
    const brace = css.indexOf('{', i);
    if (brace === -1) break;
    const selector = css.slice(i, brace).trim();
    const closeBrace = css.indexOf('}', brace);
    if (closeBrace === -1) break;
    const body = css.slice(brace + 1, closeBrace);
    blocks.push({ selector, body, raw: css.slice(i, closeBrace + 1) });
    i = closeBrace + 1;
  }
  return blocks;
}

const ABOVE_THE_FOLD_RE = /hero|navbar|kz-trust|nav-|gallery-carousel|\.slide|\.skip-to-content|kz-lang|pulse-dot/i;

function filterBlocks(css) {
  const blocks = splitCssBlocks(css);
  const critical = [];
  const deferred = [];
  for (const b of blocks) {
    if (b.header && b.header.startsWith('@keyframes')) {
      if (ABOVE_THE_FOLD_RE.test(b.header) || /kenburns|pulse|fade/i.test(b.header)) critical.push(b.raw);
      else deferred.push(b.raw);
    } else if (b.header && (b.header.startsWith('@media') || b.header.startsWith('@supports'))) {
      const innerBlocks = splitCssBlocks(b.body);
      const innerCrit = [];
      const innerDef = [];
      for (const ib of innerBlocks) {
        if (ib.selector && ABOVE_THE_FOLD_RE.test(ib.selector)) innerCrit.push(ib.raw);
        else innerDef.push(ib.raw);
      }
      if (innerCrit.length) critical.push(`${b.header}{\n${innerCrit.join('\n')}\n}`);
      if (innerDef.length) deferred.push(`${b.header}{\n${innerDef.join('\n')}\n}`);
    } else if (b.selector) {
      if (ABOVE_THE_FOLD_RE.test(b.selector)) critical.push(b.raw);
      else deferred.push(b.raw);
    } else {
      deferred.push(b.raw);
    }
  }
  return { critical: critical.join('\n'), deferred: deferred.join('\n') };
}

function buildHomeCriticalDeferred() {
  const baseCritical = [
    'css/styles.css',
    'css/scroll-3d.css',
    'css/services-navigation.css',
    'css/responsive.css',
    'css/header-pro.css',
    'css/mobile-perf.css'
  ];

  const criticalCss = baseCritical.map(f => fs.readFileSync(path.join(FE, f), 'utf8')).join('\n');
  const luxuryCss = fs.readFileSync(path.join(FE, 'css', 'luxury-pro.css'), 'utf8');
  const homeUpgradeCss = fs.readFileSync(path.join(FE, 'css', 'home-upgrade.css'), 'utf8');
  const mobileProCss = fs.readFileSync(path.join(FE, 'css', 'mobile-pro.css'), 'utf8');
  const quickActionsCss = fs.readFileSync(path.join(FE, 'css', 'quick-actions.css'), 'utf8');
  const footerCss = fs.readFileSync(path.join(FE, 'css', 'site-footer.css'), 'utf8');

  const lux = filterBlocks(luxuryCss);
  const hup = filterBlocks(homeUpgradeCss);
  const mob = filterBlocks(mobileProCss);
  const qck = filterBlocks(quickActionsCss);

  const allCritical = criticalCss + '\n' + lux.critical + '\n' + hup.critical + '\n' + mob.critical + '\n' + qck.critical;
  const allDeferred = lux.deferred + '\n' + hup.deferred + '\n' + mob.deferred + '\n' + qck.deferred + '\n' + footerCss;

  const minCrit = minify(allCritical);
  const minDef = minify(allDeferred);

  fs.writeFileSync(path.join(FE, 'css', 'bundle-home-critical.min.css'), minCrit);
  fs.writeFileSync(path.join(FE, 'css', 'bundle-home-deferred.min.css'), minDef);

  return {
    criticalHash: hash(minCrit),
    deferredHash: hash(minDef)
  };
}

function main() {
  // 1. Build optimized FontAwesome subset
  buildFaSubset(minify);

  let cfg;
  if (fs.existsSync(CONFIG)) cfg = JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
  else {
    console.error('Config missing:', CONFIG);
    return;
  }

  // Treatment pages generated from the pSEO registry use the "content" bundle automatically
  const TAX = path.join(__dirname, 'seo', 'taxonomy.json');
  if (fs.existsSync(TAX) && cfg.bundles.content) {
    for (const t of JSON.parse(fs.readFileSync(TAX, 'utf8')).treatments || []) {
      const rel = t.type === 'generated' ? `${t.url.replace(/^\/|\/$/g, '')}/index.html` : null;
      if (rel && !cfg.pages[rel] && fs.existsSync(path.join(FE, rel))) cfg.pages[rel] = 'content';
    }
  }

  const versions = {};
  let rawTotal = 0;
  let minTotal = 0;
  for (const [name, files] of Object.entries(cfg.bundles)) {
    const css = bundleCss(files);
    const raw = files.reduce((a, f) => a + fs.statSync(path.join(FE, f)).size, 0);
    fs.writeFileSync(path.join(FE, 'css', `bundle-${name}.min.css`), css);
    versions[name] = hash(css);
    rawTotal += raw;
    minTotal += Buffer.byteLength(css);
    console.log(`bundle-${name}.min.css  ${files.length} files  ${(raw / 1024).toFixed(1)} KB -> ${(Buffer.byteLength(css) / 1024).toFixed(1)} KB`);
  }


  // Point every page at its bundle
  for (const [rel, name] of Object.entries(cfg.pages)) {
    const file = path.join(FE, rel);
    if (!fs.existsSync(file)) { console.warn('missing page', rel); continue; }
    let html = fs.readFileSync(file, 'utf8');

    // Upgrade FontAwesome CDN link to local fa-subset.min.css
    html = html.replace(/https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome\/6\.4\.0\/css\/all\.min\.css/g, '/css/fa-subset.min.css');

    if (rel === 'index.html' || name === 'home') {
      const homeReplacement = `    <link rel="stylesheet" href="css/bundle-home.min.css?v=${versions['home']}"><!-- built by tools/build-css.js -->\n`;
      const homePattern = /[ \t]*<link\b[^>]*href=["'][^"']*bundle-home(?:-critical)?\.min\.css[^"']*["'][^>]*>(?:[ \t]*<!--[\s\S]*?-->)?[ \t]*(?:\r?\n[ \t]*<!--[\s\S]*?-->)*(?:\r?\n[ \t]*<noscript>[\s\S]*?<\/noscript>)*(?:\r?\n[ \t]*<script>[\s\S]*?<\/script>)*\r?\n?/i;
      if (homePattern.test(html)) {
        html = html.replace(homePattern, homeReplacement);
      } else {
        const basicLink = /[ \t]*<link\b[^>]*href=["'][^"']*bundle-home[^"']*["'][^>]*>(?:[ \t]*<!--[\s\S]*?-->)?[ \t]*\r?\n?/i;
        if (basicLink.test(html)) {
          html = html.replace(basicLink, homeReplacement);
        }
      }
      fs.writeFileSync(file, html);
      continue;
    }

    const srcs = new Set(cfg.bundles[name]);
    const tagRe = /[ \t]*<link\b[^>]*>(?:<!-- built by tools\/build-css\.js[^>]*?-->)?[ \t]*\r?\n?/gi;
    let prefix = null;
    let first = -1;
    html = html.replace(tagRe, (m, offset) => {
      if (!/rel=["']stylesheet["']/i.test(m)) return m;
      const hrefMatch = m.match(/href=["'](\/?)(css\/[^"'?]+\.css)(?:\?[^"']*)?["']/i);
      if (!hrefMatch) return m;
      const slash = hrefMatch[1] || '';
      const href = hrefMatch[2];
      if (!srcs.has(href) && href !== `css/bundle-${name}.min.css`) return m;
      if (prefix === null) { prefix = slash; first = offset; return '\u0000BUNDLE\u0000'; }
      return '';
    });
    if (first === -1) { console.warn('no stylesheet links found in', rel); continue; }
    const tag = `    <link rel="stylesheet" href="${prefix}css/bundle-${name}.min.css?v=${versions[name]}"><!-- built by tools/build-css.js from: ${cfg.bundles[name].map((f) => path.basename(f)).join(', ')} -->\n`;
    html = html.replace('\u0000BUNDLE\u0000', tag);
    fs.writeFileSync(file, html);
  }
  console.log(`total ${(rawTotal / 1024).toFixed(0)} KB of source CSS -> ${(minTotal / 1024).toFixed(0)} KB in ${Object.keys(cfg.bundles).length} bundles; ${Object.keys(cfg.pages).length} pages updated`);
}

if (require.main === module) main();
module.exports = { minify };
