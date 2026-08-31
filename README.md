# 🏥 Kezza Hair & Skin Clinic — Developer Documentation & Architecture Guide

A modern, responsive, high-performance static web platform with an integrated **AI Face & Scalp Scanner**, interactive medical triage chatbot, dynamic doctor profiles, and direct WhatsApp consultation routing for **Kezza Hair & Skin Clinic** (Jaipur & Sikar, Rajasthan).

---

## 🏗️ 1. Project Directory Structure

The project follows a clean, decoupled frontend architecture designed for simplicity, fast loading speeds, zero server maintenance overhead, and seamless hosting on GitHub Pages, Cloudflare Pages, Vercel, or Netlify.

```
kezza_clinic/                       ← Repository Root
│
├── 📦 server.js                    # Lightweight Express static server (serves /frontend on port 3001)
├── 📋 package.json                 # Project manifest: name, scripts, express dependency
├── 📖 README.md                    # Developer onboarding & architecture documentation (this file)
├── 🔐 .gitignore                   # Ignored files: node_modules, .env, *.bak, *.db, uploads/photos
├── 🛠️ tools/                       # Developer utility scripts
│   ├── fix_mojibake.py             # Unicode / character encoding sanitizer
│   └── update_paths.js             # Batch CSS/JS path integrity updater
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
    │   └── admin.html              # Internal Clinic Intake & Dashboard Preview
    │
    ├── 🎨 css/                     # Modular CSS Stylesheets (one per page/feature)
    │   ├── styles.css              # Core global stylesheet (Typography, Header, Footer, Colors)
    │   ├── about-styles.css        # About page & founders section styling
    │   ├── branches-styles.css     # Franchise & clinic location page styling
    │   ├── chatbot.css             # 💬 Floating AI Assistant & Laser Scanner Promo Modal
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
    │   ├── script.js               # Homepage (Lazy loading, Video Observer, Doctor Bio expander)
    │   ├── about-script.js         # About page interactions, shine effects & bio toggle
    │   ├── branches-script.js      # Branch page animations & enquiry form
    │   ├── chatbot.js              # 💬 Tri-lingual Chatbot (Eng/Hindi/Hinglish) + Scanner Modal
    │   ├── contact-script.js       # Client-side form validation & instant WhatsApp dispatch
    │   ├── face-scanner-script.js  # 🤖 MediaPipe Face Mesh, 9-Step Assessment, Doctor Matcher
    │   ├── hair-services-script.js # Hair treatments interactive elements & cost calculator
    │   ├── mobile-menu.js          # Responsive mobile navigation hamburger toggle
    │   ├── permanent-makeup-script.js # PMU gallery tabs & interactive consultation builder
    │   ├── quick-actions.js        # Floating action buttons handler
    │   ├── services-navigation.js  # 170ms hover-intent auto-expand & mobile accordion logic
    │   ├── skin-services-script.js # Skin treatment tabs & skin concern quiz
    │   ├── terms-script.js         # Legal TOC scrollspy & print utilities
    │   └── whatsapp-form.js        # Consultation ID generator & WhatsApp URL formatting helpers
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
  - *Hair Concerns* (Sikar) ➔ **Dr. Dhiral Vijayvargiya** (+91 8130888129)
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
  - **Dr. Dhiral Vijayvargiya**: Sikar
  - **Krishna (PMU)**: Jaipur & Sikar
  - **Dr. Mandhata Sharma (ENT & Rhinoplasty)**: Jaipur
- **Interactive Bio (`... More Info`)**: Truncated previews can be toggled to view the doctor's full surgical and clinical credentials with smooth transitions.

### 🚀 D. Services Hover Accordion Navigation (`js/services-navigation.js`)
- **Desktop**: Features a 170ms hover-intent delay preventing accidental flicker when moving the mouse across the navigation bar.
- **Mobile (`<= 992px`)**: Automatically switches to an accessible click-to-expand accordion menu.

---

## 💻 3. How to Run Locally

Since the project is 100% client-side, you can run it using any lightweight static server:

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
1. Push your repository to GitHub:
   ```bash
   git push origin main
   ```
2. Go to **Settings > Pages** in your GitHub repository.
3. Under **Branch**, select `main` and `/ (root)` folder.
4. Click **Save**. The website will be live at:
   `https://<YOUR_GITHUB_USERNAME>.github.io/<REPO_NAME>/`

### B. Vercel / Netlify / Cloudflare Pages
- Set **Framework Preset**: `Other` or `Static HTML`.
- Set **Build Command**: *(leave empty)*.
- Set **Output Directory**: `. (root)`.

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

---

## 📄 License & Ownership
© 2026 **Kezza Hair & Skin Clinic**. All rights reserved.
