# Kezza Clinic — programmatic SEO (pSEO) implementation report

30 September 2026 · site: https://www.kezza.co.in · code: `tools/content/pseo.py`, `tools/seo/taxonomy.json`, `tools/seo/pseo_audit.py`

**In one paragraph.** The site now has a small, rule-based pSEO system instead of hand-copied pages. One registry lists every treatment, where it sits in the hair / skin / weight-loss / PMU tree, which clinics offer it and what search it answers. Page content lives in one file per treatment. The build turns those into pages with the existing Kezza design, and a status model decides what Google may see: new pages start in **review** (built, `noindex`, not in the sitemap, not linked from menus) and only become indexable when a named reviewer and date are set and every quality gate passes. Following the plan, three pilot pages (one each for skin, weight loss and PMU) were built and checked first, then the other nine. **12 new treatment pages are ready for the clinic to review; none of them is indexable yet.** The 7 treatment pages approved last time stay live. Programmatic SEO here means a controlled system for good pages, not a way to mass-produce pages, and nothing in it guarantees rankings.

| | Before | After |
| --- | --- | --- |
| HTML pages | 36 | 48 |
| Indexable pages (in sitemap) | 34 | 34 (unchanged until the clinic approves the new pages) |
| Treatment pages built by the system | 7 | 19 (7 published, 12 in review) |
| Critical audit issues | 0 | 0 |
| Unsupported-claim wording on new pages | – | 0 |
| `npm test` | passes | passes (now also runs the pSEO audit in strict mode) |

Backup before changes: git commit `1cd2a4a` (the package delivered earlier today). Nothing was deleted, no existing URL was renamed and no existing functionality was removed.

## 1. Existing page inventory

Every HTML page was audited before any change (`docs/pseo/inventory-before.md` / `.csv` has all 28 columns: category, treatment, location, URL, title, H1, meta, canonical, robots, schema, breadcrumbs, links in and out, intent, duplication risk, orphan status). Summary of the 36 pages found:

| URL | Category | Treatment / role | Index | Words | Links in (body / menu) | Issues found |
| --- | --- | --- | --- | --- | --- | --- |
| /404.html |  | utility | no | 32 | 0 / 0 |  |
| /about.html |  | About & Doctors | yes | 1668 | 19 / 33 | no visible breadcrumb |
| /admin.html |  | utility | no | 69 | 0 / 0 |  |
| /blog/fue-vs-dhi-hair-transplant/ | Hair | FUE vs DHI | yes | 1670 | 9 / 0 |  |
| /blog/hair-transplant-cost-jaipur/ | Hair | Hair transplant cost | yes | 1425 | 9 / 0 |  |
| /blog/how-many-prp-sessions/ | Hair | How many PRP sessions | yes | 1237 | 5 / 0 |  |
| /blog/ |  | Blog | yes | 320 | 7 / 33 |  |
| /blog/norwood-scale-explained/ | Hair | Norwood scale | yes | 1567 | 8 / 0 |  |
| /blog/prp-vs-gfc-therapy/ | Hair | PRP vs GFC | yes | 1468 | 7 / 0 |  |
| /blog/why-laser-cant-remove-white-hair/ | Hair | Why laser can't remove white hair | yes | 1394 | 3 / 0 |  |
| /branches.html |  | Franchise | yes | 788 | 0 / 33 | linked only from menu/footer; no visible breadcrumb |
| /contact.html |  | Contact | yes | 583 | 29 / 33 | no visible breadcrumb |
| /electrolysis.html | Hair | Electrolysis | yes | 1679 | 4 / 33 | overlaps white hair removal |
| /face-scanner.html |  | AI Skin & Hair Scanner | yes | 660 | 33 / 33 | no visible breadcrumb |
| /gfc-treatment/ | Hair | GFC Hair Treatment | yes | 1790 | 14 / 33 |  |
| /hair-loss-consultation.html | Hair | Hair Loss Consultation | yes | 1168 | 10 / 33 |  |
| /hair-services.html | Hair | Hair Services | yes | 1859 | 16 / 30 | unverified doctor names in reviews; no visible breadcrumb |
| /hair-transplant/beard/ | Hair | Beard Transplant | yes | 1895 | 8 / 33 |  |
| /hair-transplant/dhi/ | Hair | DHI Hair Transplant | yes | 1790 | 7 / 33 |  |
| /hair-transplant/eyebrow/ | Hair | Eyebrow Transplant | yes | 1700 | 8 / 33 |  |
| /hair-transplant/fue/ | Hair | FUE Hair Transplant | yes | 2155 | 11 / 33 |  |
| /hair-transplant/ | Hair | Hair Transplant | yes | 1348 | 16 / 33 |  |
| /hair-wig.html | Hair | Hair Replacement (Wig & Patch) | yes | 1554 | 2 / 33 |  |
| /hi/hair-transplant/ | Hair | हेयर ट्रांसप्लांट (Hindi) | yes | 1879 | 1 / 0 |  |
| / |  | Home | yes | 2166 | 23 / 33 | 13 claim phrases; title shared intent with Jaipur page |
| /laser-hair-removal/ | Skin | Laser Hair Removal | yes | 1866 | 5 / 33 |  |
| /locations/ajmer/ |  | Kezza Ajmer | yes | 856 | 18 / 19 |  |
| /locations/ |  | Our Clinics | yes | 298 | 5 / 33 |  |
| /locations/jaipur/ |  | Kezza Jaipur | yes | 1038 | 20 / 19 | H1 competed with the home page |
| /locations/sikar/ |  | Kezza Sikar | yes | 909 | 20 / 19 |  |
| /permanent-makeup.html | Permanent Makeup | Permanent Makeup | yes | 1799 | 5 / 33 | claims (100% safe, 5000+), unverified case studies; no visible breadcrumb |
| /prp-therapy.html | Hair | PRP Hair Treatment | yes | 1840 | 14 / 33 | zero-pain wording; no visible breadcrumb |
| /skin-services.html | Skin | Skin Services | yes | 1668 | 6 / 33 | claims (100% painless, 85%+, 92%+), unverified doctor name; no visible breadcrumb |
| /terms.html |  | Terms & Privacy | yes | 875 | 0 / 32 | linked only from menu/footer; no visible breadcrumb |
| /weight-loss.html | Weight Loss | Weight Loss | yes | 970 | 3 / 33 | unverified results case and third-party photos; no visible breadcrumb |
| /white-hair-removal.html | Hair | White & Grey Hair Removal | yes | 1698 | 5 / 33 | overlaps electrolysis; no visible breadcrumb |

