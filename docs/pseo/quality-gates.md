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
| `/acne-treatment/` | review | **review** | noindex | 0 | 1 | 6 |
| `/acne-scar-treatment/` | review | **review** | noindex | 0 | 0 | 7 |
| `/hydra-facial/` | review | **review** | noindex | 0 | 1 | 6 |
| `/botox/` | review | **review** | noindex | 0 | 1 | 7 |
| `/dark-circles-treatment/` | review | **review** | noindex | 0 | 1 | 6 |
| `/cryolipolysis/` | review | **review** | noindex | 0 | 1 | 7 |
| `/hifu-body-sculpting/` | review | **review** | noindex | 0 | 1 | 6 |
| `/weight-management/` | review | **review** | noindex | 0 | 1 | 6 |
| `/microblading/` | review | **review** | noindex | 0 | 1 | 7 |
| `/lip-blush/` | review | **review** | noindex | 0 | 1 | 6 |
| `/permanent-eyeliner/` | review | **review** | noindex | 0 | 1 | 6 |
| `/pmu-correction/` | review | **review** | noindex | 0 | 1 | 6 |

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

- Warning: links to pages that are not published yet: /acne-scar-treatment/
- To confirm before approval: Confirm the treatments offered: which medical peels, extraction, cyst injections and whether isotretinoin is prescribed at Kezza.
- To confirm before approval: Confirm acne treatment is available in Sikar as well as Jaipur.
- To confirm before approval: Confirm the review timing (the page says 6 to 8 weeks) matches clinic practice.
- To confirm before approval: Choose the reviewing doctor (suggested: Dr. Amrita Mukhija or Dr. Neelam Choudhary), then set status, reviewer and reviewed date.
- To confirm before approval: The hero photo is an illustrative stock-style image, not a Kezza patient.
- To confirm before approval: No prices are shown. Add them only if the clinic wants to publish prices.

## /acne-scar-treatment/ — review

- To confirm before approval: Confirm which scar treatments each clinic offers (subcision, MNRF, fractional CO2 laser, chemical peels) and whether device names should be shown.
- To confirm before approval: Confirm that acne scar treatment is available in Sikar as well as Jaipur.
- To confirm before approval: Confirm the usual session spacing and course length (the page says several sessions, a few weeks apart).
- To confirm before approval: Confirm the advice on raised scars (steroid injections, silicone, laser) and on deep ice pick scars (focused chemical application such as TCA CROSS, or punch techniques) matches what the clinic offers.
- To confirm before approval: Choose the reviewing doctor (suggested: Dr. Amrita Mukhija or Dr. Neelam Choudhary), then set status, reviewer and reviewed date.
- To confirm before approval: The hero photo is an illustrative stock-style image, not a Kezza patient. The explainer photo is a real Kezza treatment room.
- To confirm before approval: No prices are shown. Add them only if the clinic wants to publish prices.

## /hydra-facial/ — review

- Warning: links to pages that are not published yet: /acne-scar-treatment/, /acne-treatment/
- To confirm before approval: Confirm the machine used at each clinic and whether it is a HydraFacial-brand system. The skin page calls the treatment 'HydraFacial MD' with 'patented Vortex-Fusion technology'; that brand wording should only stay if the clinic uses a genuine HydraFacial system.
- To confirm before approval: Confirm the steps, solutions and any add-ons offered, and who performs the facial.
- To confirm before approval: Confirm hydra facials are available in Sikar as well as Jaipur.
- To confirm before approval: Choose the reviewing doctor (suggested: Dr. Amrita Mukhija or Dr. Neelam Choudhary), then set status, reviewer and reviewed date.
- To confirm before approval: The hero photo is an illustrative stock-style image. The explainer photo shows the real machine at Kezza.
- To confirm before approval: No prices are shown. Add them only if the clinic wants to publish prices.

## /botox/ — review

- Warning: links to pages that are not published yet: /dark-circles-treatment/
- To confirm before approval: Confirm the brand(s) of botulinum toxin used. Botox is a trademark of Allergan (AbbVie); if the clinic uses another brand, the page title and wording should use the generic name.
- To confirm before approval: The skin page shows 'FDA Allergan Brands' and '6–9 Mo Lasting Results'. Published sources give about 3 to 4 months (Mayo Clinic) or 3 to 6 months (Cleveland Clinic); please confirm or correct the skin page.
- To confirm before approval: Confirm the areas treated (including masseter/jawline) and that injections are given only at the Jaipur clinic.
- To confirm before approval: Confirm which doctors give the injections and the review timing (the page says about two weeks).
- To confirm before approval: Choose the reviewing doctor (suggested: Dr. Nakul Somani or Dr. Amrita Mukhija), then set status, reviewer and reviewed date.
- To confirm before approval: The hero photo is an illustrative stock-style image, not a Kezza patient.
- To confirm before approval: No prices are shown. Add them only if the clinic wants to publish prices.

## /dark-circles-treatment/ — review

- Warning: links to pages that are not published yet: /botox/
- To confirm before approval: Confirm the methods offered for dark circles at Kezza: prescription creams, chemical peels, laser toning, tear-trough filler and whether PRP is used.
- To confirm before approval: Confirm the filler products used under the eyes and which doctors inject them.
- To confirm before approval: Confirm dark circles treatment is offered only at the Jaipur clinic.
- To confirm before approval: Choose the reviewing doctor (suggested: Dr. Amrita Mukhija or Dr. Nakul Somani), then set status, reviewer and reviewed date.
- To confirm before approval: The hero photo is an illustrative stock-style image, not a Kezza patient.
- To confirm before approval: No prices are shown. Add them only if the clinic wants to publish prices.

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
- To confirm before approval: Confirm the clinic's position on weight-loss medicines. The page only says a doctor may discuss them or refer; do not add named medicines unless the clinic prescribes them.
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
