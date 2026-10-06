# Skin services cluster — report (6 October 2026)

Built on the project uploaded on 3 October ("kezza_clinic-main 2.zip"), with the semaglutide guide work merged in.
`npm test`: 66 pages, 0 errors, 0 warnings, 0 critical audit issues.

All skin service pages are built but **in review** (`noindex`, not in the sitemap or `llms.txt`, and live pages do not link to
them yet). Each one goes live when a doctor approves it: set `"status": "published"`, `"reviewer"` and `"reviewed"` in its file
in `tools/content/pages/`, run `npm run build && npm test`, upload, then request indexing in Google Search Console. A test run
with all nine published passed every check (56 indexable pages, 0 critical issues), and menus, hub links, sitemap and `llms.txt`
switched over automatically.

## Decisions you should know about

- **URLs follow the site's existing pattern** (`/acne-treatment/`, folder URLs), not `/hydrafacial-md.html`. Pages that already
  existed in review kept their URLs; none of them was ever indexed.
- **Hydra facial, not "HydraFacial MD".** The clinic uses a general hydra facial machine, so using the brand name would be
  misleading and a trademark risk. The brand is mentioned once, in an FAQ that explains the difference. The skin page, home page,
  clinic pages and the hydra facial blog article were corrected to match.
- **Acne and acne scars stay as two pages.** People search for them separately and the treatments differ. They link to each other.
- **No "dermatologist in Jaipur" target yet.** No doctor with a dermatology degree (MD, DNB or DVD) is listed or confirmed, so the
  Medical Dermatology page targets mole, wart and skin tag removal and never calls Kezza staff dermatologists. When a dermatologist
  is confirmed, add them and this target can be added.
- **Botox & dermal fillers share one page** (`/botox/`), as asked. A separate fillers page can follow if filler searches justify it.
- **All three clinics**: the clinic confirmed on 3 October that skin treatments are offered in Jaipur, Sikar and Ajmer, so every
  skin page lists all three with address, hours, phone and directions.
- **No prices, ratings, testimonials or before/after photos** were added. Keyword volumes were not available (no keyword tool or
  Search Console is connected), so the keyword map is based on search-result and question research.

## Pages

| # | URL | Primary keyword | Secondary keywords | Intent | Title | H1 |
|---|---|---|---|---|---|---|
| 1 | `/hydra-facial/` (updated) | hydra facial in jaipur | hydra facial treatment jaipur; medical facial jaipur; hydradermabrasion; facial for oily skin and blackheads; facial before wedding | Commercial / transactional + local | Hydra Facial in Jaipur \| Kezza Clinic | Hydra Facial in Jaipur \| Cleanse, Exfoliate & Hydrate |
| 2a | `/acne-treatment/` (updated) | acne treatment in jaipur | pimple treatment jaipur; hormonal acne treatment; chemical peel for acne; acne marks treatment | Informational + commercial + local | Acne Treatment in Jaipur \| Kezza Clinic | Acne Treatment in Jaipur \| Doctor-Led Care for Pimples |
| 2b | `/acne-scar-treatment/` (updated) | acne scar treatment in jaipur | pimple marks removal; subcision; MNRF for acne scars; fractional CO2 laser for scars | Commercial + local | Acne Scar Treatment in Jaipur \| Kezza Clinic | Acne Scar Treatment in Jaipur \| Subcision, MNRF & Laser |
| 3 | `/pigmentation-treatment/` (new) | pigmentation treatment in jaipur | melasma treatment jaipur; laser toning jaipur; chemical peel for pigmentation; dark spots treatment; hyperpigmentation treatment | Informational + commercial + local | Pigmentation & Melasma Treatment in Jaipur \| Kezza Clinic | Pigmentation & Melasma Treatment in Jaipur \| Fading Dark Patches Safely |
| 4 | `/botox/` (rewritten: Botox & fillers) | botox and fillers in jaipur | botox treatment jaipur; dermal fillers jaipur; lip fillers jaipur; under eye filler; anti-wrinkle injections jaipur | Commercial + local | Botox & Dermal Fillers in Jaipur \| Kezza Clinic | Botox & Dermal Fillers in Jaipur \| Anti-Wrinkle Injections & Volume |
| 5 | `/stretch-marks-treatment/` (new) | stretch marks treatment in jaipur | stretch mark removal jaipur; laser for stretch marks; MNRF for stretch marks; pregnancy stretch marks; white stretch marks | Informational + commercial + local | Stretch Marks Treatment in Jaipur \| Kezza Clinic | Stretch Marks Treatment in Jaipur \| Laser, MNRF & Microneedling |
| 6 | `/medical-dermatology/` (new) | mole, wart and skin tag removal in jaipur | skin tag removal jaipur; wart removal jaipur; mole removal jaipur; medical dermatology jaipur; skin problem treatment | Commercial + local | Mole, Wart & Skin Tag Removal in Jaipur \| Kezza Clinic | Medical Dermatology in Jaipur \| Skin Tags, Warts, Moles & Skin Problems |
| 7 | `/skin-consultation/` (new) | skin consultation in jaipur | skin specialist consultation; skin check jaipur; skin analysis jaipur; personalised skin treatment plan | Commercial / transactional + local | Skin Consultation in Jaipur \| Kezza Hair & Skin Clinic | Skin Consultation in Jaipur \| A Doctor's Assessment & Plan |

