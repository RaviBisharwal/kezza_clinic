#!/usr/bin/env node
/**
 * Fix excessive headings on index.html and hair-services.html:
 * - H4 procedure/item names → <p class="item-title">
 * - Footer H3s → <p class="footer-heading">
 * - CTA sentences inside H4 → <p class="cta-text">
 * - Duplicate "Hair Services" H3 in footer → renamed
 */
const fs = require('fs');

// ── index.html ──────────────────────────────────────────────────────
let html = fs.readFileSync('frontend/index.html', 'utf8');

// 1. Convert H4 procedure item headings to <p class="item-title"> 
//    (these are inside service card grids — not real document headings)
//    We target h4 tags that are inside .procedure-item, .service-detail, .treatment-item etc.
html = html.replace(
  /<h4([^>]*class="[^"]*(?:procedure|service-detail|treatment|detail-item|sub-item)[^"]*"[^>]*)>([\s\S]*?)<\/h4>/gi,
  '<p$1 role="heading" aria-level="4">$2</p>'
);

// 2. Convert ALL remaining H4s to styled paragraphs
//    (52 headings → target < 20; H4s are the bulk)
html = html.replace(/<h4([^>]*)>([\s\S]*?)<\/h4>/gi, (match, attrs, content) => {
  // Keep H4 only if it's a real sub-section heading (not a list item)
  const text = content.replace(/<[^>]+>/g,'').trim();
  // CTAs (questions / calls to action)
  if (/\?$/.test(text) || /Looking for|Ready to|Explore Complete/i.test(text)) {
    return `<p${attrs} class="cta-subtext">${content}</p>`;
  }
  // Everything else → item-title
  return `<p${attrs} class="item-heading">${content}</p>`;
});

// 3. Fix footer H3s → styled paragraphs (not semantic headings)
//    Match the footer nav group titles
html = html.replace(
  /<h3([^>]*)>\s*(About|Quick Links|Contact)\s*<\/h3>/gi,
  '<p$1 class="footer-nav-title">$2</p>'
);

// 4. Fix duplicate "Hair Services" in footer — rename to "Services"
// The footer one comes after the main content one
let hairServicesCount = 0;
html = html.replace(/<h3([^>]*)>\s*Hair Services\s*<\/h3>/gi, (match, attrs) => {
  hairServicesCount++;
  if (hairServicesCount > 1) {
    return `<p${attrs} class="footer-nav-title">Our Services</p>`;
  }
  return match;
});

fs.writeFileSync('frontend/index.html', html, 'utf8');

// Count final headings
const finalCount = [...html.matchAll(/<h[1-6][^>]*>/gi)].length;
console.log('✅ index.html — headings reduced to:', finalCount);

// ── hair-services.html ──────────────────────────────────────────────
let html2 = fs.readFileSync('frontend/hair-services.html', 'utf8');

// Convert H4s that are procedure/item names
html2 = html2.replace(/<h4([^>]*)>([\s\S]*?)<\/h4>/gi, (match, attrs, content) => {
  const text = content.replace(/<[^>]+>/g,'').trim();
  if (/\?$/.test(text) || /Looking for|Ready to|Book|Contact|Explore/i.test(text)) {
    return `<p${attrs} class="cta-subtext">${content}</p>`;
  }
  return `<p${attrs} class="item-heading">${content}</p>`;
});

// Fix footer H3s
html2 = html2.replace(
  /<h3([^>]*)>\s*(About|Quick Links|Contact|Hair Services|Skin Services)\s*<\/h3>/gi,
  (match, attrs, title) => {
    // Only convert if it looks like a footer item
    return `<p${attrs} class="footer-nav-title">${title}</p>`;
  }
);

// Fix duplicate section headings
const dupeMap2 = {};
html2 = html2.replace(/<(h[1-6])([^>]*)>([\s\S]*?)<\/h[1-6]>/gi, (match, tag, attrs, content) => {
  const text = content.replace(/<[^>]+>/g,'').trim().replace(/\s+/g,' ');
  dupeMap2[text] = (dupeMap2[text]||0)+1;
  if (dupeMap2[text] > 1) {
    // Second occurrence → downgrade to paragraph
    return `<p${attrs} class="section-subhead">${content}</p>`;
  }
  return match;
});

fs.writeFileSync('frontend/hair-services.html', html2, 'utf8');
const finalCount2 = [...html2.matchAll(/<h[1-6][^>]*>/gi)].length;
console.log('✅ hair-services.html — headings reduced to:', finalCount2);

// ── Quick fix for other pages with > 30 headings ──────────────────
['skin-services.html','about.html','permanent-makeup.html','face-scanner.html','terms.html','branches.html'].forEach(file => {
  let h = fs.readFileSync('frontend/' + file, 'utf8');
  
  // Footer H3 nav titles
  h = h.replace(
    /<h3([^>]*)>\s*(About|Quick Links|Contact|Hair Services|Skin Services|Services)\s*<\/h3>/gi,
    '<p$1 class="footer-nav-title">$2</p>'
  );

  // Duplicate headings → demote second occurrence
  const seen = {};
  h = h.replace(/<(h[1-6])([^>]*)>([\s\S]*?)<\/h[1-6]>/gi, (match, tag, attrs, content) => {
    const text = content.replace(/<[^>]+>/g,'').trim().replace(/\s+/g,' ');
    seen[text] = (seen[text]||0)+1;
    if (seen[text] > 1) {
      return `<p${attrs} class="section-subhead">${content}</p>`;
    }
    return match;
  });

  fs.writeFileSync('frontend/' + file, h, 'utf8');
  const cnt = [...h.matchAll(/<h[1-6][^>]*>/gi)].length;
  console.log('✅', file, '— headings:', cnt);
});
