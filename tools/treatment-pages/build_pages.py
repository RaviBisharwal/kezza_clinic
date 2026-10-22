#!/usr/bin/env python3
"""
Kezza Clinic — Doctor profile pages builder.
Generates frontend/doctors/<slug>/index.html from tools/treatment-pages/pages_doctors.py.

Usage:
    python3 tools/treatment-pages/build_pages.py
"""
import datetime
import html
import json
import os
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
FE = os.path.join(ROOT, "frontend")
DOCS_DIR = os.path.join(FE, "doctors")

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pages_doctors import DOCTORS  # noqa: E402

BASE_URL = "https://www.kezza.co.in"
TODAY = "2026-10-17"


CLINIC_CARDS = {
    "jaipur": """<div class="pg-branch-card">
<strong><a href="/locations/jaipur/">Kezza Jaipur · Khatipura</a></strong>
<span>A-7, 1st Floor, Hanuman Nagar, Sirsi Road, Khatipura, Jaipur, Rajasthan 302012</span>
<span>Open 9 AM – 8 PM, all 7 days · <a href="tel:+919284517427">+91-9284517427</a></span>
<div class="pg-branch-links"><a href="https://maps.app.goo.gl/4eUGixic35V777yd8" rel="noopener" target="_blank">Get directions</a><a href="/locations/jaipur/">Clinic page</a></div>
</div>""",
    "sikar": """<div class="pg-branch-card">
<strong><a href="/locations/sikar/">Kezza Sikar · Silver Jubilee Road</a></strong>
<span>4th Floor, Shakambhari Heights, Opposite S.K. Hospital, Silver Jubilee Road, Sakpura Mohlla, Samrathpura, Sikar, Rajasthan 332001</span>
<span>Open 9 AM – 8 PM, all 7 days · <a href="tel:+919284517427">+91-9284517427</a></span>
<div class="pg-branch-links"><a href="https://maps.app.goo.gl/kFkEyXNvTP6DSGKq6" rel="noopener" target="_blank">Get directions</a><a href="/locations/sikar/">Clinic page</a></div>
</div>""",
    "ajmer": """<div class="pg-branch-card">
<strong><a href="/locations/ajmer/">Kezza Ajmer · Jawahar Nagar</a></strong>
<span>1st Floor, Hotel Oasis Complex, Shastri Nagar, Jawahar Nagar, Ajmer, Rajasthan 305001</span>
<span>Open 9 AM – 8 PM, all 7 days · <a href="tel:+919216088257">+91-9216088257</a></span>
<div class="pg-branch-links"><a href="https://maps.app.goo.gl/zMajvKmT5N7coswJA" rel="noopener" target="_blank">Get directions</a><a href="/locations/ajmer/">Clinic page</a></div>
</div>"""
}