Findings in short: no duplicate titles, descriptions or H1s; no orphan pages; no broken internal links; every indexable page was in the sitemap with a self-referencing canonical. Two pages were weakly linked (menu/footer only), 11 hand-built pages had breadcrumb schema without a visible trail, and 46 phrases of unsupported claim wording sat on the hand-built pages (48 once a check for "permanent results" was added; listed in section 15).

## 2. New pSEO architecture

```
tools/seo/taxonomy.json        registry: categories, treatments, pages, what is NOT generated and why
        │   (id, URL, category, parent, clinics, search intent, related, card, fallback link, llms.txt line)
tools/content/pages/NN-*.html  one file per generated page: JSON header (hero, sections, FAQs, procedure, status,
        │                      review notes) + the long guide section in HTML
tools/content/pseo.py          engine: status model, quality gates, related-page rules, link sync, link fallbacks
        ▼
tools/content/build_content_pages.py   builds pages with the existing Kezza template (header/footer copied from
        │                              /hair-transplant/ at build time), then sitemap.xml, llms.txt, .htaccess rule,
        │                              docs/pseo/quality-gates.md
tools/build-css.js / stamp-js.js       CSS bundle (new pages join the 'content' bundle automatically), JS versions
tools/seo/pseo_audit.py                sitewide inventory + audit; runs in `npm test` with --strict
```

- **Content separated from presentation.** Writers edit text in `tools/content/pages/*.html`; the layout comes from existing components (`service-page.css`, `content-pages.css`). No new CSS architecture, no new JavaScript.
- **Status model.** `draft` (not built) → `review` / `approved` (built for preview, `noindex, follow`, excluded from sitemap, llms.txt, menus, cards and related links, no "reviewed by" line) → `published` (indexable only if every critical gate passes and a known reviewer plus review date are set; otherwise held back as *blocked*) · `noindex` (built for visitors, never indexed).
- **Status-aware links.** Menus, footers, home cards and hub pages carry `data-pseo` markers or `pseo:link` slots. While a page is in review they keep pointing to the current section of the hub page (for example `/skin-services.html#botox`); the build switches them to the new page the moment it is published, and back again if it is unpublished.
- **Link fallbacks.** If a published page mentions a page that is still in review, the build points that link at the registry fallback, so pages can be published one at a time without ever sending visitors or Google to an unapproved page.
- **Tested both ways.** In a scratch copy, FUE was set back to review (menus, cards, clinic lists and hub links fell back; the page turned `noindex` and left the sitemap; DHI, beard, eyebrow and Hindi pages stayed live with their FUE links pointed at the fallback), and all 12 new pages were set to published (46 indexable pages, 0 critical issues, every new page linked from 3–6 pages in body text).

## 3. Treatment taxonomy

Built from the codebase (hub pages, navigation, chatbot knowledge, clinic data), not from assumptions. Types: **static** = existing hand-built page, **generated** = built by the pSEO system, **section** = a real service that stays as a section of a hub page.

**Hair** — hub `/hair-services.html`

- Hair Transplant — `/hair-transplant/` — static, published — clinics: jaipur, sikar, ajmer
- FUE Hair Transplant (under Hair Transplant) — `/hair-transplant/fue/` — generated, published — clinics: jaipur, sikar, ajmer
- DHI Hair Transplant (under Hair Transplant) — `/hair-transplant/dhi/` — generated, published — clinics: jaipur
- Beard Transplant (under Hair Transplant) — `/hair-transplant/beard/` — generated, published — clinics: jaipur, sikar, ajmer
- Eyebrow Transplant (under Hair Transplant) — `/hair-transplant/eyebrow/` — generated, published — clinics: jaipur, sikar, ajmer
- हेयर ट्रांसप्लांट (Hindi) — `/hi/hair-transplant/` — generated, published — clinics: jaipur, sikar, ajmer
- PRP Hair Treatment — `/prp-therapy.html` — static, published — clinics: jaipur, sikar
- GFC Hair Treatment — `/gfc-treatment/` — generated, published — clinics: jaipur, sikar
- Hair Loss Consultation — `/hair-loss-consultation.html` — static, published — clinics: jaipur, sikar, ajmer
- White & Grey Hair Removal — `/white-hair-removal.html` — static, published — clinics: jaipur
- Electrolysis — `/electrolysis.html` — static, published — clinics: jaipur
- Hair Replacement (Wig & Patch) — `/hair-wig.html` — static, published — clinics: jaipur
- Hairline Design — `/hair-services.html#hairline-design` — section, published
- Female Hair Restoration — `/hair-services.html#female-hair` — section, published

**Skin** — hub `/skin-services.html`

- Laser Hair Removal — `/laser-hair-removal/` — generated, published — clinics: jaipur, sikar
- Acne Treatment — `/acne-treatment/` — generated, review — clinics: jaipur, sikar
- Acne Scar Treatment — `/acne-scar-treatment/` — generated, review — clinics: jaipur, sikar
- Hydra Facial — `/hydra-facial/` — generated, review — clinics: jaipur, sikar
- Botox (Anti-Wrinkle Injections) — `/botox/` — generated, review — clinics: jaipur
- Dark Circles Treatment — `/dark-circles-treatment/` — generated, review — clinics: jaipur
- Skin Treatments — `/skin-services.html` — section, published
- Pigmentation & Melasma Treatment — `/skin-services.html#pigmentation` — section, published
- Dermal Fillers — `/skin-services.html#anti-aging` — section, published
- HIFU Face Lifting — `/skin-services.html#anti-aging` — section, published
- Glutathione Therapy — `/skin-services.html#glutathione` — section, published
- Stretch Mark Treatment — `/skin-services.html#stretch-marks` — section, published
- Medical Dermatology — `/skin-services.html#medical-derma` — section, published

**Weight Loss** — hub `/weight-loss.html`

- Cryolipolysis (Fat Freezing) — `/cryolipolysis/` — generated, review — clinics: jaipur, sikar
- HIFU Body Sculpting — `/hifu-body-sculpting/` — generated, review — clinics: jaipur, sikar
- Medical Weight Management — `/weight-management/` — generated, review — clinics: jaipur, sikar
- Non-Surgical Body Sculpting — `/weight-loss.html` — section, published
- Double Chin Reduction — `/weight-loss.html#treatments` — section, published
- RF Body Tightening — `/weight-loss.html#transformations` — section, published

**Permanent Makeup** — hub `/permanent-makeup.html`

- Microblading & Eyebrow PMU — `/microblading/` — generated, review — clinics: jaipur, sikar
- Lip Blush & Lip Neutralization — `/lip-blush/` — generated, review — clinics: jaipur, sikar
- Permanent Eyeliner — `/permanent-eyeliner/` — generated, review — clinics: jaipur, sikar
- PMU Correction — `/pmu-correction/` — generated, review — clinics: jaipur, sikar
- Beauty Spot PMU — `/permanent-makeup.html` — section, published

