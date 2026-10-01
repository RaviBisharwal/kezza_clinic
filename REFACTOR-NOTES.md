# Code clean-up — September 2026

A behaviour-preserving clean-up of the website code: less code, no duplicate handlers, the same pages, the
same forms, the same leads. Every change was checked against the original site in a real browser (see
*How it was verified*). Visible changes are listed on their own — *UI polish* and *Bugs fixed* — so they can
be reviewed separately.

## What changed

### CSS (`frontend/css/*.css`, rebuilt `bundle-*.min.css`)
- **Removed rules that can never match.** A rule was removed only when every selector in it uses a class or
  id that does not appear anywhere on the pages that load that stylesheet, nor in any script those pages run
  (including the chatbot and scanner, which build their markup in JavaScript). Third-party classes (Font
  Awesome, Leaflet) were always kept. `content-pages.css` was left untouched on purpose: it is the style kit
  for future blog/location pages. A second pass after the JavaScript clean-up removed the styles that only the
  deleted scripts used (for example the Terms page's extra back-to-top button and its unused table of contents).
- **Removed exact duplicate rules** inside a file (the later, winning copy is kept) and duplicated
  declarations inside one rule.
- **Removed declarations that are always overridden** later in *every* bundle that includes the file (same
  selector, same media query, same property). Browser fallbacks (`-webkit-`, `dvh`, `clamp()`, `var()` …) and
  rules with selectors some browsers reject were never treated as overrides.
- **Removed unused `@keyframes`** (not referenced by any CSS, script or inline style) and empty rules/media blocks.
- Result: source CSS −16 % (1,036 → 867 KB, −4,400 lines); every page downloads 9–44 % less CSS
  (home 230 → 199 KB, hair services 180 → 138 KB, PRP 246 → 214 KB, contact 171 → 140 KB).

### JavaScript (`frontend/js/`)
- **Dead code removed** — blocks whose target elements do not exist on the page that loads the script, found
  with a static check and confirmed with browser code-coverage: hero parallax/particles that are not on the
  page, old testimonial rotators, counters, lightbox and before/after showcase code for sections that were
  removed, a `/* … */`-disabled contact-form handler (the live one is `whatsapp-form.js`), unused helpers
  (`animateCounter`, `showNotification`), unreferenced chatbot internals (an unused 190-line system prompt,
  `renderFinalConfirmedSummary`, `handleImageFileSelect`, `compressImage`, `addUserImageMessage`,
  `detectSpecialist`, `createMapButtonHtml`) and unused variables.
- **Duplicates consolidated** — video autoplay-on-scroll was implemented three times on the home page
  (`script.js`, `quick-actions.js`, `home-video.js`); it now lives only in `quick-actions.js` (loaded on every
  page) and `home-video.js` is gone. The services category/tab switcher existed in both `script.js` and
  `services-navigation.js`; it now lives only in `services-navigation.js`. The per-page "smooth scroll to #anchor"
  handlers in seven page scripts (and PRP's own navbar/progress-bar/anchor code) were always overridden by
  `smooth-scroll.js`, so they were removed.
- Debug `console.log` lines removed (one of them printed patients' names and WhatsApp numbers to the browser
  console on the face-scanner page).
- Public hooks kept on purpose: `window.KezzaAI`, `window.openKezzaChat`, `window.openKezzaScanner`,
  `window.openScannerPromoModal`, `window.KezzaSmoothScroll`, `window.KezzaScannerModal` (Google Tag Manager or
  other scripts may call them).
- Result: 23 → 22 files, −2,350 lines (−14 %), −11.6 % bytes.

### Server (`server.js`)
- The three nested `try/catch` blocks that fall back from one Gemini model to the next (chat) and the two in the
  photo analysis endpoint are now one small helper, `generateWithFallback()`. Same models, same order, same
  request, same error behaviour. Lead capture, admin API and validation are untouched.

### HTML
- Removed three commented-out sections from `about.html` and the `home-video.js` script tag.
- Replaced five Font Awesome **Pro-only** icon names (they render as blank space with the free icon set the
  site loads) with free equivalents: `fa-sparkles` → `fa-wand-magic-sparkles`, `fa-shield-check` →
  `fa-shield-halved`, `fa-nose` → `fa-face-smile`, `fa-body` → `fa-person`, `fa-camera-slash` → `fa-video-slash`.
- `admin.html`: accessible names for the close button and filter drop-downs.

### Tooling
- New `npm run build:js` (`tools/stamp-js.js`), part of `npm run build`: stamps every local script with a
  content hash (`?v=3f9c2a1b`) so edited JavaScript reaches returning visitors despite the one-week cache.
  All pages are already stamped; run `npm run build` after editing any file in `frontend/js` or `frontend/css`.
- Removed the three retired SEO stubs and three one-off migration scripts (`fix_headings.js`,
  `fix_img_dimensions.js`, `update_paths.js`); all remain in git history.

## UI polish (visible, small, same design)
1. **Contact page — clinic cards.** On phones (320–390 px) the *Maps* / WhatsApp buttons spilled out of the
   card (the Jaipur WhatsApp button was cut off), and at some tablet/laptop widths (about 770–800 px and
   1100 px) the second or third card was clipped. The card header now wraps: the same three buttons sit under
   the clinic name, and the name no longer breaks over three lines on desktop.
2. **Contact page — footer social icons.** They were unstyled (small default-blue links on the dark footer);
   they are now round white icons with the brand teal on hover.
3. **Permanent Makeup page — "Why choose us" and "Process" grids.** A later stylesheet forced three columns on
   every screen, so on phones cards 3 and 6 (e.g. *Numbing & Preparation*, *Follow-up & Touch-up Session*)
   were pushed off-screen. Phones now get one card per row, as the page's own mobile stylesheet intended.
4. **PRP page — "Sterile Autologous Protocol" badge.** Its float animation cancelled its centring, so it sat
   under the *2nd PRP* pin. It is now centred, and hidden where the photo frame is too narrow for it (phones,
   and the two-column layout at 961–1145 px).
5. **Terms page — floating buttons.** The page added its own back-to-top button and progress bar on top of the
   site-wide ones; the extra button sat under the chat button on desktop/tablet and covered *Book Visit* in the
   bottom bar on phones. Only the site-wide pair remains. The keyboard-shortcut hint moved just above the
   back-to-top button (it was partly hidden behind it and behind the bottom bar on tablets), and the *Print*
   button's label and the "Link copied" message are visible again (they used colour variables this page never
   defines, so the text was white on white).
6. **AI-scanner popup on blog and location pages — doctor photos.** `scanner-modal.js` used relative image
   paths (`images/Doctor2.jpeg`), which point to a non-existent folder from `/blog/…` and `/locations/…`, so the
   recommended doctor's photo was a broken image there. The paths are now root-relative (`/images/…`), like the
   logo in the same file.

## Bugs fixed (behaviour changes — review these)
1. **Mobile menu did not open on the PRP, AI face-scanner and Terms pages.** Old page scripts added a second
   hamburger handler on top of `mobile-menu.js`, so one tap opened and immediately closed the drawer. On Terms,
   an old "☰" menu also hid the drawer with inline styles. The duplicate handlers were removed; the drawer now
   works exactly like on every other page.
2. **Terms page keyboard shortcuts fired while typing.** Pressing `P` anywhere opened the print dialog and `T`
   scrolled to the top — including while typing in the chatbot. Shortcuts are now ignored inside inputs.
3. **Hovering the four treatment cards on the Skin page threw a JavaScript error** (the handler looked for an
   icon the cards do not have). The broken hover handler was removed; the cards look and behave the same.
4. Blank icons (Font Awesome Pro names) — see HTML above.

## Found but not changed (need a decision)
- **The AI-scanner popup opens twice.** Measured: it opens 2.5 s after load (`quick-actions.js`) and, after the
  visitor closes it, again at 6 s (`scanner-launch.js`) — the two scripts use different "already shown" keys.
  Recommendation: keep one of the two timers.
- **Home page: the first click on the header's "Book Consultation" can do nothing.** The chatbot is lazy-loaded
  on the home page; a click that arrives while `kezza-ai.js` is still downloading is swallowed (seen in 2 of 4
  test loads when clicking right after the page appeared); the second click works. Fix: in
  `quick-actions.js → openChatbotConsultant()`, when the script tag exists but `window.openKezzaChat` is not
  ready, wait for that script's `load` event and then open the chat.
- **Chatbot (`kezza-ai.js`) replies that fail.** The errors are caught, so the visitor gets the generic
  "Namaste! Main aapki consultation booking…" message instead of the intended answer:
  - `generateStrictResponse()` is called but does not exist — e.g. "acne", "botox", "microblading",
    "lip blush", "SMP / scalp micropigmentation", "dark circles".
  - Exact treatment names such as "white hair removal" call `startConsultationFlow(cat, text, lang)` with an
    undefined `text`; two other calls pass the language where the clinic is expected
    (`startConsultationFlow(catKey, treatKey, lang)`).
  - Routing oddities: "book appointment" starts a *Rhinoplasty* booking, "rhinoplasty" gets the greeting, and
    "cryolipolysis", "fat freezing" and "thank you" get generic replies.
  These sit in the booking/lead flow, so they were left for a separate, reviewed change.
- **Meta Pixel is only on the home page**; unless it is also set up inside Google Tag Manager, other pages do
  not send `PageView`.
- Terms page (desktop/tablet): until the chatbot's "Ask Kezza!" bubble is dismissed it covers the *Print*
  button (the `P` shortcut still works). Moving the button was left for a design decision.
- Admin API: when `ADMIN_TOKEN` is not set and `NODE_ENV` is not `production`, `server.js` accepts the built-in
  token `kezza-admin-secret-2026`. Set `ADMIN_TOKEN` (or `NODE_ENV=production`) wherever the server is reachable.

## How it was verified
- **Styles:** every element on all 26 pages at desktop (1366 px), tablet (820 px) and phone (390 px) widths was
  compared — all computed CSS properties, pseudo-elements and box positions — in the loaded state and after
  opening the services menu, the mobile drawer, an FAQ, the chatbot (and one chatbot reply) and the AI-scanner
  popup: 78 page/width combinations × up to 9 states. The only differences are the changes listed above
  (plus known timing noise such as auto-rotating carousels and focus rings).
- **Behaviour:** an automated clicker pressed up to 150 interactive elements per page (desktop and phone) in
  the same order on the old and new site and compared the page after every click (DOM, scroll position, opened
  windows, network requests such as WhatsApp links and lead webhooks): no difference in any opened window,
  navigation or request. The face-scanner lead is sent with an identical payload at the same step. The pages
  with UI polish (contact, permanent makeup, PRP) were clicked through again afterwards — same result — and
  the Terms page's print button, `T`/`P` shortcuts, back-to-top button and "copy link" headings were tested
  separately.
- **Chatbot:** scripted English, Hinglish and booking conversations (82 turns), comparing every bot reply,
  quick reply and outgoing request — identical.
- **Server:** every API route (chat, photo analysis, lead capture, admin) exercised with the same requests
  against the old and new `server.js` (Gemini, Google Sheets and storage stubbed) — identical responses,
  identical model fallback order and identical stored leads.
- **Layout:** no page scrolls sideways and no text or button is cut off at 360, 390, 769, 820, 1100 or 1366 px.
- `npm run seo:check` and the reference-page validator: no errors.
