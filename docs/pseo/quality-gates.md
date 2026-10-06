# Quality gates for generated treatment pages

Written by `tools/content/build_content_pages.py` on every build. A page is indexable only when its status is `published`, a reviewer and review date are recorded, and no critical check fails. Status and reviewer are set in the page's file in `tools/content/pages/`.

| Page | Status in file | Effective | Robots | Critical | Warnings | For the reviewer |
| --- | --- | --- | --- | --- | --- | --- |
| `/hair-transplant/fue/` | published | **published** | indexable | 0 | 0 | 0 |
| `/hair-transplant/dhi/` | published | **published** | indexable | 0 | 0 | 0 |
| `/hair-transplant/beard/` | published | **published** | indexable | 0 | 0 | 0 |
| `/hair-transplant/eyebrow/` | published | **published** | indexable | 0 | 0 | 0 |
| `/gfc-treatment/` | published | **published** | indexable | 0 | 0 | 0 |
| `/laser-hair-removal/` | published | **published** | indexable | 0 | 0 | 0 |
| `/hi/hair-transplant/` | published | **published** | indexable | 0 | 0 | 0 |
| `/acne-treatment/` | review | **review** | noindex | 0 | 1 | 7 |
| `/acne-scar-treatment/` | review | **review** | noindex | 0 | 1 | 7 |
| `/hydra-facial/` | review | **review** | noindex | 0 | 1 | 6 |
| `/botox/` | review | **review** | noindex | 0 | 1 | 9 |
| `/dark-circles-treatment/` | review | **review** | noindex | 0 | 1 | 8 |
| `/cryolipolysis/` | review | **review** | noindex | 0 | 1 | 7 |
| `/hifu-body-sculpting/` | review | **review** | noindex | 0 | 1 | 6 |
| `/weight-management/` | review | **review** | noindex | 0 | 1 | 6 |
| `/microblading/` | review | **review** | noindex | 0 | 1 | 7 |
| `/lip-blush/` | review | **review** | noindex | 0 | 1 | 6 |
| `/permanent-eyeliner/` | review | **review** | noindex | 0 | 1 | 6 |
| `/pmu-correction/` | review | **review** | noindex | 0 | 1 | 6 |
| `/pigmentation-treatment/` | review | **review** | noindex | 0 | 1 | 7 |
| `/stretch-marks-treatment/` | review | **review** | noindex | 0 | 0 | 7 |
| `/medical-dermatology/` | review | **review** | noindex | 0 | 0 | 8 |
| `/skin-consultation/` | review | **review** | noindex | 0 | 1 | 5 |

## /hair-transplant/fue/ — published

- All checks passed.

## /hair-transplant/dhi/ — published

- All checks passed.

## /hair-transplant/beard/ — published

- All checks passed.

## /hair-transplant/eyebrow/ — published

- All checks passed.

## /gfc-treatment/ — published

- All checks passed.

## /laser-hair-removal/ — published

- All checks passed.

## /hi/hair-transplant/ — published

- All checks passed.

## /acne-treatment/ — review

- Warning: links to pages that are not published yet: /acne-scar-treatment/, /pigmentation-treatment/
- To confirm before approval: Confirm the treatments offered: which medical peels, extraction, cyst injections and whether isotretinoin is prescribed at Kezza.
- To confirm before approval: The clinic said on 3 Oct 2026 that skin treatments are available at all three clinics. Confirm which doctors treat acne in Sikar and Ajmer.
- To confirm before approval: Confirm the review timing (the page says 6 to 8 weeks) matches clinic practice.
- To confirm before approval: Choose the reviewing doctor (suggested: Dr. Amrita Mukhija or Dr. Neelam Choudhary), then set status, reviewer and reviewed date.
- To confirm before approval: The hero photo is an illustrative stock-style image, not a Kezza patient.
- To confirm before approval: No prices are shown. Add them only if the clinic wants to publish prices.
- To confirm before approval: The explainer photo is an illustrative image, not a Kezza patient.

## /acne-scar-treatment/ — review

