#!/usr/bin/env node
/**
 * Kezza Clinic — JavaScript build: minify + cache-busting (npm run build:js).
 *
 * Keep editing the readable files in frontend/js/*.js. This script writes a
 * minified copy of each one next to it (frontend/js/<name>.min.js, made with
 * esbuild) and points every page at the minified copy with a content hash:
 *
 *     <script src="js/pro-animations.min.js?v=3f9c2a1b" defer></script>
 *
 * quick-actions.js and scanner-launch.js load other files while the page is
 * running (the chatbot, the scanner popup); their references are stamped with
 * the current hashes before they are minified.
 *
 * Run it after editing anything in frontend/js (and after `npm run build:css`,
 * because the scanner popup's stylesheet is one of the CSS bundles):
 *
 *     npm run build          (CSS bundles, then this)
 *
 * esbuild is a devDependency: run `npm install` once.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

let esbuild;
try {
  esbuild = require('esbuild');
} catch (e) {
  console.error('\nesbuild is not installed. Run `npm install` in the project folder, then `npm run build:js` again.\n');
  process.exit(1);
}

const FE = path.resolve(__dirname, '..', 'frontend');
const JS_DIR = path.join(FE, 'js');
const SKIP_DIRS = new Set(['images', 'video', 'posters', 'uploads', 'css', 'js']);
const LOADERS = ['quick-actions.js', 'scanner-launch.js'];

const md5 = (buf) => crypto.createHash('md5').update(buf).digest('hex').slice(0, 8);
const versionOf = (rel) => {
  const file = path.join(FE, rel);
  return fs.existsSync(file) ? md5(fs.readFileSync(file)) : null;
};

let before = 0;
let after = 0;
function minify(name) {
  const src = fs.readFileSync(path.join(JS_DIR, name), 'utf8');
  let code;
  try {
    code = esbuild.transformSync(src, { loader: 'js', minify: true, charset: 'utf8', legalComments: 'none', target: 'es2020' }).code;
  } catch (err) {
    console.error(`Could not minify js/${name}:\n${err.message}`);
    process.exit(1);
  }
  const dest = name.replace(/\.js$/, '.min.js');
  const destPath = path.join(JS_DIR, dest);
  if (!fs.existsSync(destPath) || fs.readFileSync(destPath, 'utf8') !== code) fs.writeFileSync(destPath, code);
  before += Buffer.byteLength(src);
  after += Buffer.byteLength(code);
}

// 1. Everything except the runtime loaders
const sources = fs.readdirSync(JS_DIR).filter((f) => f.endsWith('.js') && !f.endsWith('.min.js')).sort();
sources.filter((f) => !LOADERS.includes(f)).forEach(minify);

// 2. Stamp the files the loaders inject at runtime, then minify the loaders
const RUNTIME_REF = /(['"])(\/?)((?:js\/[A-Za-z0-9._-]+?\.min\.js)|(?:css\/bundle-[A-Za-z0-9._-]+\.min\.css))(?:\?v=[A-Za-z0-9._-]*)?\1/g;
for (const name of LOADERS) {
  const file = path.join(JS_DIR, name);
  if (!fs.existsSync(file)) continue;
  const src = fs.readFileSync(file, 'utf8');
  const out = src.replace(RUNTIME_REF, (m, q, slash, rel) => {
    const v = versionOf(rel);
    if (!v) { console.warn(`  ! js/${name} refers to a missing file: ${rel}`); return m; }
    return `${q}${slash}${rel}?v=${v}${q}`;
  });
  if (out !== src) fs.writeFileSync(file, out);
  minify(name);
}

// 3. Point every page at the minified files, with content hashes
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) return SKIP_DIRS.has(d.name) ? [] : walk(p);
    return d.name.endsWith('.html') ? [p] : [];
  });
}
const TAG = /<script\b[^>]*\ssrc="(\/?)js\/([A-Za-z0-9._-]+?)(?:\.min)?\.js(?:\?v=[^"]*)?"[^>]*>/g;
let pagesChanged = 0;
const missing = new Set();
for (const file of walk(FE)) {
  const html = fs.readFileSync(file, 'utf8');
  const out = html.replace(TAG, (tag, slash, name) => {
    const rel = `js/${name}.min.js`;
    const v = versionOf(rel);
    if (!v) { missing.add(`${path.relative(FE, file)} -> js/${name}.js`); return tag; }
    return tag.replace(/src="[^"]*"/, `src="${slash}${rel}?v=${v}"`);
  });
  if (out !== html) { fs.writeFileSync(file, out); pagesChanged++; }
}
for (const m of missing) console.warn(`  ! script not found: ${m}`);
console.log(`js: ${sources.length} files minified ${(before / 1024).toFixed(0)} KB -> ${(after / 1024).toFixed(0)} KB; ${pagesChanged} page(s) updated`);