def build_navbar():
    return """<nav class="navbar">
<div class="nav-container">
<div class="nav-logo">
<a aria-label="Kezza Clinic Home" href="/index.html"><img alt="Kezza Clinic" decoding="async" height="60" loading="eager" src="/images/logo.png" width="160"/></a>
</div>
<ul class="nav-menu" id="navMenu">
<li><a href="/index.html">Home</a></li>
<li><a href="/about.html">About</a></li>
<li class="nav-item-services-dropdown">
<a aria-controls="servicesDropdownMenu" aria-expanded="false" aria-haspopup="true" class="services-nav-toggle active" href="javascript:void(0)" id="servicesNavToggle" role="button">
<span>SERVICES</span> <i class="fas fa-chevron-down nav-arrow"></i>
</a>
<div aria-label="Services Menu" class="services-dropdown-menu mega-menu-panel" id="servicesDropdownMenu" role="region">
<div class="mega-menu-grid">
<div class="mega-col">
<div class="mega-col-header">
<i class="fas fa-user-md mega-col-icon"></i>
<a class="mega-col-title" href="/hair-services.html">Hair Services</a>
</div>
<ul class="mega-link-list">
<li><a class="mega-link" href="/hair-transplant/">Hair Transplant (HT)</a></li>
<li><a class="mega-link" href="/hair-transplant/fue/">FUE Hair Transplant</a></li>
<li><a class="mega-link" href="/hair-transplant/dhi/">DHI Hair Transplant</a></li>
<li><a class="mega-link" href="/hair-transplant/beard/">Beard Transplant</a></li>
<li><a class="mega-link" href="/hair-transplant/eyebrow/">Eyebrow Transplant</a></li>
<li><a class="mega-link" href="/prp-therapy.html">PRP Therapy</a></li>
<li><a class="mega-link" href="/gfc-treatment/">GFC Therapy</a></li>
<li><a class="mega-link" href="/white-hair-removal.html">White Hair Removal</a></li>
<li><a class="mega-link" href="/electrolysis.html">Electrolysis</a></li>
<li><a class="mega-link" href="/hair-wig.html">Hair Wig / Hair Replacement</a></li>
<li><a class="mega-link" href="/hair-loss-consultation.html">Hair Loss Consultation</a></li>
</ul>
<div class="mega-col-header" style="margin-top:18px;">
<i class="fas fa-bolt mega-col-icon"></i>
<span class="mega-col-title">Laser Treatments</span>
</div>
<ul class="mega-link-list">
<li><a class="mega-link" href="/laser-hair-removal/">Laser Hair Removal</a></li>
<li><a class="mega-link" href="/laser-hair-removal/full-body/">Full Body Laser Hair Removal</a></li>
<li><a class="mega-link" href="/q-switch-laser/">Q-Switch Laser</a></li>
</ul>
</div>
<div class="mega-col">
<div class="mega-col-header">
<i class="fas fa-spa mega-col-icon"></i>
<a class="mega-col-title" href="/skin-services.html">Skin Services</a>
</div>
<ul class="mega-link-list">
<li><a class="mega-link" href="/hydra-facial/">Hydra Facial</a></li>
<li><a class="mega-link" href="/chemical-peel/">Chemical Peel</a></li>
<li><a class="mega-link" href="/medical-peel/">Medical Peel</a></li>
<li><a class="mega-link" href="/microneedling/">Microneedling</a></li>
<li><a class="mega-link" href="/glutathione-treatment/">Glutathione Treatment</a></li>
<li><a class="mega-link" href="/acne-treatment/">Acne &amp; Acne Scars</a></li>
<li><a class="mega-link" href="/pigmentation-treatment/">Pigmentation &amp; Melasma</a></li>
<li><a class="mega-link" href="/botox/">Botox &amp; Fillers</a></li>
<li><a class="mega-link" href="/dark-circles-treatment/">Dark Circle Treatment</a></li>
<li><a class="mega-link" href="/stretch-marks-treatment/">Stretch Marks</a></li>
<li><a class="mega-link" href="/medical-dermatology/">Medical Dermatology</a></li>
<li><a class="mega-link" href="/skin-consultation/">Skin Consultation</a></li>
</ul>
</div>
<div class="mega-col">
<div class="mega-col-header">
<i class="fas fa-user-doctor mega-col-icon"></i>
<a class="mega-col-title" href="/cosmetic-surgery/">Cosmetic Surgery</a>
</div>
<ul class="mega-link-list">
<li><a class="mega-link" href="/rhinoplasty/">Rhinoplasty (Nose)</a></li>
<li><a class="mega-link" href="/blepharoplasty/">Blepharoplasty (Eyelids)</a></li>
<li><a class="mega-link" href="/scar-revision/">Scar Revision</a></li>
</ul>
<div class="mega-col-header" style="margin-top:18px;">
<i class="fas fa-weight-scale mega-col-icon"></i>
<a class="mega-col-title" href="/weight-loss.html">Weight Loss</a>
</div>
<ul class="mega-link-list">
<li><a class="mega-link" href="/weight-management/">Medical Weight Loss</a></li>
<li><a class="mega-link" href="/weight-loss.html#treatments">Body Sculpting</a></li>
</ul>
<div class="mega-col-header" style="margin-top:18px;">
<i class="fas fa-paint-brush mega-col-icon"></i>
<a class="mega-col-title" href="/permanent-makeup.html">Permanent Makeup</a>
</div>
<ul class="mega-link-list">
<li><a class="mega-link" href="/microblading/">Microblading</a></li>
<li><a class="mega-link" href="/lip-neutralization/">Lip Neutralization</a></li>
<li><a class="mega-link" href="/permanent-makeup.html#lip-blush">Lip Blush PMU</a></li>
<li><a class="mega-link" href="/permanent-makeup.html#eyeliner">Permanent Eyeliner</a></li>
</ul>
</div>
</div>
</div>
</li>
<li><a class="nav-scanner-link" href="/face-scanner.html">✦ AI Scanner</a></li>
<li><a href="/locations/">Clinics</a></li>
<li><a href="/blog/">Blog</a></li>
<li><a href="/branches.html">Franchise</a></li>
<li><a href="/contact.html">Contact</a></li>
</ul>
<div class="nav-cta">
<div aria-label="Select Language" class="kz-lang-switcher notranslate" role="group" translate="no">
<i aria-hidden="true" class="fas fa-globe kz-globe-icon"></i>
<button aria-label="English" class="kz-lang-btn active" data-lang="en" title="English" type="button">EN</button>
<span aria-hidden="true" class="kz-lang-sep">/</span>
<button aria-label="हिंदी" class="kz-lang-btn" data-lang="hi" title="हिंदी" type="button">हिंदी</button>
</div>
<a class="btn-nav-call" href="tel:+919284517427" title="Call Kezza Clinic"><i class="fas fa-phone-alt"></i> <span>+91-9284517427</span></a>
<a class="btn-primary" href="#schedule-assessment">Book Consultation</a>
</div>
<div aria-label="Select Language" class="kz-lang-switcher kz-lang-switcher-mobile notranslate" role="group" translate="no">
<i aria-hidden="true" class="fas fa-globe kz-globe-icon"></i>
<button aria-label="English" class="kz-lang-btn active" data-lang="en" title="English" type="button">EN</button>
<span aria-hidden="true" class="kz-lang-sep">/</span>
<button aria-label="हिंदी" class="kz-lang-btn" data-lang="hi" title="हिंदी" type="button">हिंदी</button>
</div>
<div aria-label="Toggle navigation menu" class="hamburger" id="hamburger" role="button" tabindex="0">
<span></span><span></span><span></span>
</div>
</div>
</nav>"""


