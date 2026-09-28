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
 * It then rewrites every page's <link> tags to point at its bundle with a
 * content hash (?v=abc12345), so browsers re-download only when CSS changes.
 *
 * Keep editing the normal source files in frontend/css/ — then run:
 *
 *     npm run build:css      (or: node tools/build-css.js)
 *
 * Which files go into which bundle lives in tools/css-bundles.json. To add a
 * page, add it under "pages" with its bundle name (create the bundle list if
 * it needs a new combination of stylesheets).
 */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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
      const j = css.indexOf(')', i);                                // url(...) verbatim
      emit(css.slice(i, j + 1));
      i = j + 1;
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

// Build the config from the pages' current <link> tags (first run only).
function discover() {
  const pages = {};
  const bundles = {};
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) return ['images', 'video', 'uploads', 'posters', 'css', 'js'].includes(d.name) ? [] : walk(p);
    return d.name.endsWith('.html') ? [p] : [];
  });
  for (const file of walk(FE)) {
    const html = fs.readFileSync(file, 'utf8');
    const list = [...html.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="\/?(css\/[^"?]+\.css)(?:\?[^"]*)?"[^>]*>/g)].map((m) => m[1]);
    if (!list.length) continue;
    const key = list.join('|');
    let name = Object.keys(bundles).find((b) => bundles[b].join('|') === key);
    if (!name) {
      const rel = path.relative(FE, file).replace(/\\/g, '/');
      name = rel.replace(/(\/index)?\.html$/, '').replace(/\//g, '-') || 'home';
      if (name === 'index') name = 'home';
      bundles[name] = list;
    }
    pages[path.relative(FE, file).replace(/\\/g, '/')] = name;
  }
  return { bundles, pages };
}

function main() {
  let cfg;
  if (fs.existsSync(CONFIG)) cfg = JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
  else {
    cfg = discover();
    fs.writeFileSync(CONFIG, JSON.stringify(cfg, null, 2) + '\n');
    console.log('created', path.relative(ROOT, CONFIG));
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
    const srcs = new Set(cfg.bundles[name]);
    const tagRe = /[ \t]*<link[^>]*rel="stylesheet"[^>]*href="(\/?)(css\/[^"?]+\.css)(?:\?[^"]*)?"[^>]*>(?:<!-- built by tools\/build-css\.js[^>]*?-->)?[ \t]*\r?\n?/g;
    let prefix = null;
    let first = -1;
    html = html.replace(tagRe, (m, slash, href, offset) => {
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