How the tree you sent maps onto the site:

| Your tree | Where it lives now |
| --- | --- |
| Hair › Hair Transplant, PRP, GFC, Beard Transplant | `/hair-transplant/` (+ FUE, DHI, beard, eyebrow children), `/prp-therapy.html`, `/gfc-treatment/` — all live |
| Hair › Hair Replacement | `/hair-wig.html` (existing page, kept) |
| Skin › Acne, Acne Scars, HydraFacial, Botox, Dark Circles | new pages in review: `/acne-treatment/`, `/acne-scar-treatment/`, `/hydra-facial/`, `/botox/`, `/dark-circles-treatment/` |
| Skin › Laser | `/laser-hair-removal/` (live); a generic laser page was not made (section 5) |
| Weight Loss › Cryolipolysis, HIFU, Weight Management | new pages in review: `/cryolipolysis/`, `/hifu-body-sculpting/`, `/weight-management/` |
| Weight Loss › RF | not generated: RF only appears inside a results case on the weight-loss page (section 5) |
| PMU › Eyebrow PMU, Microblading | one page, `/microblading/` (same service and search intent at Kezza) |
| PMU › Lip Blush, Eyeliner, PMU Correction | new pages in review: `/lip-blush/`, `/permanent-eyeliner/`, `/pmu-correction/` |

## 4. Pages eligible for programmatic generation

A treatment qualified only if (1) Kezza's own pages show it is offered, (2) it answers a distinct search intent that no existing page answers in depth, (3) there is enough real, sourced information for a useful page, and (4) it would not duplicate another page. Every page below passed all critical gates (unique title, description, H1 and opening, 900+ page-specific words, 4+ FAQs, no claim wording, images with alt text and sizes, valid links and taxonomy).

| Page | URL | Status | Clinics | Primary search intent | Words* | FAQs | Most similar page |
| --- | --- | --- | --- | --- | --- | --- | --- |
| FUE Hair Transplant | `/hair-transplant/fue/` | published | jaipur, sikar, ajmer | fue hair transplant in jaipur | 1839 | 9 | 2% (dhi-hair-transplant) |
| DHI Hair Transplant | `/hair-transplant/dhi/` | published | jaipur | dhi hair transplant in jaipur | 1498 | 9 | 2% (fue-hair-transplant) |
| Beard Transplant | `/hair-transplant/beard/` | published | jaipur, sikar, ajmer | beard transplant in jaipur | 1590 | 9 | 2% (eyebrow-transplant) |
| Eyebrow Transplant | `/hair-transplant/eyebrow/` | published | jaipur, sikar, ajmer | eyebrow transplant in jaipur | 1419 | 8 | 2% (beard-transplant) |
| हेयर ट्रांसप्लांट (Hindi) | `/hi/hair-transplant/` | published | jaipur, sikar, ajmer | हेयर ट्रांसप्लांट जयपुर | 1590 | 9 | 0% (weight-management) |
| GFC Hair Treatment | `/gfc-treatment/` | published | jaipur, sikar | gfc hair treatment in jaipur | 1485 | 9 | 0% (microblading) |
| Laser Hair Removal | `/laser-hair-removal/` | published | jaipur, sikar | laser hair removal in jaipur | 1583 | 9 | 1% (hydra-facial) |
| Acne Treatment | `/acne-treatment/` | review | jaipur, sikar | acne treatment in jaipur | 1485 | 6 | 1% (acne-scar-treatment) |
| Acne Scar Treatment | `/acne-scar-treatment/` | review | jaipur, sikar | acne scar treatment in jaipur | 1763 | 6 | 1% (acne-treatment) |
| Hydra Facial | `/hydra-facial/` | review | jaipur, sikar | hydra facial in jaipur | 1309 | 6 | 1% (weight-management) |
| Botox (Anti-Wrinkle Injections) | `/botox/` | review | jaipur | botox treatment in jaipur | 1366 | 6 | 0% (dark-circles-treatment) |
| Dark Circles Treatment | `/dark-circles-treatment/` | review | jaipur | dark circles treatment in jaipur | 1329 | 6 | 1% (hifu-body-sculpting) |
| Cryolipolysis (Fat Freezing) | `/cryolipolysis/` | review | jaipur, sikar | cryolipolysis in jaipur | 1638 | 6 | 1% (hifu-body-sculpting) |
| HIFU Body Sculpting | `/hifu-body-sculpting/` | review | jaipur, sikar | hifu body sculpting in jaipur | 1383 | 6 | 1% (cryolipolysis) |
| Medical Weight Management | `/weight-management/` | review | jaipur, sikar | medical weight management in jaipur | 1342 | 6 | 1% (hydra-facial) |
| Microblading & Eyebrow PMU | `/microblading/` | review | jaipur, sikar | microblading in jaipur | 1644 | 6 | 4% (permanent-eyeliner) |
| Lip Blush & Lip Neutralization | `/lip-blush/` | review | jaipur, sikar | lip blush in jaipur | 1470 | 6 | 4% (permanent-eyeliner) |
| Permanent Eyeliner | `/permanent-eyeliner/` | review | jaipur, sikar | permanent eyeliner in jaipur | 1400 | 6 | 4% (lip-blush) |
| PMU Correction | `/pmu-correction/` | review | jaipur, sikar | pmu correction in jaipur | 1476 | 6 | 1% (microblading) |

\* Page-specific words only (template wording, navigation and cited source titles are not counted). The gate limit for similarity between generated pages is 30%; the highest found is 4%.

## 5. Pages intentionally NOT generated

| Topic | Why not |
| --- | --- |
| Treatment × city pages (e.g. 'Hair transplant in Sikar') | The three clinic pages already answer the local search with city-specific doctors, treatments, nearby towns and FAQs. A second page per treatment and city would repeat the treatment page with a new city name: a doorway-page risk with no extra value. Treatment pages list the clinics that offer them instead. |
| Separate 'Eyebrow PMU' and 'Microblading' pages | Same search intent and the same service at Kezza (microblading / hybrid / powder brows). Merged into one page, /microblading/. |
| Separate lash-enhancement page | Offered as a style of permanent eyeliner; covered on /permanent-eyeliner/. |
| Separate lip-neutralization page | Offered as part of lip PMU; covered on /lip-blush/. |
| Generic 'Laser treatments' page | Would duplicate the skin page's laser section and /laser-hair-removal/. Laser toning belongs with pigmentation. |
| RF body tightening | Only appears inside a results case on the weight-loss page, not as a listed treatment. Needs clinic confirmation before a page. |
| Double chin reduction | Covered on the cryolipolysis and HIFU pages; the clinic's exact methods ('lipolytic contouring') need confirming first. |
| Pigmentation, fillers, glutathione, stretch marks, medical dermatology, female hair restoration | Real services with sections on the hub pages. Eligible for pages in a later round, after the current pages are approved. |
| Scalp micropigmentation (SMP) and camouflage | Mentioned only in the chatbot; no website content or clinic detail to build from. |
| Beauty spot PMU | Very small service with little search demand; stays on the PMU page. |