def build_footer():
    return """<footer class="footer kz-site-footer">
<div class="container">
<div class="footer-grid kz-footer-grid">
<div class="footer-column kz-footer-brand">
<p class="footer-nav-title kz-footer-name">Kezza Hair &amp; Skin Clinic</p>
<p>Doctor-led hair restoration, skin and laser care, permanent makeup and body contouring at our clinics in Jaipur, Sikar and Ajmer, Rajasthan.</p>
<p class="kz-footer-hours"><i aria-hidden="true" class="far fa-clock"></i> Open 9 AM – 8 PM, all 7 days</p>
<div class="kz-footer-social">
<a aria-label="Instagram" href="https://www.instagram.com/kezza_clinic" rel="noopener noreferrer" target="_blank" title="Instagram"><i aria-hidden="true" class="fab fa-instagram"></i></a>
<a aria-label="Facebook" href="https://www.facebook.com/kezzaclinic" rel="noopener noreferrer" target="_blank" title="Facebook"><i aria-hidden="true" class="fab fa-facebook-f"></i></a>
<a aria-label="YouTube" href="https://www.youtube.com/@Kezza_Clinic_Jaipur" rel="noopener noreferrer" target="_blank" title="YouTube"><i aria-hidden="true" class="fab fa-youtube"></i></a>
</div>
</div>
<div class="footer-column">
<p class="footer-nav-title">Quick Links</p>
<ul>
<li><a href="/index.html">Home</a></li>
<li><a href="/about.html">About Us</a></li>
<li><a href="/about.html#doctors">Our Doctors</a></li>
<li><a href="/cosmetic-surgery/">Cosmetic Surgery</a></li>
<li><a href="/locations/">Our Clinics</a></li>
<li><a href="/blog/">Hair &amp; Skin Blog</a></li>
<li><a href="/face-scanner.html">AI Face Scanner</a></li>
<li><a href="/permanent-makeup.html">Permanent Makeup</a></li>
<li><a href="/weight-loss.html">Weight Loss</a></li>
<li><a href="/branches.html">Franchise</a></li>
<li><a href="/contact.html">Contact Us</a></li>
<li><a href="/terms.html">Privacy &amp; Terms</a></li>
</ul>
</div>
<div class="footer-column">
<p class="footer-nav-title"><a href="/hair-services.html">Hair Services</a></p>
<ul>
<li><a href="/hair-transplant/">Hair Transplant</a></li>
<li><a href="/prp-therapy.html">PRP Therapy</a></li>
<li><a href="/gfc-treatment/">GFC Therapy</a></li>
<li><a href="/white-hair-removal.html">White Hair Removal</a></li>
<li><a href="/electrolysis.html">Electrolysis</a></li>
<li><a href="/hair-wig.html">Hair Wig &amp; Replacement</a></li>
<li><a href="/hair-loss-consultation.html">Hair Loss Consultation</a></li>
</ul>
</div>
<div class="footer-column">
<p class="footer-nav-title"><a href="/skin-services.html">Skin Services</a></p>
<ul>
<li><a href="/hydra-facial/">Hydra Facial</a></li>
<li><a href="/chemical-peel/">Chemical Peel</a></li>
<li><a href="/acne-treatment/">Acne &amp; Acne Scars</a></li>
<li><a href="/pigmentation-treatment/">Pigmentation &amp; Melasma</a></li>
<li><a href="/q-switch-laser/">Q-Switch Laser</a></li>
<li><a href="/botox/">Botox &amp; Fillers</a></li>
<li><a href="/dark-circles-treatment/">Dark Circle Treatment</a></li>
<li><a href="/stretch-marks-treatment/">Stretch Marks</a></li>
<li><a href="/medical-dermatology/">Medical Dermatology</a></li>
<li><a href="/laser-hair-removal/">Laser Hair Removal</a></li>
<li><a href="/skin-consultation/">Skin Consultation</a></li>
</ul>
</div>
<div class="footer-column kz-footer-contact">
<p class="footer-nav-title">Contact &amp; Clinics</p>
<ul>
<li><i aria-hidden="true" class="fas fa-phone-alt"></i><span><a href="tel:+919284517427">+91-9284517427</a> <small>Jaipur &amp; Sikar</small></span></li>
<li><i aria-hidden="true" class="fas fa-phone-alt"></i><span><a href="tel:+919216088257">+91-9216088257</a> <small>Ajmer</small></span></li>
<li><i aria-hidden="true" class="fab fa-whatsapp"></i><span><a href="https://wa.me/919284517427" rel="noopener noreferrer" target="_blank">WhatsApp +91-9284517427</a></span></li>
<li><i aria-hidden="true" class="fas fa-envelope"></i><span><a href="mailto:support@kezza.co.in">support@kezza.co.in</a></span></li>
<li><i aria-hidden="true" class="fas fa-map-marker-alt"></i><span><a href="/locations/jaipur/"><strong>Jaipur</strong></a>: A-7, 1st Floor, Hanuman Nagar, Sirsi Road, Khatipura</span></li>
<li><i aria-hidden="true" class="fas fa-map-marker-alt"></i><span><a href="/locations/sikar/"><strong>Sikar</strong></a>: 4th Floor, Shakambhari Heights, Opposite S.K. Hospital, Silver Jubilee Road</span></li>
<li><i aria-hidden="true" class="fas fa-map-marker-alt"></i><span><a href="/locations/ajmer/"><strong>Ajmer</strong></a>: 1st Floor, Hotel Oasis Complex, Shastri Nagar, Jawahar Nagar</span></li>
</ul>
</div>
</div>
<div class="footer-bottom kz-footer-bottom">
<p>© <span class="footer-year">2026</span> Kezza Hair &amp; Skin Clinic. All rights reserved.</p>
<p class="kz-footer-note">The information on this website is general and does not replace a consultation with a doctor. Results differ from person to person.</p>
</div>
</div>
<script>document.querySelectorAll(".footer-year").forEach(e=>e.textContent=new Date().getFullYear());</script>
</footer>
<div class="social-sidebar">
<a class="social-icon instagram" href="https://www.instagram.com/kezza_clinic/" rel="noopener noreferrer" target="_blank" title="Instagram">
<i class="fab fa-instagram"></i>
</a>
<a class="social-icon facebook" href="https://www.facebook.com/kezzaclinic" rel="noopener noreferrer" target="_blank" title="Facebook">
<i class="fab fa-facebook"></i>
</a>
<a class="social-icon whatsapp" href="https://wa.me/919284517427" rel="noopener noreferrer" target="_blank" title="WhatsApp">
<i class="fab fa-whatsapp"></i>
</a>
<a aria-label="Kezza Clinic YouTube" class="social-icon youtube" href="https://www.youtube.com/@Kezza_Clinic_Jaipur" rel="noopener noreferrer" target="_blank" title="Kezza Clinic YouTube">
<i class="fab fa-youtube"></i>
</a>
</div>
<div class="floating-quick-dock" id="floatingQuickDock">
<a class="dock-item dock-call" href="tel:+919284517427" title="Call Clinic">
<i class="fas fa-phone-alt"></i> <span>Call 9284517427</span>
</a>
<a class="dock-item dock-wa" href="https://wa.me/919284517427" rel="noopener noreferrer" target="_blank" title="WhatsApp Doctor Team">
<i class="fab fa-whatsapp"></i> <span>WhatsApp Us</span>
</a>
<a class="dock-item dock-scan" href="/face-scanner.html" title="AI Face &amp; Scalp Scanner">
<i class="fas fa-camera"></i> <span>✦ AI Scanner</span>
</a>
<a class="dock-item dock-book" href="#schedule-assessment" title="Book Consultation">
<i class="fas fa-calendar-alt"></i> <span>Book Visit</span>
</a>
</div>
<script defer="" src="/js/script.min.js?v=34062363"></script>
<script defer="" src="/js/mobile-menu.min.js?v=bc5a0c11"></script>
<script defer="" src="/js/services-navigation.min.js?v=c26e2b84"></script>
<script defer="" src="/js/quick-actions.min.js?v=03bd54e5"></script>
<script defer="" src="/js/scanner-launch.min.js?v=7bfd531b"></script>
<script defer="" src="/js/smooth-scroll.min.js?v=c3bde406"></script>
<script defer="" src="/js/translate.min.js?v=70bbb3cd"></script>
<script defer="" src="/js/pro-animations.min.js?v=09f33aab"></script>
<script defer="" src="/js/telecrm.min.js?v=61919537"></script>
<script defer="" src="/js/treatment-page.min.js?v=61ca6b8c"></script>"""


