# Update — 30 September 2026 (pSEO): treatment registry, quality gates and 12 pages in review

Full report: `docs/pseo/PSEO-REPORT.md` (23 sections). `npm test`: 48 pages, 0 errors, 0 critical audit issues.

## A. What changed

- **A programmatic-SEO system** instead of hand-copied pages: one registry of treatments (`tools/seo/taxonomy.json`), one content
  file per page (`tools/content/pages/`), an engine with a status model and quality gates (`tools/content/pseo.py`) and a sitewide
  audit (`tools/seo/pseo_audit.py`, run by `npm test`).
- **12 new treatment pages, all in review** (built, `noindex`, not in the sitemap, not linked from live pages): acne treatment, acne
  scar treatment, hydra facial, Botox, dark circles, cryolipolysis, HIFU body sculpting, medical weight management, microblading,
  lip blush, permanent eyeliner, PMU correction. Each lists what the clinic must confirm before approval.
- **The 7 doctor-approved pages** (FUE, DHI, beard, eyebrow, GFC, laser hair removal, Hindi) are marked `published` and stay live.
- **Links that follow page status** in menus, footers, home cards, hub pages and clinic pages. They point to the hub sections today
  and switch to the new pages automatically when each one is published.
- **Visible changes on live pages:** the home page FUE and DHI cards now open the FUE and DHI pages; the Jaipur clinic page H1 now
  reads "Hair & Skin Clinic in Khatipura, Jaipur" so it no longer competes with the home page.

## B. Upload and approval

1. Upload the changed files and the new folders (`acne-treatment/`, `acne-scar-treatment/`, `hydra-facial/`, `botox/`,
   `dark-circles-treatment/`, `cryolipolysis/`, `hifu-body-sculpting/`, `weight-management/`, `microblading/`, `lip-blush/`,
   `permanent-eyeliner/`, `pmu-correction/`, new files in `images/treatments/` and `images/og/`), plus `.htaccess`. The new pages
   are safe to upload: Google is told not to index them and no live page links to them.
2. Ask the suggested reviewer to read each page and answer its points (report section 15).
3. To publish a page: in its file in `tools/content/pages/` set `"status": "published"`, `"reviewer"` and `"reviewed"`, run
   `npm run build && npm test`, upload the changed files, then request indexing for that URL in Google Search Console.

## C. Found, not changed (please decide) — details in report section 15

- Before/after photos on the weight-loss page that carry another practice's "GW" watermark.
- Stock photos showing a CoolSculpting logo, and HydraFacial brand wording, that should only stay if Kezza uses those systems.
- 48 phrases of claim wording on existing pages ("100% Safe", "Zero Pain Guarantee", "guaranteed inch loss", "permanent results"…).
- Doctor names in reviews that are not in the clinic's doctor list, and unverified results cases.

---

# Update — 30 September 2026: new treatment pages, Hindi page, stronger clinic pages

This update adds the pages and changes recommended after comparing Kezza with the clinics that rank above it
(medispaindia.in, alcsindia.com). Your own recent work (the electrolysis, hair-wig and hair-loss-consultation
pages, your navigation and footer changes, your edit to the Norwood article) is kept. `npm test` and
`npm run seo:check`: 36 pages, 0 errors, 0 warnings.

## A. Before you upload

1. **Doctor review.** Each new page says "Medically reviewed by". Ask **Dr. Ankit Bhalothia** to read the FUE, DHI,
   beard, eyebrow, GFC and Hindi hair-transplant pages, and **Dr. Nakul Somani** to read the laser hair removal page.
   Make any corrections in `tools/content/pages/*.html`, change `"reviewed"` in that file to the date they approve it,
   then run `npm run build`.
2. **Upload** the changed files to `public_html`, keeping the folder structure. New folders:
   `hair-transplant/fue/`, `hair-transplant/dhi/`, `hair-transplant/beard/`, `hair-transplant/eyebrow/`,
   `gfc-treatment/`, `laser-hair-removal/`, `hi/hair-transplant/`, `images/treatments/`.
   Also upload `.htaccess` (hidden on a Mac: Cmd+Shift+. in Finder shows it).
