#!/usr/bin/env python3
"""
Kezza Clinic — content page builder (no dependencies, Python 3.8+).

Builds, from tools/seo/site-data.json, tools/content/blog/*.html and tools/content/pages/*.html:
  frontend/locations/index.html            clinic finder (hub)
  frontend/locations/<city>/index.html     one page per clinic (NAP, hours, doctors, treatments, FAQ)
  frontend/blog/index.html                 blog index
  frontend/blog/<slug>/index.html          one page per article
  frontend/<path>/index.html               one page per treatment in tools/content/pages/ (FUE, DHI, beard,
                                           eyebrow, GFC, laser hair removal, Hindi hair transplant page)
  frontend/sitemap.xml                     every indexable page, lastmod from git
  frontend/llms.txt                        AI-crawler summary of the site (llmstxt.org format)

The header, footer, social bar and floating dock are copied from
frontend/hair-transplant/index.html at build time, so new pages always match
the live navigation. Run from the repo root:

    python3 tools/content/build_content_pages.py

To add a blog post: copy an existing file in tools/content/blog/, edit the
JSON header and the HTML body, add an OG card in tools/og/make_og_images.py,
then re-run this script (and `npm run build:css` if you use the CSS bundles).

To add a treatment page: copy a file in tools/content/pages/, edit the JSON
header (hero, sections, FAQs, reviewer) and the HTML body (the long-form
"details" section), add its OG card and its path to tools/css-bundles.json
("content" bundle), then run `npm run build`.
"""
import datetime
import html
import json
import os
import re
import subprocess
import sys
from urllib.parse import quote

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pseo  # noqa: E402  (registry, status model, quality gates, link rules)

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
FE = os.path.join(ROOT, "frontend")
DATA = json.load(open(os.path.join(ROOT, "tools", "seo", "site-data.json"), encoding="utf-8"))
LOC = json.load(open(os.path.join(ROOT, "tools", "content", "locations.json"), encoding="utf-8"))  # longer local copy
BASE = DATA["base_url"]
ORG_ID, WEBSITE_ID, LOGO_ID = f"{BASE}/#organization", f"{BASE}/#website", f"{BASE}/#logo"
TODAY = datetime.date.today().isoformat()
E = lambda s: html.escape(str(s), quote=True)  # noqa: E731

# Stylesheets for the generated pages. build-css.js swaps these for one bundle.
CSS = ["/css/styles.css?v=2.2", "/css/services-navigation.css?v=3.6", "/css/quick-actions.css?v=2.0",
       "/css/service-page.css?v=2.0", "/css/responsive.css?v=3.8", "/css/kezza-ai.css?v=5.5",
       "/css/content-pages.css?v=1.0"]


# ───────────────────────────── template parts ─────────────────────────────
def template_parts():
    ref = open(os.path.join(FE, "hair-transplant", "index.html"), encoding="utf-8").read()
    head_analytics = re.search(r"(<!-- Google Tag Manager -->.*?<!-- End Google Tag Manager -->)", ref, re.S).group(1)
    gtag = re.search(r"(<!-- Google tag \(gtag\.js\) -->.*?</script>\s*<script>.*?</script>)", ref, re.S).group(1)
    gtm_body = re.search(r"(<!-- Google Tag Manager \(noscript\) -->.*?<!-- End Google Tag Manager \(noscript\) -->)", ref, re.S).group(1)
    nav = re.search(r'(<nav class="navbar">.*?</nav>)\s*\n\s*<!-- Main Content -->', ref, re.S).group(1)
    tail = re.search(r"(<!-- Footer -->\s*<footer.*?)</body>", ref, re.S).group(1)
    # Neutral nav: nothing "active" by default
    nav = nav.replace(' class="services-nav-toggle active"', ' class="services-nav-toggle"')
    nav = nav.replace(' class="services-sub-link active"', ' class="services-sub-link"')
    # Page-specific script tags stay; drop page-specific inline scripts if any
    return head_analytics, gtag, gtm_body, nav, tail


HEAD_GTM, GTAG, GTM_BODY, NAV, TAIL = template_parts()


def nav_for(active_href=None):
    if not active_href:
        return NAV
    return NAV.replace(f'<li><a href="{active_href}">', f'<li><a href="{active_href}" class="active">', 1)


# ───────────────────────────── schema helpers ─────────────────────────────
def postal(b):
    return {"@type": "PostalAddress", "streetAddress": b["street"], "addressLocality": b["city"],
            "addressRegion": b["region"], "postalCode": b["postal"], "addressCountry": b["country"]}


def org_node():
    o = DATA["organization"]
    return {"@type": "MedicalOrganization", "@id": ORG_ID, "name": o["name"], "alternateName": o["alternate_names"],
            "url": f"{BASE}/", "logo": {"@type": "ImageObject", "@id": LOGO_ID, "url": f"{BASE}{o['logo']}", "width": 297, "height": 200},
            "image": f"{BASE}/images/og/home.jpg", "telephone": o["telephone"], "email": o["email"],
            "address": postal(DATA["branches"]["jaipur"]), "sameAs": o["same_as"]}


def website_node():
    return {"@type": "WebSite", "@id": WEBSITE_ID, "url": f"{BASE}/", "name": DATA["organization"]["name"],
            "alternateName": "Kezza Clinic", "publisher": {"@id": ORG_ID}, "inLanguage": "en-IN"}


def hours_spec():
    return [{"@type": "OpeningHoursSpecification",
             "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
             "opens": DATA["hours"]["opens"], "closes": DATA["hours"]["closes"]}]


def branch_id(k):
    return f"{BASE}/locations/{k}/#clinic"


def person_id(k):
    return f"{BASE}/about.html#{k}"


def branch_node(k, full=False):
    b = DATA["branches"][k]
    n = {"@type": "MedicalClinic", "@id": branch_id(k), "name": b["name"], "url": f"{BASE}/locations/{k}/",
         "parentOrganization": {"@id": ORG_ID}, "telephone": b["phones"][0], "address": postal(b),
         "openingHoursSpecification": hours_spec(), "image": f"{BASE}{b['image']}", "hasMap": b["map"], "priceRange": "₹₹"}
    if b.get("geo"):
        n["geo"] = {"@type": "GeoCoordinates", "latitude": b["geo"][0], "longitude": b["geo"][1]}
    if full:
        n.update({"logo": {"@id": LOGO_ID}, "email": b["email"], "areaServed": {"@type": "City", "name": b["city"]},
                  "medicalSpecialty": ["Dermatology", "PlasticSurgery"], "sameAs": DATA["organization"]["same_as"],
                  "employee": [{"@id": person_id(p)} for p in b["doctors"]],
                  "availableService": [{"@type": "MedicalProcedure", "name": s[0], "url": f"{BASE}{s[1]}"} for s in b["services"]]})
        if len(b["phones"]) > 1:
            n["contactPoint"] = [{"@type": "ContactPoint", "telephone": p, "contactType": "appointments",
                                  "availableLanguage": ["en", "hi"]} for p in b["phones"]]
    return n


def person_node(k):
    p = DATA["people"][k]
    n = {"@type": "Person", "@id": person_id(k), "name": p["name"], "jobTitle": p["job_title"],
         "url": person_id(k), "image": f"{BASE}{p['image']}"}
    if p.get("branches"):
        n["worksFor"] = [{"@id": branch_id(b)} for b in p["branches"]]
    return n


def breadcrumb(url, trail):
    return {"@type": "BreadcrumbList", "@id": f"{url}#breadcrumb",
            "itemListElement": [{"@type": "ListItem", "position": i + 1, "name": n, "item": f"{BASE}{p}"}
                                for i, (n, p) in enumerate(trail)]}


def webpage(url, name, desc, typ="WebPage", about=None, image=None, extra=None, modified=None):
    n = {"@type": typ, "@id": f"{url}#webpage", "url": url, "name": name, "description": desc,
         "isPartOf": {"@id": WEBSITE_ID}, "publisher": {"@id": ORG_ID}, "inLanguage": "en-IN",
         "breadcrumb": {"@id": f"{url}#breadcrumb"}, "dateModified": modified or TODAY}
    if about:
        n["about"] = {"@id": about}
    if image:
        n["primaryImageOfPage"] = {"@type": "ImageObject", "url": image, "width": 1200, "height": 630}
    if extra:
        n.update(extra)
    return n


def faq_node(url, qas):
    strip = lambda s: re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", s))).strip()  # noqa: E731
    return {"@type": "FAQPage", "@id": f"{url}#faq", "isPartOf": {"@id": f"{url}#webpage"},
            "mainEntity": [{"@type": "Question", "name": strip(q), "acceptedAnswer": {"@type": "Answer", "text": strip(a)}}
                           for q, a in qas]}


def graph(nodes):
    body = json.dumps({"@context": "https://schema.org", "@graph": nodes}, ensure_ascii=False, indent=2).replace("</", "<\\/")
    return ('    <!-- ═══ SEO: Structured data (one connected @graph; entity @ids are shared across pages) ═══ -->\n'
            f'    <script type="application/ld+json">\n{body}\n    </script>')


# ───────────────────────────── page shell ─────────────────────────────
def page(path, title, desc, og_image, og_alt, nodes, main_html, active_nav=None, preload=None,
         lang="en-IN", alternates=None, nav_html=None, robots=pseo.INDEX_ROBOTS):
    url = f"{BASE}{path}"
    css = "\n".join(f'    <link rel="stylesheet" href="{c}">' for c in CSS)
    pre = f'    <link rel="preload" as="image" href="{preload}">\n' if preload else ""
    og_locale = lang.replace("-", "_")
    alt_html = "".join(f'\n    <link rel="alternate" hreflang="{h}" href="{BASE}{p}">' for h, p in (alternates or []))
    return f"""<!DOCTYPE html>
<html lang="{lang}">

<head>
    <!-- Generated by tools/content/build_content_pages.py — edit the source there, not this file. -->
    {HEAD_GTM}
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{E(title)}</title>
    <meta name="description" content="{E(desc)}">
    <meta name="robots" content="{robots}">

    {GTAG}

    <!-- Fonts & Icons -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="preload" as="style" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"></noscript>
    <link rel="icon" type="image/png" href="/images/logo.png">

    <!-- Stylesheets -->
{css}
{pre}
    <!-- ═══ SEO: canonical URL ═══ -->
    <link rel="canonical" href="{url}">{alt_html}
    <!-- ═══ SEO: Open Graph / social previews ═══ -->
    <meta property="og:type" content="{'article' if path.startswith('/blog/') and path != '/blog/' else 'website'}">
    <meta property="og:site_name" content="Kezza Hair &amp; Skin Clinic">
    <meta property="og:locale" content="{og_locale}">
    <meta property="og:url" content="{url}">
    <meta property="og:title" content="{E(title)}">
    <meta property="og:description" content="{E(desc)}">
    <meta property="og:image" content="{BASE}{og_image}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="{E(og_alt)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{E(title)}">
    <meta name="twitter:description" content="{E(desc)}">
    <meta name="twitter:image" content="{BASE}{og_image}">

{graph(nodes)}
</head>

<body>
    {GTM_BODY}

    <!-- Navigation -->
    {nav_html or nav_for(active_nav)}

    <!-- Main Content -->
    <main class="service-page-main">
{main_html}
    </main>

    {TAIL}</body>

</html>
"""


def crumbs_html(trail):
    items = []
    for i, (name, href) in enumerate(trail):
        if i == len(trail) - 1:
            items.append(f'                    <li aria-current="page">{E(name)}</li>')
        else:
            items.append(f'                    <li><a href="{href}">{E(name)}</a></li>')
    return ('        <nav class="service-breadcrumbs" aria-label="Breadcrumb">\n            <div class="sp-container">\n'
            '                <ol>\n' + "\n".join(items) + "\n                </ol>\n            </div>\n        </nav>\n")


