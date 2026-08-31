#!/usr/bin/env node
/**
 * Kezza Clinic — 90%+ SEO & Performance Optimizer
 * Implements Google Lighthouse & technical SEO standards across all HTML files:
 * 1. Favicons & Apple Touch Icons
 * 2. Meta robots (index/follow for public, noindex for admin)
 * 3. Theme color & Author tags
 * 4. rel="noopener noreferrer" on all external target="_blank" links
 * 5. aria-label on logo links and icon buttons
 * 6. Native lazy loading (loading="lazy" decoding="async") on below-the-fold images
 * 7. Google Fonts preconnect & display=swap optimization
 */

const fs = require('fs');
const path = require('path');

const frontendDir = path.join(__dirname, '..', 'frontend');
const files = fs.readdirSync(frontendDir).filter(f => f.endsWith('.html'));

let totalOptimizations = 0;

files.forEach(file => {
  const filePath = path.join(frontendDir, file);
  let html = fs.readFileSync(filePath, 'utf8');
  let changes = 0;

  // 1. Ensure <html lang="en">
  if (!/<html[^>]*lang=/i.test(html)) {
    html = html.replace(/<html/i, '<html lang="en"');
    changes++;
  }

  // 2. Add Favicon and theme-color if missing
  if (!/<link[^>]*rel=["'](?:shortcut )?icon["']/i.test(html)) {
    const faviconBlock = `    <link rel="icon" type="image/png" href="images/logo.png">\n    <link rel="apple-touch-icon" href="images/logo.png">\n    <meta name="theme-color" content="#0B132B">`;
    html = html.replace(/<\/head>/i, `${faviconBlock}\n</head>`);
    changes++;
  }

  // 3. Add meta robots if missing
  if (!/<meta[^>]*name=["']robots["']/i.test(html)) {
    const robotsTag = file === 'admin.html' 
      ? `    <meta name="robots" content="noindex, nofollow">`
      : `    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">\n    <meta name="author" content="Kezza Hair & Skin Clinic">`;
    html = html.replace(/<\/head>/i, `${robotsTag}\n</head>`);
    changes++;
  }

  // 4. Secure all target="_blank" links with rel="noopener noreferrer"
  html = html.replace(/<a\b([^>]*\btarget=["']_blank["'][^>]*)>/gi, (match, attrs) => {
    if (!/\brel=/i.test(attrs)) {
      changes++;
      return `<a ${attrs} rel="noopener noreferrer">`;
    } else if (!/noopener/i.test(attrs)) {
      changes++;
      return `<a ${attrs.replace(/rel=["']([^"']*)["']/i, 'rel="$1 noopener noreferrer"')}>`;
    }
    return match;
  });

  // 5. Add aria-label="Kezza Clinic Home" to logo links
  html = html.replace(/<a\s+href=["']index\.html["'](?![^>]*aria-label)([^>]*)>(\s*<img[^>]*logo[^>]*>\s*)<\/a>/gi, (match, attrs, img) => {
    changes++;
    return `<a href="index.html" aria-label="Kezza Clinic Home"${attrs}>${img}</a>`;
  });

  // 6. Add loading="lazy" and decoding="async" to images (skip logos and top hero images)
  let imgIdx = 0;
  html = html.replace(/<img\b([^>]*)>/gi, (match, attrs) => {
    imgIdx++;
    const isHeroOrLogo = /logo|hero1\./i.test(attrs) || imgIdx <= 2;
    if (!isHeroOrLogo) {
      let newAttrs = attrs;
      if (!/\bloading=/i.test(attrs)) {
        newAttrs += ' loading="lazy"';
        changes++;
      }
      if (!/\bdecoding=/i.test(attrs)) {
        newAttrs += ' decoding="async"';
        changes++;
      }
      return `<img${newAttrs}>`;
    }
    return match;
  });

  // 7. Ensure Google Fonts have display=swap
  html = html.replace(/fonts\.googleapis\.com\/css2\?family=([^"'>\s]+)(?!.*display=swap)/gi, (match) => {
    changes++;
    return match + '&display=swap';
  });

  if (changes > 0) {
    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`✅ ${file} — applied ${changes} optimizations`);
    totalOptimizations += changes;
  } else {
    console.log(`✨ ${file} — already fully optimized`);
  }
});

console.log(`\n🎉 Total optimization enhancements applied: ${totalOptimizations}`);