3. **Delete on the server** (uploading does not remove files): `images/BILLPRINT_16050485.pdf`. It is a private
   electricity bill and was back in the uploaded zip.
4. **Google Search Console:** resubmit `https://www.kezza.co.in/sitemap.xml` and request indexing for the 7 new URLs
   and the 3 clinic pages.
5. **Google Business Profiles:** set each profile's website link to its clinic page, with tracking so you can see
   these visits in Analytics:
   - Jaipur: `https://www.kezza.co.in/locations/jaipur/?utm_source=google&utm_medium=organic&utm_campaign=gbp`
   - Sikar: `https://www.kezza.co.in/locations/sikar/?utm_source=google&utm_medium=organic&utm_campaign=gbp`
   - Ajmer: `https://www.kezza.co.in/locations/ajmer/?utm_source=google&utm_medium=organic&utm_campaign=gbp`

## B. What changed

### New pages (built by `tools/content/build_content_pages.py` from `tools/content/pages/*.html`)
| URL | Main search it targets | Reviewer |
| --- | --- | --- |
| `/hair-transplant/fue/` | FUE hair transplant in Jaipur | Dr. Ankit Bhalothia |
| `/hair-transplant/dhi/` | DHI hair transplant in Jaipur | Dr. Ankit Bhalothia |
| `/hair-transplant/beard/` | Beard transplant in Jaipur | Dr. Ankit Bhalothia |
| `/hair-transplant/eyebrow/` | Eyebrow transplant in Jaipur | Dr. Ankit Bhalothia |
| `/gfc-treatment/` | GFC hair treatment in Jaipur | Dr. Ankit Bhalothia |
| `/laser-hair-removal/` | Laser hair removal in Jaipur / Sikar | Dr. Nakul Somani |
| `/hi/hair-transplant/` | हेयर ट्रांसप्लांट जयपुर (Hindi searches) | Dr. Ankit Bhalothia |

- Same design as the hair-transplant page: hero, reviewer line, explainer, benefits, suitability, steps, recovery
  timeline, a detailed guide with sources, the clinics that offer it, FAQs, related treatments and the booking band.
- No prices (as agreed). Pages link to the existing cost guide instead.
- Clinic availability follows `site-data.json`: DHI is shown for Jaipur only; GFC and laser for Jaipur and Sikar.
- Schema: `MedicalWebPage` with `reviewedBy` and `lastReviewed`, `MedicalProcedure`, `BreadcrumbList`, `FAQPage`.
- The Hindi page is linked both ways with the English page (`hreflang` en-IN / hi-IN / x-default) and has a
  "यह पेज हिंदी में पढ़ें" link on the English page.
- New photos are crops of images already on the site (`tools/content/make_treatment_images.py`). They look like
  stock/AI photos, so their alt text describes the procedure and does not claim they are Kezza patients.

### Clinic pages (Jaipur, Sikar, Ajmer)
- H1 now says "Hair Transplant & Skin Clinic in {city}".
- New sections: treatments in that city (with the doctors who provide them), nearby towns, and "your first visit".
  Three more FAQs per clinic. Each page is now about twice as long (for example Sikar 475 → 909 words). The copy is
  in `tools/content/locations.json`.
- Treatment lists point to the new pages (FUE, GFC, laser hair removal, hair loss consultation).

### Navigation and footer (all pages)
- Hair menu: FUE, DHI, beard and eyebrow transplant added under Hair Transplant. "GFC Therapy" opens the GFC page and
  "Electrolysis" opens your `electrolysis.html` (it used to jump to a section of the hair services page).
- Skin menu: "Laser Hair Removal" added under "Laser Treatments".
- Footers: FUE, DHI, beard, eyebrow, GFC and electrolysis links now open their own pages.