def faq_html(qas, heading="Frequently Asked Questions", bg="sp-bg-white", badge="FAQs"):
    items = "".join(f"""
                    <details class="sp-faq-item">
                        <summary class="sp-faq-question">
                            <span>{q}</span>
                            <span class="faq-chevron"><i class="fas fa-chevron-down"></i></span>
                        </summary>
                        <div class="sp-faq-answer">
                            {a}
                        </div>
                    </details>""" for q, a in qas)
    return f"""
        <section class="sp-section-pad {bg}" id="faqs">
            <div class="sp-container">
                <div class="kz-center-head">
                    <span class="sp-pill-badge"><i class="fas fa-question-circle"></i> {E(badge)}</span>
                    <h2 class="sp-section-heading">{E(heading)}</h2>
                </div>
                <div class="faq-accordion-wrap">{items}
                </div>
            </div>
        </section>
"""


def cta_band(title, text, wa="919284517427", phone="+919284517427", phone_label="9284517427",
             wa_text="Hi Kezza Clinic, I would like to book a consultation.", wa_label="Book on WhatsApp", call_word="Call"):
    wa_q = quote(wa_text)
    return f"""
        <section class="service-cta-band">
            <picture>
                <source type="image/webp" srcset="/images/hair-services/hair-transplant/hair-transplant-cta-background-kezza-jaipur.webp 1600w">
                <img src="/images/hair-services/hair-transplant/hair-transplant-cta-background-kezza-jaipur.jpg"
                     width="1600" height="600" loading="lazy" decoding="async"
                     alt="" class="cta-band-bg-img" aria-hidden="true">
            </picture>
            <div class="sp-container">
                <div class="cta-band-inner">
                    <h2>{E(title)}</h2>
                    <p>{text}</p>
                    <div class="cta-band-btn-group">
                        <a href="https://wa.me/{wa}?text={wa_q}" target="_blank" rel="noopener noreferrer" class="btn-wa-action">
                            <i class="fab fa-whatsapp"></i> {E(wa_label)}
                        </a>
                        <a href="tel:{phone}" class="btn-call-action" style="background: rgba(255,255,255,0.12); color: #ffffff !important; border-color: rgba(255,255,255,0.25);">
                            <i class="fas fa-phone-alt"></i> {E(call_word)}: {phone_label}
                        </a>
                    </div>
                </div>
            </div>
        </section>
"""


RESOLVER = None      # set in __main__ once the quality gates have run
NEUTRALIZED = []     # (page, link, fallback) for the gate report


