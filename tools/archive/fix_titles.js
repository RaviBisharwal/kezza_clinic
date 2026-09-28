#!/usr/bin/env node
/**
 * RETIRED (Sep 2026) — do not restore.
 *
 * This one-off script hard-coded the old dead domain (kezzaclinic.com), the
 * wrong schema phone (+91-9414077399), wrong hours (10:00–20:00) and old
 * titles/descriptions. Re-running it would silently undo the SEO fixes.
 *
 * Titles, meta descriptions, canonical/OG tags and JSON-LD now live directly
 * in each page. Clinic facts (NAP, hours, doctors) are documented in
 * tools/seo/site-data.json — run `npm run seo:check` after editing pages.
 * The original version is in git history if you ever need it.
 */
console.error('fix_titles.js is retired — see the comment at the top of this file.');
process.exit(1);