def build_schema(doc):
    slug = doc["slug"]
    name = doc["hero_title"]
    page_url = f"{BASE_URL}/doctors/{slug}/"
    webpage_id = f"{page_url}#webpage"
    breadcrumb_id = f"{page_url}#breadcrumb"
    person_id = f"{page_url}#person"
    faq_id = f"{page_url}#faq"

    graph = [
        {
            "@type": "MedicalOrganization",
            "@id": f"{BASE_URL}/#organization",
            "name": "Kezza Hair & Skin Clinic",
            "alternateName": ["Kezza Clinic", "Kezza Hair and Skin Clinic"],
            "url": f"{BASE_URL}/",
            "logo": {
                "@type": "ImageObject",
                "@id": f"{BASE_URL}/#logo",
                "url": f"{BASE_URL}/images/fallbacks/logo.webp",
                "width": 900,
                "height": 220
            },
            "image": f"{BASE_URL}/images/fallbacks/hair-services-bg.webp",
            "telephone": "+91-9284517427",
            "email": "support@kezza.co.in",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "A-7, 1st Floor, Hanuman Nagar, Sirsi Road, Khatipura",
                "addressLocality": "Jaipur",
                "addressRegion": "Rajasthan",
                "postalCode": "302012",
                "addressCountry": "IN"
            },
            "sameAs": [
                "https://www.facebook.com/kezzaclinic",
                "https://www.instagram.com/kezza_clinic",
                "https://www.youtube.com/@Kezza_Clinic_Jaipur"
            ]
        },
        {
            "@type": "WebSite",
            "@id": f"{BASE_URL}/#website",
            "url": f"{BASE_URL}/",
            "name": "Kezza Hair & Skin Clinic",
            "alternateName": "Kezza Clinic",
            "publisher": {"@id": f"{BASE_URL}/#organization"},
            "inLanguage": "en-IN"
        },
        {
            "@type": "ProfilePage",
            "@id": webpage_id,
            "url": page_url,
            "name": doc["title"],
            "description": doc["meta_desc"],
            "isPartOf": {"@id": f"{BASE_URL}/#website"},
            "publisher": {"@id": f"{BASE_URL}/#organization"},
            "inLanguage": "en-IN",
            "datePublished": "2026-10-13",
            "dateModified": TODAY,
            "breadcrumb": {"@id": breadcrumb_id},
            "mainEntity": {"@id": person_id},
            "primaryImageOfPage": {
                "@type": "ImageObject",
                "url": f"{BASE_URL}/images/doctors/{slug}.jpg",
                "width": 600,
                "height": 750
            }
        },
        {
            "@type": "BreadcrumbList",
            "@id": breadcrumb_id,
            "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{BASE_URL}/"},
                {"@type": "ListItem", "position": 2, "name": "About Us", "item": f"{BASE_URL}/about.html"},
                {"@type": "ListItem", "position": 3, "name": name, "item": page_url}
            ]
        }
    ]

    # Person node
    person_node = {
        "@type": "Person",
        "@id": person_id,
        "name": name,
        "url": page_url,
        "image": f"{BASE_URL}/images/doctors/{slug}.jpg",
        "jobTitle": doc.get("job_title", doc["eyebrow"])
    }

    if doc.get("honorific_prefix"):
        person_node["honorificPrefix"] = doc["honorific_prefix"]

    clinics = doc.get("clinics", [])
    if clinics:
        person_node["worksFor"] = [{"@id": f"{BASE_URL}/locations/{c}/#clinic"} for c in clinics]

    if doc.get("occupation"):
        person_node["hasOccupation"] = {"@type": "Occupation", "name": doc["occupation"]}

    if doc.get("knows_about"):
        person_node["knowsAbout"] = doc["knows_about"]
    else:
        # derive from existing schema if available
        raw_person = None
        for n in doc.get("schema", {}).get("@graph", []):
            if n.get("@type") == "Person":
                raw_person = n
                break
        if raw_person and raw_person.get("knowsAbout"):
            person_node["knowsAbout"] = raw_person["knowsAbout"]

    if doc.get("alumni_of"):
        person_node["alumniOf"] = doc["alumni_of"]
    elif doc.get("schema"):
        for n in doc.get("schema", {}).get("@graph", []):
            if n.get("@type") == "Person" and n.get("alumniOf"):
                person_node["alumniOf"] = n["alumniOf"]

    if doc.get("has_credential"):
        person_node["hasCredential"] = doc["has_credential"]

    if doc.get("council") and doc.get("reg_no"):
        person_node["identifier"] = {
            "@type": "PropertyValue",
            "propertyID": doc["council"],
            "value": doc["reg_no"]
        }

    raw_desc = ""
    for n in doc.get("schema", {}).get("@graph", []):
        if n.get("@type") == "Person" and n.get("description"):
            raw_desc = n["description"]
            break
    # sanitize description
    if slug == "dr-mandhata-sharma":
        raw_desc = "Dr. Mandhata Sharma is an ENT and head & neck surgeon with an MS from Maulana Azad Medical College (MAMC), Delhi. At Kezza Clinic he performs rhinoplasty."
    elif slug == "dr-neelam-choudhary":
        raw_desc = "Dr. Neelam Choudhary is a dental surgeon with postgraduate training in facial aesthetics and clinical cosmetology, consulting at our Jaipur and Sikar clinics."
    elif slug == "dr-ankit-bhalothia":
        raw_desc = "Dr. Ankit Bhalothia is a specialist oral and maxillofacial surgeon whose practice at Kezza approaches facial aesthetics and hair transplantation through a lens of total structural harmony."

    if raw_desc:
        person_node["description"] = raw_desc

    graph.append(person_node)

    # FAQ node
    if doc.get("faqs"):
        faq_entities = []
        for q, a_html in doc["faqs"]:
            ans_clean = html.unescape(a_html).replace("<p>", "").replace("</p>", "").strip()
            # replace &amp; with & for schema text
            faq_entities.append({
                "@type": "Question",
                "name": q,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": ans_clean
                }
            })
        graph.append({
            "@type": "FAQPage",
            "@id": faq_id,
            "isPartOf": {"@id": webpage_id},
            "mainEntity": faq_entities
        })

    return json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False, separators=(',', ':'))