- Warning: links to pages that are not published yet: /pigmentation-treatment/
- To confirm before approval: Confirm which scar treatments each clinic offers (subcision, MNRF, fractional CO2 laser, chemical peels) and whether device names should be shown.
- To confirm before approval: The clinic said on 3 Oct 2026 that skin treatments are available at all three clinics. Confirm which scar treatments each clinic offers and which doctors provide them.
- To confirm before approval: Confirm the usual session spacing and course length (the page says several sessions, a few weeks apart).
- To confirm before approval: Confirm the advice on raised scars (steroid injections, silicone, laser) and on deep ice pick scars (focused chemical application such as TCA CROSS, or punch techniques) matches what the clinic offers.
- To confirm before approval: Choose the reviewing doctor (suggested: Dr. Amrita Mukhija or Dr. Neelam Choudhary), then set status, reviewer and reviewed date.
- To confirm before approval: The hero photo is an illustrative stock-style image, not a Kezza patient. The explainer photo is a real Kezza treatment room.
- To confirm before approval: No prices are shown. Add them only if the clinic wants to publish prices.

## /hydra-facial/ — review

- Warning: links to pages that are not published yet: /acne-scar-treatment/, /acne-treatment/, /pigmentation-treatment/
- To confirm before approval: Confirm the steps, solutions and any add-ons offered, and who performs the facial.
- To confirm before approval: Choose the reviewing doctor (suggested: Dr. Amrita Mukhija or Dr. Neelam Choudhary), then set status, reviewer and reviewed date.
- To confirm before approval: The hero photo is an illustrative stock-style image. The explainer photo shows the real machine at Kezza.
- To confirm before approval: No prices are shown. Add them only if the clinic wants to publish prices.
- To confirm before approval: The clinic confirmed on 3 Oct 2026 that it uses a general hydra facial machine, not the branded HydraFacial system, and that skin treatments are available at all three clinics. The page and the hub now say 'hydra facial'; the brand is mentioned once, in the FAQ that explains the difference.
- To confirm before approval: Confirm hygiene practice (single-use tips where needed) and who gives the facials at each clinic.

## /botox/ — review

- Warning: links to pages that are not published yet: /dark-circles-treatment/, /pigmentation-treatment/
- To confirm before approval: The page now covers Botox and dermal fillers, as the clinic asked for one injectables page; the URL stays /botox/.
- To confirm before approval: Confirm the brand(s) of botulinum toxin and hyaluronic acid filler used, and that each product is approved by CDSCO. Botox is a trademark of Allergan (AbbVie); if another brand is used, use the generic name 'botulinum toxin' in the title and text.
- To confirm before approval: Confirm the filler areas offered (lips, cheeks, under-eyes, smile lines, jawline) and the clinic's policy for under-eye filler and for high-risk areas such as the nose and forehead.
- To confirm before approval: The clinic said on 3 Oct 2026 that fillers are offered and that skin treatments are available at all three clinics. Confirm which doctors give injections at each clinic (the Ajmer doctors are listed as oral and maxillofacial, aesthetic and hair transplant surgeons) and that hyaluronidase is kept on site for emergencies.
- To confirm before approval: The skin page shows 'FDA Allergan Brands', 'US FDA-Approved Neuromodulators', '6–9 Mo Lasting Results' and 'Zero Downtime'. Published sources give about 3 to 4 months for Botox (Mayo Clinic); please confirm or correct the skin page.
- To confirm before approval: Botulinum toxin's schedule under Indian drug rules could not be verified, so the page only calls it a prescription medicine.
- To confirm before approval: Choose the reviewing doctor (suggested: Dr. Nakul Somani or Dr. Amrita Mukhija), then set status, reviewer and reviewed date.
- To confirm before approval: The hero and filler photos are illustrative stock-style images, not Kezza patients.
- To confirm before approval: No prices are shown. Add them only if the clinic wants to publish prices.

## /dark-circles-treatment/ — review