No treatment × city pages were made. The three clinic pages already serve local searches; copying each treatment page for Sikar and Ajmer would create doorway pages. Treatment pages list the clinics that offer them instead (section 13).

## 6. Duplicate and cannibalization findings

| Pages | Finding | Decision |
| --- | --- | --- |
| Home page vs `/locations/jaipur/` | Home title and the Jaipur H1 both targeted "Hair Transplant & Skin Clinic in Jaipur" | **Differentiate (done):** Jaipur H1 is now "Hair & Skin Clinic in Khatipura, Jaipur | Kezza, Sirsi Road", matching its title; the home page keeps the city-wide phrase |
| `/white-hair-removal.html` vs `/electrolysis.html` | Same method (electrolysis) and overlapping intent | **Differentiate (recommended, not changed):** keep white-hair removal as the problem page and electrolysis as the method page, and cut the repeated sections |
| `/locations/sikar/` vs `/locations/ajmer/` and `/locations/jaipur/` | 20–23% shared wording (address blocks, hours, FAQ pattern) | **Keep:** below the 25% warning line and each has its own doctors, treatments and nearby towns |
| `/hair-transplant/` vs FUE / DHI pages | Parent and child pages on one topic | **Keep:** the hub covers choice and cost, FUE and DHI pages cover each method; breadcrumbs and links make the hierarchy explicit |
| `/prp-therapy.html` vs `/gfc-treatment/` | Related treatments | **Keep:** different treatments; cross-linked, and the PRP vs GFC article compares them |
| `/hair-transplant/eyebrow/` vs `/microblading/` | Both about fuller eyebrows | **Keep:** different intent (growing real hair vs cosmetic pigment); each page points to the other for the right reader |
| Skin, weight-loss and PMU hub pages vs their new treatment pages | Hub sections summarise the same treatments | **Keep hub + detail pattern:** hubs stay the broad pages; status-aware links hand readers down to the detail page once it is published |
| Separate 'Eyebrow PMU' page vs `/microblading/` | Same service and intent | **Merge (by design):** one page |
| `/hair-transplant/beard/` and `/hair-transplant/eyebrow/` | Share the FAQ question "When will I see results?" (answers differ) | **Keep for now:** harmless; could be reworded when the pages are next reviewed (they are doctor-approved, so not changed) |

No redirects or canonical changes were needed: the audit found no duplicate pages, and no page was generated that could compete with an existing one (the registry checks that each primary intent is used once).

## 7. Internal-linking architecture

Rules, all driven by the registry and the page status:

1. **Menus and footers** (all 15 hand-built pages and the shared template): up to 15 menu items and up to 4 footer links per page carry `data-pseo` markers. Example: *Dark Circle Treatment* points to `/skin-services.html#dark-circles` today and to `/dark-circles-treatment/` once published.
2. **Home page cards:** 14 treatment cards carry markers. FUE and DHI cards now open the FUE and DHI pages (they previously opened the general hair-transplant page).
3. **Hub pages:** 18 `pseo:link` slots add a descriptive link such as *Read the full Botox guide* at the end of the matching section once the page is live (hair, skin, weight-loss, PMU and PRP pages).
4. **Related treatments** on each generated page: the registry's `related` list first, then parent and sibling treatments, then the same category; only live pages, maximum three.
5. **Further reading:** blog articles listed for a treatment in the registry are added automatically when the page does not already link them.
6. **Clinic pages:** treatment lists on `/locations/jaipur/` and `/locations/sikar/` use treatment ids, so they switch to the treatment page when it is published.
7. **Breadcrumbs:** Home › category hub › parent › page, generated from the taxonomy.
8. **Safety net:** links from a live page to a page in review are pointed at the fallback; the audit fails if a hand-built page hard-codes a link to an unpublished page.

Anchor text is descriptive ("Read the acne scar treatment guide", "medical weight management"), never keyword lists. In the all-published simulation, every new page received 3–6 in-content links plus menu/footer links; none was orphaned.

## 8. Metadata strategy

- **Title:** `{Treatment} in Jaipur | Kezza Clinic` (Jaipur is the flagship; the clinics offering it are listed on the page), 60 characters or fewer, unique sitewide. Botox adds "Anti-Wrinkle Injections" because that is how people search.
- **Meta description:** 70–160 characters, names the clinics that offer the treatment and the main questions answered, unique sitewide.
- **H1:** `{Treatment} in Jaipur` plus a short descriptive span (for example "| Non-Surgical Fat Freezing"); unique sitewide.
- **Opening sentence:** the first 12 words must differ from every other generated page.
- **Social share:** a 1200 × 630 card per page from `tools/og/make_og_images.py`; the gate fails if it is missing.
- **Robots:** `noindex, follow` for review pages; the standard indexable robots tag only for published pages.

All of this is checked by the build (section 14). New titles, for reference:

| Page | Title | Meta description length |
| --- | --- | --- |
| `/acne-treatment/` | Acne Treatment in Jaipur \| Kezza Clinic | 153 |
| `/acne-scar-treatment/` | Acne Scar Treatment in Jaipur \| Kezza Clinic | 157 |
| `/hydra-facial/` | Hydra Facial in Jaipur \| Kezza Clinic | 155 |
| `/botox/` | Botox in Jaipur: Anti-Wrinkle Injections \| Kezza Clinic | 157 |
| `/dark-circles-treatment/` | Dark Circles Treatment in Jaipur \| Kezza Clinic | 154 |
| `/cryolipolysis/` | Cryolipolysis (Fat Freezing) in Jaipur \| Kezza Clinic | 154 |
| `/hifu-body-sculpting/` | HIFU Body Sculpting in Jaipur \| Kezza Clinic | 154 |
| `/weight-management/` | Medical Weight Management in Jaipur \| Kezza Clinic | 157 |
| `/microblading/` | Microblading & Eyebrow PMU in Jaipur \| Kezza Clinic | 149 |
| `/lip-blush/` | Lip Blush in Jaipur \| Kezza Clinic | 153 |
| `/permanent-eyeliner/` | Permanent Eyeliner in Jaipur \| Kezza Clinic | 142 |
| `/pmu-correction/` | PMU Correction in Jaipur \| Kezza Clinic | 157 |

## 9. Breadcrumb strategy

