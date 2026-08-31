#!/usr/bin/env node
/**
 * Trim meta descriptions to 120–155 chars (Google truncates at ~160)
 */
const fs = require('fs');

const DESCS = {
  'index.html':
    'Top-rated hair transplant & skin clinic in Rajasthan. Expert FUE, DHI transplant, skin care & free AI face scanner. Clinics in Jaipur & Sikar.',
  'about.html':
    'Meet the expert team at Kezza Clinic — board-certified dermatologists & experienced hair transplant surgeons serving Jaipur and Sikar.',
  'hair-services.html':
    'Expert hair restoration at Kezza: FUE, DHI hair transplant, PRP, GFC therapy, beard & eyebrow transplant in Jaipur & Sikar. Natural results.',
  'skin-services.html':
    'Advanced skin care at Kezza Clinic: HydraFacial, carbon peel, laser resurfacing, anti-aging & acne scar removal in Jaipur & Sikar, Rajasthan.',
  'weight-loss.html':
    'Safe non-surgical weight loss & body sculpting at Kezza Clinic, Jaipur. Certified specialists, personalised programs. Book your consultation.',
  'permanent-makeup.html':
    'Professional permanent makeup at Kezza Clinic Jaipur: microblading, ombre brows, lip blush & scalp micropigmentation (SMP). Book today.',
  'face-scanner.html':
    'Free AI face & scalp assessment at Kezza Clinic. Our MediaPipe scanner analyses your skin in 9 steps and matches you to the right specialist.',
  'branches.html':
    'Kezza Clinic franchise network in Rajasthan — clinics in Jaipur & Sikar. Explore franchise opportunities with full training & business support.',
  'contact.html':
    'Book a consultation at Kezza Hair & Skin Clinic in Jaipur or Sikar. Reach us by phone, WhatsApp or our online form. Same-day appointments.',
  'terms.html':
    'Terms, privacy policy & medical disclaimer for Kezza Hair & Skin Clinic in Jaipur & Sikar, Rajasthan. Please read before using our services.',
  'admin.html':
    'Kezza Clinic internal admin panel for patient intake and clinic management. Authorised staff access only.',
};

const files = fs.readdirSync('frontend').filter(f => f.endsWith('.html'));
let fixed = 0;

files.forEach(file => {
  if (!DESCS[file]) return;
  let html = fs.readFileSync('frontend/' + file, 'utf8');
  const d = DESCS[file];

  // Replace <meta name="description" content="...">
  html = html.replace(
    /(name="description"\s+content=")[^"]*(")/i,
    `$1${d}$2`
  );
  html = html.replace(
    /(content=")[^"]*("\s+name="description")/i,
    `$1${d}$2`
  );

  // Replace og:description
  html = html.replace(
    /(property="og:description"\s+content=")[^"]*(")/i,
    `$1${d}$2`
  );

  // Replace twitter:description
  html = html.replace(
    /(name="twitter:description"\s+content=")[^"]*(")/i,
    `$1${d}$2`
  );

  fs.writeFileSync('frontend/' + file, html, 'utf8');
  console.log(`✅ ${file} — ${d.length} chars`);
  fixed++;
});

console.log(`\n📊 ${fixed} descriptions updated.`);
