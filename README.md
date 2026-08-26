# 🏥 Kezza Hair & Skin Clinic — Official Website & AI Face Scanner

A modern, high-performance web platform and AI-powered skin & hair assessment system for **Kezza Hair & Skin Clinic** (Jaipur & Sikar, Rajasthan).

---

## 🌟 Key Features

- **🤖 AI Skin & Hair Face Scanner (`face-scanner.html`)**:
  - Real-time client-side face landmark tracking using **MediaPipe Face Mesh**.
  - Interactive photo capture with live framing guidelines.
  - Sequential **9-step clinical assessment questionnaire** (Concern, Duration, Family History, Name, Age, City, Clinic Branch, Preferred Date & Time Slot, Phone Number).
  - **📅 Smart Calendar & Date Picker**: Pick preferred consultation date (Today, Tomorrow, or custom calendar up to 60 days).
  - **⚡ Instant WhatsApp Appointment Routing**: Generates pre-formatted consultation request messages with specialist doctor assignment.
  - **🔄 Seamless Auto-Restart**: Automatically resets consultation state after sending for uninterrupted patient intake.

- **🌐 Clinic Services & Franchise Network**:
  - Hair Restoration (FUE, DHI, Beard, Eyebrow, PRP, GFC).
  - Dermatology & Skin Care (HydraFacial, Laser, Chemical Peels, Anti-Aging).
  - Permanent Makeup & Aesthetic Procedures.
  - Franchise Network & Multi-Branch Directory (Jaipur & Sikar centers).

- **🔒 Backend Architecture (`kezza-server.js`)**:
  - Express.js with robust REST APIs.
  - Built-in SQLite persistent storage for patient intake records.
  - AI analysis engine powered by Google Gemini Vision & deterministic clinical routing.
  - Rate limiting, structured logging, and CORS protection.

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla CSS3 (Custom Design System), JavaScript (ES6+).
- **Computer Vision**: Google MediaPipe Face Mesh CDN.
- **Backend**: Node.js, Express.js.
- **Database**: SQLite (`better-sqlite3`).
- **AI Integration**: Google Gemini Vision API (`gemini-2.0-flash`).
- **Messaging**: WhatsApp Business Cloud API / Click-to-Chat URI protocols.

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/<YOUR_USERNAME>/kezza-clinic.git
cd kezza-clinic

# Install dependencies
npm install
```

### 3. Environment Setup (Optional)
```bash
cp .env.example .env
# Edit .env with your optional Gemini API key or WhatsApp Cloud token
```

### 4. Run Locally
```bash
# Start the fullstack server (Frontend + Backend on Port 3001)
npm start
```
Open **[http://localhost:3001](http://localhost:3001)** in your browser.

---

## 🌐 Deploying to Render.com + GoDaddy Domain

### 1. Deploy on Render (Free)
1. Push this repository to GitHub.
2. Log in to [Render.com](https://render.com) and click **New Web Service**.
3. Select this repository:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Click **Create Web Service**. Your site will be live at `https://your-service-name.onrender.com`.

### 2. Connect Your GoDaddy Domain
1. In Render Dashboard, go to **Settings → Custom Domains** and add `yourdomain.com` and `www.yourdomain.com`.
2. In GoDaddy DNS Management:
   - Add **CNAME Record**: Host `www` → Points to `your-service-name.onrender.com`
   - Add **A Record**: Host `@` → Points to Render's IP address.
3. Render automatically provisions a free **SSL Certificate (HTTPS 🔒)** within minutes.

---

## 📁 Project Structure

```
├── index.html                  # Main homepage
├── face-scanner.html           # AI Face Scanner & Consultation flow
├── face-scanner-script.js      # Scanner logic, camera, questions, WhatsApp routing
├── face-scanner-styles.css     # Scanner styles and animations
├── branches.html               # Franchise & branch locations
├── hair-services.html          # Hair restoration procedures
├── skin-services.html          # Dermatology & skin treatments
├── permanent-makeup.html       # PMU & cosmetic treatments
├── about.html                  # About Kezza Clinic
├── contact.html                # Contact & appointments
├── terms.html                  # Terms & conditions
├── kezza-server.js             # Express backend server & SQLite database
├── chatbot.js                  # Website floating assistant
├── images/                     # Optimized visual assets
└── package.json                # Project manifest & dependencies
```

---

## 📄 License & Ownership

© 2026 Kezza Hair & Skin Clinic. All rights reserved.