Breadcrumbs for generated pages come from the taxonomy (`pseo.breadcrumb_for`): Home › category hub › parent treatment (if any) › page. The visible trail and the BreadcrumbList schema are produced from the same data, so they always match. Example: Home › Weight Loss › Cryolipolysis (Fat Freezing). The audit compares visible and schema trails on every page. The 11 hand-built pages that have breadcrumb schema but no visible trail are listed as notes; adding a visible trail there is a design change, so it is left as a recommendation.

## 10. Schema strategy

Only schema that describes what is really on the page. Each generated page has one `@graph`:

- `MedicalOrganization` and `WebSite` (the clinic, shared `@id`s across the site)
- `MedicalWebPage` for medical treatments, plain `WebPage` for permanent makeup
- The treatment: `MedicalProcedure` with `procedureType` (for example `NoninvasiveProcedure` for cryolipolysis and hydra facial, `PercutaneousProcedure` for acne scar treatment and Botox), `MedicalTherapy` for acne, dark circles and weight management, and `Service` (with `provider` and `areaServed`) for PMU, which is cosmetic rather than medical
- `BreadcrumbList` and `FAQPage` (FAQ text copied from the visible questions)
- `reviewedBy`, `lastReviewed` and a `Person` for the reviewer **only when the page is published with a reviewer and date**

Not added anywhere: ratings, review counts, prices, offers, before/after results or medical claims. The review pages carry no reviewer data at all until someone real has approved them.

## 11. Sitemap strategy

`sitemap.xml` is generated from the registry on every build: hand-built pages in a stable order (home, about, each hub followed by its treatment pages, then the rest), generated pages **only if published and passing every gate**, clinic pages and blog articles. `lastmod` is the last git commit of each file (today for uncommitted changes); each entry lists its share image. `llms.txt` follows the same rule, grouped by category. Review pages are in neither. `robots.txt` was audited and is unchanged: it must not block review pages, because Google has to crawl a page to see its `noindex`.

## 12. Canonical strategy

Every page has a self-referencing canonical on `https://www.kezza.co.in`, folder URLs end in `/`, and `.htaccess` sends the no-slash version to the slash version with a 301 (this rule is regenerated from the page folders on each build). The English and Hindi hair-transplant pages keep their reciprocal `hreflang` pair. No cross-page canonicals were needed because no duplicate pages were created. Review pages keep a self canonical plus `noindex`; when published only the robots tag changes. The audit fails if an indexable page's canonical is not its own URL, or if a `noindex` page appears in the sitemap.

## 13. Location strategy

- **No treatment × city pages.** Kezza has three clinics; the clinic pages (`/locations/jaipur/`, `/sikar/`, `/ajmer/`) carry the local signals: address, map, hours, doctors, nearby towns and local FAQs.
- **Treatment pages list the clinics that offer them**, taken from the registry (`locations`), for example Botox and dark circles: Jaipur only; cryolipolysis: Jaipur and Sikar. This is flagged for confirmation on every page.
- **Clinic pages link to treatment pages** through the treatment ids in `tools/seo/site-data.json`, so they update when a page is published.
- **Jaipur page vs home page:** differentiated (section 6).
- A city-specific treatment page should only be considered if there is genuinely local content for it (a doctor who only practises there, local pricing, local patient information), and it would go through the same gates.

## 14. Content quality system

The build runs these gates on every generated page and writes the results to `docs/pseo/quality-gates.md`:

| Gate | Level |
| --- | --- |
| Required fields (title, description, H1, intro, hero image, FAQs, call to action, procedure) | critical |
| Title 60 characters or fewer and unique sitewide; description 70–160 and unique; H1 unique; opening 12 words unique | critical |
| At least 900 page-specific words and 4 FAQs | critical |
| Content similarity with any other generated page below 30% (6-word shingles) | critical |
| No unsupported claim wording: 100% / guaranteed / zero risk / no side effects / risk-free / works for everyone / best clinic / number 1 / painless / permanent results (negated uses such as "no guarantee" are allowed) | critical |
| URL matches the registry; category, parent and clinics exist | critical |
| Images exist, have alt text (125 characters or fewer), width and height; social share image exists | critical |
| Internal links resolve | critical |
| Published pages need a reviewer who is a real person in `site-data.json` and an ISO review date | critical |
| FAQ question used on another page; links to pages not yet published | warning |
| `review_notes` in the page file | shown to the reviewer |

A page whose status is `published` but fails a critical gate is held back (built as `noindex`). The sitewide audit (`npm run seo:audit`, and `npm test` in strict mode) adds: duplicate titles/descriptions/H1s across all pages, near-duplicate content (40% critical, 25% warning), pages sharing a registered search intent, orphans, broken links, sitemap coverage, canonical checks, links from live pages to unpublished pages, and claim wording on hand-built pages (reported for review).

## 15. Medical-content review requirements

**How to approve a page:** a doctor (or, for PMU, the PMU artist plus a doctor for the safety parts) reads the page in review, answers the points below, and then in the page file sets `"status": "published"`, `"reviewer": "<id from site-data.json>"` and `"reviewed": "YYYY-MM-DD"`, and runs `npm run build && npm test`. Nothing else needs editing: menus, cards, hub links, clinic lists, sitemap and llms.txt follow automatically.

Everything on the new pages comes from Kezza's own site or from the sources cited on each page (AAD, NHS, Mayo Clinic, Cleveland Clinic, DermNet, US FDA, ASPS, WHO, peer-reviewed reviews). No statistics, success rates, credentials, certifications, patient outcomes, guarantees, prices or before/after photos were invented. Where a figure is quoted (for example the average fat reduction after cryolipolysis), it is attributed to its source and flagged for the clinic to confirm.

Before hand-over, every page had a second, independent accuracy check against its cited sources. It led to corrections such as: Botox aftercare matched word-for-word to Cleveland Clinic's advice; tear-trough filler risks stated in full (lumps, bluish tint, rare vessel blockage and sight loss); laser darkening of brown, red and pink PMU pigments, not only white and flesh tones; patch tests moved to a visit before the treatment day; hernia added as a reason not to have cryolipolysis, with rare cold injury and delayed nerve pain; aspirin allergy added for the hydra-facial peel step; no numbing-cream claim for peels; fractional-laser pinkness lasting weeks; and no tattooing over moles without a doctor's check. Figures from NHS guidance (0.5–1 kg a week, 5–10% weight loss, 45–60 minutes of activity) were re-checked on the NHS page.

**`/acne-treatment/`** — suggested reviewer: dr-amrita-mukhija or dr-neelam-choudhary

