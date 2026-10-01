# 🏥 Kezza Hair & Skin Clinic — Developer Documentation & Architecture Guide

A modern, responsive, high-performance static web platform with an integrated **AI Face & Scalp Scanner**, interactive medical triage chatbot, dynamic doctor profiles, and direct WhatsApp consultation routing for **Kezza Hair & Skin Clinic** (Jaipur, Sikar & Ajmer, Rajasthan).

---

## 🏗️ 1. Project Directory Structure

The project follows a clean, decoupled frontend architecture designed for simplicity, fast loading speeds, zero server maintenance overhead, and seamless hosting on GitHub Pages, Cloudflare Pages, Vercel, or Netlify.

```
kezza_clinic/                       ← Repository Root
│
├── 📦 server.js                    # Express server: static /frontend + Gemini, lead & admin APIs (port 3001)
├── 📋 package.json                 # Project manifest: name, scripts, express dependency
├── 📖 README.md                    # Developer onboarding & architecture documentation (this file)
├── 🔐 .gitignore                   # Ignored files: node_modules, .env, *.bak, *.db, uploads/photos, data/
├── 🔑 .env.example                 # Template for .env — copy and fill before running the server
├── 🛠️ tools/                       # Developer utility scripts
│   ├── fix_mojibake.py             # Unicode / character encoding sanitizer
│   ├── validate_reference_page.py  # Content checks for hair-transplant/ (run by npm test)
│   ├── build_hair_transplant_images.py # Resizes hair-transplant page photos (macOS `sips`)
│   ├── optimize_for_90_plus.js     # One-off head/meta optimizer (already applied; review before re-running)
│   ├── build-css.js                # CSS bundler (npm run build:css)
│   ├── stamp-js.js                 # JS cache-busting ?v=<hash> stamps (npm run build:js)
│   ├── content/                    # Clinic, treatment and blog pages, sitemap, llms.txt builder (npm run build:content)
│   │                               # pseo.py = programmatic-SEO engine (status model, quality gates, link rules)
│   ├── og/                         # Social share image generator (npm run og)
│   └── seo/                        # site-data.json (clinic facts), taxonomy.json (treatment registry),
│                                   # check-seo.js (npm run seo:check), pseo_audit.py (npm run seo:audit)
├── 📚 docs/pseo/                   # pSEO report, page inventory (before/after), quality-gate results
│
└── 🌐 frontend/                    ← ALL public-facing website files live here
    │
    ├── 📄 HTML Pages
    │   ├── index.html              # Main Landing Page (Hero, Procedures, Doctors, Testimonials, FAQ)
    │   ├── about.html              # About Clinic, Founders, Medical Philosophy & Expandable Doctors
    │   ├── hair-services.html      # Hair Restoration (FUE, DHI, Beard, Eyebrow, PRP, GFC)
    │   ├── skin-services.html      # Dermatology & Skin Care (HydraFacial, Carbon Peel, Acne, Glow)
    │   ├── weight-loss.html        # Weight Management, Body Sculpting & BMI Calculator
    │   ├── permanent-makeup.html   # PMU Artistry, Microblading, Lip Blush, Eyebrows & SMP
    │   ├── face-scanner.html       # 🤖 AI Face & Scalp Scanner (MediaPipe + 9-Step Assessment)
    │   ├── branches.html           # Franchise & Clinic Locations (Jaipur & Sikar Centers)
    │   ├── contact.html            # Contact Form, Direct Calling, Clinic Google Maps
    │   ├── terms.html              # Privacy Policy, Medical Disclaimer, Terms & Conditions
    │   ├── hair-transplant/fue|dhi|beard|eyebrow/, gfc-treatment/, laser-hair-removal/, hi/hair-transplant/,
    │   │   acne-treatment/, acne-scar-treatment/, hydra-facial/, botox/, dark-circles-treatment/,
    │   │   cryolipolysis/, hifu-body-sculpting/, weight-management/, microblading/, lip-blush/,
    │   │   permanent-eyeliner/, pmu-correction/
    │   │                           # Treatment pages generated from tools/content/pages/ (do not edit the HTML);
    │   │                           # the last 12 are in review (noindex) until the clinic approves them
    │   └── admin.html              # Internal Clinic Intake & Dashboard Preview
    │
    ├── 🎨 css/                     # Modular CSS Stylesheets (one per page/feature)
    │   ├── styles.css              # Core global stylesheet (Typography, Header, Footer, Colors)
    │   ├── about-styles.css        # About page & founders section styling
    │   ├── branches-styles.css     # Franchise & clinic location page styling
    │   ├── kezza-ai.css            # Floating AI assistant & scanner promo modal
    │   ├── contact-styles.css      # Contact form, map cards & office hours styling
    │   ├── doctors-landscape.css   # 🩺 Doctor landscape cards, verified badges, expandable bio
    │   ├── face-scanner-styles.css # 🔬 Camera HUD, Facial Mesh Guide, Step flow & Calendar
    │   ├── hair-services-styles.css       # Hair procedures, before/after galleries & pricing
    │   ├── permanent-makeup-styles.css    # PMU artistry, procedure showcases & FAQ accordion
    │   ├── quick-actions.css       # Floating Quick-Action Bar (Call, WhatsApp, AI Scanner)
    │   ├── services-navigation.css # 🚀 Header Services Accordion (170ms hover / Mobile tap)
    │   ├── skin-services-styles.css       # Skin & laser dermatology layout
    │   └── terms-styles.css        # Legal, privacy policy & terms page formatting
    │
    ├── ⚡ js/                      # JavaScript Logic & Interactive Modules (one per page/feature)
    │   ├── script.js               # Home, hair-transplant, blog & location pages (navbar shadow, image lazy-loading)
    │   ├── about-script.js         # About page interactions, shine effects & bio toggle
    │   ├── branches-script.js      # Branch page animations & enquiry form
    │   ├── kezza-ai.js             # Tri-lingual chatbot (Eng/Hindi/Hinglish) + scanner modal
    │   ├── contact-script.js       # Client-side form validation & instant WhatsApp dispatch
    │   ├── face-scanner-script.js  # 🤖 MediaPipe Face Mesh, 9-Step Assessment, Doctor Matcher
    │   ├── hair-services-script.js # Hair treatments interactive elements & cost calculator
    │   ├── mobile-menu.js          # Responsive mobile navigation hamburger toggle
    │   ├── permanent-makeup-script.js # PMU gallery tabs & interactive consultation builder
    │   ├── quick-actions.js        # Floating action buttons handler
    │   ├── services-navigation.js  # 170ms hover-intent auto-expand & mobile accordion logic
    │   ├── skin-services-script.js # Skin treatment tabs & skin concern quiz
    │   ├── terms-script.js         # Legal TOC scrollspy & print utilities
    │   ├── whatsapp-form.js        # Consultation ID generator & WhatsApp URL formatting helpers
    │   ├── smooth-scroll.js        # Shared: in-page anchor scrolling, reading progress bar, navbar elevation, back-to-top
    │   ├── quick-actions.js        # Shared: video autoplay on scroll, quick dock, scanner & chatbot launchers
    │   └── scanner-launch.js       # Shared: lazy-loads the AI scanner popup (scanner-modal.js / .css)
    │
    ├── 🖼️ images/                  # High-res: doctor portraits, clinic photos, logos, badges, procedure images
    ├── 🎬 video/                   # Clinic walkthrough & patient video testimonials
    └── 📁 uploads/                 # Client-side image upload preview folder
```