def build_qualifications_block(doc):
    quals = doc.get("qualifications", [])
    reg_line = doc.get("registration_line")

    if not quals and not reg_line:
        return ""

    rows_html = []
    for q in quals:
        q_name = html.escape(q.get("qualification", ""))
        college = html.escape(q.get("college", ""))
        univ = html.escape(q.get("university", ""))
        year = html.escape(str(q.get("year", "")))
        rows_html.append(f"<tr><td>{q_name}</td><td>{college}</td><td>{univ}</td><td>{year}</td></tr>")

    table_html = ""
    if rows_html:
        table_html = f"""<div class="dp-qual-table-wrap">
<table class="dp-qual-table">
<thead>
<tr><th scope="col">Qualification</th><th scope="col">College</th><th scope="col">University</th><th scope="col">Year</th></tr>
</thead>
<tbody>
{"".join(rows_html)}
</tbody>
</table>
</div>"""

    reg_html = f'<p class="dp-reg-line">{html.escape(reg_line)}</p>' if reg_line else ""

    return f"""<div class="dp-qualifications">
<h3>Qualifications &amp; Registration</h3>
{table_html}
{reg_html}
</div>"""


def generate_doctor_page(doc):
    slug = doc["slug"]
    name = doc["hero_title"]
    title = doc["title"]
    meta_desc = doc["meta_desc"]
    og_title = doc.get("og_title", title)
    og_desc = doc.get("og_desc", meta_desc)
    og_img_alt = doc.get("og_img_alt", f"{name} at Kezza Hair & Skin Clinic")
    photo_alt = doc.get("photo_alt", f"{name}, {doc.get('job_title', '')}")
    photo_src = doc.get("photo_src", f"/images/doctors/{slug}.webp")
    eyebrow = doc.get("eyebrow", "")
    hero_sub = doc.get("hero_sub", "")
    hero_desc = doc.get("hero_desc", "")

    # Chips
    chips_html = "".join(doc.get("chips", []))

    # Facts
    facts_html = "".join(f"<li><strong>{f[0]}</strong><span>{f[1]}</span></li>" for f in doc.get("facts", []))

    # CTAs
    wa_href = ""
    wa_num = doc.get("wa", "919284517427")
    if slug == "dr-dhiral-vijayvargiya":
        wa_num = "919216088257"
    elif slug == "dr-neelam-choudhary":
        wa_num = "919216063686"
    elif slug == "dr-ankit-bhalothia":
        wa_num = "919216063681"

    wa_href = f"https://wa.me/{wa_num}?text=Hello%20Kezza%20Clinic%2C%20I%20would%20like%20to%20book%20a%20consultation%20with%20{html.escape(name)}."

    # Bio paragraphs
    bio_html = "".join(doc.get("about_ps", []))
    qual_block = build_qualifications_block(doc)

    # Treatments
    treat_h2 = doc.get("treat_h2", f"Treatments with {name} at Kezza")
    treat_p = doc.get("treat_p", "Prices confirmed by the clinic in October 2026.")
    treat_cards_html = []
    for tc in doc.get("treat_cards", []):
        p_badge = f"<b>{tc[3]}</b>" if len(tc) > 3 and tc[3] else ""
        treat_cards_html.append(f'<a class="dp-treat-card" href="{tc[0]}"><strong>{tc[1]}</strong><span>{tc[2]}</span>{p_badge}</a>')

    # Clinics
    clinics_h2 = doc.get("clinics_h2", f"Where to consult {name}")
    clinics_p = doc.get("clinics_p", "")
    clinic_cards_html = []
    for c in doc.get("clinics", ["jaipur"]):
        if c in CLINIC_CARDS:
            clinic_cards_html.append(CLINIC_CARDS[c])

    # FAQs
    faq_items_html = []
    for i, (q, a_html) in enumerate(doc.get("faqs", [])):
        faq_items_html.append(f"""<div class="pg-faq-item">
<h3><button aria-controls="faq-a{i}" aria-expanded="false" class="pg-faq-q" id="faq-q{i}" type="button">{q}<i aria-hidden="true" class="fas fa-chevron-down"></i></button></h3>
<div aria-labelledby="faq-q{i}" class="pg-faq-a" id="faq-a{i}" role="region">{a_html}</div>
</div>""")

    # Booking Form
    book_h2 = doc.get("book_h2", f"Book a consultation with {name}")
    book_p = doc.get("book_p", "Tell us about your concern, and our team will book your consultation.")
    pills_html = "".join(f'<div class="pg-trust-pill">{p}</div>' for p in doc.get("trust_pills", []))

    dept = doc.get("department", "Hair & Skin")
    spec = doc.get("specialist", name)
    treatment_val = doc.get("lead_treatment", f"Consultation with {name}")

    c_opts_html = "".join(f'<option value="{opt[0]}">{opt[1]}</option>' for opt in doc.get("clinic_opts", [("Jaipur", "Kezza Jaipur · Khatipura")]))
    t_opts_html = "".join(f'<option>{opt}</option>' for opt in doc.get("treatment_opts", ["Hair loss consultation", "Skin consultation", "Not sure — need advice"]))

    schema_json = build_schema(doc)

    html_content = f"""<!DOCTYPE html>

<html lang="en-IN">
<head>
<script>(function(t,n,r,e,m){{t[e]=t[e]||[],t[e].push({{"gtm.start":new Date().getTime(),event:"gtm.js"}});var g=n.getElementsByTagName(r)[0],a=n.createElement(r),s=e!="dataLayer"?"&l="+e:"";a.async=!0,a.src="https://www.googletagmanager.com/gtm.js?id="+m+s,g.parentNode.insertBefore(a,g)}})(window,document,"script","dataLayer","GTM-P5C9295R");</script>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>{title}</title>
<meta content="{meta_desc}" name="description"/>
<meta content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" name="robots"/>
<script async="" src="https://www.googletagmanager.com/gtag/js?id=G-2Q4NB5CRMW"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments)}}gtag("js",new Date),gtag("config","G-2Q4NB5CRMW");</script>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link as="style" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" onload="this.onload=null;this.rel='stylesheet'" rel="preload"/>
<noscript><link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet"/></noscript>
<link href="/images/fallbacks/favicon.png" rel="icon" type="image/png"/>
    <link rel="stylesheet" href="/css/bundle-content.min.css?v=895b1520"><!-- built by tools/build-css.js from: styles.css, services-navigation.css, quick-actions.css, service-page.css, responsive.css, kezza-ai.css, content-pages.css, treatment-pg.css, site-footer.css, header-pro.css, mobile-perf.css -->
<script>document.documentElement.classList.add('pg-js')</script>
<link href="{BASE_URL}/doctors/{slug}/" rel="canonical"/>
<meta content="profile" property="og:type"/>
<meta content="Kezza Hair &amp; Skin Clinic" property="og:site_name"/>
<meta content="en_IN" property="og:locale"/>
<meta content="{BASE_URL}/doctors/{slug}/" property="og:url"/>
<meta content="{og_title}" property="og:title"/>
<meta content="{og_desc}" property="og:description"/>
<meta content="{BASE_URL}/images/og/doctor-{slug}.jpg" property="og:image"/>
<meta content="1200" property="og:image:width"/>
<meta content="630" property="og:image:height"/>
<meta content="{og_img_alt}" property="og:image:alt"/>
<meta content="summary_large_image" name="twitter:card"/>
<meta content="{og_title}" name="twitter:title"/>
<meta content="{og_desc}" name="twitter:description"/>
<meta content="{BASE_URL}/images/og/doctor-{slug}.jpg" name="twitter:image"/>
<script type="application/ld+json">{schema_json}</script>
<link href="/css/site-quality.css?v=20261013" rel="stylesheet"/>
<script src="/js/media-fallbacks.min.js?v=664242f3"></script>
<link href="/site.webmanifest" rel="manifest"/>
<meta content="#00afc0" name="theme-color"/>
</head>
<body>
<a class="skip-to-content" href="#content-start">Skip to main content</a>
<noscript><iframe height="0" src="https://www.googletagmanager.com/ns.html?id=GTM-P5C9295R" style="display:none;visibility:hidden" width="0"></iframe></noscript>
{build_navbar()}
<main class="service-page-main pg-page" id="content-start">
<div class="pg-crumbs">
<div class="pg-container">
<nav aria-label="Breadcrumb" id="breadcrumb">
<div class="sp-breadcrumb-wrap">
<a aria-label="Go Back to Doctors" class="kz-back-btn" href="/about.html#doctors" title="Back to Doctors"><i class="fas fa-arrow-left"></i> <span>Back</span></a>
<ol><li><a href="/">Home</a></li><li><a href="/about.html">About Us</a></li><li aria-current="page">{name}</li></ol>
</div>
</nav>
</div>
</div>
<section class="pg-hero-wrap">
<div class="pg-container">
<div class="dp-hero-grid">
<div class="dp-photo"><img alt="{photo_alt}" decoding="async" fetchpriority="high" height="750" loading="eager" src="{photo_src}" width="600"/><div class="dp-photo-badge"><i class="fas fa-certificate"></i> Verified Specialist</div></div>
<div class="dp-info">
<div class="pg-chips">{chips_html}</div>
<span class="pg-eyebrow">{eyebrow}</span>
<h1 class="pg-hero-title">{name}</h1>
<p class="pg-hero-subtitle">{hero_sub}</p>
<p class="pg-hero-desc" style="margin-left:0">{hero_desc}</p>
<ul class="dp-facts">{facts_html}</ul>
<div class="dp-ctas">
<a class="btn-pg-wa" data-cta="profile-hero" href="{wa_href}" rel="noopener" target="_blank"><i aria-hidden="true" class="fab fa-whatsapp"></i> WhatsApp to book</a>
<a class="btn-pg-book" href="#schedule-assessment"><i aria-hidden="true" class="fas fa-calendar-check"></i> Request a call back</a>
</div>
</div>
</div>
</div>
</section>
<section class="pg-section-pad pg-bg-white" id="about">
<div class="pg-container">
<div class="dp-bio pg-prose">
<span class="pg-sec-kicker">Profile</span>
<h2 style="margin-top:12px">About {name}</h2>
{bio_html}
{qual_block}
</div>
</div>
</section>
<section class="pg-section-pad pg-bg-light" id="treatments">
<div class="pg-container">
<div class="pg-sec-head">
<span class="pg-sec-kicker">At Kezza</span>
<h2>{treat_h2}</h2>
<div class="pg-gold-bar"></div>
<p>{treat_p}</p>
</div>
<div class="dp-treat-grid">{"".join(treat_cards_html)}</div>
</div>
</section>
<section class="pg-section-pad pg-bg-white" id="clinics">
<div class="pg-container">
<div class="pg-sec-head">
<span class="pg-sec-kicker">Clinic{"s" if len(clinic_cards_html) > 1 else ""}</span>
<h2>{clinics_h2}</h2>
<div class="pg-gold-bar"></div>
<p>{clinics_p}</p>
</div>
<div class="dp-clinic-grid">{"".join(clinic_cards_html)}</div>
</div>
</section>
<section class="pg-section-pad pg-bg-light" id="faq">
<div class="pg-container">
<div class="pg-sec-head">
<span class="pg-sec-kicker">FAQs</span>
<h2>Booking with {name.split()[1] if len(name.split()) > 1 else name}: common questions</h2>
<div class="pg-gold-bar"></div>
</div>
<div class="pg-faq-list">
{"".join(faq_items_html)}
</div>
</div>
</section>
<section class="pg-section-pad pg-bg-light" id="schedule-assessment">
<div class="pg-container">
<div class="pg-book-grid">
<div class="pg-book-info">
<h2>{book_h2}</h2>
<p>{book_p}</p>
<div class="pg-trust-pills">{pills_html}</div>
<a class="btn-pg-wa" data-cta="booking" href="{wa_href}" rel="noopener" style="width:100%;margin-top:6px" target="_blank"><i aria-hidden="true" class="fab fa-whatsapp"></i> WhatsApp the clinic</a>
</div>
<form class="pg-book-form pg-lead-form" data-department="{dept}" data-page="/doctors/{slug}/" data-specialist="{spec}" data-treatment="{treatment_val}" data-wa="{wa_num}" id="pgLeadForm" novalidate="">
<p class="pg-form-title">Request a call back</p>
<p class="pg-form-sub">Takes 30 seconds. Our team replies during clinic hours.</p>
<div class="pg-form-row">
<div class="pg-input-group"><label for="pgName">Full name</label><input autocomplete="name" id="pgName" name="name" placeholder="e.g. Pooja Sharma" required="" type="text"/><span class="pg-field-error" data-error-for="name"></span></div>
<div class="pg-input-group"><label for="pgPhone">WhatsApp number</label><input autocomplete="tel-national" id="pgPhone" inputmode="numeric" maxlength="10" name="whatsapp" pattern="[6-9][0-9]{{9}}" placeholder="10-digit mobile" required="" type="tel"/><span class="pg-field-error" data-error-for="whatsapp"></span></div>
</div>
<div class="pg-form-row">
<div class="pg-input-group"><label for="pgClinic">Clinic</label><select id="pgClinic" name="clinic" required="">{c_opts_html}</select></div>
<div class="pg-input-group"><label for="pgTime">Best time to call <small>(optional)</small></label><select id="pgTime" name="preferredTime"><option>Any Time</option><option>Morning (9 AM – 12 PM)</option><option>Afternoon (12 – 4 PM)</option><option>Evening (4 – 8 PM)</option></select></div>
</div>
<div class="pg-input-group"><label for="pgTreatment">I am interested in</label><select id="pgTreatment" name="treatment">{t_opts_html}</select></div>
<div class="pg-input-group"><label for="pgNotes">Your concern <small>(optional)</small></label><textarea id="pgNotes" name="message" placeholder="Tell us briefly about your concern" rows="3"></textarea></div>
<div aria-hidden="true" class="pg-hp"><label for="kz_hp">Leave this empty</label><input autocomplete="off" id="kz_hp" name="kz_hp" tabindex="-1" type="text"/></div>
<p class="pg-form-status" role="alert"></p>
<button class="btn-submit-consult" type="submit"><i aria-hidden="true" class="fas fa-calendar-check"></i> Request My Consultation</button>
<p class="pg-form-legal">By sending this form you agree to be contacted by Kezza Clinic about your enquiry. See our <a href="/terms.html">privacy policy</a>.</p>
</form>
</div>
<p class="pg-note">This page is general information from Kezza Hair &amp; Skin Clinic and does not replace a consultation. Suitability, number of sessions and results differ from person to person.</p>
</div>
</section>
</main>
{build_footer()}
</body>
</html>
"""
    return html_content


def main():
    print(f"Building doctor profile pages into {DOCS_DIR}...")
    for slug, doc in DOCTORS.items():
        doc_dir = os.path.join(DOCS_DIR, slug)
        os.makedirs(doc_dir, exist_ok=True)
        html_content = generate_doctor_page(doc)
        out_path = os.path.join(doc_dir, "index.html")
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(html_content)
        print(f"  ✓ Built {slug}/index.html")
    print("All doctor pages successfully built.")


if __name__ == "__main__":
    main()