- Confirm the treatments offered: which medical peels, extraction, cyst injections and whether isotretinoin is prescribed at Kezza.
- Confirm acne treatment is available in Sikar as well as Jaipur.
- Confirm the review timing (the page says 6 to 8 weeks) matches clinic practice.
- Choose the reviewing doctor (suggested: Dr. Amrita Mukhija or Dr. Neelam Choudhary), then set status, reviewer and reviewed date.
- The hero photo is an illustrative stock-style image, not a Kezza patient.
- No prices are shown. Add them only if the clinic wants to publish prices.

**`/acne-scar-treatment/`** — suggested reviewer: dr-amrita-mukhija or dr-neelam-choudhary

- Confirm which scar treatments each clinic offers (subcision, MNRF, fractional CO2 laser, chemical peels) and whether device names should be shown.
- Confirm that acne scar treatment is available in Sikar as well as Jaipur.
- Confirm the usual session spacing and course length (the page says several sessions, a few weeks apart).
- Confirm the advice on raised scars (steroid injections, silicone, laser) and on deep ice pick scars (focused chemical application such as TCA CROSS, or punch techniques) matches what the clinic offers.
- Choose the reviewing doctor (suggested: Dr. Amrita Mukhija or Dr. Neelam Choudhary), then set status, reviewer and reviewed date.
- The hero photo is an illustrative stock-style image, not a Kezza patient. The explainer photo is a real Kezza treatment room.
- No prices are shown. Add them only if the clinic wants to publish prices.

**`/hydra-facial/`** — suggested reviewer: dr-amrita-mukhija or dr-neelam-choudhary

- Confirm the machine used at each clinic and whether it is a HydraFacial-brand system. The skin page calls the treatment 'HydraFacial MD' with 'patented Vortex-Fusion technology'; that brand wording should only stay if the clinic uses a genuine HydraFacial system.
- Confirm the steps, solutions and any add-ons offered, and who performs the facial.
- Confirm hydra facials are available in Sikar as well as Jaipur.
- Choose the reviewing doctor (suggested: Dr. Amrita Mukhija or Dr. Neelam Choudhary), then set status, reviewer and reviewed date.
- The hero photo is an illustrative stock-style image. The explainer photo shows the real machine at Kezza.
- No prices are shown. Add them only if the clinic wants to publish prices.

**`/botox/`** — suggested reviewer: dr-nakul-somani or dr-amrita-mukhija

- Confirm the brand(s) of botulinum toxin used. Botox is a trademark of Allergan (AbbVie); if the clinic uses another brand, the page title and wording should use the generic name.
- The skin page shows 'FDA Allergan Brands' and '6–9 Mo Lasting Results'. Published sources give about 3 to 4 months (Mayo Clinic) or 3 to 6 months (Cleveland Clinic); please confirm or correct the skin page.
- Confirm the areas treated (including masseter/jawline) and that injections are given only at the Jaipur clinic.
- Confirm which doctors give the injections and the review timing (the page says about two weeks).
- Choose the reviewing doctor (suggested: Dr. Nakul Somani or Dr. Amrita Mukhija), then set status, reviewer and reviewed date.
- The hero photo is an illustrative stock-style image, not a Kezza patient.
- No prices are shown. Add them only if the clinic wants to publish prices.

**`/dark-circles-treatment/`** — suggested reviewer: dr-amrita-mukhija or dr-nakul-somani

- Confirm the methods offered for dark circles at Kezza: prescription creams, chemical peels, laser toning, tear-trough filler and whether PRP is used.
- Confirm the filler products used under the eyes and which doctors inject them.
- Confirm dark circles treatment is offered only at the Jaipur clinic.
- Choose the reviewing doctor (suggested: Dr. Amrita Mukhija or Dr. Nakul Somani), then set status, reviewer and reviewed date.
- The hero photo is an illustrative stock-style image, not a Kezza patient.
- No prices are shown. Add them only if the clinic wants to publish prices.

**`/cryolipolysis/`** — suggested reviewer: dr-neelam-choudhary or dr-youvraj-singh

- Confirm the cryolipolysis device used at each clinic, the areas it can treat and whether it is cleared or approved by a regulator; the page does not name a brand.
- Confirm cryolipolysis is offered in Sikar as well as Jaipur.
- Confirm the four-applicator full-body option is described correctly (taken from the weight-loss page), and the review timing (the page says about three to four months).
- The FAQ quotes published averages (Cleveland Clinic: 15 to 28 percent; ASPS: about 20 percent). Confirm you are comfortable showing them.
- Choose the reviewing doctor (suggested: Dr. Neelam Choudhary or Dr. Youvraj Singh), then set status, reviewer and reviewed date.
- The hero photo is an illustrative stock-style image, not a Kezza patient or device.
- No prices are shown. Add them only if the clinic wants to publish prices.

**`/hifu-body-sculpting/`** — suggested reviewer: dr-neelam-choudhary or dr-youvraj-singh

- Confirm the HIFU device used for the body, the areas it is approved or cleared for, and that it is offered in Sikar as well as Jaipur.
- The weight-loss page describes HIFU body sculpting with 'zero downtime, instant visible results'. Published reviews describe results building over 8 to 12 weeks; please confirm or correct the weight-loss page.
- The FAQ quotes published averages (about 2 to 3 cm off the waist). Confirm you are comfortable showing them.
- Choose the reviewing doctor (suggested: Dr. Neelam Choudhary or Dr. Youvraj Singh), then set status, reviewer and reviewed date.
- The hero photo is an illustrative stock-style image, not a Kezza patient or device.
- No prices are shown. Add them only if the clinic wants to publish prices.

**`/weight-management/`** — suggested reviewer: dr-youvraj-singh

- Confirm what the programme actually includes at Kezza: who runs it (doctor, dietitian or both), which tests are offered, how often follow-ups happen and whether it is available in Sikar as well as Jaipur.
- Confirm the clinic's position on weight-loss medicines. The page only says a doctor may discuss them or refer; do not add named medicines unless the clinic prescribes them.
- Confirm you are comfortable quoting NHS guidance (0.5 to 1 kg a week; 5 to 10 percent improves health) and the India Obesity Commission 2025 definition.
- Suggested reviewer: Dr. Youvraj Singh (Consultant Physician & Internal Medicine). Then set status, reviewer and reviewed date.
- The hero photo is a real Kezza treatment room.
- No prices are shown. Add them only if the clinic wants to publish prices.

**`/microblading/`** — suggested reviewer: krishna (PMU artist); risks and 'check first' list also by dr-amrita-mukhija or dr-neelam-choudhary

