#!/usr/bin/env python3
"""
Kezza Clinic — content page builder (no dependencies, Python 3.8+).

Builds, from tools/seo/site-data.json and tools/content/blog/*.html:
  frontend/locations/index.html            clinic finder (hub)
  frontend/locations/<city>/index.html     one page per clinic (NAP, hours, doctors, treatments, FAQ)
  frontend/blog/index.html                 blog index
  frontend/blog/<slug>/index.html          one page per article
  frontend/sitemap.xml                     every indexable page, lastmod from git
  frontend/llms.txt                        AI-crawler summary of the site (llmstxt.org format)

The header, footer, social bar and floating dock are copied from
frontend/hair-transplant/index.html at build time, so new pages always match
the live navigation. Run from the repo root:

    python3 tools/content/build_content_pages.py

To add a blog post: copy an existing file in tools/content/blog/, edit the
JSON header and the HTML body, add an OG card in tools/og/make_og_images.py,
then re-run this script (and `npm run build:css` if you use the CSS bundles).
"""
import datetime
import html
import json
import os
import re
import subprocess
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
FE = os.path.join(ROOT, "frontend")
DATA = json.load(open(os.path.join(ROOT, "tools", "seo", "site-data.json"), encoding="utf-8"))
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
def page(path, title, desc, og_image, og_alt, nodes, main_html, active_nav=None, preload=None):
    url = f"{BASE}{path}"
    css = "\n".join(f'    <link rel="stylesheet" href="{c}">' for c in CSS)
    pre = f'    <link rel="preload" as="image" href="{preload}">\n' if preload else ""
    return f"""<!DOCTYPE html>
<html lang="en-IN">

<head>
    <!-- Generated by tools/content/build_content_pages.py — edit the source there, not this file. -->
    {HEAD_GTM}
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{E(title)}</title>
    <meta name="description" content="{E(desc)}">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">

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
    <link rel="canonical" href="{url}">
    <!-- ═══ SEO: Open Graph / social previews ═══ -->
    <meta property="og:type" content="{'article' if path.startswith('/blog/') and path != '/blog/' else 'website'}">
    <meta property="og:site_name" content="Kezza Hair &amp; Skin Clinic">
    <meta property="og:locale" content="en_IN">
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
    {nav_for(active_nav)}

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


def faq_html(qas, heading="Frequently Asked Questions", bg="sp-bg-white"):
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
                    <span class="sp-pill-badge"><i class="fas fa-question-circle"></i> FAQs</span>
                    <h2 class="sp-section-heading">{E(heading)}</h2>
                </div>
                <div class="faq-accordion-wrap">{items}
                </div>
            </div>
        </section>
"""


def cta_band(title, text, wa="919284517427", phone="+919284517427", phone_label="9284517427"):
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
                        <a href="https://wa.me/{wa}?text=Hi%20Kezza%20Clinic%2C%20I%20would%20like%20to%20book%20a%20consultation." target="_blank" rel="noopener noreferrer" class="btn-wa-action">
                            <i class="fab fa-whatsapp"></i> Book on WhatsApp
                        </a>
                        <a href="tel:{phone}" class="btn-call-action" style="background: rgba(255,255,255,0.12); color: #ffffff !important; border-color: rgba(255,255,255,0.25);">
                            <i class="fas fa-phone-alt"></i> Call: {phone_label}
                        </a>
                    </div>
                </div>
            </div>
        </section>