### Titles (to stop pages competing for the same search)
| Page | New title |
| --- | --- |
| hair-services.html | Hair Treatment in Jaipur: Transplant, PRP, GFC \| Kezza |
| hair-loss-consultation.html | Hair Fall & Hair Loss Treatment in Jaipur \| Kezza Clinic |
| prp-therapy.html | PRP Hair Treatment in Jaipur \| Kezza Clinic |
| skin-services.html | Skin Specialist & Laser Treatment in Jaipur \| Kezza Clinic |
| permanent-makeup.html | Microblading & Permanent Makeup in Jaipur \| Kezza Clinic |

Descriptions, Open Graph/Twitter titles and the schema page name were updated to match. Headings and page content
were not changed.

### Links inside pages
- Hair transplant page: FUE/DHI links in the explainer, beard/eyebrow links in the FAQ, cost-guide link in the pricing
  box, GFC card → GFC page, Hindi page link.
- Hair services page: a "Read the full … guide" link in the FUE, DHI, beard and eyebrow sections; GFC card → GFC page.
- PRP page (GFC section), skin page (laser section), home page (GFC and laser "view details" arrows) → new pages.
- Blog articles link to the new pages where they mention them. The Norwood article keeps your `/hair-wig.html` link
  (now in its source file too, so a rebuild no longer undoes it).

### Other
- 23 social share images that pages still referenced were missing from the upload; restored.
- `sitemap.xml` and `llms.txt` include the new pages and your three new pages.
- `.htaccess`: the new folders redirect to their trailing-slash URL.
- `tools/seo/check-seo.js` accepts `lang="hi-IN"` on Hindi pages, reads Hindi FAQ text and checks that `hreflang`
  pages link back to each other.

## C. Found, not changed (please decide)
- **hair-services.html** shows surgeon quotes from "Dr. S. Sharma" and "Dr. R. Verma", who are not on the doctors page,
  and figures such as "99.2% graft survival". Unverifiable names and numbers on medical pages can hurt trust with
  Google and patients; consider replacing them with your real doctors and removing the figures.
