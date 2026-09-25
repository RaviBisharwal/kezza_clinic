#!/usr/bin/env node
/**
 * Kezza Clinic — SEO Auto-Fixer
 * Injects: canonical, Open Graph, Twitter Card, JSON-LD structured data
 * into every page in frontend/
 */

const fs   = require('fs');
const path = require('path');

const BASE_URL   = 'https://kezzaclinic.com';
const SITE_NAME  = 'Kezza Hair & Skin Clinic';
const OG_IMAGE   = `${BASE_URL}/images/logo.png`;
const TWITTER_HANDLE = '@KezzaClinic';
const PHONE      = '+91-9414077399';
const ADDRESS    = 'Kezza Hair & Skin Clinic, Jaipur & Sikar, Rajasthan, India';

// Per-page SEO data
const PAGE_DATA = {
  'index.html': {
    slug: '',
    title: 'Kezza Hair & Skin Clinic – Best Hair Transplant in Rajasthan | Jaipur & Sikar',
    desc: 'Top-rated hair transplant & skin care clinic in Rajasthan. Expert FUE, DHI hair transplant, advanced skin treatments & AI-powered assessments in Jaipur & Sikar.',
    ogImg: `${BASE_URL}/images/hero1.jpg`,
    schema: 'MedicalBusiness',
  },
  'about.html': {
    slug: 'about',
    title: 'About Kezza Clinic – Expert Hair & Skin Specialists in Jaipur & Sikar',
    desc: 'Meet the expert team at Kezza Hair & Skin Clinic. Experienced dermatologists & hair transplant surgeons serving Jaipur and Sikar with precision and care.',
    ogImg: `${BASE_URL}/images/keeza-clinic-outside.jpg`,
    schema: 'AboutPage',
  },
  'hair-services.html': {
    slug: 'hair-services',
    title: 'Hair Transplant & Restoration Services – FUE, DHI, PRP, GFC | Kezza Clinic',
    desc: 'Advanced hair restoration at Kezza Clinic: FUE, DHI hair transplant, PRP, GFC therapy, beard & eyebrow transplant in Jaipur & Sikar, Rajasthan.',
    ogImg: `${BASE_URL}/images/fui-hair-1.jpg`,
    schema: 'MedicalClinic',
  },
  'skin-services.html': {
    slug: 'skin-services',
    title: 'Skin Care & Dermatology Services – HydraFacial, Laser, Anti-Aging | Kezza',
    desc: 'Expert skin treatments at Kezza Clinic: HydraFacial, carbon peel, laser, anti-aging, pigmentation, acne scar removal in Jaipur & Sikar, Rajasthan.',
    ogImg: `${BASE_URL}/images/hydra-facial.jpg`,
    schema: 'MedicalClinic',
  },
  'weight-loss.html': {
    slug: 'weight-loss',
    title: 'Non-Surgical Weight Loss & Body Sculpting | Kezza Clinic Jaipur',
    desc: 'Safe, non-surgical weight loss and body sculpting treatments at Kezza Clinic, Jaipur. Personalised programs for lasting results. Book a free consultation.',
    ogImg: `${BASE_URL}/images/keeza-inside-clinic.jpg`,
    schema: 'MedicalClinic',
  },
  'permanent-makeup.html': {
    slug: 'permanent-makeup',
    title: 'Permanent Makeup (PMU) – Microblading, Lip Blush, SMP | Kezza Clinic Jaipur',
    desc: 'Professional permanent makeup at Kezza Clinic, Jaipur: microblading, ombre brows, lip blush, eyeliner & scalp micropigmentation (SMP). Book today.',
    ogImg: `${BASE_URL}/images/pm-hero.jpg`,
    schema: 'MedicalClinic',
  },
  'face-scanner.html': {
    slug: 'face-scanner',
    title: 'Free AI Face & Scalp Assessment – Kezza Clinic AI Scanner',
    desc: 'Get a free AI-powered skin & scalp assessment at Kezza Clinic. Our MediaPipe-based scanner analyses your face in 9 steps and matches you with the right specialist.',
    ogImg: `${BASE_URL}/images/keeza-machine.jpg`,
    schema: 'WebApplication',
  },
  'branches.html': {
    slug: 'branches',
    title: 'Kezza Clinic Franchise & Locations – Jaipur & Sikar | Join Our Network',
    desc: 'Kezza Clinic franchise opportunities across Rajasthan. Proven business model, full training & support. Find our clinics in Jaipur & Sikar.',
    ogImg: `${BASE_URL}/images/keeza-clinic-outside.jpg`,
    schema: 'MedicalClinic',
  },
  'contact.html': {
    slug: 'contact',
    title: 'Contact Kezza Clinic – Book a Consultation in Jaipur or Sikar',
    desc: 'Contact Kezza Hair & Skin Clinic to book your consultation. Reach us at our Jaipur or Sikar clinics, via WhatsApp, call or online form.',
    ogImg: `${BASE_URL}/images/keeza-reception.jpg`,
    schema: 'ContactPage',
  },
  'terms.html': {
    slug: 'terms',
    title: 'Terms & Conditions | Privacy Policy – Kezza Hair & Skin Clinic',
    desc: 'Read the terms and conditions, privacy policy and medical disclaimer for Kezza Hair & Skin Clinic services in Jaipur & Sikar, Rajasthan.',
    ogImg: `${BASE_URL}/images/logo.png`,
    schema: 'WebPage',
  },
};