"""


def write(rel, content):
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
    ]


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
    main = crumbs_html([("Home", "/index.html"), ("Our Clinics", "/locations/"), (city, path)]) + f"""
        <header class="service-hero-section">
            <div class="sp-container">
                <div class="service-hero-grid">
                    <div class="service-hero-content">
                        <div class="hero-trust-chips">
                            <span class="chip chip-clinical"><i class="fas fa-clock"></i> Open 9 AM – 8 PM · All 7 days</span>
                            <span class="chip chip-network"><i class="fas fa-map-marker-alt"></i> {E(b['label'])}</span>
                        </div>
                        <h1>Kezza Hair &amp; Skin Clinic, {city}</h1>
                        <p class="service-hero-lead">{E(b['intro'])}</p>
                        <div class="service-hero-ctas">
                            <a href="https://wa.me/{b['whatsapp']}?text=Hi%20Kezza%20{city}%2C%20I%20would%20like%20to%20book%20a%20consultation." target="_blank" rel="noopener noreferrer" class="btn-wa-action">
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

        <section class="sp-section-pad sp-bg-white" id="details">
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

        <section class="sp-section-pad sp-bg-light" id="doctors">
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

        <section class="sp-section-pad sp-bg-white" id="treatments">
            <div class="sp-container">
                <div class="kz-center-head">
                    <span class="sp-pill-badge"><i class="fas fa-th-large"></i> Treatments</span>
                    <h2 class="sp-section-heading">Treatments at Kezza {city}</h2>
                </div>
                <ul class="kz-treat-list">{treat}
                </ul>
                <p class="kz-note">Call or WhatsApp before your visit to confirm a treatment is available on your chosen day. Other clinics: {other_links}.</p>
            </div>
        </section>
""" + faq_html(faqs, heading=f"Visiting our {city} clinic", bg="sp-bg-light") + cta_band(
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
    cards = []
    for k, b in DATA["branches"].items():
        docs = ", ".join(DATA["people"][d]["name"] for d in b["doctors"][:3]) + (" and more" if len(b["doctors"]) > 3 else "")
        cards.append(f"""
                    <article class="kz-clinic-card">
                        <img src="{b['image']}" alt="Kezza Hair &amp; Skin Clinic, {b['city']}" width="768" height="1024" loading="lazy" decoding="async">
                        <div class="kz-card-body">
                            <span class="kz-chip">{E(b['label'])}</span>
                            <h2><a href="/locations/{k}/" style="color:inherit;text-decoration:none">Kezza {b['city']}</a></h2>
                            <p><i class="fas fa-map-marker-alt" style="color:#00AFC0"></i> {E(b['display_address'])}</p>
                            <p><i class="fas fa-clock" style="color:#00AFC0"></i> 9 AM – 8 PM, all 7 days</p>
                            <p><i class="fas fa-phone-alt" style="color:#00AFC0"></i> <a href="tel:{tel(b['phones'][0])}">{pretty_phone(b['phones'][0])}</a></p>
                            <p><i class="fas fa-user-md" style="color:#00AFC0"></i> {E(docs)}</p>
                            <div class="kz-card-actions">
                                <a href="/locations/{k}/" class="btn-call-action"><i class="fas fa-info-circle"></i> Clinic details</a>
                                <a href="{b['map']}" target="_blank" rel="noopener noreferrer" class="btn-call-action"><i class="fas fa-location-arrow"></i> Directions</a>
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
    ]
    main = crumbs_html([("Home", "/index.html"), ("Our Clinics", path)]) + f"""
        <header class="service-hero-section">
            <div class="sp-container">
                <div class="kz-center-head" style="margin-bottom:0">
                    <span class="sp-pill-badge"><i class="fas fa-hospital"></i> 3 clinics in Rajasthan</span>
                    <h1 class="sp-section-heading" style="font-size:clamp(2.1rem,3.8vw,3.1rem);margin-top:14px">Kezza Clinics in Jaipur, Sikar &amp; Ajmer</h1>
                    <p class="service-hero-lead">Doctor-led hair restoration, skin and laser care, permanent makeup and body contouring, close to home. Every clinic is open 9 AM – 8 PM, all 7 days.</p>
                </div>
            </div>
        </header>

        <section class="sp-section-pad sp-bg-white" id="clinics">
            <div class="sp-container">
                <div class="kz-clinic-cards">{''.join(cards)}
                </div>
            </div>
        </section>
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
    main = crumbs_html([("Home", "/index.html"), ("Blog", "/blog/"), (a["h1"], path)]) + f"""
        <header class="sp-section-pad sp-bg-white" style="padding-bottom:10px">
            <div class="sp-container">
                <div class="kz-article-head">
                    <span class="kz-chip">{E(a['category'])}</span>
                    <h1>{E(a['h1'])}</h1>
                    <p class="kz-dek">{a['dek']}</p>
                    <div class="kz-byline">
                        <span><i class="fas fa-hospital"></i>By the Kezza Hair &amp; Skin Clinic team</span>
                        <span><i class="fas fa-calendar-alt"></i>Updated <time datetime="{a['modified']}">{fmt_date(a['modified'])}</time></span>
                        <span><i class="fas fa-clock"></i>{a['minutes']} min read</span>
                    </div>
                </div>
                <div class="kz-article-hero">
                    <img src="{og}" width="1200" height="630" fetchpriority="high" decoding="async" alt="{E(a['hero_alt'])}">
                </div>
            </div>
        </header>

        <section class="sp-section-pad sp-bg-white" style="padding-top:36px">
            <div class="sp-container">
                <article class="kz-article">
                    <div class="kz-takeaways"><h2>Key takeaways</h2><ul>{takeaways}</ul></div>
                    {toc(a['body'])}
{a['body']}

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
    nodes = [org_node(), website_node(),
             webpage(url, a["title"], a["description"], about=f"{url}#article", image=f"{BASE}{og}", modified=a["modified"]),
             breadcrumb(url, [("Home", "/"), ("Blog", "/blog/"), (a["h1"], path)]), posting,
             faq_node(url, a["faqs"])]
    write(f"blog/{a['slug']}/index.html", page(path, a["title"], a["description"], og, a["hero_alt"], nodes, main, active_nav="/blog/"))


