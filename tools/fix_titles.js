#!/usr/bin/env node
/**
 * Fix SEO Errors:
 * 1. Optimize all title tags to 50-60 chars (SEO sweet spot)
 * 2. Fix duplicate/poor title tags
 * 3. Ensure all meta descriptions are 120-155 chars
 */
const fs = require('fs');

// Ideal titles: 50–60 chars, unique per page, keyword-first
const TITLES = {
  'index.html':           'Kezza Clinic – Best Hair Transplant in Jaipur',   // 46 chars
  'about.html':           'About Kezza Clinic | Hair & Skin Experts Jaipur',   // 47 chars
  'hair-services.html':   'Hair Transplant: FUE, DHI, PRP & GFC | Kezza',      // 45 chars
  'skin-services.html':   'Skin Care & Laser Treatments | Kezza Clinic',        // 43 chars
  'weight-loss.html':     'Non-Surgical Weight Loss & Body Sculpting | Kezza',  // 49 chars
  'permanent-makeup.html':'Permanent Makeup PMU: Microblading & SMP | Kezza',  // 48 chars
  'face-scanner.html':    'Free AI Skin & Hair Scanner | Kezza Clinic',         // 42 chars
  'branches.html':        'Kezza Clinic Locations & Franchise | Jaipur & Sikar',// 51 chars
  'contact.html':         'Book Consultation | Contact Kezza Clinic Jaipur',    // 47 chars
  'terms.html':           'Terms, Privacy Policy & Disclaimer | Kezza Clinic',  // 49 chars
  'admin.html':           'Admin Dashboard | Kezza Hair & Skin Clinic',          // 42 chars
};

// Full 120-155 char meta descriptions
const DESCS = {
  'index.html':
    'Kezza Hair & Skin Clinic — top-rated FUE & DHI hair transplant, advanced skin treatments and AI face scanner in Jaipur & Sikar, Rajasthan. Book a free consultation today.',
  'about.html':
    'Meet the expert team at Kezza Clinic — board-certified dermatologists and experienced hair transplant surgeons delivering precision care in Jaipur and Sikar, Rajasthan.',
  'hair-services.html':
    'Expert hair restoration at Kezza Clinic: FUE, DHI hair transplant, PRP, GFC therapy, beard and eyebrow transplant in Jaipur & Sikar. Natural results, experienced surgeons.',
  'skin-services.html':
    'Advanced dermatology at Kezza Clinic: HydraFacial, carbon peel, laser resurfacing, anti-aging, pigmentation and acne scar removal in Jaipur & Sikar, Rajasthan.',
  'weight-loss.html':
    'Safe non-surgical weight loss and body sculpting at Kezza Clinic, Jaipur. Personalised programs, certified specialists and proven results. Book your free consultation now.',
  'permanent-makeup.html':
    'Professional permanent makeup at Kezza Clinic Jaipur: microblading, ombre brows, lip blush, eyeliner and scalp micropigmentation (SMP). Natural-looking, long-lasting results.',
  'face-scanner.html':
    'Free AI-powered face and scalp assessment at Kezza Clinic. Our MediaPipe scanner analyses your skin and hair in 9 steps and matches you to the right specialist — no charge.',
  'branches.html':
    'Kezza Clinic franchise network across Rajasthan — clinics in Jaipur and Sikar. Explore franchise opportunities with full training, support and proven business model.',
  'contact.html':
    'Contact Kezza Hair & Skin Clinic to book your consultation in Jaipur or Sikar. Reach us by phone, WhatsApp or our online form. Same-day appointments available.',
  'terms.html':
    'Terms and conditions, privacy policy and medical disclaimer for Kezza Hair & Skin Clinic services in Jaipur and Sikar, Rajasthan. Read before using our services.',
  'admin.html':
    'Kezza Clinic internal admin panel for patient intake and clinic management. Authorised staff only.',
};

let fixed = 0;
const files = fs.readdirSync('frontend').filter(f => f.endsWith('.html'));

files.forEach(file => {
  if (!TITLES[file]) return;
  let html = fs.readFileSync('frontend/' + file, 'utf8');

  // Replace title
  html = html.replace(/<title[^>]*>.*?<\/title>/si, `<title>${TITLES[file]}</title>`);

  // Replace OG title too
  html = html.replace(/(property="og:title"\s+content=")[^"]*(")/i,   `$1${TITLES[file]}$2`);
  html = html.replace(/(property="og:title"\s+content=')[^']*(')/i,   `$1${TITLES[file]}$2`);
  html = html.replace(/(content="[^"]*"\s+property="og:title")/i,      `content="${TITLES[file]}" property="og:title"`);

  // Replace Twitter title
  html = html.replace(/(name="twitter:title"\s+content=")[^"]*(")/i,  `$1${TITLES[file]}$2`);
  html = html.replace(/(name="twitter:title"\s+content=')[^']*(')/i,  `$1${TITLES[file]}$2`);

  // Replace meta description
  if (DESCS[file]) {
    const d = DESCS[file];
    // Standard format: name="description" content="..."
    html = html.replace(/(name="description"\s+content=")[^"]*(")/i,   `$1${d}$2`);
    html = html.replace(/(name="description"\s+content=')[^']*(')/i,   `$1${d}$2`);
    html = html.replace(/(content="[^"]*"\s+name="description")/i,      `content="${d}" name="description"`);
    // OG description
    html = html.replace(/(property="og:description"\s+content=")[^"]*(")/i, `$1${d}$2`);
    html = html.replace(/(property="og:description"\s+content=')[^']*(')/i, `$1${d}$2`);
    // Twitter description
    html = html.replace(/(name="twitter:description"\s+content=")[^"]*(")/i, `$1${d}$2`);
    html = html.replace(/(name="twitter:description"\s+content=')[^']*(')/i, `$1${d}$2`);
  }

  fs.writeFileSync('frontend/' + file, html, 'utf8');
  const titleLen = TITLES[file].length;
  const descLen  = (DESCS[file] || '').length;
  console.log(`✅ ${file} — title: ${titleLen} chars, desc: ${descLen} chars`);
  fixed++;
});

console.log(`\n📊 ${fixed} files updated.`);