// JSON-LD schema builders
function buildSchema(page, data) {
  const url = `${BASE_URL}/${data.slug ? data.slug + '.html' : ''}`;
  const base = {
    '@context': 'https://schema.org',
    name: SITE_NAME,
    url: BASE_URL,
    telephone: PHONE,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Jaipur',
      addressRegion: 'Rajasthan',
      addressCountry: 'IN',
    },
    image: data.ogImg,
    sameAs: [
      'https://www.instagram.com/kezzaclinic',
      'https://www.facebook.com/kezzaclinic',
    ],
  };

  switch (data.schema) {
    case 'MedicalBusiness':
    case 'MedicalClinic':
      return JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'MedicalClinic',
        ...base,
        description: data.desc,
        medicalSpecialty: ['Dermatology', 'Plastic Surgery', 'Cosmetology'],
        priceRange: '₹₹',
        openingHours: 'Mo-Su 10:00-20:00',
      }, null, 2);

    case 'WebApplication':
      return JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Kezza AI Face & Scalp Scanner',
        url: url,
        description: data.desc,
        applicationCategory: 'HealthApplication',
        operatingSystem: 'Web Browser',
        author: { '@type': 'Organization', ...base },
      }, null, 2);

    case 'AboutPage':
      return JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: data.title,
        url: url,
        description: data.desc,
        publisher: { '@type': 'Organization', ...base },
      }, null, 2);

    case 'ContactPage':
      return JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: data.title,
        url: url,
        description: data.desc,
        publisher: { '@type': 'Organization', ...base },
      }, null, 2);

    default:
      return JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: data.title,
        url: url,
        description: data.desc,
        publisher: { '@type': 'Organization', ...base },
      }, null, 2);
  }
}

function buildSEOBlock(file, data) {
  const url = `${BASE_URL}/${data.slug ? data.slug + '.html' : ''}`;
  const schema = buildSchema(file, data);

  return `
    <!-- ═══ SEO: Canonical ═══════════════════════════════════════════ -->
    <link rel="canonical" href="${url}" />

    <!-- ═══ SEO: Open Graph ══════════════════════════════════════════ -->
    <meta property="og:type"        content="website" />
    <meta property="og:site_name"   content="${SITE_NAME}" />
    <meta property="og:url"         content="${url}" />
    <meta property="og:title"       content="${data.title}" />
    <meta property="og:description" content="${data.desc}" />
    <meta property="og:image"       content="${data.ogImg}" />
    <meta property="og:image:width"  content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:locale"      content="en_IN" />

    <!-- ═══ SEO: Twitter Card ════════════════════════════════════════ -->
    <meta name="twitter:card"        content="summary_large_image" />
    <meta name="twitter:site"        content="${TWITTER_HANDLE}" />
    <meta name="twitter:title"       content="${data.title}" />
    <meta name="twitter:description" content="${data.desc}" />
    <meta name="twitter:image"       content="${data.ogImg}" />

    <!-- ═══ SEO: Structured Data (JSON-LD) ══════════════════════════ -->
    <script type="application/ld+json">
${schema}
    </script>`;
}

// ── Process each HTML file ─────────────────────────────────────────
let fixed = 0, skipped = 0;

Object.entries(PAGE_DATA).forEach(([file, data]) => {
  const fpath = path.join('frontend', file);
  if (!fs.existsSync(fpath)) { console.warn('⚠️  Not found:', fpath); skipped++; return; }

  let html = fs.readFileSync(fpath, 'utf8');

  // Fix title if needed
  if (data.title) {
    html = html.replace(/<title>.*?<\/title>/si, `<title>${data.title}</title>`);
  }

  // Fix/replace meta description
  if (html.match(/name=[\"']description[\"']/i)) {
    html = html.replace(
      /(<meta\s[^>]*name=[\"']description[\"'][^>]*content=[\"'])([^\"']*)([\"'][^>]*>)/i,
      `$1${data.desc}$3`
    ).replace(
      /(<meta\s[^>]*content=[\"'])([^\"']*)([\"'][^>]*name=[\"']description[\"'][^>]*>)/i,
      `$1${data.desc}$3`
    );
  } else {
    html = html.replace('</head>', `    <meta name="description" content="${data.desc}" />\n</head>`);
  }

  // Remove existing canonical/OG/Twitter/LD-JSON to avoid duplicates
  html = html.replace(/\s*<link rel="canonical"[^>]*>/gi, '');
  html = html.replace(/\s*<meta property="og:[^"]*"[^>]*>/gi, '');
  html = html.replace(/\s*<meta property="og:[^']*'[^>]*>/gi, '');
  html = html.replace(/\s*<meta name="twitter:[^"]*"[^>]*>/gi, '');
  html = html.replace(/\s*<meta name="twitter:[^']*'[^>]*>/gi, '');
  html = html.replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/gi, '');

  // Inject SEO block just before </head>
  const seoBlock = buildSEOBlock(file, data);
  html = html.replace('</head>', `${seoBlock}\n</head>`);

  fs.writeFileSync(fpath, html, 'utf8');
  console.log(`✅ Fixed: ${file}`);
  fixed++;
});

console.log(`\n📊 Done: ${fixed} fixed, ${skipped} skipped.`);