- Confirm that powder (shaded) brows are offered as a style of their own, alongside microblading and hybrid brows.
- Confirm the 'wait or check first' list, including how long you ask people to wait after isotretinoin.
- Confirm eyebrow PMU is available in Sikar as well as Jaipur (the PMU artist is listed at both clinics).
- Confirm the healing advice matches the clinic's printed aftercare sheet, and when the patch test is done (the page says at a consultation before the treatment day).
- Suggested reviewers: Krishna Choudhary (PMU artist) for technique and aftercare, and a clinic doctor for the risks and 'check first' list. The strip will read 'Reviewed by', not 'Medically reviewed by'.
- The hero photo is an illustrative stock-style image, not a Kezza client.
- No prices are shown. Add them only if the clinic wants to publish prices.

**`/lip-blush/`** — suggested reviewer: krishna (PMU artist); cold sore and medical advice also by dr-amrita-mukhija or dr-neelam-choudhary

- Confirm how lip neutralization is done at Kezza and how many sessions it usually needs.
- Confirm the cold sore policy (for example, a doctor's antiviral prescription before treatment) and who prescribes it.
- Confirm that lip line definition is offered, that lip PMU is available in Sikar as well as Jaipur, and when the patch test is done (the page says at a consultation before the treatment day).
- Suggested reviewers: Krishna Choudhary (PMU artist) for technique and aftercare, and a clinic doctor for the cold sore and 'check first' advice. The strip will read 'Reviewed by'.
- The hero photo is an illustrative stock-style image, not a Kezza client.
- No prices are shown. Add them only if the clinic wants to publish prices.

**`/permanent-eyeliner/`** — suggested reviewer: krishna (PMU artist); eye-safety advice also by a clinic doctor

- Confirm the eyeliner styles offered (for example, whether lower lash line or winged liner is offered) and the numbing product used near the eyes.
- Confirm the advice on contact lenses, lash extensions and eye makeup after treatment, how the eye is protected during treatment (for example eye shields), and when the patch test is done (the page says at a consultation before the treatment day).
- Confirm permanent eyeliner is available in Sikar as well as Jaipur.
- Suggested reviewers: Krishna Choudhary (PMU artist) for technique and aftercare, and a clinic doctor for the eye-safety advice. The strip will read 'Reviewed by'.
- The hero and close-up photos are illustrative stock-style images, not a Kezza client.
- No prices are shown. Add them only if the clinic wants to publish prices.

**`/pmu-correction/`** — suggested reviewer: krishna (PMU artist); laser and medical advice also by a clinic doctor

- Confirm the correction methods used at Kezza: colour correction, reshaping, non-laser lightening, and whether laser removal is offered in-house or by referral (and by whom).
- Confirm the beauty spot service and the policy of not tattooing over an existing mole unless a doctor has checked it (the PMU page mentions enhancing natural beauty spots), and when the patch test is done.
- Confirm corrections are available in Sikar as well as Jaipur.
- Suggested reviewers: Krishna Choudhary (PMU artist) for technique, and a clinic doctor for the laser and medical advice. The strip will read 'Reviewed by'.
- The hero photo is an illustrative stock-style image, not a Kezza client.
- No prices are shown. Add them only if the clinic wants to publish prices.

**Found on existing pages (not changed; please decide):**

- **Third-party before/after photos on the weight-loss page.** `images/tummy-tightening-result.jpg` carries another practice's circular "GW" watermark and looks like a surgical tummy-tuck result, presented as a Kezza transformation. `images/abdominal-flank-sculpting-result.jpg` is a similar before/after composite. Remove both unless they are Kezza patients who gave consent; they are a copyright risk and could mislead patients.
- **Brand logos on stock photos.** `images/full-body-cryo.jpg` (and the identical `hero-body-sculpting.jpg`) shows a CoolSculpting® logo on the applicator; the weight-loss page uses it for "Full Body Cryo Slimming". Use it only if Kezza uses a genuine CoolSculpting system. The weight-loss page also uses `keeza-machine.jpg` (a hydra-facial machine) as the cryolipolysis card photo.
- **HydraFacial® naming.** The skin page calls the treatment "HydraFacial MD" with "patented Vortex-Fusion technology". Keep that wording only if the machine is a genuine HydraFacial system; the new page uses the generic name.
- **Claim wording on hand-built pages (48 phrases, full list in `docs/pseo/inventory-after.md`).** Examples: home "100% Safe & Sterile OTs", "Lifetime Support & Guarantee", "written satisfaction guarantee", "guaranteed inch loss tracking", reviews saying "Best clinic…"; skin "100% Painless", "Zero Pain Guarantee", "85%+ Texture Remodel", "FDA Allergan Brands", "6–9 Mo Lasting Results" (published sources give 3–4 months for Botox); PRP "zero pain, zero inflammation"; PMU "100% Safe & Sterile", "5000+ Happy Clients"; electrolysis and white-hair pages "permanent results", "zero risk"; weight-loss "Zero downtime, instant visible results" for HIFU (results take 8–12 weeks). One hit on the terms page is a false positive (it says no procedure offers guaranteed outcomes).
- **Unverified names and results.** "Dr. Ananya P., Consultant Dermatologist" (skin page) and Dr. S. Sharma / Dr. R. Verma (hair page) are not in the clinic's doctor list; the weight-loss "Verified Clinical Case" (−3.8″, 34% fat reduction) and PMU "Real Transformations" case studies need proof and consent, or should be removed.
- **Extra WhatsApp numbers** on the home, about and weight-loss pages differ from the main number (+91 92845 17427); confirm they are current.

## 16. Performance changes

- New pages use the existing one-file `content` CSS bundle (build-css now adds registry pages to it automatically), the existing deferred scripts and no new JavaScript.
- Every image is a JPEG + WebP pair with `width` and `height` (no layout shift). Hero images are preloaded with `fetchpriority="high"` and a `sizes` hint; everything below the hero is lazy-loaded. Hero WebP files are 23–74 KB, card thumbnails 6–17 KB.
- Pages were checked at desktop, tablet and phone widths: no horizontal overflow, mobile menu opens, FAQ accordions work, no script errors.
- The status-aware links are resolved at build time, so they add nothing to page weight or load time.

## 17. Accessibility changes

- One H1 per page and a logical H2/H3 order; FAQs use native `<details>/<summary>`, which work with keyboards and screen readers.
- Every image has descriptive alt text (checked by the gates); decorative icons are hidden from screen readers.
- Link text says where it goes ("Read the full microblading guide"); the Hindi page keeps `lang="hi-IN"` with the English header and footer marked `lang="en-IN"`.
- Recommendation: the brand link colour `--sp-primary-dark` (#008F9C) has about 3.9:1 contrast on white, below the 4.5:1 WCAG AA level for normal text. A slightly darker teal such as #007A85 (about 5.1:1) would pass. Not changed, to keep the existing design.

## 18. Files modified

- `tools/content/build_content_pages.py`: uses the registry and engine: status-aware robots, reviewer strip and schema only when published, taxonomy breadcrumbs, related cards, further reading, clinic lists from the registry, sitemap/llms.txt from the registry, gate report, link fallbacks, `reviewer_label` for PMU pages.
- `tools/content/pages/01–07`: `"status": "published"` added (the doctor-approved pages).
- `tools/content/make_treatment_images.py`: crops for the 12 new pages and two shared card thumbnails.
- `tools/content/locations.json`: Jaipur H1.
- `tools/seo/site-data.json`: treatment ids on clinic treatment lists (fallback URLs unchanged in what visitors see).
- `tools/og/make_og_images.py`: 12 share cards.
- `tools/build-css.js`: adds registry pages to the content bundle automatically.
- `package.json`: `npm test` runs the pSEO audit (strict); new `npm run seo:audit`.
- `README.md`: pSEO workflow, commands, directory map.
- 15 hand-built pages (`index`, `about`, `contact`, `branches`, `terms`, `face-scanner`, `hair-services`, `skin-services`, `weight-loss`, `permanent-makeup`, `prp-therapy`, `white-hair-removal`, `electrolysis`, `hair-wig`, `hair-loss-consultation`) and `hair-transplant/index.html`: `data-pseo` markers and `pseo:link` slots only; visible changes: home FUE/DHI card links (section 21).
- Generated pages (7 treatment pages, 3 clinic pages + hub, blog + 6 articles), `sitemap.xml`, `llms.txt`, `.htaccess`: rebuilt: markers in the shared menu, JSON-LD key order, Jaipur H1, Norwood article author box lists Hair Loss Consultation, GFC page gets a further-reading link, sitemap order, llms.txt grouped by category, trailing-slash rule lists the new folders.

## 19. Files created

- `tools/seo/taxonomy.json`: the registry.
- `tools/content/pseo.py`: the engine.
- `tools/seo/pseo_audit.py`: inventory and audit tool.
- `tools/content/pages/08–19`: content for the 12 new pages (status: review).
- `frontend/<12 page folders>/index.html`: the built review pages.
- `frontend/images/treatments/<12 folders>/`, `treatments/shared/anti-ageing-thumb.*`, `body-sculpting-thumb.*`: image crops (JPEG + WebP) made from photos already on the site.
- `frontend/images/og/<12>.jpg`: share cards.
- `docs/pseo/`: this report, `inventory-before.*`, `inventory-after.*`, `audit-*.json`, `quality-gates.md/.json`, and `inventory.*` / `audit.json` (latest run, rewritten by `npm test`).

## 20. URLs created

All 12 are built, reachable by direct link for review, `noindex, follow`, not in the sitemap and not linked from live pages.

| URL | Category | Status | Becomes indexable when |
| --- | --- | --- | --- |
| `https://www.kezza.co.in/acne-treatment/` | Skin | review (noindex) | status, reviewer and date are set and gates pass |
| `https://www.kezza.co.in/acne-scar-treatment/` | Skin | review (noindex) | status, reviewer and date are set and gates pass |
| `https://www.kezza.co.in/hydra-facial/` | Skin | review (noindex) | status, reviewer and date are set and gates pass |
| `https://www.kezza.co.in/botox/` | Skin | review (noindex) | status, reviewer and date are set and gates pass |
| `https://www.kezza.co.in/dark-circles-treatment/` | Skin | review (noindex) | status, reviewer and date are set and gates pass |
| `https://www.kezza.co.in/cryolipolysis/` | Weight Loss | review (noindex) | status, reviewer and date are set and gates pass |
| `https://www.kezza.co.in/hifu-body-sculpting/` | Weight Loss | review (noindex) | status, reviewer and date are set and gates pass |
| `https://www.kezza.co.in/weight-management/` | Weight Loss | review (noindex) | status, reviewer and date are set and gates pass |
| `https://www.kezza.co.in/microblading/` | Permanent Makeup | review (noindex) | status, reviewer and date are set and gates pass |
| `https://www.kezza.co.in/lip-blush/` | Permanent Makeup | review (noindex) | status, reviewer and date are set and gates pass |
| `https://www.kezza.co.in/permanent-eyeliner/` | Permanent Makeup | review (noindex) | status, reviewer and date are set and gates pass |
| `https://www.kezza.co.in/pmu-correction/` | Permanent Makeup | review (noindex) | status, reviewer and date are set and gates pass |

## 21. URLs changed

No existing URL was renamed or moved. Link targets that changed on live pages:

- Home page: the *Sapphire FUE* card now opens `/hair-transplant/fue/` and the *DHI* card `/hair-transplant/dhi/` (both previously `/hair-transplant/`).
- `/locations/jaipur/`: H1 text changed (URL unchanged).
- Everything else points where it did before until a review page is published.

## 22. Redirects created

One existing rule was extended, no new redirects: the `.htaccess` trailing-slash rule (301 from `/folder` to `/folder/`) is now generated from the page folders and includes the 12 new folders. Nothing was merged or removed, so no page-to-page redirects were needed.

## 23. Remaining recommendations

- **Review and approve the 12 pages** (section 15). Publish them one at a time if that is easier; links are safe either way. Then resubmit the sitemap in Google Search Console and request indexing for each approved URL.
- **Fix the existing-page issues in section 15**, starting with the watermarked before/after photos, the branded stock photos and the claim wording.
- **Replace stock photos with real ones** where possible: Kezza's rooms, devices and (with written consent) patients. The new pages use stock-style images that show procedures, never results.
- **Search Console:** after publishing, watch Pages › Indexing and the Performance report filtered by each new URL for 4–8 weeks; a page with impressions but few clicks usually needs a better title or description, not more pages.
- **Supporting articles** (add to the registry's `articles` so they link automatically): acne scar types explained; cryolipolysis vs HIFU; microblading vs powder brows; what causes dark circles in Indian skin; how long Botox lasts.
- **Backlinks:** each new page is a natural target for local citations and partners (for example the clinic's Google Business Profile services list, Practo/Justdial profiles, local press about the clinic). Link to the page that matches the service, not only the home page.
- **Next candidates for pages** (same gates, after this round is approved): pigmentation and melasma, dermal fillers, stretch marks, female hair loss.
- **Differentiate white-hair removal and electrolysis**, and give `branches.html` a contextual link (for example from the about page).
- **Accessibility:** consider the darker link colour in section 17; add visible breadcrumbs to the hand-built hub pages when they are next redesigned.
- **Keep `npm test` in the deploy routine:** it now fails if a page is duplicated, loses its canonical, links to an unpublished page or drifts from the sitemap.

SEO results depend on many things outside the website (competition, reviews, backlinks, Google's own changes). This system makes the site easier to crawl, clearer about what each page is for and safer to grow; it does not guarantee rankings.
