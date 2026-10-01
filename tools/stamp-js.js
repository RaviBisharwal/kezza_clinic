#!/usr/bin/env node
/**
 * Kezza Clinic — cache-busting for JavaScript files (zero dependencies).
 *
 * The .htaccess caches CSS/JS for a week, so an edited script only reaches
 * returning visitors when its URL changes. This stamps every local script
 * reference with a short content hash:
 *
 *     <script src="js/kezza-ai.js?v=3f9c2a1b" defer></script>
 *
 * It rewrites <script src> tags in every page plus the few places where a
 * script or stylesheet is injected at runtime ('js/kezza-ai.js?v=…' in the
 * home page and quick-actions.js, the scanner modal files in scanner-launch.js
 * and quick-actions.js). Run it after editing any file in frontend/js:
 *
 *     npm run build          (or: node tools/stamp-js.js)
 */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const FE = path.resolve(__dirname, '..', 'frontend');
const SKIP_DIRS = new Set(['images', 'video', 'posters', 'uploads', 'css', 'js']);

const hashes = {};
const hashOf = (rel) => {
  if (!(rel in hashes)) {
    const file = path.join(FE, rel);
    hashes[rel] = fs.existsSync(file) ? crypto.createHash('md5').update(fs.readFileSync(file)).digest('hex').slice(0, 8) : null;
  }
  return hashes[rel];
};

// js/foo.js or css/scanner-modal.css, optionally with a leading slash and an existing ?v=…
const REF = /((?:\/)?)((?:js\/[A-Za-z0-9._-]+\.js)|(?:css\/scanner-modal\.css))(\?v=[A-Za-z0-9._-]*)?/g;
const stamp = (text, only) => text.replace(only, (tag) => tag.replace(REF, (m, slash, rel) => {
  const h = hashOf(rel);
  return h ? `${slash}${rel}?v=${h}` : m;
}));

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) return SKIP_DIRS.has(d.name) ? [] : walk(p);
    return d.name.endsWith('.html') ? [p] : [];
  });
}

let changed = 0;
const write = (file, before, after) => { if (before !== after) { fs.writeFileSync(file, after); changed++; } };

// 1. <script src="..."> tags and the home page's inline lazy loader
for (const file of walk(FE)) {
  const html = fs.readFileSync(file, 'utf8');
  let out = stamp(html, /<script\b[^>]*\ssrc="[^"]*"[^>]*>/g);
  out = stamp(out, /sc\.src\s*=\s*'[^']*'/g);
  write(file, html, out);
}
// 2. runtime-injected assets inside the shared scripts
for (const rel of ['js/quick-actions.js', 'js/scanner-launch.js']) {
  const file = path.join(FE, rel);
  const js = fs.readFileSync(file, 'utf8');
  write(file, js, stamp(js, /'(?:[^'\\]|\\.)*(?:kezza-ai\.js|scanner-modal\.js|scanner-modal\.css)(?:\?v=[^']*)?'/g));
}
// quick-actions.js / scanner-launch.js may have changed above, so pages must point at their new hashes
for (const rel of ['js/quick-actions.js', 'js/scanner-launch.js']) delete hashes[rel];
for (const file of walk(FE)) {
  const html = fs.readFileSync(file, 'utf8');
  write(file, html, stamp(html, /<script\b[^>]*\ssrc="[^"]*"[^>]*>/g));
}
console.log(`stamped JS versions: ${changed} file write(s)`);