Meta descriptions (all 139–160 characters, all unique) are in each page file and in `docs/pseo/inventory.csv`.
`/dark-circles-treatment/` was also updated (all three clinics).

## 1. Internal linking map

- Every skin page → Skin Services hub (breadcrumb), the Skin Consultation page (mid-page call to action), its three related pages
  (cards), the clinic pages, and the contact numbers.
- Skin Consultation → all seven skin service pages (concern cards) and the AI skin scanner and hair loss consultation.
- Acne ↔ Acne scars ↔ Pigmentation; Botox ↔ Dark circles; Hydra facial → Acne, Pigmentation; Stretch marks → Acne scars.
- Blog → service pages: acne scar guide → `/acne-scar-treatment/`; hydra facial guide → `/hydra-facial/`; chemical peels guide →
  `/pigmentation-treatment/` (added automatically when each page is published).
- Skin Services hub → every child page through status-aware links (shown only once each page is published).
- Main menu "Skin" list on all 60 pages: Hydra Facial, Acne & Acne Scars, Pigmentation & Melasma, Botox & Fillers, Dark Circle
  Treatment, Stretch Marks, Medical Dermatology, Laser Hair Removal, Skin Consultation. Until a page is published, its menu link
  points to the matching section of the skin page.

## 2. Keyword map

One primary keyword per page (table above). Kept apart on purpose: "skin specialist in jaipur" stays with the Skin Services hub,
"chemical peels for pigmentation" with the blog guide, "acne scar treatment options" with the blog guide, "hydra facial benefits"
with the blog guide. Not targeted: "dermatologist in jaipur" (no confirmed dermatologist), "skin whitening / fairness" (ASCI
guidance and Indian drug rules), "HydraFacial MD" (not the machine used).

## 3. Schema

Each page: Organization/MedicalClinic, WebSite, MedicalWebPage (or WebPage for the consultation), BreadcrumbList, the treatment
(MedicalTherapy, MedicalProcedure or Service) and FAQPage matching the visible FAQs. `reviewedBy` and the reviewer's Person node
are added only when a page is published with a reviewer and date. No ratings or review schema.

## 4. Sitemap

No change while pages are in review. Each page is added automatically when published (with its share image).

## 5. Canonical URLs

Self-referencing canonicals on every page, e.g. `https://www.kezza.co.in/pigmentation-treatment/`. Trailing-slash redirects for
the new folders were added to `.htaccess` by the build.

## 6. FAQ topics

Hydra facial: brand vs generic, frequency, comfort, acne, wedding timing, aftercare, session length, downtime.
Acne: how long, going away alone, isotretinoin, peels, makeup, adult acne, marks fading, when to see a doctor.
Acne scars: complete removal, sessions, pain, Indian skin, downtime, acne first, marks vs scars, how long results last.
Pigmentation: melasma cure, how long, pregnancy, sunscreen, laser toning, glutathione, acne marks, chemist creams.
Botox & fillers: duration, onset, frozen look, side effects, lip filler duration, dissolving filler, blindness risk, Botox or filler, aftercare.
Stretch marks: complete removal, white marks, sessions, laser on Indian skin, breastfeeding, natural fading, oils, health signs.
Medical dermatology: skin tag recurrence, home removal, warts going away, dangerous moles, scarring, pain, ringworm, healing time.
Skin consultation: appointments, what to bring, same-day treatment, AI scanners, skin type, sunscreen, tests, hair questions.