def build_blog_index(arts):
    path = "/blog/"
    url = f"{BASE}{path}"
    title = "Hair & Skin Blog: Guides From Kezza Clinic Doctors"
    desc = "Clear, doctor-led guides on hair transplant, PRP and GFC, white hair removal and hair-loss stages from Kezza Hair & Skin Clinic in Jaipur, Sikar and Ajmer."
    cards = "".join(f"""
                    <a class="kz-blog-card" href="/blog/{a['slug']}/">
                        <img src="/images/og/{a['og']}.jpg" alt="{E(a['h1'])}" width="1200" height="630" loading="lazy" decoding="async">
                        <div class="kz-card-body">
                            <span class="kz-chip">{E(a['category'])}</span>
                            <h2>{E(a['h1'])}</h2>
                            <p class="kz-muted">{E(a['description'])}</p>
                            <p class="kz-muted" style="font-size:.85rem">{a['minutes']} min read · {fmt_date(a['modified'])}</p>
                        </div>
                    </a>""" for a in arts)
    main = crumbs_html([("Home", "/index.html"), ("Blog", path)]) + f"""
        <header class="service-hero-section">
            <div class="sp-container">
                <div class="kz-center-head" style="margin-bottom:0">
                    <span class="sp-pill-badge"><i class="fas fa-book-medical"></i> Kezza Clinic blog</span>
                    <h1 class="sp-section-heading" style="font-size:clamp(2.1rem,3.8vw,3.1rem);margin-top:14px">Hair &amp; Skin Answers From Our Doctors</h1>
                    <p class="service-hero-lead">Straight answers to the questions patients ask us most, with sources you can check.</p>
                </div>
            </div>
        </header>

        <section class="sp-section-pad sp-bg-white" id="articles">
            <div class="sp-container">
                <div class="kz-blog-grid">{cards}
                </div>
            </div>
        </section>
""" + cta_band("Have a question we haven't answered?", "Message our team on WhatsApp and a doctor will guide you.")
    blog = {"@type": "Blog", "@id": f"{url}#blog", "name": "Kezza Hair & Skin Clinic Blog", "url": url,
            "publisher": {"@id": ORG_ID}, "inLanguage": "en-IN",
            "blogPost": [{"@id": f"{BASE}/blog/{a['slug']}/#article"} for a in arts]}
    nodes = [org_node(), website_node(),
             webpage(url, title, desc, typ="CollectionPage", about=f"{url}#blog", image=f"{BASE}/images/og/blog.jpg"),
             breadcrumb(url, [("Home", "/"), ("Blog", path)]), blog]
    write("blog/index.html", page(path, title, desc, "/images/og/blog.jpg", "Kezza Hair & Skin Clinic blog", nodes, main, active_nav="/blog/"))