- **skin-services.html** and **prp-therapy.html** make absolute claims ("92%+ reduction", "zero burn risk",
  "zero pain", "US FDA-approved laser"). Keep them only if you can back them up (for the laser, the device's approval).
- **index.html / about.html / weight-loss.html** use five other WhatsApp numbers (…63681, …63686, …61300, …46221,
  …88129). Check that each one is answered.
- The hair-transplant page's in-text links use the browser's default blue (they have no link style); left as is.

---

# SEO / AEO / GEO implementation — September 2026

This change set implements the September 2026 SEO audit, corrects the places where the audit was wrong, and adds clinic location pages, a blog and CSS bundles. Everything was checked with `npm run seo:check` (0 errors) and a computed-style comparison of all 18 page templates at desktop and mobile widths (CSS bundles render identically to the old separate files).

---

## 1. Deploy checklist (do these in order)

1. **Upload the changed files** to `public_html`, keeping the folder structure. New folders: `locations/`, `blog/`, `images/og/`. New files include **`.htaccess`**, which is hidden on a Mac (press Cmd+Shift+. in Finder to see it).
2. **Delete these files on the server** (uploading doesn't remove them):
   - `LLMs.txt` has been replaced by lowercase `llms.txt`. `.htaccess` also 301-redirects the old URL.
   - `images/BILLPRINT_16050485.pdf`: this is an electricity bill that was publicly downloadable. If the GitHub repo is public, it is also in the git history.
3. **In your local repo (Mac):** delete `frontend/LLMs.txt` *before* copying the new `frontend/llms.txt`. macOS is case-insensitive, so copying over it would keep the old name. Then run `git add -A`.
4. **Check the redirects after upload:**
   - `http://kezza.co.in/about.html` → 301 → `https://www.kezza.co.in/about.html`
   - `https://www.kezza.co.in/nothing-here` → your styled 404 page
   - If the whole site shows *500 Internal Server Error*, delete the `Options -Indexes` line from `.htaccess`. A few hosts don't allow it.
5. **Google Search Console:**
   - Add or verify the **Domain property `kezza.co.in`** (DNS).
   - Submit `https://www.kezza.co.in/sitemap.xml`.
   - Request indexing for `/`, `/hair-transplant/`, `/locations/jaipur/`, `/locations/sikar/`, `/locations/ajmer/` and `/blog/`.
   - Over the next few weeks, watch *Pages → "Duplicate, Google chose different canonical"* shrink. Every page used to declare the dead domain as its canonical.
6. **Bing Webmaster Tools:** import the site from Search Console and submit the same sitemap. Bing's index feeds several AI assistants.
7. **Google Business Profiles (one per branch):**
   - Remove the keywords from the **Sikar profile name** ("…Best Hair Transplant, Skin Doctor, Dermatologist Sikar"). Keyword-stuffed names break Google's guidelines and risk suspension.
   - Make each profile's address, phone and hours (9 AM – 8 PM, all 7 days) match the site exactly.
   - Set each profile's **website link to its own location page**, not the homepage.
8. Spot-check a few URLs in Google's Rich Results Test and at validator.schema.org.

---

## 2. What changed

### Critical: the live domain
- The site runs on **www.kezza.co.in**, but every canonical tag, `og:url`, schema URL, the sitemap, the robots.txt sitemap line and LLMs.txt pointed at **kezzaclinic.com**, a domain with no DNS record. All of them now use `https://www.kezza.co.in`.
- New **`.htaccess`**:
  - 301 redirects from `kezza.co.in` and `http://` to `https://www.kezza.co.in` (both hosts used to serve the site with no redirect);
  - a working 404 page;
  - gzip compression and browser caching;
  - an `X-Robots-Tag` header for admin;
  - blocks on dotfiles and backups.

### NAP (name, address, phone) and hours
- **One schema phone number:** `+91-9284517427`, the number visitors already see. `+91-9414077399` only ever existed inside hidden schema, and it is gone.
- **Hours:** 9 AM – 8 PM, all 7 days, everywhere. Schema used to say 10–8, and the Ajmer cards said 10–7 Mon–Sat or 10–7:30. The AI chatbot prompts (`server.js`, `js/kezza-ai.js`) now say the same.
- **Jaipur PIN:** 302012, which matches the company registration and directory listings. The visible copy said 302021.
- **Instagram:** `@kezza_clinic`. Half the schema used the wrong `kezzaclinic` handle.
- **Doctors:**
  - Dr. Dhiral Vijayvargiya is shown at **Ajmer**.
  - Dr. Amrita Mukhija is shown at **Jaipur** only.
  - "Dr. Krishna Choudhary" is now **Krishna Choudhary (PMU artist)** everywhere, including the chatbot.
- The Sikar map pin on the contact page now uses your Google Business Profile coordinates.

### Titles, descriptions, headings, social previews
- Every page title is ≤ 60 characters, includes the location and uses no "Best" superlative.
- Every meta description is 110–160 characters. White-hair-removal was 248 and PRP was 181.
- `lang="en-IN"` on every page. "Jaipur" is now in the hair-services H1.
- Clean, consistent Open Graph and Twitter tags. New **1200×630 branded share images** in `images/og/`, generated by `tools/og/make_og_images.py`. The white-hair page used to share a PRP photo, and several pages shared portrait photos that got cropped.
- The franchise page (`branches.html`) is now titled for **franchise** searches. Patients searching "Kezza Sikar" now land on the new location pages instead.
- The PMU title no longer promises SMP, because the page has no SMP content (see §4).

### Structured data (schema.org JSON-LD)
- Each page has one connected `@graph` with stable `@id`s, so Google and AI engines see one clinic brand with three branches:
  - `MedicalOrganization` (with legal name, logo, founder and social profiles);
  - `WebSite`;
  - three branch `MedicalClinic` entities (address, phone, `openingHoursSpecification`, map, and geo for Sikar);
  - `BreadcrumbList` on every page;
  - `MedicalWebPage` / `MedicalProcedure` on service pages;
  - `Person` entries for every doctor, the PMU artist and the founder, each linked to their branch;
  - `BlogPosting` with source citations.
- **FAQPage** schema is now generated from the FAQs that are actually visible on each page. Before, the hair-transplant schema questions didn't match the page.
- New answer-first FAQs:
  - PRP page: how GFC differs from PRP, and when results appear;
  - white-hair page: what electrolysis is;
  - hair-transplant page: ten fuller answers, including who shouldn't have a transplant and FUE vs DHI;
  - weight-loss page: a new six-question FAQ section.
- No `SearchAction`: the site has no search, and Google retired the sitelinks search box in 2024.

### Internal links
- The main nav "Hair Transplant (HT)" link now opens `/hair-transplant/`, your strongest page for the #1 keyword. Before, no page in the nav linked to it.
- A **"Clinics"** item has been added to the main nav. Footers link to Our Clinics, the Blog, the white-hair page and the correct PRP and transplant pages.
- Contextual links from the audit's plan: hair-services → transplant; PRP → transplant and hub; skin → doctors; PMU → artist; about → transplant and PRP; white-hair → transplant.
- Homepage treatment cards now link to their exact pages and sections instead of all pointing at the hub pages.
- The city names on the home, about, contact and franchise branch cards link to the location pages.

### Crawling, sitemap, AI files
- **robots.txt**:
  - explicit groups for search engines, AI answer engines (OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User, PerplexityBot, …) and AI training bots (GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, …);
  - fixes a real bug where Googlebot and Bingbot were **not** blocked from `/admin.html` and `/uploads/`.
- **sitemap.xml** lists all 24 indexable pages, including white-hair-removal, the new pages and share images. `lastmod` is the real last git commit date of each page.
- **llms.txt** (lowercase, per the spec) lists the three clinics with NAP and doctors, the treatments, the team and the guides.

### New pages
- `/locations/` is the clinic finder. `/locations/jaipur/`, `/locations/sikar/` and `/locations/ajmer/` each show the address, map link, timings, phones, doctors, treatments and a FAQ, with `MedicalClinic` schema.
- `/blog/` has six researched articles from the Month-2 plan, each with key takeaways, FAQs and cited sources. There are no price figures and no banned claims.
  - FUE vs DHI
  - Hair transplant cost in Jaipur
  - PRP vs GFC
  - How many PRP sessions
  - Why laser can't remove white hair
  - The Norwood scale, with original diagrams

### Speed
- Each page now loads **one CSS bundle** instead of 6–9 render-blocking stylesheets. For example, the homepage went from 9 requests and 283 KB (52 KB gzipped) to 1 request and 230 KB (37 KB gzipped).
- `.htaccess` adds gzip compression and caching. On shared hosting this is the biggest win for phones.

### Bug fixes
- The AI scanner failed to load its assets on any page more than one folder deep. `js/scanner-launch.js` now finds the site root from its own URL.
- The 404 page now uses root-absolute paths, so it's styled at any URL depth.
- Script versions were bumped for the JS files that changed.

### Tooling (new)
| Command | What it does |
|---|---|
| `npm run build` | Rebuilds location pages, blog, sitemap and llms.txt, then the CSS bundles |
| `npm run build:css` | Re-bundles CSS after you edit anything in `frontend/css/` |
| `npm run seo:check` | Fails on the wrong domain, NAP or hours mismatch, broken links, invalid or mismatched schema, sitemap gaps |
| `npm run og` | Regenerates the 1200×630 share images (needs `pip install pillow`) |

- The clinic facts (addresses, phones, hours, doctors, services per branch) live in `tools/seo/site-data.json`. Edit that file, then run `npm run build`.
- `tools/inject_seo.js`, `tools/fix_titles.js` and `tools/fix_descriptions.js` have been **removed** (still in git history). They hard-coded the dead domain, the wrong phone and the wrong hours, and re-running them would have undone all of this.

---

## 3. Where the audit was wrong

| Audit said | Actually |
|---|---|
| Domain is kezzaclinic.com; "canonical tags all correct" | The live domain is www.kezza.co.in, and kezzaclinic.com has no DNS. Every canonical pointed at a dead domain. This was the biggest problem on the site. |
| Proposed schema: `Mo-Su 10:00-20:00` | The clinic is open 09:00–20:00 |
| Proposed schema: `instagram.com/kezzaclinic` | The account is `@kezza_clinic` |
| Proposed clinic schema lists Jaipur + Sikar | There are three branches; Ajmer was missing |
| Add a WebSite `SearchAction` | The site has no search, and Google retired the sitelinks search box in Nov 2024 |
| FAQ schema will win rich results | Google removed FAQ rich results completely on 7 May 2026. The markup is still useful for AI answers, not for Google snippets. |
| "No BreadcrumbList on any page" | Two pages had it, and the hair-transplant one pointed at a URL that doesn't exist |
| white-hair-removal has no FAQPage | It had one |
| hair-services doesn't link to PRP; weight-loss has no homepage link | Both links already existed |
| Admin/uploads are blocked in robots.txt ("PASS") | Not for Googlebot or Bingbot: their own groups overrode the block |
| LLMs.txt is in place | The spec file is `/llms.txt`; `/LLMs.txt` 404s for anything requesting the standard path |
| Missed | The main nav never linked to `/hair-transplant/`; kezza.co.in had no www/https redirects; the Jaipur PIN, Ajmer hours and doctor locations disagreed between pages; a private bill PDF was public |

---

## 4. Needs a decision from you

- **"Book Free Consultation"** appears on many pages, but consultations cost ₹500 in Jaipur and ₹200 in Sikar and Ajmer (adjusted against treatment). The new pages don't mention price. Decide whether to keep calling it free.
- **Review counts and stats** are hard-coded: "4.9★ (320+ reviews)" on Sikar, "4.8 (210+ reviews)" on the newer Ajmer branch, "15,000+ patients", "10,000+ procedures". Make sure they match your Google profiles, or remove them.
- **"Dr. Ananya P., Consultant Dermatologist"** is quoted on the skin page but isn't on the About page. Confirm who she is, or replace the quote with one from Dr. Amrita Mukhija or Dr. Neelam Choudhary.
- **Medical claims** such as "zero risk", "100% autologous", "permanent fat reduction", "US-FDA cleared" and "board-certified dermatologists" (your skin team are aesthetic physicians) should get a doctor's review. Your own `validate_reference_page.py` bans several of these words.
- **The contact-page map pin for Jaipur** (26.848, 75.826) sits in south Jaipur, not Khatipura, and Ajmer isn't on the map. Paste the coordinates from each Google Business Profile.
- **SMP** has no page even though it's a service. A dedicated scalp micropigmentation page is the next best content piece (it's a P0 keyword in the audit's map).
- **The scanner popup** opens automatically after 6 seconds and preloads about 100 KB on every page. Consider showing it only after scrolling, or only on some pages, to help mobile speed and avoid Google's intrusive-popup signal.
- **The Meta Pixel** is hard-coded only on the homepage. Confirm GTM fires it on every page, or ad conversions from other pages are lost.
- **Chatbot and scanner routing** still sends "Sikar hair transplant" leads to +91 81308 88129 under Dr. Dhiral's name. Confirm that number now belongs to the Sikar team.
- **Twitter/X:** the `@KezzaClinic` handle was removed from meta tags. Add it back only if you own that account.
- **Blog:** ask a doctor to review each article. The articles don't claim a medical reviewer yet.

## 5. Next steps (not done in this pass)
- Remove unused CSS. Coverage shows only 30–65% of each bundle is used on a page, but this needs per-page testing of menus, modals and chat states.
- Optimise the homepage videos and large images; these are likely the next biggest mobile-speed win.
- Publish the Month-3 articles. Copy any file in `tools/content/blog/`, edit it, add an OG card in `tools/og/make_og_images.py`, then run `npm run og && npm run build`.
- Build individual doctor profile pages, and a dedicated SMP page.
