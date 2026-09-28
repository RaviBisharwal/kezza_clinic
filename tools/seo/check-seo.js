#!/usr/bin/env node
/**
 * Kezza Clinic — SEO consistency checker (zero dependencies).
 *
 *     npm run seo:check        (or: node tools/seo/check-seo.js)
 *
 * Fails (exit code 1) on anything that would hurt indexing or NAP consistency:
 *   • canonical / og:url not on https://www.kezza.co.in, or the old kezzaclinic.com domain anywhere
 *   • missing/duplicate title, description, canonical, lang="en-IN"
 *   • JSON-LD that doesn't parse, phone numbers or opening hours that don't match tools/seo/site-data.json
 *   • FAQPage questions that aren't visible on the page
 *   • internal links, images or og:images that point at files that don't exist
 *   • indexable pages missing from sitemap.xml (or sitemap URLs with no file)
 * Warns on title/description lengths outside Google's display limits.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const FE = path.join(ROOT, 'frontend');
const DATA = JSON.parse(fs.readFileSync(path.join(__dirname, 'site-data.json'), 'utf8'));
const BASE = DATA.base_url;
const digits = (s) => String(s).replace(/\D/g, '').slice(-10);
const PHONES = new Set([DATA.organization.telephone, ...Object.values(DATA.branches).flatMap((b) => b.phones)].map(digits));
const SKIP_DIRS = new Set(['images', 'video', 'posters', 'uploads', 'css', 'js']);

const errors = [];
const warnings = [];
const err = (f, m) => errors.push(`${f}: ${m}`);
const warn = (f, m) => warnings.push(`${f}: ${m}`);

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) return SKIP_DIRS.has(d.name) ? [] : walk(p);
    if (/^google[a-z0-9]+\.html$/i.test(d.name)) return [];
    return d.name.endsWith('.html') ? [p] : [];
  });
}

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
  .replace(/&#39;|&#x27;/g, "'").replace(/&nbsp;/g, ' ').replace(/&ndash;/g, '–').replace(/&mdash;/g, '—')
  .replace(/&rsquo;/g, '’').replace(/&ldquo;|&rdquo;/g, '"').replace(/&middot;/g, '·').replace(/&bull;/g, '•');
const textOf = (html) => decode(html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ');
const norm = (s) => decode(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

function localTarget(fromFile, href) {
  if (href && href.includes('${')) return null;                  // JS template strings
  if (!href || /^(https?:|mailto:|tel:|javascript:|data:|#|\/\/)/i.test(href)) {
    if (href && href.startsWith(BASE)) href = href.slice(BASE.length) || '/';
    else return null;
  }
  const clean = decodeURI(href.split('#')[0].split('?')[0]);
  if (!clean) return null;
  let target = clean.startsWith('/') ? path.join(FE, clean) : path.resolve(path.dirname(fromFile), clean);
  if (clean.endsWith('/')) target = path.join(target, 'index.html');
  return target;
}

function urlToFile(url) {
  let p = url.replace(BASE, '') || '/';
  if (p.endsWith('/')) p += 'index.html';
  return path.join(FE, p);
}

const pages = walk(FE);
const indexable = [];

for (const file of pages) {
  const rel = path.relative(FE, file).replace(/\\/g, '/');
  const html = fs.readFileSync(file, 'utf8');
  const noindex = /<meta\s+name="robots"\s+content="[^"]*noindex/i.test(html);

  if (/kezzaclinic\.com/i.test(html)) err(rel, 'references the dead domain kezzaclinic.com');
  if (!/<html[^>]*\blang="en-IN"/.test(html)) err(rel, 'missing lang="en-IN"');
  if (/Dr\.\s*Krishna/.test(html)) err(rel, 'Krishna is the PMU artist, not a doctor ("Dr. Krishna")');

  // Links, images, scripts, stylesheets that resolve to local files
  for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const t = localTarget(file, m[1]);
    if (t && !fs.existsSync(t)) err(rel, `broken local reference: ${m[1]}`);
  }
  for (const m of html.matchAll(/\ssrcset="([^"]+)"/g)) {
    for (const part of m[1].split(',')) {
      const t = localTarget(file, part.trim().split(/\s+/)[0]);
      if (t && !fs.existsSync(t)) err(rel, `broken srcset image: ${part.trim()}`);
    }
  }
  if (noindex) continue;
  indexable.push(rel);

  const titles = [...html.matchAll(/<title>([\s\S]*?)<\/title>/g)];
  if (titles.length !== 1) err(rel, `expected 1 <title>, found ${titles.length}`);
  else {
    const t = decode(titles[0][1].trim());
    if (t.length > 60) warn(rel, `title is ${t.length} chars (Google shows ~60): "${t}"`);
  }
  const descs = [...html.matchAll(/<meta\s+name="description"\s+content="([^"]*)"/g)];
  if (descs.length !== 1) err(rel, `expected 1 meta description, found ${descs.length}`);
  else {
    const d = decode(descs[0][1]);
    if (d.length > 160 || d.length < 70) warn(rel, `meta description is ${d.length} chars (aim for 110–160)`);
  }
  const canon = [...html.matchAll(/<link\s+rel="canonical"\s+href="([^"]+)"/g)].map((m) => m[1]);
  if (canon.length !== 1) err(rel, `expected 1 canonical, found ${canon.length}`);
  else {
    if (!canon[0].startsWith(BASE + '/')) err(rel, `canonical not on ${BASE}: ${canon[0]}`);
    if (!fs.existsSync(urlToFile(canon[0]))) err(rel, `canonical points at a page that doesn't exist: ${canon[0]}`);
    const og = (html.match(/property="og:url"\s+content="([^"]+)"/) || [])[1];
    if (og !== canon[0]) err(rel, `og:url (${og}) differs from canonical (${canon[0]})`);
  }
  const ogImg = (html.match(/property="og:image"\s+content="([^"]+)"/) || [])[1];
  if (!ogImg) err(rel, 'missing og:image');
  else if (!fs.existsSync(urlToFile(ogImg))) err(rel, `og:image file missing: ${ogImg}`);
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) warn(rel, `${h1} <h1> tags (expected 1)`);

  // Structured data
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (!blocks.length) warn(rel, 'no JSON-LD');
  const visible = norm(textOf(html));
  for (const b of blocks) {
    let data;
    try { data = JSON.parse(b[1]); } catch (e) { err(rel, `JSON-LD does not parse: ${e.message}`); continue; }
    const nodes = data['@graph'] || [data];
    const all = JSON.stringify(data);
    for (const m of all.matchAll(/"telephone":"([^"]+)"/g)) {
      if (!PHONES.has(digits(m[1]))) err(rel, `schema telephone ${m[1]} is not in site-data.json`);
    }
    for (const m of all.matchAll(/"(opens|closes)":"([^"]+)"/g)) {
      if (m[2] !== DATA.hours[m[1]]) err(rel, `schema ${m[1]} ${m[2]} doesn't match site-data.json (${DATA.hours[m[1]]})`);
    }
    if (/"openingHours"/.test(all)) err(rel, 'uses legacy "openingHours" text; use openingHoursSpecification');
    for (const m of all.matchAll(/"(?:url|item|@id)":"(https:\/\/www\.kezza\.co\.in\/[^"#]*)/g)) {
      if (!fs.existsSync(urlToFile(m[1]))) err(rel, `schema URL has no page: ${m[1]}`);
    }
    for (const n of nodes) {
      if (n['@type'] === 'FAQPage') {
        for (const q of n.mainEntity || []) {
          if (!visible.includes(norm(q.name))) err(rel, `FAQ question not visible on page: "${q.name}"`);
        }
      }
    }
  }
}

// Sitemap
const sitemap = fs.readFileSync(path.join(FE, 'sitemap.xml'), 'utf8');
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
for (const l of locs) {
  if (!l.startsWith(BASE + '/')) err('sitemap.xml', `URL not on ${BASE}: ${l}`);
  if (!fs.existsSync(urlToFile(l))) err('sitemap.xml', `URL has no file: ${l}`);
}
const inSitemap = new Set(locs.map((l) => path.relative(FE, urlToFile(l)).replace(/\\/g, '/')));
for (const rel of indexable) {
  if (rel === '404.html') continue;
  if (!inSitemap.has(rel)) err('sitemap.xml', `indexable page missing: ${rel}`);
}
const robots = fs.readFileSync(path.join(FE, 'robots.txt'), 'utf8');
if (!robots.includes(`Sitemap: ${BASE}/sitemap.xml`)) err('robots.txt', 'Sitemap line must point at ' + BASE + '/sitemap.xml');
if (!fs.existsSync(path.join(FE, 'llms.txt'))) err('llms.txt', 'missing (must be lowercase: /llms.txt)');

console.log(`Checked ${pages.length} pages (${indexable.length} indexable), ${locs.length} sitemap URLs.`);
warnings.forEach((w) => console.log('  warn  ' + w));
errors.forEach((e) => console.log('  ERROR ' + e));
console.log(errors.length ? `\n${errors.length} error(s), ${warnings.length} warning(s)` : `\nOK: no errors, ${warnings.length} warning(s)`);
process.exit(errors.length ? 1 : 0);
