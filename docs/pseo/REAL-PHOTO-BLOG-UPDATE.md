# Kezza Blog + Real Photography SEO Update

Date: 2026-10-01

## What changed

- Added 5 optimized real Kezza treatment-stage photographs under `frontend/images/blog-real/`.
- Added real-photo support to the blog content builder so a published article can use a genuine Kezza image as its hero/card image while retaining the branded OG image for social sharing where configured.
- Added a real-photography section to `/blog/` with contextual captions and links to the new hair-transplant guides.
- Added two focused, informational hair-transplant articles:
  - `/blog/hair-transplant-hairline-design/`
  - `/blog/hair-transplant-procedure-day/`
- Added real-photo usage to relevant existing articles on FUE vs DHI, hair-transplant cost, graft planning, and recovery.
- Added image dimensions, descriptive alt text, lazy loading for below-the-fold images, and an above-the-fold high-priority hero image.
- Added internal links between the new articles, existing treatment pages, and related guides.
- Added authoritative external sources from AAD and ISHRS to the new articles.
- Kept the existing Kezza design system and existing pSEO architecture.

## Image selection

The update intentionally uses treatment-stage/scalp photographs rather than publishing the supplied identifiable before/after patient portraits. Identifiable patient photography should only be published after the clinic confirms appropriate documented website/marketing consent.

## SEO architecture

The blog now has stronger connections between:

Blog → Hair Transplant topic cluster → FUE/DHI treatment pages → Clinic/location pages

The new pages are included in the generated sitemap because they are published blog content.

## Validation

`npm test` completed successfully:

- 0 errors
- 0 warnings
- 0 critical pSEO issues
- 60 pages audited
- 46 sitemap URLs
- 0 claim-wording flags in the pSEO audit

SEO improvements can strengthen crawlability, topical coverage, internal linking, image relevance and user experience, but rankings or traffic increases cannot be guaranteed.