# ───────────────────────────── sitemap + llms.txt ─────────────────────────────
STATIC_PAGES = [  # (path, file, og image or main image)
    ("/", "index.html", "/images/og/home.jpg"),
    ("/about.html", "about.html", "/images/og/about.jpg"),
    ("/hair-services.html", "hair-services.html", "/images/og/hair-services.jpg"),
    ("/hair-transplant/", "hair-transplant/index.html", "/images/hair-services/og/hair-transplant-og-kezza-jaipur.jpg"),
    ("/prp-therapy.html", "prp-therapy.html", "/images/og/prp-therapy.jpg"),
    ("/white-hair-removal.html", "white-hair-removal.html", "/images/og/white-hair-removal.jpg"),
    ("/skin-services.html", "skin-services.html", "/images/og/skin-services.jpg"),
    ("/weight-loss.html", "weight-loss.html", "/images/og/weight-loss.jpg"),
    ("/permanent-makeup.html", "permanent-makeup.html", "/images/og/permanent-makeup.jpg"),
    ("/face-scanner.html", "face-scanner.html", "/images/og/face-scanner.jpg"),
    ("/contact.html", "contact.html", "/images/og/contact.jpg"),
    ("/branches.html", "branches.html", "/images/og/branches.jpg"),
    ("/terms.html", "terms.html", None),
]


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


def build_sitemap(arts):
    entries = list(STATIC_PAGES)
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


def build_llms(arts):
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
    lines += ["", "## Treatments",
              f"- [Hair transplant (FUE, DHI, FUT)]({BASE}/hair-transplant/): doctor-led surgery at all three clinics; beard and eyebrow transplant",
              f"- [Hair loss treatments hub]({BASE}/hair-services.html): transplant, PRP, GFC, electrolysis, hair systems and wigs, hair-loss consultation",
              f"- [PRP and GFC therapy]({BASE}/prp-therapy.html): platelet-rich plasma and growth factor concentrate injections for thinning hair",
              f"- [White and grey hair removal]({BASE}/white-hair-removal.html): electrolysis for white, grey and blonde hair that laser cannot treat",
              f"- [Skin and laser treatments]({BASE}/skin-services.html): acne and scars, pigmentation, dark circles, anti-ageing, Botox, HydraFacial, laser hair reduction, glutathione",
              f"- [Non-surgical weight loss and body sculpting]({BASE}/weight-loss.html): cryolipolysis, HIFU body sculpting, double-chin reduction (Jaipur and Sikar)",
              f"- [Permanent makeup]({BASE}/permanent-makeup.html): microblading, ombre brows, lip blush, permanent eyeliner (Jaipur and Sikar)",
              f"- [Free AI skin and scalp scanner]({BASE}/face-scanner.html): online preliminary assessment that routes you to the right specialist",
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


if __name__ == "__main__":
    arts = load_articles()
    build_locations_hub()
    for key in DATA["branches"]:
        build_location(key)
    for art in arts:
        build_article(art, arts)
    build_blog_index(arts)
    build_sitemap(arts)
    build_llms(arts)