def write(rel, content, live=True):
    if rel.endswith(".html") and live and RESOLVER is not None:
        self_url = "/" + (rel[:-len("index.html")] if rel.endswith("index.html") else rel)
        content, fixed = pseo.neutralize(content, RESOLVER, self_url)
        NEUTRALIZED.extend((rel, u, fb) for u, fb in fixed)
    path = os.path.join(FE, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("wrote", os.path.relpath(path, ROOT))


def pretty_phone(p):
    d = re.sub(r"\D", "", p)[-10:]
    return f"+91 {d[:5]} {d[5:]}"


def tel(p):
    return "+91" + re.sub(r"\D", "", p)[-10:]


# ───────────────────────────── locations ─────────────────────────────
def doctor_cards(keys):
    out = []
    for k in keys:
        p = DATA["people"][k]
        out.append(f"""
                    <a class="kz-doc-mini" href="/about.html#{k}">
                        <img src="{p['image']}" alt="{E(p['name'])}, {E(p['job_title'])}" width="600" height="400" loading="lazy" decoding="async">
                        <div><strong>{E(p['name'])}</strong><span>{E(p['job_title'])}</span></div>
                    </a>""")
    return "".join(out)


def location_faqs(k):
    b = DATA["branches"][k]
    docs = ", ".join(DATA["people"][d]["name"] for d in b["doctors"])
    phones = " or ".join(pretty_phone(p) for p in b["phones"])
    return [
        (f"What are the timings of Kezza Clinic {b['city']}?",
         f"The {b['city']} clinic is open from 9 AM to 8 PM, all 7 days a week, including Sundays. Booking ahead by phone or WhatsApp makes sure the right doctor is available when you arrive."),
        (f"Where is Kezza Clinic in {b['city']}?",
         f"{E(b['display_address'])}. {E(b['reach'])} Use <a href=\"{b['map']}\" target=\"_blank\" rel=\"noopener noreferrer\">Google Maps directions</a> to reach the door."),
        (f"Which doctors see patients at the {b['city']} clinic?",
         f"{E(docs)}. See their qualifications and experience on our <a href=\"/about.html#doctors\">doctors page</a>."),
        (f"How do I book an appointment at the {b['city']} clinic?",
         f"Call {phones}, message us on <a href=\"https://wa.me/{b['whatsapp']}\" target=\"_blank\" rel=\"noopener noreferrer\">WhatsApp</a>, or use the form on our <a href=\"/contact.html\">contact page</a>. Share your concern and a preferred time, and the team will confirm your slot."),
        (f"Can I get a hair transplant at the {b['city']} clinic?",
         f"Yes. The {b['city']} clinic offers hair transplant consultations and procedures. Your doctor first checks your donor area and hair-loss stage, then explains the plan. Read about <a href=\"/hair-transplant/\">hair transplant at Kezza</a>."),
    ] + [tuple(f) for f in LOC.get(k, {}).get("faqs", [])]


def build_location(k):
    b = DATA["branches"][k]
    path = f"/locations/{k}/"
    url = f"{BASE}{path}"
    city = b["city"]
    titles = {"jaipur": "Hair & Skin Clinic in Jaipur, Khatipura | Kezza Clinic",
              "sikar": "Hair Transplant & Skin Clinic in Sikar | Kezza Clinic",
              "ajmer": "Hair Transplant & Skin Clinic in Ajmer | Kezza Clinic"}
    descs = {"jaipur": "Kezza Hair & Skin Clinic on Sirsi Road, Khatipura, Jaipur: hair transplant, PRP/GFC, skin and laser care and PMU. Open 9 AM–8 PM, all 7 days.",
             "sikar": "Kezza Hair & Skin Clinic, Silver Jubilee Road, Sikar (opp. S.K. Hospital): hair transplant, PRP/GFC, skin and laser care. Open 9 AM–8 PM daily.",
             "ajmer": "Kezza Hair & Skin Clinic, Oasis Complex, Shastri Nagar, Ajmer: hair transplant and facial aesthetics with Dr. Aliza Rizvi. Open 9 AM–8 PM, all 7 days."}
    title, desc = titles[k], descs[k]
    faqs = location_faqs(k)
    phones_html = "<br>".join(f'<a href="tel:{tel(p)}">{pretty_phone(p)}</a>' for p in b["phones"])
    treat = "".join(f'\n                    <li><a href="{s[1]}"><i class="fas {s[2]}" aria-hidden="true"></i> {E(s[0])}</a></li>' for s in b["services"])
    others = [o for o in DATA["branches"] if o != k]
    other_links = " and ".join(f'<a href="/locations/{o}/">{DATA["branches"][o]["city"]}</a>' for o in others)
    x = LOC.get(k, {})
    h1 = x.get("h1", f"Kezza Hair &amp; Skin Clinic, {city}")
    h1_span = f' <span>{x["h1_span"]}</span>' if x.get("h1_span") else ""
    wa_book = f"https://wa.me/{b['whatsapp']}?text=Hi%20Kezza%20{city}%2C%20I%20would%20like%20to%20book%20a%20consultation."
    main = crumbs_html([("Home", "/index.html"), ("Our Clinics", "/locations/"), (city, path)]) + f"""
        <header class="service-hero-section">
            <div class="sp-container">
                <div class="service-hero-grid">
                    <div class="service-hero-content">
                        <div class="hero-trust-chips">
                            <span class="chip chip-clinical"><i class="fas fa-clock"></i> Open 9 AM – 8 PM · All 7 days</span>
                            <span class="chip chip-network"><i class="fas fa-map-marker-alt"></i> {E(b['label'])}</span>
                        </div>
                        <h1>{h1}{h1_span}</h1>
                        <p class="service-hero-lead">{E(b['intro'])}</p>
                        <div class="service-hero-ctas">
                            <a href="{wa_book}" target="_blank" rel="noopener noreferrer" class="btn-wa-action">
                                <i class="fab fa-whatsapp"></i> WhatsApp the {city} clinic
                            </a>
                            <a href="tel:{tel(b['phones'][0])}" class="btn-call-action"><i class="fas fa-phone-alt"></i> Call {pretty_phone(b['phones'][0])}</a>
                            <a href="{b['map']}" target="_blank" rel="noopener noreferrer" class="btn-call-action"><i class="fas fa-location-arrow"></i> Get directions</a>
                        </div>
                    </div>
                    <div class="service-hero-image-wrap">
                        <img src="{b['image']}" width="768" height="1024" fetchpriority="high" decoding="async"
                             alt="Kezza Hair &amp; Skin Clinic building in {city}" style="max-height:520px;object-fit:cover;">
                    </div>
                </div>
            </div>
        </header>
"""
    sections = []
    sections.append(lambda bg: f"""
        <section class="sp-section-pad {bg}" id="details">
            <div class="sp-container">
                <div class="kz-center-head">
                    <span class="sp-pill-badge"><i class="fas fa-clinic-medical"></i> Clinic details</span>
                    <h2 class="sp-section-heading">Address, timings &amp; contact</h2>
                </div>
                <div class="kz-loc-grid">
                    <div class="kz-loc-card">
                        <h3><i class="fas fa-map-marker-alt"></i> Address</h3>
                        <address>{E(b['display_address'])}</address>
                        <a href="{b['map']}" target="_blank" rel="noopener noreferrer">Open in Google Maps →</a>
                    </div>
                    <div class="kz-loc-card">
                        <h3><i class="fas fa-clock"></i> Timings</h3>
                        <table class="kz-hours"><tbody>
                            <tr><td>Monday – Saturday</td><td>9 AM – 8 PM</td></tr>
                            <tr><td>Sunday</td><td>9 AM – 8 PM</td></tr>
                        </tbody></table>
                    </div>
                    <div class="kz-loc-card">
                        <h3><i class="fas fa-phone-alt"></i> Phone</h3>
                        <p>{phones_html}</p>
                        <a href="https://wa.me/{b['whatsapp']}" target="_blank" rel="noopener noreferrer"><i class="fab fa-whatsapp"></i> WhatsApp {pretty_phone(b['whatsapp'])}</a>
                    </div>
                    <div class="kz-loc-card">
                        <h3><i class="fas fa-envelope"></i> Email</h3>
                        <p><a href="mailto:{b['email']}">{E(b['email'])}</a></p>
                        <p class="kz-muted">Or use our <a href="/contact.html">online booking form</a>.</p>
                    </div>
                </div>
                <p class="kz-note"><i class="fas fa-info-circle"></i> {E(b['reach'])}</p>
            </div>
        </section>
""")
    if x.get("services"):
        cards = "".join(f"""
                    <div class="kz-loc-card">
                        <h3><i class="fas {sv.get('icon', 'fa-check-circle')}"></i> <a href="{sv['href']}">{sv['title']}</a></h3>
                        <p>{sv['text']}</p>
                    </div>""" for sv in x["services"])
        sub = f"\n                    <p>{x['services_sub']}</p>" if x.get("services_sub") else ""
        sections.append(lambda bg: f"""
        <section class="sp-section-pad {bg}" id="services">
            <div class="sp-container">
                <div class="kz-center-head">
                    <span class="sp-pill-badge"><i class="fas fa-notes-medical"></i> What we treat</span>
                    <h2 class="sp-section-heading">{x.get('services_h2', f'Treatments in {city}')}</h2>{sub}
                </div>
                <div class="kz-svc-grid">{cards}
                </div>
            </div>
        </section>
""")
    sections.append(lambda bg: f"""
        <section class="sp-section-pad {bg}" id="doctors">
            <div class="sp-container">
                <div class="kz-center-head">
                    <span class="sp-pill-badge"><i class="fas fa-user-md"></i> Your care team</span>
                    <h2 class="sp-section-heading">Doctors at our {city} clinic</h2>
                    <p>Tap a profile to read qualifications and areas of expertise.</p>
                </div>
                <div class="kz-doc-grid">{doctor_cards(b['doctors'])}
                </div>
            </div>
        </section>
""")
    sections.append(lambda bg: f"""
        <section class="sp-section-pad {bg}" id="treatments">
            <div class="sp-container">
                <div class="kz-center-head">
                    <span class="sp-pill-badge"><i class="fas fa-th-large"></i> Treatments</span>
                    <h2 class="sp-section-heading">All treatments at Kezza {city}</h2>
                </div>
                <ul class="kz-treat-list">{treat}
                </ul>
                <p class="kz-note">Call or WhatsApp before your visit to confirm a treatment is available on your chosen day. Other clinics: {other_links}.</p>
            </div>
        </section>
""")
    if x.get("nearby"):
        chips = "".join(f"<li>{E(a)}</li>" for a in x["nearby"])
        sections.append(lambda bg: f"""
        <section class="sp-section-pad {bg}" id="nearby">
            <div class="sp-container">
                <div class="kz-center-head" style="margin-bottom:0">
                    <span class="sp-pill-badge"><i class="fas fa-route"></i> Getting here</span>
                    <h2 class="sp-section-heading">Visiting from nearby</h2>
                    <p>{x.get('nearby_text', '')}</p>
                    <ul class="kz-area-chips">{chips}</ul>
                    <p class="kz-note"><a href="{b['map']}" target="_blank" rel="noopener noreferrer">Open Google Maps directions to Kezza {city} →</a></p>
                </div>
            </div>
        </section>
""")
    visit = [("Book a slot", f"Call {pretty_phone(b['phones'][0])} or WhatsApp the clinic with your concern and a preferred time. The team confirms which doctor you will see."),
             ("Bring your history", "Bring previous prescriptions, reports and a list of the medicines you take. For a hair assessment, come with clean, dry hair without oil or styling products."),
             ("Consultation and examination", "The doctor listens to your concerns and examines your scalp or skin, using trichoscopy for hair loss."),
             ("A clear plan", "You receive a treatment plan with the number of sessions or grafts and an estimate, so you can decide in your own time.")]
    steps = "".join(f"""
                    <div class="why-point-item">
                        <div class="why-point-num">{n:02d}</div>
                        <div class="why-point-text">
                            <h3>{h}</h3>
                            <p>{d}</p>
                        </div>
                    </div>""" for n, (h, d) in enumerate(visit, 1))
    sections.append(lambda bg: f"""
        <section class="sp-section-pad {bg}" id="first-visit">
            <div class="sp-container">
                <div class="kz-center-head">
                    <span class="sp-pill-badge"><i class="fas fa-calendar-check"></i> First visit</span>
                    <h2 class="sp-section-heading">Your first visit to Kezza {city}</h2>
                </div>
                <div class="why-points-list kz-steps-list">{steps}
                </div>
            </div>
        </section>
""")
    bgs = ["sp-bg-white", "sp-bg-light"]
    main += "".join(fn(bgs[i % 2]) for i, fn in enumerate(sections))
    main += faq_html(faqs, heading=f"Visiting our {city} clinic", bg=bgs[len(sections) % 2]) + cta_band(
        f"Book your visit to Kezza {city}",
        f"Open 9 AM – 8 PM, all 7 days. Call, WhatsApp or <a href=\"/contact.html\" style=\"color:#fff;text-decoration:underline\">book online</a>.",
        wa=b["whatsapp"], phone=tel(b["phones"][0]), phone_label=pretty_phone(b["phones"][0]))

    nodes = [org_node(), website_node(),
             webpage(url, title, desc, about=branch_id(k), image=f"{BASE}{b['og_image']}", extra={"mainEntity": {"@id": branch_id(k)}}),
             breadcrumb(url, [("Home", "/"), ("Our Clinics", "/locations/"), (city, path)]),
             branch_node(k, full=True)]
    nodes += [person_node(d) for d in b["doctors"]]
    nodes.append(faq_node(url, faqs))
    write(f"locations/{k}/index.html",
          page(path, title, desc, b["og_image"], f"Kezza Hair & Skin Clinic, {city}", nodes, main,
               active_nav="/locations/", preload=b["image"]))


def build_locations_hub():
    path = "/locations/"
    url = f"{BASE}{path}"
    title = "Our Clinics in Jaipur, Sikar & Ajmer | Kezza Clinic"
    desc = "Find Kezza Hair & Skin Clinic near you: addresses, phone numbers, timings, doctors and directions for our Jaipur, Sikar and Ajmer clinics."
    
    branch_meta = {
        "jaipur": {
            "facility": "Flagship Surgical OT Center",
            "rating": "4.9",
            "reviews": "1,200+",
            "tags": ["Sapphire FUE", "DHI Implantation", "PRP & GFC", "Triple Laser LHR", "HydraFacial"]
        },
        "sikar": {
            "facility": "Regional Hair & Laser Center",
            "rating": "4.9",
            "reviews": "850+",
            "tags": ["FUE Hair Transplant", "GFC Therapy", "Diode Laser LHR", "Medical Facials", "Skin Peels"]
        },
        "ajmer": {
            "facility": "Aesthetics & Cosmetology Center",
            "rating": "4.8",
            "reviews": "420+",
            "tags": ["Facial Aesthetics", "PRP & GFC", "Laser Hair Removal", "Microblading", "Acne Repair"]
        }
    }

    cards = []
    for k, b in DATA["branches"].items():
        meta = branch_meta.get(k, {
            "facility": "Medical Aesthetics Center",
            "rating": "4.9",
            "reviews": "500+",
            "tags": ["Hair Care", "Skin Care", "Laser Treatment"]
        })
        doc_chips = "".join(f'<span class="kz-doctor-chip"><i class="fas fa-user-md"></i> {E(DATA["people"][d]["name"])}</span>' for d in b["doctors"][:3])
        if len(b["doctors"]) > 3:
            doc_chips += f'<span class="kz-doctor-chip" style="color:#00AFC0">+{len(b["doctors"]) - 3} more</span>'
        service_tags = "".join(f'<span class="kz-service-mini-tag">{E(s)}</span>' for s in meta["tags"])
        
        cards.append(f"""
                    <article class="kz-clinic-card" data-city="{k}" id="{k}">
                        <div class="kz-clinic-card-thumb">
                            <img src="{b['image']}" alt="Kezza Hair &amp; Skin Clinic, {b['city']}" width="768" height="1024" loading="lazy" decoding="async">
                            <div class="kz-thumb-overlay"></div>
                            <div class="kz-thumb-top-row">
                                <span class="kz-rating-pill"><i class="fas fa-star"></i> {meta['rating']} ({meta['reviews']})</span>
                                <span class="kz-facility-badge">{meta['facility']}</span>
                            </div>
                            <div class="kz-thumb-title-wrap">
                                <h2 class="kz-thumb-city-title"><a href="/locations/{k}/">Kezza {b['city']}</a></h2>
                                <div class="kz-thumb-loc-label"><i class="fas fa-map-pin" style="color:#00AFC0"></i> {E(b['label'])}</div>
                            </div>
                        </div>
                        <div class="kz-card-body">
                            <div class="kz-info-micro-row">
                                <div class="kz-info-icon-box" style="background:#ecfdf5;color:#047857"><i class="fas fa-door-open"></i></div>
                                <div class="kz-info-text-content">
                                    <strong style="color:#047857">Open Today · 9:00 AM – 8:00 PM</strong>
                                    <span style="font-size:0.82rem;color:#64748b">Open 7 days a week, including Sunday</span>
                                </div>
                            </div>
                            <div class="kz-info-micro-row">
                                <div class="kz-info-icon-box"><i class="fas fa-map-marker-alt"></i></div>
                                <div class="kz-info-text-content">
                                    <strong>Clinic Location</strong>
                                    <span>{E(b['display_address'])}</span>
                                </div>
                            </div>
                            <div class="kz-info-micro-row">
                                <div class="kz-info-icon-box"><i class="fas fa-user-md"></i></div>
                                <div class="kz-info-text-content">
                                    <strong>Specialists on Duty</strong>
                                    <div class="kz-card-doctor-pills">{doc_chips}</div>
                                </div>
                            </div>
                            <div class="kz-info-micro-row">
                                <div class="kz-info-icon-box"><i class="fas fa-wand-magic-sparkles"></i></div>
                                <div class="kz-info-text-content">
                                    <strong>Popular Treatments</strong>
                                    <div class="kz-card-services-list">{service_tags}</div>
                                </div>
                            </div>
                            <div class="kz-info-micro-row">
                                <div class="kz-info-icon-box"><i class="fas fa-phone-alt"></i></div>
                                <div class="kz-info-text-content">
                                    <strong>Clinic Helpline</strong>
                                    <a href="tel:{tel(b['phones'][0])}" style="color:#008f9c;font-weight:700;text-decoration:none">{pretty_phone(b['phones'][0])}</a>
                                </div>
                            </div>
                            <div class="kz-card-actions-grid">
                                <a href="https://wa.me/{b['whatsapp']}?text=Hello%20Kezza%20Team%2C%20I%20want%20to%20consult%20at%20Kezza%20{b['city']}." target="_blank" rel="noopener noreferrer" class="kz-btn-primary-action"><i class="fab fa-whatsapp"></i> Book Visit</a>
                                <a href="/locations/{k}/" class="kz-btn-secondary-action"><i class="fas fa-info-circle"></i> Clinic Details</a>
                                <a href="{b['map']}" target="_blank" rel="noopener noreferrer" class="kz-btn-directions-link"><i class="fas fa-location-arrow"></i> Get Google Maps Directions</a>
                            </div>
                        </div>
                    </article>""")

    faqs = [
        ("Which Kezza clinic should I visit?",
         "Choose the clinic closest to you: all three follow the same clinical protocols. Some specialists work only at certain clinics (for example, rhinoplasty and plastic surgery consultations are in Jaipur), so our team will guide you when you call."),
        ("Are Kezza clinics open on Sunday?",
         "Yes. All three clinics, in Jaipur, Sikar and Ajmer, are open from 9 AM to 8 PM, seven days a week."),
        ("Is there one phone number for all clinics?",
         "+91 92845 17427 is the main helpline for Jaipur and Sikar. The Ajmer clinic has its own number, +91 92160 88257."),
        ("Can I open a Kezza Clinic franchise in another city?",
         "Yes. We offer franchise partnerships with comprehensive doctor training, treatment protocols and clinic setup across Rajasthan. Learn more on our <a href=\"/branches.html\">franchise enquiry page</a>."),
    ]
    main = crumbs_html([("Home", "/index.html"), ("Our Clinics", path)]) + f"""
        <header class="kz-locations-hero">
            <div class="sp-container">
                <div class="kz-hero-badge-wrap">
                    <span class="kz-live-status-pill">
                        <span class="kz-live-pulse-dot"></span>
                        All 3 Clinics Open Today · 9:00 AM – 8:00 PM
                    </span>
                    <span class="sp-pill-badge"><i class="fas fa-hospital"></i> 3 Clinics in Rajasthan</span>
                </div>
                <h1 class="kz-locations-h1">Kezza Clinics in <span class="kz-highlight-text">Jaipur, Sikar &amp; Ajmer</span></h1>
                <p class="kz-locations-lead">Doctor-led hair restoration, skin and laser care, permanent makeup and body contouring, close to home. Every clinic is open 9 AM – 8 PM, all 7 days.</p>

                <div class="kz-hero-metrics">
                    <div class="kz-metric-card">
                        <div class="kz-metric-num"><i class="fas fa-star"></i> 4.9 / 5.0</div>
                        <div class="kz-metric-lbl">2,500+ Verified Patient Reviews</div>
                    </div>
                    <div class="kz-metric-card">
                        <div class="kz-metric-num"><i class="fas fa-hospital-alt"></i> 3 Centers</div>
                        <div class="kz-metric-lbl">Jaipur · Sikar · Ajmer</div>
                    </div>
                    <div class="kz-metric-card">
                        <div class="kz-metric-num"><i class="fas fa-user-md"></i> Doctor-Led Care</div>
                        <div class="kz-metric-lbl">Direct Surgeon &amp; Dermatologist Consults</div>
                    </div>
                    <div class="kz-metric-card">
                        <div class="kz-metric-num"><i class="fas fa-shield-alt"></i> Certified Sterile OTs</div>
                        <div class="kz-metric-lbl">HEPA Laminar Airflow Protocols</div>
                    </div>
                </div>

                <div class="kz-city-filter-bar">
                    <button type="button" class="kz-filter-tab active" data-city="all" onclick="filterClinics('all')"><i class="fas fa-th-large"></i> All Clinics (3)</button>
                    <button type="button" class="kz-filter-tab" data-city="jaipur" onclick="filterClinics('jaipur')"><i class="fas fa-map-pin"></i> Jaipur Center</button>
                    <button type="button" class="kz-filter-tab" data-city="sikar" onclick="filterClinics('sikar')"><i class="fas fa-map-pin"></i> Sikar Center</button>
                    <button type="button" class="kz-filter-tab" data-city="ajmer" onclick="filterClinics('ajmer')"><i class="fas fa-map-pin"></i> Ajmer Center</button>
                </div>
            </div>
        </header>

        <section class="sp-section-pad sp-bg-white" id="clinics">
            <div class="sp-container">
                <div class="kz-clinic-cards">{''.join(cards)}
                </div>
            </div>
        </section>

        <!-- Clinical Excellence / Infrastructure -->
        <section class="kz-features-section">
            <div class="sp-container">
                <div class="kz-center-head">
                    <span class="sp-pill-badge"><i class="fas fa-medal"></i> Quality Standards</span>
                    <h2 class="sp-section-heading">Clinical Excellence at Every Location</h2>
                    <p class="service-hero-lead" style="margin-bottom:0">Consistent surgical protocols, sterile environments, and licensed dermatologists across all three Rajasthan centers.</p>
                </div>
                <div class="kz-features-grid">
                    <div class="kz-feature-box">
                        <div class="kz-feature-icon"><i class="fas fa-shield-virus"></i></div>
                        <h3>Hospital-Grade Sterile OTs</h3>
                        <p>Modular operation suites with HEPA laminar air filtration and single-use micro-blades under strict hospital hygiene protocols.</p>
                    </div>
                    <div class="kz-feature-box">
                        <div class="kz-feature-icon"><i class="fas fa-user-md"></i></div>
                        <h3>Consult with Real Doctors</h3>
                        <p>You meet qualified hair transplant surgeons and dermatologists, not high-pressure sales counsellors.</p>
                    </div>
                    <div class="kz-feature-box">
                        <div class="kz-feature-icon"><i class="fas fa-sun"></i></div>
                        <h3>US-FDA Approved Lasers</h3>
                        <p>Triple-wavelength cooling laser tech and digital trichoscopy for accurate follicular diagnostics.</p>
                    </div>
                    <div class="kz-feature-box">
                        <div class="kz-feature-icon"><i class="fas fa-file-medical-alt"></i></div>
                        <h3>Transparent Clinic Care</h3>
                        <p>Clear, honest procedural pricing with complimentary post-treatment follow-ups and care guidance.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Service Availability Matrix -->
        <section class="kz-matrix-section">
            <div class="sp-container">
                <div class="kz-center-head">
                    <span class="sp-pill-badge"><i class="fas fa-list-check"></i> Service Matrix</span>
                    <h2 class="sp-section-heading">Available Procedures by Clinic</h2>
                    <p class="service-hero-lead" style="margin-bottom:0">Review service capabilities across our Jaipur, Sikar and Ajmer facilities.</p>
                </div>
                <div class="kz-matrix-wrap">
                    <table class="kz-matrix-table">
                        <thead>
                            <tr>
                                <th>Clinical Service</th>
                                <th>Jaipur (Khatipura)</th>
                                <th>Sikar (Silver Jubilee Rd)</th>
                                <th>Ajmer (Shastri Nagar)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>Sapphire FUE Hair Transplant</strong></td>
                                <td><span class="kz-matrix-check"><i class="fas fa-check-circle"></i> In-House OT</span></td>
                                <td><span class="kz-matrix-check"><i class="fas fa-check-circle"></i> In-House OT</span></td>
                                <td><span class="kz-matrix-consult"><i class="fas fa-comments"></i> Consult &amp; Pre-Op</span></td>
                            </tr>
                            <tr>
                                <td><strong>DHI Direct Implantation</strong></td>
                                <td><span class="kz-matrix-check"><i class="fas fa-check-circle"></i> In-House OT</span></td>
                                <td><span class="kz-matrix-check"><i class="fas fa-check-circle"></i> In-House OT</span></td>
                                <td><span class="kz-matrix-consult"><i class="fas fa-comments"></i> Consult &amp; Pre-Op</span></td>
                            </tr>
                            <tr>
                                <td><strong>PRP &amp; GFC Follicular Therapy</strong></td>
                                <td><span class="kz-matrix-check"><i class="fas fa-check-circle"></i> Available Daily</span></td>
                                <td><span class="kz-matrix-check"><i class="fas fa-check-circle"></i> Available Daily</span></td>
                                <td><span class="kz-matrix-check"><i class="fas fa-check-circle"></i> Available Daily</span></td>
                            </tr>
                            <tr>
                                <td><strong>Triple-Wavelength Laser Hair Removal</strong></td>
                                <td><span class="kz-matrix-check"><i class="fas fa-check-circle"></i> Chill-Tip Suite</span></td>
                                <td><span class="kz-matrix-check"><i class="fas fa-check-circle"></i> Chill-Tip Suite</span></td>
                                <td><span class="kz-matrix-check"><i class="fas fa-check-circle"></i> Chill-Tip Suite</span></td>
                            </tr>
                            <tr>
                                <td><strong>Medical HydraFacials &amp; Glow Peels</strong></td>
                                <td><span class="kz-matrix-check"><i class="fas fa-check-circle"></i> Available Daily</span></td>
                                <td><span class="kz-matrix-check"><i class="fas fa-check-circle"></i> Available Daily</span></td>
                                <td><span class="kz-matrix-check"><i class="fas fa-check-circle"></i> Available Daily</span></td>
                            </tr>
                            <tr>
                                <td><strong>Permanent Makeup (PMU Brows &amp; Lips)</strong></td>
                                <td><span class="kz-matrix-check"><i class="fas fa-check-circle"></i> Dedicated Artist</span></td>
                                <td><span class="kz-matrix-consult"><i class="fas fa-calendar-alt"></i> Scheduled Days</span></td>
                                <td><span class="kz-matrix-check"><i class="fas fa-check-circle"></i> Available Daily</span></td>
                            </tr>
                            <tr>
                                <td><strong>Body Sculpting &amp; Cryolipolysis</strong></td>
                                <td><span class="kz-matrix-check"><i class="fas fa-check-circle"></i> In-House Suite</span></td>
                                <td><span class="kz-matrix-consult"><i class="fas fa-calendar-alt"></i> Scheduled Days</span></td>
                                <td><span class="kz-matrix-consult"><i class="fas fa-comments"></i> Consultation</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>

        <script>
        function filterClinics(city) {{
            document.querySelectorAll('.kz-filter-tab').forEach(function(t) {{ t.classList.remove('active'); }});
            var clickedTab = document.querySelector('.kz-filter-tab[data-city="' + city + '"]');
            if (clickedTab) clickedTab.classList.add('active');
            
            document.querySelectorAll('.kz-clinic-card').forEach(function(card) {{
                if (city === 'all' || card.getAttribute('data-city') === city) {{
                    card.style.display = 'flex';
                }} else {{
                    card.style.display = 'none';
                }}
            }});
        }}
        </script>
""" + faq_html(faqs, heading="Choosing a clinic", bg="sp-bg-light") + cta_band(
        "Not sure which clinic is right for you?",
        "Tell us your concern on WhatsApp and we will suggest the right doctor and the nearest clinic.")
    items = [{"@type": "ListItem", "position": i + 1, "item": {"@id": branch_id(k)}} for i, k in enumerate(DATA["branches"])]
    nodes = [org_node(), website_node(),
             webpage(url, title, desc, typ="CollectionPage", about=ORG_ID, image=f"{BASE}/images/og/locations.jpg",
                     extra={"mainEntity": {"@type": "ItemList", "itemListElement": items}}),
             breadcrumb(url, [("Home", "/"), ("Our Clinics", path)])]
    nodes += [branch_node(k, full=True) for k in DATA["branches"]]
    nodes.append(faq_node(url, faqs))
    write("locations/index.html", page(path, title, desc, "/images/og/locations.jpg", "Kezza clinics in Jaipur, Sikar and Ajmer",
                                       nodes, main, active_nav="/locations/"))


# ───────────────────────────── blog ─────────────────────────────
def load_articles():
    arts = []
    folder = os.path.join(ROOT, "tools", "content", "blog")
    for fn in sorted(os.listdir(folder)):
        if not fn.endswith(".html"):
            continue
        raw = open(os.path.join(folder, fn), encoding="utf-8").read()
        m = re.match(r"\s*<!--\s*(\{.*?\})\s*-->\s*(.*)$", raw, re.S)
        if not m:
            sys.exit(f"{fn}: missing JSON header comment")
        meta = json.loads(m.group(1))
        meta["body"] = m.group(2).strip()
        words = len(re.sub(r"<[^>]+>", " ", meta["body"]).split())
        meta["minutes"] = max(3, round(words / 200))
        meta["words"] = words
        arts.append(meta)
    arts.sort(key=lambda a: a.get("order", 99))
    return arts


def toc(body):
    heads = re.findall(r'<h2 id="([^"]+)">(.*?)</h2>', body)
    lis = "".join(f'<li><a href="#{i}">{t}</a></li>' for i, t in heads)
    return f'<nav class="kz-toc" aria-label="On this page"><strong>On this page</strong><ol>{lis}</ol></nav>'


def fmt_date(d):
    return datetime.date.fromisoformat(d).strftime("%-d %B %Y")


def build_article(a, arts):
    path = f"/blog/{a['slug']}/"
    url = f"{BASE}{path}"
    og = f"/images/og/{a['og']}.jpg"
    related = [x for x in arts if x["slug"] in a.get("related", [])]
    rel_html = "".join(f"""
                    <a class="kz-blog-card" href="/blog/{r['slug']}/">
                        <img src="/images/og/{r['og']}.jpg" alt="{E(r['h1'])}" width="1200" height="630" loading="lazy" decoding="async">
                        <div class="kz-card-body"><span class="kz-chip">{E(r['category'])}</span><h2>{E(r['h1'])}</h2></div>
                    </a>""" for r in related)
    takeaways = "".join(f"<li>{t}</li>" for t in a["takeaways"])
    sources = "".join(f'<li><a href="{s[1]}" target="_blank" rel="noopener noreferrer">{E(s[0])}</a></li>' for s in a["sources"])
    services = " · ".join(f'<a href="{s[1]}">{E(s[0])}</a>' for s in a.get("services", []))

    rev_id = a.get("reviewer")
    rev_data = DATA.get("people", {}).get(rev_id) if rev_id else None
    if rev_data:
        byline_rev = f'<span><i class="fas fa-user-md"></i>Medically reviewed by <a href="/about.html#{rev_id}">{E(rev_data["name"])}</a> ({E(rev_data["job_title"])})</span>'
    else:
        byline_rev = '<span><i class="fas fa-hospital"></i>By the Kezza Hair &amp; Skin Clinic team</span>'

    svcs = a.get("services", [])
    first_svc = svcs[0] if svcs else None
    bridge_btn = f'<a href="{first_svc[1]}" class="btn-call-action" style="padding:10px 18px;font-size:0.9rem"><i class="fas fa-arrow-right"></i> {E(first_svc[0])}</a>' if first_svc else ''
    wa_msg = quote(f"Hi Kezza Clinic, I was reading your guide on {a['h1']} and would like to ask a doctor some questions.")
    treatment_bridge = f"""
                    <div class="kz-treatment-bridge">
                        <span class="sp-pill-badge" style="font-size:0.75rem;padding:3px 10px"><i class="fas fa-stethoscope"></i> Clinical Guidance</span>
                        <h3>Considering clinical treatment?</h3>
                        <p>Our aesthetic physicians and surgeons provide personalized clinical assessments at our Jaipur, Sikar and Ajmer clinics.</p>
                        <div style="display:flex;flex-wrap:wrap;gap:10px">
                            {bridge_btn}
                            <a href="https://wa.me/919284517427?text={wa_msg}" target="_blank" rel="noopener noreferrer" class="btn-wa-action" style="padding:10px 18px;font-size:0.9rem"><i class="fab fa-whatsapp"></i> WhatsApp Doctor Inquiry</a>
                        </div>
                    </div>"""

    main = crumbs_html([("Home", "/index.html"), ("Blog", "/blog/"), (a["h1"], path)]) + f"""
        <header class="sp-section-pad kz-article-header sp-bg-white">
            <div class="sp-container">
                <div class="kz-article-head">
                    <span class="kz-chip">{E(a['category'])}</span>
                    <h1>{E(a['h1'])}</h1>
                    <p class="kz-dek">{a['dek']}</p>
                    <div class="kz-byline">
                        {byline_rev}
                        <span><i class="fas fa-calendar-alt"></i>Updated <time datetime="{a['modified']}">{fmt_date(a['modified'])}</time></span>
                        <span><i class="fas fa-clock"></i>{a['minutes']} min read</span>
                    </div>
                </div>
                <div class="kz-article-hero">
                    <img src="{og}" width="1200" height="630" fetchpriority="high" decoding="async" alt="{E(a['hero_alt'])}">
                </div>
            </div>
        </header>

        <section class="sp-section-pad kz-article-body-section sp-bg-white">
            <div class="sp-container">
                <article class="kz-article">
                    <div class="kz-takeaways"><h2>Key takeaways</h2><ul>{takeaways}</ul></div>
                    {toc(a['body'])}
{a['body']}

{treatment_bridge}

                    <h2 id="sources">Sources</h2>
                    <ol class="kz-sources">{sources}</ol>
                    <p class="kz-disclaimer">This article is general health information, not a diagnosis or a substitute for a consultation. Treatment suitability, number of sessions and results vary from person to person; please speak to a doctor about your own situation.</p>
                    <div class="kz-author-box">
                        <img src="/images/logo.png" alt="Kezza Hair &amp; Skin Clinic logo" width="297" height="200" loading="lazy">
                        <p><strong>Kezza Hair &amp; Skin Clinic</strong> is a doctor-led hair, skin and aesthetics clinic with branches in <a href="/locations/jaipur/">Jaipur</a>, <a href="/locations/sikar/">Sikar</a> and <a href="/locations/ajmer/">Ajmer</a>. Meet our <a href="/about.html#doctors">doctors</a>.{(' Related treatments: ' + services) if services else ''}</p>
                    </div>
                </article>
            </div>
        </section>
""" + faq_html(a["faqs"], bg="sp-bg-light") + (f"""
        <section class="sp-section-pad sp-bg-white" id="related">
            <div class="sp-container">
                <div class="kz-center-head"><span class="sp-pill-badge"><i class="fas fa-book-open"></i> Keep reading</span>
                    <h2 class="sp-section-heading">Related articles</h2></div>
                <div class="kz-blog-grid">{rel_html}
                </div>
            </div>
        </section>
""" if related else "") + cta_band(a.get("cta_title", "Talk to a Kezza doctor"),
                              "Get a personal assessment at our Jaipur, Sikar or Ajmer clinic. Open 9 AM – 8 PM, all 7 days.")

    posting = {"@type": "BlogPosting", "@id": f"{url}#article", "headline": a["h1"], "description": a["description"],
               "image": {"@type": "ImageObject", "url": f"{BASE}{og}", "width": 1200, "height": 630},
               "datePublished": a["published"], "dateModified": a["modified"],
               "author": {"@id": ORG_ID}, "publisher": {"@id": ORG_ID},
               "mainEntityOfPage": {"@id": f"{url}#webpage"}, "isPartOf": {"@id": f"{BASE}/blog/#blog"},
               "inLanguage": "en-IN", "wordCount": a["words"], "articleSection": a["category"],
               "keywords": a.get("keywords", []), "about": [{"@type": "Thing", "name": t} for t in a.get("about", [])],
               "citation": [{"@type": "CreativeWork", "name": s[0], "url": s[1]} for s in a["sources"]]}
    if rev_data:
        posting["reviewedBy"] = {"@type": "Person", "name": rev_data["name"], "jobTitle": rev_data["job_title"], "url": f"{BASE}/about.html#{rev_id}"}
    nodes = [org_node(), website_node(),
             webpage(url, a["title"], a["description"], about=f"{url}#article", image=f"{BASE}{og}", modified=a["modified"]),
             breadcrumb(url, [("Home", "/"), ("Blog", "/blog/"), (a["h1"], path)]), posting,
             faq_node(url, a["faqs"])]
    write(f"blog/{a['slug']}/index.html", page(path, a["title"], a["description"], og, a["hero_alt"], nodes, main, active_nav="/blog/"))


def build_blog_index(arts):
    path = "/blog/"
    url = f"{BASE}{path}"
    title = "Hair & Skin Blog: Guides From Kezza Clinic Doctors"
    desc = "Doctor-reviewed clinical guides on hair transplants, PRP therapy, acne scars, laser hair removal, cryolipolysis, and permanent makeup from Kezza Clinic."

    def cat_key(c):
        c = c.lower()
        if "transplant" in c: return "hair-transplant"
        if "hair loss" in c or "prp" in c: return "hair-loss"
        if "laser" in c or "white hair" in c: return "laser"
        if "skin" in c: return "skin"
        if "weight" in c or "body" in c: return "weight"
        if "makeup" in c or "pmu" in c: return "pmu"
        return "other"

    featured_slugs = ["fue-vs-dhi-hair-transplant", "acne-scars-treatment-options", "cryolipolysis-fat-freezing-guide"]
    featured_arts = [a for a in arts if a["slug"] in featured_slugs]
    featured_cards = "".join(f"""
                    <a class="kz-blog-card kz-blog-card-featured" href="/blog/{a['slug']}/" data-category="{cat_key(a['category'])}" data-search="{E((a['h1'] + ' ' + a['description'] + ' ' + a['category']).lower())}">
                        <span class="kz-featured-badge"><i class="fas fa-star"></i> Featured Guide</span>
                        <img src="/images/og/{a['og']}.jpg" alt="{E(a['hero_alt'] or a['h1'])}" width="1200" height="630" loading="eager" decoding="async">
                        <div class="kz-card-body">
                            <span class="kz-chip">{E(a['category'])}</span>
                            <h2>{E(a['h1'])}</h2>
                            <p class="kz-muted">{E(a['description'])}</p>
                            <div class="kz-card-meta">
                                <span class="kz-card-meta-left"><i class="fas fa-user-md" style="color:var(--sp-primary)"></i> Doctor Reviewed</span>
                                <span>{a['minutes']} min read</span>
                            </div>
                        </div>
                    </a>""" for a in featured_arts)

    cards = "".join(f"""
                    <a class="kz-blog-card" href="/blog/{a['slug']}/" data-category="{cat_key(a['category'])}" data-search="{E((a['h1'] + ' ' + a['description'] + ' ' + a['category'] + ' ' + ' '.join(a.get('keywords', []))).lower())}">
                        <img src="/images/og/{a['og']}.jpg" alt="{E(a['hero_alt'] or a['h1'])}" width="1200" height="630" loading="lazy" decoding="async">
                        <div class="kz-card-body">
                            <span class="kz-chip">{E(a['category'])}</span>
                            <h2>{E(a['h1'])}</h2>
                            <p class="kz-muted">{E(a['description'])}</p>
                            <div class="kz-card-meta">
                                <span class="kz-card-meta-left"><i class="fas fa-clock" style="color:var(--sp-primary)"></i> {a['minutes']} min read</span>
                                <span>{fmt_date(a['modified'])}</span>
                            </div>
                        </div>
                    </a>""" for a in arts)

    cats_count = {
        "all": len(arts),
        "hair-transplant": sum(1 for a in arts if cat_key(a["category"]) == "hair-transplant"),
        "hair-loss": sum(1 for a in arts if cat_key(a["category"]) == "hair-loss"),
        "skin": sum(1 for a in arts if cat_key(a["category"]) == "skin"),
        "laser": sum(1 for a in arts if cat_key(a["category"]) == "laser"),
        "weight": sum(1 for a in arts if cat_key(a["category"]) == "weight"),
        "pmu": sum(1 for a in arts if cat_key(a["category"]) == "pmu"),
    }

    blog_faqs = [
        ["Are Kezza's blog guides written and reviewed by real doctors?",
         "Yes. Every educational article is authored and medically reviewed by registered aesthetic physicians, hair transplant surgeons, and certified clinical specialists at Kezza Hair & Skin Clinic, using peer-reviewed dermatologic and surgical literature."],
        ["How do I determine which treatment is right for my hair or skin?",
         "Our clinical guides explain the scientific mechanisms, candidate criteria, and recovery expectations. However, because individual hair caliber, donor reserves, and skin types vary, a personalized examination with diagnostic trichoscopy or dermoscopy is always recommended."],
        ["Can I book a consultation after reading a guide?",
         "Yes. Every guide connects directly to our consultation coordinators via WhatsApp or phone (+91-9284517427), allowing you to schedule an evaluation at our Jaipur, Sikar, or Ajmer branches."],
        ["Where are Kezza clinic branches located in Rajasthan?",
         "Kezza operates full-service medical centers in Jaipur (Khatipura), Sikar (Silver Jubilee Road), and Ajmer (Oasis Complex, Shastri Nagar). All branches are open from 9 AM to 8 PM, all 7 days a week."]
    ]

    main = crumbs_html([("Home", "/index.html"), ("Blog", path)]) + f"""
        <header class="service-hero-section kz-blog-hero">
            <div class="sp-container">
                <div class="kz-center-head">
                    <span class="sp-pill-badge"><i class="fas fa-book-medical"></i> Evidence-Informed Medical Guides</span>
                    <h1 class="sp-section-heading">Hair &amp; Skin Answers From Our Doctors</h1>
                    <p class="service-hero-lead">Straight, evidence-backed answers to the questions patients ask us most, with peer-reviewed medical sources you can check.</p>

                    <div class="kz-blog-search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" id="kzBlogSearch" placeholder="Search guides by treatment, symptom or keyword..." aria-label="Search clinical guides">
                        <button type="button" id="kzSearchClear" aria-label="Clear search" style="display:none">&times;</button>
                    </div>

                    <div class="kz-topic-pills-wrap">
                        <div class="kz-topic-pills" role="tablist">
                            <button type="button" class="kz-topic-pill active" data-filter="all"><i class="fas fa-th-large"></i> All Guides <span class="count">{cats_count['all']}</span></button>
                            <button type="button" class="kz-topic-pill" data-filter="hair-transplant"><i class="fas fa-user-md"></i> Hair Transplant <span class="count">{cats_count['hair-transplant']}</span></button>
                            <button type="button" class="kz-topic-pill" data-filter="hair-loss"><i class="fas fa-vial"></i> Hair Loss &amp; PRP <span class="count">{cats_count['hair-loss']}</span></button>
                            <button type="button" class="kz-topic-pill" data-filter="skin"><i class="fas fa-sparkles"></i> Skin &amp; Peels <span class="count">{cats_count['skin']}</span></button>
                            <button type="button" class="kz-topic-pill" data-filter="laser"><i class="fas fa-bolt"></i> Laser Treatments <span class="count">{cats_count['laser']}</span></button>
                            <button type="button" class="kz-topic-pill" data-filter="weight"><i class="fas fa-weight"></i> Weight &amp; Contouring <span class="count">{cats_count['weight']}</span></button>
                            <button type="button" class="kz-topic-pill" data-filter="pmu"><i class="fas fa-paint-brush"></i> Permanent Makeup <span class="count">{cats_count['pmu']}</span></button>
                        </div>
                    </div>
                </div>
            </div>
        </header>

        <section class="sp-section-pad kz-blog-section sp-bg-white" id="featuredGuides">
            <div class="sp-container">
                <div class="kz-featured-section">
                    <div class="kz-center-head">
                        <span class="sp-pill-badge"><i class="fas fa-bookmark"></i> Flagship Resources</span>
                        <h2 class="sp-section-heading" style="font-size:clamp(1.5rem,2.5vw,2rem)">Featured Clinical Guides</h2>
                        <p style="margin:4px 0 0;font-size:0.94rem;color:var(--sp-slate-muted)">Core patient guides explaining essential procedure decisions, scientific mechanisms, and treatment costs.</p>
                    </div>
                    <div class="kz-featured-grid">
                        {featured_cards}
                    </div>
                </div>
            </div>
        </section>

        <section class="sp-section-pad kz-blog-section sp-bg-light" id="articles">
            <div class="sp-container">
                <div class="kz-center-head">
                    <span class="sp-pill-badge"><i class="fas fa-layer-group"></i> Knowledge Base</span>
                    <h2 class="sp-section-heading" id="gridTitle" style="font-size:clamp(1.5rem,2.5vw,2rem)">All Clinical Guides ({len(arts)})</h2>
                    <p id="noMatchesNotice" style="display:none;margin-top:14px;color:var(--sp-slate-muted);font-size:1rem">No articles match your search query. Try another keyword or reset the filter.</p>
                </div>
                <div class="kz-blog-grid" id="blogGrid">
                    {cards}
                </div>
            </div>
        </section>
""" + faq_html(blog_faqs, bg="sp-bg-white kz-blog-faq") + f"""
        <script>
        (function() {{
            var searchInput = document.getElementById('kzBlogSearch');
            var clearBtn = document.getElementById('kzSearchClear');
            var pills = document.querySelectorAll('.kz-topic-pill');
            var cards = document.querySelectorAll('#blogGrid .kz-blog-card');
            var featSection = document.getElementById('featuredGuides');
            var noMatches = document.getElementById('noMatchesNotice');
            var gridTitle = document.getElementById('gridTitle');
            var currentCategory = 'all';

            function filterArticles() {{
                var q = (searchInput.value || '').trim().toLowerCase();
                if (clearBtn) clearBtn.style.display = q ? 'block' : 'none';
                if (featSection) {{
                    featSection.style.display = (q || currentCategory !== 'all') ? 'none' : 'block';
                }}
                var visibleCount = 0;
                cards.forEach(function(card) {{
                    var cat = card.getAttribute('data-category');
                    var text = card.getAttribute('data-search') || '';
                    var matchesCat = (currentCategory === 'all' || cat === currentCategory);
                    var matchesQuery = (!q || text.indexOf(q) !== -1);
                    if (matchesCat && matchesQuery) {{
                        card.style.display = 'flex';
                        visibleCount++;
                    }} else {{
                        card.style.display = 'none';
                    }}
                }});
                if (noMatches) {{
                    noMatches.style.display = visibleCount === 0 ? 'block' : 'none';
                }}
                if (gridTitle) {{
                    gridTitle.textContent = currentCategory === 'all' && !q ? 'All Clinical Guides (' + cards.length + ')' : 'Matching Guides (' + visibleCount + ')';
                }}
            }}

            pills.forEach(function(pill) {{
                pill.addEventListener('click', function() {{
                    pills.forEach(function(p) {{ p.classList.remove('active'); }});
                    pill.classList.add('active');
                    currentCategory = pill.getAttribute('data-filter') || 'all';
                    filterArticles();
                }});
            }});

            if (searchInput) {{
                searchInput.addEventListener('input', filterArticles);
            }}
            if (clearBtn) {{
                clearBtn.addEventListener('click', function() {{
                    searchInput.value = '';
                    filterArticles();
                    searchInput.focus();
                }});
            }}
        }})();
        </script>
""" + cta_band("Have a question we haven't answered?", "Message our team on WhatsApp and a doctor will guide you.")
    blog = {"@type": "Blog", "@id": f"{url}#blog", "name": "Kezza Hair & Skin Clinic Blog", "url": url,
            "publisher": {"@id": ORG_ID}, "inLanguage": "en-IN",
            "blogPost": [{"@id": f"{BASE}/blog/{a['slug']}/#article"} for a in arts]}
    nodes = [org_node(), website_node(),
             webpage(url, title, desc, typ="CollectionPage", about=f"{url}#blog", image=f"{BASE}/images/og/blog.jpg"),
             breadcrumb(url, [("Home", "/"), ("Blog", path)]), blog,
             faq_node(url, blog_faqs)]
    write("blog/index.html", page(path, title, desc, "/images/og/blog.jpg", "Kezza Hair & Skin Clinic blog", nodes, main, active_nav="/blog/"))


# ───────────────────────────── treatment pages ─────────────────────────────
# Source files: tools/content/pages/*.html = a JSON header (hero, sections, FAQs, reviewer…) in an HTML
# comment, followed by the HTML of the long-form "details" section. Built with the same components as
# frontend/hair-transplant/index.html (service-page.css) plus the content-pages.css kit.
SVG = {  # inline icon paths, same set as the hair-transplant page
    "check": "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
    "plus": "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z",
    "shield": "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z",
    "clock": "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z",
    "face": "M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 20.3a1 1 0 0 0 1.35 1.35l2.69-.62C9.93 22.26 11.88 23 14 23c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 15c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z",
    "people": "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
}

# Fixed interface words for each language used by treatment pages
UI = {
    "en-IN": {"wa": "Book Consultation on WhatsApp", "call": "Call Now", "reviewed": "Medically reviewed by",
              "last": "Last reviewed", "where_badge": "Where", "faq_badge": "FAQs", "faq_h2": "Frequently Asked Questions",
              "related_badge": "Related", "related_h2": "Related Treatments", "more": "Learn More",
              "cta_wa": "Book on WhatsApp", "cta_call": "Call", "in_short": "In Short:", "note": "Medical Note:",
              "disclaimer": "Results vary from person to person. This page is general information from Kezza Hair &amp; Skin Clinic and is not a substitute for a consultation with a doctor.",
              "clinic": "Kezza"},
    "hi-IN": {"wa": "WhatsApp पर परामर्श बुक करें", "call": "कॉल करें", "reviewed": "चिकित्सकीय समीक्षा:",
              "last": "अंतिम समीक्षा", "where_badge": "क्लिनिक", "faq_badge": "सवाल-जवाब", "faq_h2": "अक्सर पूछे जाने वाले सवाल",
              "related_badge": "और जानें", "related_h2": "संबंधित उपचार", "more": "और पढ़ें",
              "cta_wa": "WhatsApp पर बुक करें", "cta_call": "कॉल करें", "in_short": "संक्षेप में:", "note": "चिकित्सकीय नोट:",
              "disclaimer": "परिणाम हर व्यक्ति में अलग होते हैं। यह पेज केज़ा हेयर एंड स्किन क्लिनिक की सामान्य जानकारी है; यह डॉक्टर से परामर्श का विकल्प नहीं है।",
              "clinic": "केज़ा"},
}


def picture(img, eager=False, sizes=None):
    """<picture> for an image dict {src, webp?, w, h, alt}; webp is optional."""
    sz = f' sizes="{sizes}"' if sizes else ""
    webp = f'\n                                <source type="image/webp" srcset="{img["webp"]} {img["w"]}w"{sz}>' if img.get("webp") else ""
    load = 'fetchpriority="high" decoding="async"' if eager else 'loading="lazy" decoding="async"'
    return (f'<picture>{webp}\n                                <img src="{img["src"]}" width="{img["w"]}" height="{img["h"]}" {load}'
            f'\n                                     alt="{E(img["alt"])}">\n                            </picture>')


def head_block(badge, icon, h2, sub=None):
    s = f'\n                    <p class="sp-section-subhead">{sub}</p>' if sub else ""
    return (f'                <div class="kz-center-head">\n                    <span class="sp-pill-badge"><i class="fas {icon}"></i> {badge}</span>\n'
            f'                    <h2 class="sp-section-heading">{h2}</h2>{s}\n                </div>\n')


def svc_hero(p, ui):
    chips = "".join(f'\n                            <span class="chip {"chip-clinical" if i == 0 else "chip-network"}"><i class="fas {c[0]}"></i> {c[1]}</span>'
                    for i, c in enumerate(p["chips"]))
    span = f' <span>{p["h1_span"]}</span>' if p.get("h1_span") else ""
    note = f'\n                        <p class="kz-note">{p["hero_note"]}</p>' if p.get("hero_note") else ""
    wa = quote(p["wa_text"])
    return f"""
        <header class="service-hero-section">
            <div class="sp-container">
                <div class="service-hero-grid">
                    <div class="service-hero-content">
                        <div class="hero-trust-chips">{chips}
                        </div>
                        <h1>{p['h1']}{span}</h1>
                        <p class="service-hero-lead">{p['lead']}</p>
                        <div class="service-hero-ctas">
                            <a href="https://wa.me/919284517427?text={wa}" target="_blank" rel="noopener noreferrer" class="btn-wa-action">
                                <i class="fab fa-whatsapp"></i> {ui['wa']}
                            </a>
                            <a href="tel:+919284517427" class="btn-call-action">
                                <i class="fas fa-phone-alt"></i> {ui['call']}: 9284517427
                            </a>
                        </div>{note}
                    </div>
                    <div class="service-hero-image-wrap">
                            {picture(p['hero_image'], eager=True, sizes="(max-width: 768px) 100vw, 600px")}
                    </div>
                </div>
            </div>
        </header>
"""


def svc_reviewer(p, ui):
    k = p["reviewer"]
    d = DATA["people"][k]
    when = fmt_date(p["reviewed"]) if p["lang"] == "en-IN" else p.get("reviewed_label", p["reviewed"])
    name = p.get("reviewer_name", d["name"])
    job = p.get("reviewer_title", d["job_title"])
    return f"""
        <div class="kz-review-wrap">
            <div class="sp-container">
                <div class="kz-review-strip">
                    <img src="{d['image']}" alt="{E(d['name'])}" width="600" height="400" loading="lazy" decoding="async">
                    <p>{p.get('reviewer_label', ui['reviewed'])} <a href="/about.html#{k}">{E(name)}</a>, {E(job)} <span class="kz-review-date">· {ui['last']} <time datetime="{p['reviewed']}">{when}</time></span></p>
                </div>
            </div>
        </div>
"""


def svc_explainer(x, ui, bg):
    paras = "".join(f"\n                        <p>{t}</p>" for t in x["paras"])
    lis = "".join(f'\n                                <li><i class="fas fa-check-circle"></i> <span><strong>{a}:</strong> {b}</span></li>' for a, b in x.get("in_short", []))
    box = (f'\n                        <div class="explainer-in-short">\n                            <h3>{x.get("in_short_title", ui["in_short"])}</h3>'
           f'\n                            <ul>{lis}\n                            </ul>\n                        </div>') if lis else ""
    media = (f'\n                    <div class="explainer-media">\n                            {picture(x["image"], sizes="(max-width: 768px) 100vw, 500px")}\n                    </div>') if x.get("image") else ""
    single = "" if media else ' style="grid-template-columns:1fr;max-width:860px;margin:0 auto"'
    return f"""
        <section class="sp-section-pad {bg}" id="what-is">
            <div class="sp-container">
                <div class="explainer-grid"{single}>
                    <div class="explainer-text">
                        <span class="sp-pill-badge"><i class="fas {x.get('icon', 'fa-microscope')}"></i> {x['badge']}</span>
                        <h2>{x['h2']}</h2>{paras}{box}
                    </div>{media}
                </div>
            </div>
        </section>
"""


def svc_candidacy(c, bg):
    ok = "".join(f'\n                            <li><i class="fas fa-check-circle"></i> <span>{t}</span></li>' for t in c["suited"])
    no = "".join(f'\n                            <li><i class="fas fa-times-circle"></i> <span>{t}</span></li>' for t in c["not_suited"])
    note = f'\n                        <p class="candidacy-note">{c["note"]}</p>' if c.get("note") else ""
    return f"""
        <section class="sp-section-pad {bg}" id="candidacy">
            <div class="sp-container">
{head_block(c['badge'], 'fa-user-check', c['h2'], c.get('sub'))}                <div class="candidacy-grid">
                    <div class="candidacy-card suited">
                        <h3><i class="fas fa-check-circle"></i> {c['suited_title']}</h3>
                        <ul class="candidacy-list">{ok}
                        </ul>
                    </div>
                    <div class="candidacy-card not-suited">
                        <h3><i class="fas fa-exclamation-circle"></i> {c['not_suited_title']}</h3>
                        <ul class="candidacy-list">{no}
                        </ul>{note}
                    </div>
                </div>
            </div>
        </section>
"""


def svc_cards(c, bg):
    cards = "".join(f"""
                    <div class="benefit-card">
                        <div class="benefit-icon-box" aria-hidden="true">
                            <svg viewBox="0 0 24 24"><path d="{SVG[i]}"/></svg>
                        </div>
                        <h3>{t}</h3>
                        <p>{d}</p>
                    </div>""" for i, t, d in c["items"])
    return f"""
        <section class="sp-section-pad {bg}" id="benefits">
            <div class="sp-container">
{head_block(c['badge'], c.get('icon', 'fa-award'), c['h2'], c.get('sub'))}                <div class="benefits-grid">{cards}
                </div>
            </div>
        </section>
"""


def svc_steps(s, bg):
    if all(len(it) > 2 and it[2] for it in s["items"]):
        cards = "".join(f"""
                    <div class="procedure-step-card">
                        <div class="procedure-img-box">
                            <span class="step-number-badge">{n:02d}</span>
                            {picture(it[2])}
                        </div>
                        <div class="step-card-body">
                            <h3>{it[0]}</h3>
                            <p>{it[1]}</p>
                        </div>
                    </div>""" for n, it in enumerate(s["items"], 1))
        grid = f'                <div class="procedure-steps-grid">{cards}\n                </div>\n'
    else:
        items = "".join(f"""
                    <div class="why-point-item">
                        <div class="why-point-num">{n:02d}</div>
                        <div class="why-point-text">
                            <h3>{it[0]}</h3>
                            <p>{it[1]}</p>
                        </div>
                    </div>""" for n, it in enumerate(s["items"], 1))
        grid = f'                <div class="why-points-list kz-steps-list">{items}\n                </div>\n'
    return f"""
        <section class="sp-section-pad {bg}" id="procedure-steps">
            <div class="sp-container">
{head_block(s['badge'], s.get('icon', 'fa-cogs'), s['h2'], s.get('sub'))}{grid}            </div>
        </section>
"""


def svc_timeline(t, ui, bg):
    items = "".join(f"""
                    <div class="timeline-milestone">
                        <div class="milestone-marker">{m}</div>
                        <div class="milestone-card">
                            <h3>{h}</h3>
                            <p>{d}</p>
                        </div>
                    </div>""" for m, h, d in t["items"])
    return f"""
        <section class="sp-section-pad {bg}" id="timeline">
            <div class="sp-container">
{head_block(t['badge'], 'fa-calendar-alt', t['h2'], t.get('sub'))}                <div class="timeline-track-wrap">{items}
                </div>
                <div class="medical-disclaimer-box">
                    <i class="fas fa-info-circle"></i>
                    <div>
                        <strong>{ui['note']}</strong> {ui['disclaimer']}
                    </div>
                </div>
            </div>
        </section>
"""


def svc_details(body, bg):
    return f"""
        <section class="sp-section-pad {bg}" id="details">
            <div class="sp-container">
                <article class="kz-article">
{body}
                </article>
            </div>
        </section>
"""


def svc_where(p, ui, bg):
    w = p["where"]
    items = "".join(f'\n                    <li><a href="/locations/{k}/"><i class="fas fa-map-marker-alt" aria-hidden="true"></i> '
                    f'{ui["clinic"]} {E(w.get("names", {}).get(k, DATA["branches"][k]["city"]))} · {E(w.get("labels", {}).get(k, DATA["branches"][k]["label"].split("·")[-1].strip()))}</a></li>'
                    for k in w["clinics"])
    return f"""
        <section class="sp-section-pad {bg}" id="where">
            <div class="sp-container">
{head_block(ui['where_badge'], 'fa-map-marker-alt', w['h2'], w.get('sub'))}                <ul class="kz-treat-list">{items}
                </ul>
                <p class="kz-note">{w['note']}</p>
            </div>
        </section>
"""


def svc_related(items, ui, bg, heading=None):
    cards = "".join(f"""
                    <a href="{r['href']}" class="related-service-card">
                        <div class="related-thumb-box">
                            {picture(r['image'])}
                        </div>
                        <div class="related-body">
                            <h3>{r['title']}</h3>
                            <p>{r['text']}</p>
                            <span class="related-link-text">{ui['more']} <i class="fas fa-arrow-right"></i></span>
                        </div>
                    </a>""" for r in items)
    return f"""
        <section class="sp-section-pad {bg}" id="related">
            <div class="sp-container">
{head_block(ui['related_badge'], 'fa-th-large', heading or ui['related_h2'])}                <div class="related-services-grid">{cards}
                </div>
            </div>
        </section>
"""


def load_pages():
    """Every page file in tools/content/pages/, merged with its registry entry in tools/seo/taxonomy.json."""
    pages = []
    folder = os.path.join(ROOT, "tools", "content", "pages")
    if not os.path.isdir(folder):
        return pages
    for fn in sorted(os.listdir(folder)):
        if not fn.endswith(".html"):
            continue
        raw = open(os.path.join(folder, fn), encoding="utf-8").read()
        m = re.match(r"\s*<!--\s*(\{.*?\})\s*-->\s*(.*)$", raw, re.S)
        if not m:
            sys.exit(f"{fn}: missing JSON header comment")
        try:
            meta = json.loads(m.group(1))
        except json.JSONDecodeError as e:
            sys.exit(f"{fn}: JSON header does not parse: {e}")
        reg = pseo.entry_for_source(fn)
        if not reg:
            sys.exit(f"{fn}: not registered in tools/seo/taxonomy.json (add a treatment with \"source\" pointing to it)")
        meta["body"] = m.group(2).strip()
        meta["id"], meta["file"] = reg["id"], fn
        meta.setdefault("path", reg["url"])
        meta.setdefault("lang", reg.get("lang", "en-IN"))
        meta.setdefault("status", "review")            # safe default: nothing goes live without approval
        if meta["status"] not in pseo.STATUSES:
            sys.exit(f"{fn}: status must be one of {', '.join(pseo.STATUSES)}")
        pages.append(meta)
    pages.sort(key=lambda x: x.get("order", 99))
    return pages


def nav_for_service(href):
    """Main nav with the Services toggle and this page's sub-link marked active."""
    nav = NAV.replace(' class="services-nav-toggle"', ' class="services-nav-toggle active"', 1)
    return re.sub(r'(<a href="' + re.escape(href) + r'"[^>]*class="services-sub-link)"', r'\1 active"', nav, count=1)


def related_cards(p, resolver):
    """Legacy hand-written cards are kept (dropping any whose page is not live); otherwise the registry rules pick them."""
    rel = p.get("related")
    if rel and isinstance(rel[0], dict) and "href" in rel[0]:
        keep = []
        for c in rel:
            target = next((t for t in pseo.TREAT.values() if t["url"] == c["href"].split("#")[0]), None)
            if not target or resolver.live(target["id"]):
                keep.append(c)
        return keep
    ids = [r for r in (rel or []) if isinstance(r, str) and resolver.live(r)] or resolver.related(p["id"])
    return [resolver.card(i) for i in ids]


def further_reading(p, resolver):
    """Links to the registry's supporting blog articles that the page does not already link to."""
    arts = []
    for slug in pseo.TREAT[p["id"]].get("articles", []):
        href = f"/blog/{slug}/"
        if href in p["body"] or href in json.dumps(p.get("faqs", [])):
            continue
        if os.path.exists(os.path.join(FE, "blog", slug, "index.html")):
            title = re.search(r"<h1>(.*?)</h1>", open(os.path.join(FE, "blog", slug, "index.html"), encoding="utf-8").read(), re.S)
            arts.append((href, strip_html(title.group(1)) if title else slug))
    if not arts:
        return ""
    lis = "".join(f'<li><a href="{h}">{E(t)}</a></li>' for h, t in arts)
    return f'\n<h2 id="further-reading">Further reading</h2>\n<ul>{lis}</ul>'


def strip_html(s):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", s))).strip()


def build_service(p, resolver, eff):
    path = p["path"]
    url = f"{BASE}{path}"
    ui = UI[p["lang"]]
    og = p["og"]
    live = eff == "published"
    trail = [tuple(c) for c in p["breadcrumb"]] if p.get("breadcrumb") else pseo.breadcrumb_for(p["id"])
    parts = [crumbs_html(trail), svc_hero(p, ui)]
    if live and p.get("reviewer") and p.get("reviewed"):
        parts.append(svc_reviewer(p, ui))
    where = dict(p.get("where") or {})
    if where:
        where.setdefault("clinics", pseo.TREAT[p["id"]].get("locations", []))
    body = p["body"]
    if body:
        extra = further_reading(p, resolver)
        if extra:
            idx = body.find('<h2 id="sources">')
            body = body[:idx] + extra.lstrip("\n") + "\n\n" + body[idx:] if idx >= 0 else body + extra
    cards = related_cards(p, resolver)
    bgs = ["sp-bg-white", "sp-bg-light"]
    order = p.get("sections", ["explainer", "cards", "candidacy", "steps", "timeline", "details", "where", "faqs", "related"])
    n = 0
    for sec in order:
        bg = bgs[n % 2]
        if sec == "explainer" and p.get("explainer"):
            parts.append(svc_explainer(p["explainer"], ui, bg))
        elif sec == "candidacy" and p.get("candidacy"):
            parts.append(svc_candidacy(p["candidacy"], bg))
        elif sec == "cards" and p.get("cards"):
            parts.append(svc_cards(p["cards"], bg))
        elif sec == "steps" and p.get("steps"):
            parts.append(svc_steps(p["steps"], bg))
        elif sec == "timeline" and p.get("timeline"):
            parts.append(svc_timeline(p["timeline"], ui, bg))
        elif sec == "details" and body:
            parts.append(svc_details(body, bg))
        elif sec == "where" and where:
            parts.append(svc_where(dict(p, where=where), ui, bg))
        elif sec == "faqs" and p.get("faqs"):
            parts.append(faq_html(p["faqs"], heading=p.get("faq_h2", ui["faq_h2"]), bg=bg, badge=ui["faq_badge"]))
        elif sec == "related" and cards:
            parts.append(svc_related(cards, ui, bg, p.get("related_h2")))
        else:
            continue
        n += 1
    parts.append(cta_band(p["cta"][0], p["cta"][1], wa_text=p["wa_text"], wa_label=ui["cta_wa"], call_word=ui["cta_call"]))
    main = "".join(parts)

    proc = p["procedure"]
    kind = proc.get("schema_type", "MedicalProcedure")
    entity = {"@type": kind, "@id": f"{url}#procedure", "name": proc["name"], "url": url, "description": p["description"]}
    if kind == "MedicalProcedure":
        entity["procedureType"] = f"https://schema.org/{proc['type']}"
        for key in ("alternateName", "bodyLocation", "howPerformed", "preparation", "followup"):
            if proc.get(key):
                entity[key] = proc[key]
    elif kind == "MedicalTherapy":
        for key in ("alternateName",):
            if proc.get(key):
                entity[key] = proc[key]
    else:  # Service (e.g. permanent makeup, which is cosmetic, not a medical procedure)
        entity.update({"serviceType": proc.get("serviceType", proc["name"]), "provider": {"@id": ORG_ID},
                       "areaServed": [{"@type": "City", "name": DATA["branches"][k]["city"]}
                                      for k in pseo.TREAT[p["id"]].get("locations", [])]})
        if proc.get("alternateName"):
            entity["alternateName"] = proc["alternateName"]
    extra = {"mainEntity": {"@id": f"{url}#procedure"}, "inLanguage": p["lang"]}
    if kind != "Service":
        extra["specialty"] = f"https://schema.org/{proc.get('specialty', 'Dermatology')}"
    if live and p.get("reviewer") and p.get("reviewed"):
        extra.update({"reviewedBy": {"@id": person_id(p["reviewer"])}, "lastReviewed": p["reviewed"]})
    crumbs = [(c[0], c[1] if c[1] != "/index.html" else "/") for c in trail]
    nodes = [org_node(), website_node(),
             webpage(url, p["title"], p["description"], typ="WebPage" if kind == "Service" else "MedicalWebPage",
                     about=f"{url}#procedure", image=f"{BASE}{og}", extra=extra),
             breadcrumb(url, crumbs), entity]
    if live and p.get("reviewer") and p.get("reviewed"):
        nodes.append(person_node(p["reviewer"]))
    if p.get("faqs"):
        nodes.append(faq_node(url, p["faqs"]))
    rel = path.strip("/") + "/index.html"
    out = page(path, p["title"], p["description"], og, p["og_alt"], nodes, main,
               preload=p["hero_image"]["src"], lang=p["lang"], alternates=p.get("alternates"),
               nav_html=nav_for_service(p.get("nav_href", path)),
               robots=pseo.INDEX_ROBOTS if live else pseo.NOINDEX_ROBOTS)
    if p["lang"] != "en-IN":  # the shared header and footer stay in English
        out = out.replace('<nav class="navbar">', '<nav class="navbar" lang="en-IN">', 1)
        out = out.replace('<footer class="footer">', '<footer class="footer" lang="en-IN">', 1)
    write(rel, out, live=live)   # pages still in review keep their links to other review pages for previewing


def write_gate_report(pages, gates, eff):
    """docs/pseo/quality-gates.md (+ .json): every generated page, its status and what still needs a human."""
    rows, js = [], []
    for p in pages:
        g = gates.get(p["id"], [])
        crit = [m for lv, m in g if lv == "critical"]
        warn = [m for lv, m in g if lv == "warning"]
        rev = [m for lv, m in g if lv == "review"]
        js.append({"id": p["id"], "url": p["path"], "status": p["status"], "effective": eff[p["id"]],
                   "reviewer": p.get("reviewer", ""), "reviewed": p.get("reviewed", ""),
                   "critical": crit, "warnings": warn, "needs_human_review": rev})
        rows.append(f"| `{p['path']}` | {p['status']} | **{eff[p['id']]}** | {'indexable' if eff[p['id']] == 'published' else 'noindex'} | "
                    f"{len(crit)} | {len(warn)} | {len(rev)} |")
    md = ["# Quality gates for generated treatment pages", "",
          "Written by `tools/content/build_content_pages.py` on every build. A page is indexable only when its status is "
          "`published`, a reviewer and review date are recorded, and no critical check fails. Status and reviewer are set "
          "in the page's file in `tools/content/pages/`.", "",
          "| Page | Status in file | Effective | Robots | Critical | Warnings | For the reviewer |",
          "| --- | --- | --- | --- | --- | --- | --- |"] + rows
    for x in js:
        md += ["", f"## {x['url']} — {x['effective']}", ""]
        md += [f"- **Critical:** {m}" for m in x["critical"]]
        md += [f"- Warning: {m}" for m in x["warnings"]]
        md += [f"- To confirm before approval: {m}" for m in x["needs_human_review"]]
        if not (x["critical"] or x["warnings"] or x["needs_human_review"]):
            md.append("- All checks passed.")
    os.makedirs(os.path.join(ROOT, "docs", "pseo"), exist_ok=True)
    open(os.path.join(ROOT, "docs", "pseo", "quality-gates.md"), "w", encoding="utf-8").write("\n".join(md) + "\n")
    json.dump(js, open(os.path.join(ROOT, "docs", "pseo", "quality-gates.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)


# ───────────────────────────── sitemap + llms.txt ─────────────────────────────
HUBS = (("hair", "hub-hair"), ("skin", "hub-skin"), ("weight-loss", "hub-weight"), ("pmu", "hub-pmu"))


def static_sitemap_entries():
    """Hand-built pages in a stable order (home, about, each category hub followed by its hand-built treatment
    pages, then the rest), taken from tools/seo/taxonomy.json."""
    reg = pseo.REGPAGES
    out = [reg["home"], reg["about"]]
    for cat, hub in HUBS:
        out.append(reg[hub])
        out += [t for t in pseo.TAX["treatments"]
                if t.get("category") == cat and t.get("type") == "static" and t.get("status") == "published"]
    out += [reg[k] for k in ("face-scanner", "contact", "franchise", "terms")]
    return [(e["url"], e["file"], e.get("og")) for e in out]


def lastmod(rel_file):
    """Last commit date of the file; today if it has uncommitted changes or git isn't available."""
    f = os.path.join("frontend", rel_file)
    try:
        dirty = subprocess.run(["git", "status", "--porcelain", "--", f], cwd=ROOT, capture_output=True, text=True, timeout=10).stdout.strip()
        if dirty:
            return TODAY
        d = subprocess.run(["git", "log", "-1", "--format=%cs", "--", f], cwd=ROOT, capture_output=True, text=True, timeout=10).stdout.strip()
        return d or TODAY
    except Exception:
        return TODAY


def build_sitemap(arts, pages, eff):
    """Only canonical, indexable pages: hand-built pages from the registry, generated pages that are
    published and pass every gate, clinic pages and blog articles."""
    entries = static_sitemap_entries()
    for p in pages:
        if eff[p["id"]] == "published":
            entries.append((p["path"], p["path"].strip("/") + "/index.html", p["og"]))
    entries.append(("/locations/", "locations/index.html", "/images/og/locations.jpg"))
    for k, b in DATA["branches"].items():
        entries.append((f"/locations/{k}/", f"locations/{k}/index.html", b["og_image"]))
    entries.append(("/blog/", "blog/index.html", "/images/og/blog.jpg"))
    for a in arts:
        entries.append((f"/blog/{a['slug']}/", f"blog/{a['slug']}/index.html", f"/images/og/{a['og']}.jpg"))
    rows = []
    for path, rel, img in entries:
        assert os.path.exists(os.path.join(FE, rel)), rel
        img_xml = f"\n    <image:image><image:loc>{BASE}{img}</image:loc></image:image>" if img else ""
        rows.append(f"  <url>\n    <loc>{BASE}{path}</loc>\n    <lastmod>{lastmod(rel)}</lastmod>{img_xml}\n  </url>")
    xml = ('<?xml version="1.0" encoding="UTF-8"?>\n'
           '<!-- Generated by tools/content/build_content_pages.py. lastmod = last git commit of each page. -->\n'
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n'
           '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n'
           + "\n".join(rows) + "\n</urlset>\n")
    write("sitemap.xml", xml)


def build_llms(arts, resolver):
    o = DATA["organization"]
    br = DATA["branches"]
    ppl = DATA["people"]
    lines = [
        "# Kezza Hair & Skin Clinic",
        "",
        "> Doctor-led hair restoration, skin and laser care, permanent makeup and non-surgical body contouring clinic in Rajasthan, India, "
        "with three clinics: Jaipur (Khatipura, flagship), Sikar and Ajmer. All clinics are open 9 AM to 8 PM, all 7 days.",
        "",
        f"Official website: {BASE}/ · Main phone and WhatsApp: {pretty_phone(o['telephone'])} · Email: {o['email']} · "
        f"Legal name: {o['legal_name']} · Founder and managing director: {ppl['pawan-bhalothia']['name']}.",
        "Instagram: https://www.instagram.com/kezza_clinic · Facebook: https://www.facebook.com/kezzaclinic · YouTube: https://www.youtube.com/@Kezza_Clinic_Jaipur",
        "",
        "## Clinics",
    ]
    for k, b in br.items():
        docs = ", ".join(ppl[d]["name"] for d in b["doctors"])
        lines.append(f"- [Kezza {b['city']}]({BASE}/locations/{k}/): {b['display_address']}. Phone {', '.join(pretty_phone(p) for p in b['phones'])}. "
                     f"Open 9 AM–8 PM daily. Doctors: {docs}. Directions: {b['map']}")
    reg = pseo.REGPAGES
    for cat, hub in HUBS:
        h = reg[hub]
        lines += ["", f"## {pseo.CATS[cat]['name']} treatments", f"- [{h['name']}]({BASE}{h['url']}): {h['llms']}"]
        for t in pseo.TAX["treatments"]:
            if t.get("category") == cat and t.get("type") in ("static", "generated") and t.get("llms") and resolver.live(t["id"]):
                lines.append(f"- [{t['name']}]({BASE}{t['url']}): {t['llms']}")
    sc = reg["face-scanner"]
    lines += ["", "## Tools", f"- [{sc['name']}]({BASE}{sc['url']}): {sc['llms']}",
              "", "## Doctors and team"]
    for k, p in ppl.items():
        where = ", ".join(br[b]["city"] for b in p.get("branches", [])) or "all clinics"
        lines.append(f"- [{p['name']}]({BASE}/about.html#{k}): {p['job_title']} ({where})")
    lines += ["", "## Guides"]
    for a in arts:
        lines.append(f"- [{a['h1']}]({BASE}/blog/{a['slug']}/): {a['description']}")
    lines += ["", "## Optional",
              f"- [About the clinic]({BASE}/about.html)",
              f"- [Contact and booking]({BASE}/contact.html)",
              f"- [Franchise enquiries]({BASE}/branches.html)",
              f"- [Terms, privacy and medical disclaimer]({BASE}/terms.html)", ""]
    write("llms.txt", "\n".join(lines))


def resolve_links_in_data(arts, resolver):
    """Point clinic treatment lists and article 'related treatments' at live pages (registry-driven)."""
    for b in DATA["branches"].values():
        b["services"] = [[sv[0], pseo.TREAT[sv[3]]["url"] if len(sv) > 3 and resolver.live(sv[3]) else sv[1], sv[2]]
                         for sv in b["services"]]
    gen_urls = {t["url"]: t["id"] for t in pseo.TREAT.values() if t.get("type") == "generated"}
    for a in arts:
        svcs = [sv for sv in a.get("services", []) if sv[1] not in gen_urls or resolver.live(gen_urls[sv[1]])]
        for t in pseo.TAX["treatments"]:
            if a["slug"] in t.get("articles", []) and resolver.live(t["id"]) and t["url"] not in [x[1] for x in svcs]:
                svcs.append([t["name"], t["url"]])
        a["services"] = svcs


if __name__ == "__main__":
    arts = load_articles()
    pages = load_pages()
    built = [p for p in pages if p["status"] != "draft"]
    for p in pages:
        if p["status"] == "draft" and os.path.exists(os.path.join(FE, p["path"].strip("/"), "index.html")):
            print(f"WARNING {p['file']}: status is draft but {p['path']} still has a built page; delete it by hand if it should go")
    gates = pseo.run_gates(built, DATA)
    eff = {p["id"]: pseo.effective_status(p, gates) for p in built}
    resolver = RESOLVER = pseo.Resolver(eff)
    for p in built:  # live pages never send visitors to a page that is not live: write() points those links at a fallback
        bad = sorted(set(pseo.links_to_unpublished(p, resolver)))
        if bad:
            note = " (pointed at their fallback until they are)" if eff[p["id"]] == "published" else ""
            gates[p["id"]].append(("warning", "links to pages that are not published yet: " + ", ".join(bad) + note))
    pseo.sync_links(resolver)                                   # static pages first (incl. the nav template)
    HEAD_GTM, GTAG, GTM_BODY, NAV, TAIL = template_parts()      # re-read the synced navigation
    resolve_links_in_data(arts, resolver)
    build_locations_hub()
    for key in DATA["branches"]:
        build_location(key)
    for art in arts:
        build_article(art, arts)
    build_blog_index(arts)
    for pg in built:
        build_service(pg, resolver, eff[pg["id"]])
    changed, unknown = pseo.sync_links(resolver)
    for u in unknown:
        print("WARNING unknown data-pseo / pseo:link id:", u)
    build_sitemap(arts, built, eff)
    build_llms(arts, resolver)
    if pseo.update_htaccess(["locations", "blog"] + sorted(p["path"].strip("/") for p in built)):
        print("updated frontend/.htaccess (trailing-slash redirects)")
    write_gate_report(built, gates, eff)
    counts = {k: sum(1 for v in eff.values() if v == k) for k in ("published", "review", "approved", "noindex", "blocked")}
    print("pSEO pages: " + ", ".join(f"{v} {k}" for k, v in counts.items() if v)
          + " — details in docs/pseo/quality-gates.md")
    for p in built:
        for lv, m in gates.get(p["id"], []):
            if lv == "critical":
                print(f"  GATE {p['path']}: {m}")