- Warning: links to pages that are not published yet: /botox/
- To confirm before approval: Confirm the methods offered for dark circles at Kezza: prescription creams, chemical peels, laser toning, tear-trough filler and whether PRP is used.
- To confirm before approval: Confirm the filler products used under the eyes and which doctors inject them.
- To confirm before approval: The clinic said on 3 Oct 2026 that skin treatments are available at all three clinics. Confirm which doctors treat dark circles, and give under-eye fillers, in Sikar and Ajmer.
- To confirm before approval: Choose the reviewing doctor (suggested: Dr. Amrita Mukhija or Dr. Nakul Somani), then set status, reviewer and reviewed date.
- To confirm before approval: The hero photo is an illustrative stock-style image, not a Kezza patient.
- To confirm before approval: No prices are shown. Add them only if the clinic wants to publish prices.
- To confirm before approval: The explainer photo is an illustrative image, not a Kezza patient.
- To confirm before approval: 6 Oct 2026: page brought to the same layout as the other skin pages (short answer, mid-page booking box, clinic cards, 'Why patients choose Kezza' and three more FAQs). Please check the new FAQ answers on sessions, pain and who to see.

## /cryolipolysis/ — review

- Warning: links to pages that are not published yet: /weight-management/
- To confirm before approval: Confirm the cryolipolysis device used at each clinic, the areas it can treat and whether it is cleared or approved by a regulator; the page does not name a brand.
- To confirm before approval: Confirm cryolipolysis is offered in Sikar as well as Jaipur.
- To confirm before approval: Confirm the four-applicator full-body option is described correctly (taken from the weight-loss page), and the review timing (the page says about three to four months).
- To confirm before approval: The FAQ quotes published averages (Cleveland Clinic: 15 to 28 percent; ASPS: about 20 percent). Confirm you are comfortable showing them.
- To confirm before approval: Choose the reviewing doctor (suggested: Dr. Neelam Choudhary or Dr. Youvraj Singh), then set status, reviewer and reviewed date.
- To confirm before approval: The hero photo is an illustrative stock-style image, not a Kezza patient or device.
- To confirm before approval: No prices are shown. Add them only if the clinic wants to publish prices.

## /hifu-body-sculpting/ — review

- Warning: links to pages that are not published yet: /cryolipolysis/, /weight-management/
- To confirm before approval: Confirm the HIFU device used for the body, the areas it is approved or cleared for, and that it is offered in Sikar as well as Jaipur.
- To confirm before approval: The weight-loss page describes HIFU body sculpting with 'zero downtime, instant visible results'. Published reviews describe results building over 8 to 12 weeks; please confirm or correct the weight-loss page.
- To confirm before approval: The FAQ quotes published averages (about 2 to 3 cm off the waist). Confirm you are comfortable showing them.
- To confirm before approval: Choose the reviewing doctor (suggested: Dr. Neelam Choudhary or Dr. Youvraj Singh), then set status, reviewer and reviewed date.
- To confirm before approval: The hero photo is an illustrative stock-style image, not a Kezza patient or device.
- To confirm before approval: No prices are shown. Add them only if the clinic wants to publish prices.

## /weight-management/ — review

- Warning: links to pages that are not published yet: /cryolipolysis/, /hifu-body-sculpting/
- To confirm before approval: Confirm what the programme actually includes at Kezza: who runs it (doctor, dietitian or both), which tests are offered, how often follow-ups happen and whether it is available in Sikar as well as Jaipur.
- To confirm before approval: The clinic confirmed on 2 Oct 2026 that its doctors prescribe weight-loss injections after a consultation. The Indian government said in March 2026 that these medicines are approved on condition of a prescription by endocrinologists or internal medicine specialists (cardiologists for some uses), so the FAQ says they are prescribed only by Kezza's internal medicine specialist at the Jaipur clinic (Dr. Youvraj Singh is the only one listed). Confirm this and how Sikar patients are handled; no medicine is named. Obesity is listed in the Schedule of India's Drugs and Magic Remedies (Objectionable Advertisements) Act, 1954, so keep this page about the consultation rather than a medicine, and have the wording checked before publishing. The blog guide on semaglutide is linked here automatically once it is published.
- To confirm before approval: Confirm you are comfortable quoting NHS guidance (0.5 to 1 kg a week; 5 to 10 percent improves health) and the India Obesity Commission 2025 definition.
- To confirm before approval: Suggested reviewer: Dr. Youvraj Singh (Consultant Physician & Internal Medicine). Then set status, reviewer and reviewed date.
- To confirm before approval: The hero photo is a real Kezza treatment room.
- To confirm before approval: No prices are shown. Add them only if the clinic wants to publish prices.