## 7. Local SEO

Jaipur in titles and H1s; Jaipur, Sikar and Ajmer in leads, chips, the clinic section (address, hours, phone, directions from
`site-data.json`, so the name, address and phone match everywhere) and calls to action. Each clinic page now lists "Skin
consultation". No city-duplicate pages.

## 8. AEO / GEO

Each page opens its first section with a 40–60 word direct answer, uses question-style headings and FAQs, includes tables where
useful (pigmentation types, treatment comparison), states who / what / where / how / when clearly, and cites 8–15 authoritative
sources (AAD, NHS, DermNet, FDA, IADVL and Indian journals).

## 9. Performance

Pages reuse the existing CSS bundle and template (no new CSS file, no new JavaScript). New images are cropped to size, with WebP
versions, width and height, lazy loading below the fold and a preloaded hero. No horizontal scrolling on phones (checked at 390 px).

## 10. Technical and content issues found (please decide)

On live pages, not changed except where noted:

- **Locations page** (added by another tool before 3 Oct): ratings and review counts ("4.9 / 5.0 · 2,500+ Verified Patient
  Reviews", "4.9 (1,200+)", etc.), "licensed dermatologists across all three centers", "US-FDA Approved Lasers", "HEPA laminar
  airflow" OTs, "Specialists on Duty", and a service table showing permanent makeup in Ajmer daily and hair transplant OTs in
  Sikar. These are not verified and some conflict with the clinic's own staff list (the PMU artist works in Jaipur and Sikar).
  Fake or unverifiable ratings can lead to Google penalties. Please confirm with real figures or remove.
- **Skin Services page**: a quote from "Dr. Ananya P., Consultant Dermatologist" (not on the About page), "senior dermatologists
  in sterile hospital operating conditions", "biologic monitoring", "70%+ Visible Fading" for stretch marks, "FDA Allergan
  Brands", "6–9 Mo Lasting Results" for Botox, "Zero Downtime", intravenous glutathione described as switching melanin "toward
  lighter pheomelanin", and patient testimonials marked "Verified Patient". The HydraFacial MD wording was corrected; the rest
  needs the clinic's decision.
- **Blog**: the "Doctor reviewed" labels and reviewer names were shown on articles that have no review date; they now appear only
  after a real review. The hydra facial article was rewritten for a general machine, and its before/after photo (origin and
  consent not confirmed) was replaced with the standard cover image. The Kamlesh Nagarkoti PRP story should have documented
  patient consent on file.
- The uploaded copy had been built without the CSS step; the full build restores the CSS bundles.

## 11. Pages that may compete for the same searches

| Pair | Status |
|---|---|
| `/hydra-facial/` vs `/blog/hydrafacial-benefits-process/` | Different intent (book vs learn). The blog article links to the page. |
| `/acne-scar-treatment/` vs `/blog/acne-scars-treatment-options/` | Different intent; cross-linked. |
| `/pigmentation-treatment/` vs `/blog/chemical-peels-vs-laser-toning/` | Page targets "pigmentation treatment in jaipur"; blog targets "chemical peels for pigmentation". |
| `/skin-consultation/` vs `/skin-services.html` | Consultation targets booking a visit; the hub targets "skin specialist in jaipur" and lists treatments. |
| `/skin-consultation/` vs `/face-scanner.html` | The scanner is a free tool; the consultation page says it is not a diagnosis and links to it. |

## 12. Recommended next content

Glutathione (only after medical and legal review), chemical peels page, laser toning, under-eye filler guide, melasma in
pregnancy guide, "acne marks vs acne scars" guide, skin tag removal guide, a dermatologist profile once confirmed, and a Hindi
version of the pigmentation and acne pages.

## Before publishing, each page asks the clinic to confirm

Treatments and devices offered at each clinic, which doctors provide them in Sikar and Ajmer, product brands for Botox and fillers
(and CDSCO approval), how unusual moles are handled (excision and lab testing, or referral), and the reviewing doctor. The full
list is in `docs/pseo/quality-gates.md`.