---

## 🌟 2. Core Features & Workflow Architecture

### 🔬 A. AI Face & Scalp Scanner (`face-scanner.html` & `js/face-scanner-script.js`)
- **Computer Vision**: Uses **Google MediaPipe Face Mesh** to track facial landmarks in real-time via the user's camera.
- **Diagnostic Flow**: 9 sequential steps (Concern -> Duration -> Family History -> Personal Info -> City & Branch -> Preferred Date & Time Slot -> Contact Number).
- **Smart Date Picker**: Interactive calendar allowing date selection (Today, Tomorrow, or customized calendar selection up to 60 days ahead) with Morning / Afternoon / Evening time slots.
- **Doctor Matching Logic**:
  - *Hair Concerns* (Jaipur) ➔ **Dr. Ankit Bhalothia** (+91 9216063681)
  - *Hair Concerns* (Sikar) ➔ Sikar hair transplant team (+91 8130888129 — routed under Dr. Dhiral's profile; he now consults at Ajmer)
  - *Skin & Laser Concerns* (Jaipur) ➔ **Dr. Amrita Mukhija** (+91 9216063686)
  - *Skin Concerns* ➔ **Dr. Neelam Choudhary** (+91 9216063686)
  - *Permanent Makeup / SMP* ➔ **Krishna** (+91 9079161300)
- **WhatsApp Routing**: Automatically compiles diagnostic summary into an encoded WhatsApp link and redirects the user with zero backend latency.

### 💬 B. Tri-Lingual Virtual Assistant & Scanner Promo (`js/chatbot.js`)
- **Languages Supported**: English, Hindi, and Hinglish.
- **Autonomous Lead Generation**: After 4.5 seconds on any page (except the scanner itself), an attractive glassmorphic AI Scanner Opportunity Modal appears with animated laser scanning lines, inviting users to scan their face/scalp for immediate productivity.
- **100% Client-Side**: No external server required; fallback deterministic natural language processor handles 100+ clinical queries with direct WhatsApp handoff.

### 🩺 C. Doctor Profiles & Expandable Bio (`css/doctors-landscape.css`)
- **Landscape Medical Cards**: Clean modern card layout with specialist badges, verified badge, and location tags.
- **Availability Matrix**:
  - **Dr. Ankit Bhalothia**: Jaipur & Sikar
  - **Dr. Amrita Mukhija**: Jaipur
  - **Dr. Neelam Choudhary**: Jaipur & Sikar
  - **Dr. Dhiral Vijayvargiya**: Ajmer
  - **Dr. Aliza Rizvi**: Ajmer
  - **Krishna Choudhary (PMU artist)**: Jaipur & Sikar
  - **Dr. Mandhata Sharma (ENT & Rhinoplasty)**: Jaipur
  - **Dr. Nakul Somani (Plastic & Aesthetic Surgery)**: Jaipur
- **Interactive Bio (`... More Info`)**: Truncated previews can be toggled to view the doctor's full surgical and clinical credentials with smooth transitions.

### 🚀 D. Services Hover Accordion Navigation (`js/services-navigation.js`)
- **Desktop**: Features a 170ms hover-intent delay preventing accidental flicker when moving the mouse across the navigation bar.
- **Mobile (`<= 992px`)**: Automatically switches to an accessible click-to-expand accordion menu.

---

## ⚙️ 2.5 Environment Configuration

Copy `.env.example` to `.env` and fill in the values before running the server:

```bash
cp .env.example .env
```

| Variable | Purpose | Required |
| --- | --- | --- |
| `GEMINI_API_KEY` | Powers `/api/chat` and `/api/analyze-photo`. Without it those routes return `NO_GEMINI_KEY` and the site uses its offline chatbot fallback. | For AI features |
| `ADMIN_TOKEN` | Shared secret protecting the admin dashboard APIs. **If unset, the admin API is disabled and returns 503** rather than being left open. `admin.html` prompts for this value once and caches it in the browser. | For `admin.html` |
| `SHEET_WEBHOOK_URL` | Google Apps Script webhook that appends leads to the clinic spreadsheet. | Optional |
| `LEAD_STORE_PATH` | Where captured leads are written as JSON (default `./data/leads.json`). This file is patient data — it is gitignored and must never be committed or deployed. | Optional |

> **⚠️ Patient data:** `frontend/uploads/photos/` and the lead store hold personal health information. Both are gitignored. Never commit them, and never deploy them to the public web root.

---

## 💻 3. How to Run Locally

> **Note:** the pages are static, but `/api/lead`, `/api/chat`, `/api/analyze-photo` and the
> admin dashboard need the Express server (`npm start`). A plain static server will serve the
> site fine — leads then fall back to posting the Google Sheets webhook directly from the
> browser, and `admin.html` will have no backend to read from.

### Option 0: Full stack (recommended — enables the APIs and admin dashboard)
```bash
npm install
cp .env.example .env    # then fill in ADMIN_TOKEN / GEMINI_API_KEY
npm start               # http://localhost:3001
```

Since the pages themselves are client-side, you can also run them on any static server:

### Option 1: Using Node `serve` or `http-server`
```bash
npx serve .
# or
npx http-server -p 3001
```

### Option 2: Using Python
```bash
python3 -m http.server 3001
```

### Option 3: Using VS Code
Install the **Live Server** extension and click **Go Live**.

Open **`http://localhost:3001`** in your browser.

---

## 🚀 4. Deployment Guide

### A. Permanent Hosting on GitHub Pages (Recommended)

> **⚠️ IMPORTANT:** The deployable website lives in the **`frontend/`** subdirectory, **not** the repository root. The root only contains `server.js`, `package.json`, and `README.md`. Deploying the root will serve an empty site.

1. Push your repository to GitHub:
   ```bash
   git push origin main
   ```
2. Go to **Settings > Pages** in your GitHub repository.
3. Under **Branch**, select `main`.
4. Under **Folder**, select **`/frontend`** (not `/root`).
5. Click **Save**. The website will be live at:
   `https://<YOUR_GITHUB_USERNAME>.github.io/<REPO_NAME>/`

### B. Vercel
- Set **Framework Preset**: `Other` or `Static HTML`.
- Set **Build Command**: *(leave empty)*.
- Set **Root Directory**: `frontend`.
- Set **Output Directory**: `. (current directory / frontend)`.

### C. Netlify / Cloudflare Pages
- Set **Base directory**: `frontend`.
- Set **Publish directory**: `frontend`.
- Set **Build command**: *(leave empty)*.

---

## 🛠️ 5. Developer Maintenance & Quality Tools

- **Check Unicode / Mojibake**:
  ```bash
  python3 tools/fix_mojibake.py
  ```
- **Batch Verify Asset Links**:
  ```bash
  node -e "
  const fs = require('fs');
  fs.readdirSync('.').filter(f => f.endsWith('.html')).forEach(file => {
    const html = fs.readFileSync(file, 'utf8');
    [...html.matchAll(/(href|src)=[\"']([^\"']+\.(css|js))[\"']/g)].forEach(m => {
      if (!m[2].startsWith('http') && !fs.existsSync(m[2].split('?')[0])) {
        console.error('Missing asset in ' + file + ': ' + m[2]);
      }
    });
  });
  console.log('Verification finished.');
  "
  ```

## 🔎 5.5 SEO, content pages & CSS build

The live site is **https://www.kezza.co.in** (GoDaddy, Apache). All SEO URLs, schema and the sitemap use that host; `frontend/.htaccess` redirects `kezza.co.in` and `http://` to it. See `SEO-CHANGES.md` for the full September 2026 change log and deploy checklist.

| Command | What it does |
| --- | --- |
| `npm run build` | Rebuilds `/locations/*`, `/blog/*`, the treatment pages, `sitemap.xml` and `llms.txt`, then the CSS bundles, then stamps JS versions |
| `npm run build:content` | Only the generated pages (`python3 tools/content/build_content_pages.py`) |
| `npm run build:css` | Re-bundles CSS after editing anything in `frontend/css/` (`node tools/build-css.js`) |
| `npm run build:js` | Stamps every local `<script src>` (and the lazily-injected chatbot/scanner files) with a content hash so edited JS reaches returning visitors (`node tools/stamp-js.js`) |
| `npm run seo:check` | Checks domain, NAP/hours, schema, FAQs, links, sitemap — run before every deploy |
| `npm run seo:audit` | Page inventory and programmatic-SEO audit (`python3 tools/seo/pseo_audit.py`): duplicate titles/H1s, near-duplicate content, competing pages, orphans, links to unpublished pages, claim wording. Writes `docs/pseo/inventory.*` |
| `npm test` | Reference-page check, server syntax, `seo:check` and the pSEO audit in strict mode (fails on any critical issue) |
| `npm run og` | Regenerates 1200×630 social share images in `frontend/images/og/` (needs `pip install pillow`) |

- **Clinic facts** (addresses, phones, hours, doctors, services per branch) live in `tools/seo/site-data.json`. Change them there, keep them identical to each Google Business Profile, then run `npm run build`.
- **CSS:** keep editing the normal files in `frontend/css/`. Pages load `css/bundle-<page>.min.css`; `tools/css-bundles.json` lists which source files (in which order) make up each bundle.
- **Blog:** each article is one file in `tools/content/blog/` (JSON header + HTML body). Copy one, edit it, add its share image in `tools/og/make_og_images.py`, then `npm run og && npm run build`.
- **Treatment pages (programmatic SEO).** The registry `tools/seo/taxonomy.json` lists every category, treatment and page: URL, category and parent, clinics, search intent, related pages, card and fallback link. Each generated page's content is one file in `tools/content/pages/` (JSON header with hero, sections, FAQs, sources and `review_notes`; the HTML after it is the long guide section). The engine is `tools/content/pseo.py`; the full design is in `docs/pseo/PSEO-REPORT.md`.
  - **Status** (`"status"` in the page file): `draft` = not built · `review` / `approved` = built for preview but `noindex`, left out of the sitemap, llms.txt, menus and related links, no "reviewed by" line · `published` = indexable, but only when every critical quality gate passes and `"reviewer"` + `"reviewed"` are set (otherwise held back) · `noindex` = built, never indexed.
  - **Add a treatment:** (1) add it to the registry; (2) copy a page file, write the content with sources and `review_notes`, keep `"status": "review"`; (3) add its image crops to `tools/content/make_treatment_images.py` and a share card to `tools/og/make_og_images.py`; (4) `npm run og && npm run build`, then fix every critical item in `docs/pseo/quality-gates.md`; (5) doctor review; (6) set `"status": "published"`, `"reviewer"` and `"reviewed"`, then `npm run build && npm test`. Menus, home cards, hub-page links, clinic pages, related cards, the sitemap and llms.txt switch to the page on their own; CSS bundling picks the page up automatically.
  - **Links in hand-built pages** that should follow a page's status use `<a href="…" data-pseo="<id>" data-pseo-fallback="<url>">` or a `<!--pseo:link id="<id>" text="…"--><!--/pseo:link-->` slot. Do not hard-code a link to a page that is not published: `npm test` fails on it.
- **Clinic pages:** addresses, phones, doctors and treatment lists come from `tools/seo/site-data.json`; the longer local text (H1, treatments in the city, nearby towns, extra FAQs) is in `tools/content/locations.json`.
- **Generated files** (`frontend/locations/**`, `frontend/blog/**`, the treatment page folders listed in the registry, `sitemap.xml`, `llms.txt`, `css/bundle-*.min.css`, the trailing-slash rule in `.htaccess`) are overwritten by the build — edit their sources instead.
- Removed: `tools/inject_seo.js`, `tools/fix_titles.js`, `tools/fix_descriptions.js` (they would re-introduce the old domain and phone) and the one-off migration scripts `fix_headings.js`, `fix_img_dimensions.js`, `update_paths.js`. All remain in git history.

---

## 📄 License & Ownership
© 2026 **Kezza Hair & Skin Clinic**. All rights reserved.