## /microblading/ — review

- Warning: links to pages that are not published yet: /pmu-correction/
- To confirm before approval: Confirm that powder (shaded) brows are offered as a style of their own, alongside microblading and hybrid brows.
- To confirm before approval: Confirm the 'wait or check first' list, including how long you ask people to wait after isotretinoin.
- To confirm before approval: Confirm eyebrow PMU is available in Sikar as well as Jaipur (the PMU artist is listed at both clinics).
- To confirm before approval: Confirm the healing advice matches the clinic's printed aftercare sheet, and when the patch test is done (the page says at a consultation before the treatment day).
- To confirm before approval: Suggested reviewers: Krishna Choudhary (PMU artist) for technique and aftercare, and a clinic doctor for the risks and 'check first' list. The strip will read 'Reviewed by', not 'Medically reviewed by'.
- To confirm before approval: The hero photo is an illustrative stock-style image, not a Kezza client.
- To confirm before approval: No prices are shown. Add them only if the clinic wants to publish prices.

## /lip-blush/ — review

- Warning: links to pages that are not published yet: /microblading/, /pmu-correction/
- To confirm before approval: Confirm how lip neutralization is done at Kezza and how many sessions it usually needs.
- To confirm before approval: Confirm the cold sore policy (for example, a doctor's antiviral prescription before treatment) and who prescribes it.
- To confirm before approval: Confirm that lip line definition is offered, that lip PMU is available in Sikar as well as Jaipur, and when the patch test is done (the page says at a consultation before the treatment day).
- To confirm before approval: Suggested reviewers: Krishna Choudhary (PMU artist) for technique and aftercare, and a clinic doctor for the cold sore and 'check first' advice. The strip will read 'Reviewed by'.
- To confirm before approval: The hero photo is an illustrative stock-style image, not a Kezza client.
- To confirm before approval: No prices are shown. Add them only if the clinic wants to publish prices.

## /permanent-eyeliner/ — review

- Warning: links to pages that are not published yet: /pmu-correction/
- To confirm before approval: Confirm the eyeliner styles offered (for example, whether lower lash line or winged liner is offered) and the numbing product used near the eyes.
- To confirm before approval: Confirm the advice on contact lenses, lash extensions and eye makeup after treatment, how the eye is protected during treatment (for example eye shields), and when the patch test is done (the page says at a consultation before the treatment day).
- To confirm before approval: Confirm permanent eyeliner is available in Sikar as well as Jaipur.
- To confirm before approval: Suggested reviewers: Krishna Choudhary (PMU artist) for technique and aftercare, and a clinic doctor for the eye-safety advice. The strip will read 'Reviewed by'.
- To confirm before approval: The hero and close-up photos are illustrative stock-style images, not a Kezza client.
- To confirm before approval: No prices are shown. Add them only if the clinic wants to publish prices.

## /pmu-correction/ — review

- Warning: links to pages that are not published yet: /lip-blush/, /microblading/, /permanent-eyeliner/
- To confirm before approval: Confirm the correction methods used at Kezza: colour correction, reshaping, non-laser lightening, and whether laser removal is offered in-house or by referral (and by whom).
- To confirm before approval: Confirm the beauty spot service and the policy of not tattooing over an existing mole unless a doctor has checked it (the PMU page mentions enhancing natural beauty spots), and when the patch test is done.
- To confirm before approval: Confirm corrections are available in Sikar as well as Jaipur.
- To confirm before approval: Suggested reviewers: Krishna Choudhary (PMU artist) for technique, and a clinic doctor for the laser and medical advice. The strip will read 'Reviewed by'.
- To confirm before approval: The hero photo is an illustrative stock-style image, not a Kezza client.
- To confirm before approval: No prices are shown. Add them only if the clinic wants to publish prices.

## /pigmentation-treatment/ — review

- Warning: links to pages that are not published yet: /acne-scar-treatment/
- To confirm before approval: Confirm the treatments offered at each clinic: which chemical peels (glycolic, salicylic, lactic, mandelic), whether laser toning (Q-switched Nd:YAG) is available in Jaipur, Sikar and Ajmer, and which prescription creams are used. Confirm whether tranexamic acid tablets are prescribed, and by which doctor.
- To confirm before approval: The clinic said on 3 Oct 2026 that skin treatments are available at all three clinics. Confirm which doctors provide pigmentation care in Sikar and Ajmer.
- To confirm before approval: The skin page promotes intravenous glutathione that 'switches melanin synthesis toward lighter pheomelanin'. Published Indian guidance (IJDVL 2016) found no efficacy data for IV glutathione and reported serious harms, the US FDA (2015) has approved no injectable skin-lightening drug, and a CDSCO notice (May 2026) says injectables are not cosmetics. Please review that section; this page mentions glutathione only in an FAQ.
- To confirm before approval: The page avoids fairness or whitening wording, in line with the ASCI guideline on skin colour in advertising.
- To confirm before approval: Choose the reviewing doctor (suggested: Dr. Amrita Mukhija or Dr. Neelam Choudhary), then set status, reviewer and reviewed date.
- To confirm before approval: The hero and explainer photos are illustrative stock-style images, not Kezza patients.
- To confirm before approval: No prices are shown. Add them only if the clinic wants to publish prices.

## /stretch-marks-treatment/ — review

- To confirm before approval: Confirm which stretch mark treatments are offered at each clinic (fractional CO2 laser, microneedling radiofrequency, microneedling, PRP, peels) and the devices used. The clinic said on 3 Oct 2026 that stretch mark treatment is offered and that skin treatments are available at all three clinics.
- To confirm before approval: The skin page shows '70%+ Visible Fading'. No reliable source supports a fixed percentage (an Indian review in 2019 found variable success for every method); please remove or source it.
- To confirm before approval: Confirm the usual spacing between sessions (the page says three to six weeks) and whether PRP is injected or applied.
- To confirm before approval: Choose the reviewing doctor (suggested: Dr. Amrita Mukhija or Dr. Neelam Choudhary), then set status, reviewer and reviewed date.
- To confirm before approval: The hero photo is an illustrative stock-style image, not a Kezza patient.
- To confirm before approval: No prices are shown. Add them only if the clinic wants to publish prices.
- To confirm before approval: The explainer photo is an illustrative image, not a Kezza patient.

## /medical-dermatology/ — review

- To confirm before approval: The clinic could not yet confirm a doctor with a dermatology qualification (MD, DNB or DVD). This page does not use the word 'dermatologist' for Kezza staff and targets mole, wart and skin tag removal. If a qualified dermatologist is confirmed, add their name and qualification and the page can also target 'dermatologist in Jaipur'.
- To confirm before approval: The skin page says treatments are 'performed by senior dermatologists in sterile hospital operating conditions', mentions 'biologic monitoring' for psoriasis, and quotes 'Dr. Ananya P., Consultant Dermatologist', who is not listed on the About page. Please confirm or correct these.
- To confirm before approval: Confirm how unusual moles are handled: surgical excision with histopathology at Kezza, or referral (and to whom). The page says they are removed surgically for laboratory testing.
- To confirm before approval: Confirm which doctors perform radiofrequency removals at each clinic, and which skin conditions (eczema, psoriasis, fungal infections) are treated at Kezza. The clinic said on 3 Oct 2026 that mole, wart and skin tag removal is offered and that skin treatments are available at all three clinics.
- To confirm before approval: Choose the reviewing doctor (suggested: Dr. Amrita Mukhija or Dr. Neelam Choudhary), then set status, reviewer and reviewed date.
- To confirm before approval: The hero photo is an illustrative image (the same photo is used on the electrolysis page), not a Kezza patient.
- To confirm before approval: No prices are shown. Add them only if the clinic wants to publish prices.
- To confirm before approval: The explainer photo is an illustrative image, not a Kezza patient.

## /skin-consultation/ — review

- Warning: links to pages that are not published yet: /acne-scar-treatment/, /acne-treatment/, /botox/, /hydra-facial/, /medical-dermatology/, /pigmentation-treatment/, /stretch-marks-treatment/
- To confirm before approval: Confirm the consultation process at each clinic: who sees skin patients in Jaipur, Sikar and Ajmer, whether every consultation is with a doctor, and whether walk-ins are accepted. The page says booking ahead is best.
- To confirm before approval: Confirm the tests available (skin scrapings for fungus, patch tests, blood tests) and whether magnification or dermoscopy is used. The page says tests are suggested only when needed.
- To confirm before approval: Confirm that the plan, number of sessions and costs are explained before treatment (the page says so), and how the consultation fee is communicated. No fee is shown.
- To confirm before approval: The hero photo is the real Kezza reception (please confirm which clinic). The examination photo is an illustrative stock-style image, not a Kezza patient.
- To confirm before approval: Choose the reviewing doctor (suggested: Dr. Amrita Mukhija or Dr. Neelam Choudhary), then set status, reviewer and reviewed date.

## Blog articles in review (noindex, not listed on the blog page or in the sitemap)

### /blog/semaglutide-for-weight-loss/ — review

- To confirm before approval: MUST CONFIRM BEFORE PUBLISHING: the Indian government said in March 2026 that these medicines are approved on the condition that they are prescribed by endocrinologists or internal medicine specialists (and, for some uses, cardiologists). The article says Kezza's weight-loss medicines are prescribed only by its internal medicine specialist at the Jaipur clinic (Dr. Youvraj Singh is the only internal medicine specialist listed, Jaipur only). Confirm this is how the clinic works, how Sikar patients are handled, and that no other Kezza doctor prescribes them; change the 'Weight-loss medicines at Kezza' section if not.
- To confirm before approval: Medical review needed (suggested: Dr. Youvraj Singh, Consultant Physician & Internal Medicine). After approval set "status": "published", "reviewer" and "reviewed".
- To confirm before approval: Legal check before publishing: obesity is listed in the Schedule of the Drugs and Magic Remedies (Objectionable Advertisements) Act, 1954, and in March 2026 the CDSCO and DGHS told GLP-1 makers to stop surrogate advertising, including 'disease awareness' and digital campaigns. Those advisories were addressed to manufacturers, but the 1954 Act applies to anyone. The article is written as balanced health information: no prices, offers or 'buy' button, risks and limits included, and brand names appear only once, for identification (one line in 'The short answer' and one FAQ), as the clinic chose on 2 Oct 2026. Have a lawyer confirm the final text, and do not use this article in paid ads, boosted posts or promotional messages.
- To confirm before approval: Figures quoted from the cited studies: STEP 1 (about 15% vs 2% at 68 weeks), STEP 2 (about 10% vs 3% in type 2 diabetes), SELECT (20% lower risk of heart attack, stroke or heart death), the STEP 1 extension (two-thirds of lost weight regained a year after stopping both the medicine and the lifestyle programme), SURMOUNT-1 (15% to 21% with tirzepatide, depending on dose) and the oral tablet trial (about 14% vs 2% at 64 weeks). Confirm you are comfortable showing them.
- To confirm before approval: Time-sensitive facts to re-check every six months: the India launches (tablets 2022; weight-management and diabetes injections 2025; generics after the patent expired on 20 March 2026), the US approval of the weight-management tablet (December 2025) and the Indian prescribing rules. India has also approved the weight-management version for teenagers aged 12 and over (May 2026, prescribed by an endocrinologist or paediatrician) and for MASH fatty liver disease (July 2026); the article does not cover these uses.
- To confirm before approval: The cover image shows a Kezza treatment room, not a patient. No before/after photos or patient results are used.

