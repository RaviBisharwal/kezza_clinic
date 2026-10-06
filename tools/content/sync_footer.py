#!/usr/bin/env python3
"""One footer for the whole site.

Writes the same footer (same columns, clinic name, phone numbers and addresses) into every page that has
<footer class="footer">. Clinic name, phones, email and addresses come from tools/seo/site-data.json, so
change them there and run:

    python3 tools/content/sync_footer.py        (also runs first in `npm run build`)

Pages in the site root get relative links (they also open from disk); pages in folders get /root links.
Treatment links carry data-pseo, so the content build points them at a treatment page only once that page
is published, and at its section on the service page until then.
The Hindi page (frontend/hi/) is written by the content build, which adds the same footer marked lang="en-IN".
"""
import html
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FE = os.path.join(ROOT, "frontend")
DATA = json.load(open(os.path.join(ROOT, "tools", "seo", "site-data.json"), encoding="utf-8"))
SKIP_DIRS = {"hi", "node_modules", "css", "js", "images", "videos", "fonts"}
FOOTER_RE = re.compile(r'<footer class="footer[^"]*">.*?</footer>', re.S)

QUICK = [
    ("Home", "/index.html"), ("About Us", "/about.html"), ("Our Clinics", "/locations/"),
    ("Hair &amp; Skin Blog", "/blog/"), ("AI Face Scanner", "/face-scanner.html"),
    ("Permanent Makeup", "/permanent-makeup.html"), ("Weight Loss", "/weight-loss.html"),
    ("Franchise", "/branches.html"), ("Contact Us", "/contact.html"), ("Privacy &amp; Terms", "/terms.html"),
]
# (text, live url, treatment id or None, fallback)
HAIR = [
    ("Hair Transplant", "/hair-transplant/", None, None),
    ("PRP Therapy", "/prp-therapy.html", None, None),
    ("GFC Therapy", "/gfc-treatment/", "gfc-treatment", "/prp-therapy.html#gfc-therapy"),
    ("White Hair Removal", "/white-hair-removal.html", None, None),
    ("Electrolysis", "/electrolysis.html", None, None),
    ("Hair Wig &amp; Replacement", "/hair-wig.html", None, None),
    ("Hair Loss Consultation", "/hair-loss-consultation.html", None, None),
]
SKIN = [  # same order and names as the Skin Services menu in the header
    ("Hydra Facial", "/hydra-facial/", "hydra-facial", "/skin-services.html#hydra-facial"),
    ("Acne &amp; Acne Scars", "/acne-treatment/", "acne-treatment", "/skin-services.html#acne"),
    ("Pigmentation &amp; Melasma", "/pigmentation-treatment/", "pigmentation-treatment", "/skin-services.html#pigmentation"),
    ("Botox &amp; Fillers", "/botox/", "botox", "/skin-services.html#botox"),
    ("Dark Circle Treatment", "/dark-circles-treatment/", "dark-circles-treatment", "/skin-services.html#dark-circles"),
    ("Stretch Marks", "/stretch-marks-treatment/", "stretch-marks", "/skin-services.html#stretch-marks"),
    ("Medical Dermatology", "/medical-dermatology/", "medical-dermatology", "/skin-services.html#medical-derma"),
    ("Laser Hair Removal", "/laser-hair-removal/", "laser-hair-removal", "/skin-services.html#laser"),
    ("Skin Consultation", "/skin-consultation/", "skin-consultation", "/skin-services.html#consultation"),
]
SOCIAL = [("Instagram", "fab fa-instagram", "https://www.instagram.com/kezza_clinic"),
          ("Facebook", "fab fa-facebook-f", "https://www.facebook.com/kezzaclinic"),
          ("YouTube", "fab fa-youtube", "https://www.youtube.com/@Kezza_Clinic_Jaipur")]


def tel(n):
    return "+" + re.sub(r"\D", "", n)


def footer(root):
    """root=True → relative links for pages in the site root."""
    def u(href):
        if not root or href.startswith(("http", "tel:", "mailto:")):
            return href
        return href.lstrip("/")

    def link(text, href, tid=None, fb=None):
        if tid:
            # until the treatment page is published the build points this at the fallback
            return f'<li><a href="{u(fb)}" data-pseo="{tid}" data-pseo-fallback="{u(fb)}">{text}</a></li>'
        return f'<li><a href="{u(href)}">{text}</a></li>'

    org = DATA["organization"]
    br = DATA["branches"]
    main_phone = org["telephone"]
    ajmer_phone = br["ajmer"]["phones"][0]
    wa = re.sub(r"\D", "", main_phone)
    name = html.escape(org["name"])
    addr = "\n".join(
        f'                        <li><i class="fas fa-map-marker-alt" aria-hidden="true"></i><span><a href="{u("/locations/" + k + "/")}"><strong>{html.escape(b["city"])}</strong></a>: {html.escape(b["street"])}</span></li>'
        for k, b in br.items())
    I = "                        "
    return f'''<footer class="footer kz-site-footer">
        <div class="container">
            <div class="footer-grid kz-footer-grid">
                <div class="footer-column kz-footer-brand">
                    <p class="footer-nav-title kz-footer-name">{name}</p>
                    <p>Doctor-led hair restoration, skin and laser care, permanent makeup and body contouring at our clinics in Jaipur, Sikar and Ajmer, Rajasthan.</p>
                    <p class="kz-footer-hours"><i class="far fa-clock" aria-hidden="true"></i> Open {html.escape(DATA["hours"]["label"])}</p>
                    <div class="kz-footer-social">
{chr(10).join(f'{I}<a href="{h}" target="_blank" rel="noopener noreferrer" aria-label="{n}" title="{n}"><i class="{c}" aria-hidden="true"></i></a>' for n, c, h in SOCIAL)}
                    </div>
                </div>
                <div class="footer-column">
                    <p class="footer-nav-title">Quick Links</p>
                    <ul>
{chr(10).join(I + link(t, h) for t, h in QUICK)}
                    </ul>
                </div>
                <div class="footer-column">
                    <p class="footer-nav-title"><a href="{u("/hair-services.html")}">Hair Services</a></p>
                    <ul>
{chr(10).join(I + link(*x) for x in HAIR)}
                    </ul>
                </div>
                <div class="footer-column">
                    <p class="footer-nav-title"><a href="{u("/skin-services.html")}">Skin Services</a></p>
                    <ul>
{chr(10).join(I + link(*x) for x in SKIN)}
                    </ul>
                </div>
                <div class="footer-column kz-footer-contact">
                    <p class="footer-nav-title">Contact &amp; Clinics</p>
                    <ul>
                        <li><i class="fas fa-phone-alt" aria-hidden="true"></i><span><a href="tel:{tel(main_phone)}">{main_phone}</a> <small>Jaipur &amp; Sikar</small></span></li>
                        <li><i class="fas fa-phone-alt" aria-hidden="true"></i><span><a href="tel:{tel(ajmer_phone)}">{ajmer_phone}</a> <small>Ajmer</small></span></li>
                        <li><i class="fab fa-whatsapp" aria-hidden="true"></i><span><a href="https://wa.me/{wa}" target="_blank" rel="noopener noreferrer">WhatsApp {main_phone}</a></span></li>
                        <li><i class="fas fa-envelope" aria-hidden="true"></i><span><a href="mailto:{org["email"]}">{org["email"]}</a></span></li>
{addr}
                    </ul>
                </div>
            </div>
            <div class="footer-bottom kz-footer-bottom">
                <p>&copy; <span class="footer-year">2026</span> {name}. All rights reserved.</p>
                <p class="kz-footer-note">The information on this website is general and does not replace a consultation with a doctor. Results differ from person to person.</p>
            </div>
        </div>
        <script>document.querySelectorAll('.footer-year').forEach(el=>el.textContent=new Date().getFullYear());</script>
    </footer>'''


PSEO_HREF_RE = re.compile(r'href="[^"]*"(?= data-pseo=)')


def same_except_pseo_hrefs(a, b):
    return PSEO_HREF_RE.sub('href=""', a) == PSEO_HREF_RE.sub('href=""', b)


def main():
    changed = []
    for dp, dns, fns in os.walk(FE):
        dns[:] = [d for d in dns if d not in SKIP_DIRS]
        for fn in fns:
            if not fn.endswith(".html"):
                continue
            path = os.path.join(dp, fn)
            s = open(path, encoding="utf-8").read()
            if not FOOTER_RE.search(s):
                continue
            at_root = os.path.dirname(os.path.relpath(path, FE)) == ""
            new = footer(at_root)
            old = FOOTER_RE.search(s).group(0)
            if same_except_pseo_hrefs(old, new):
                continue          # only the build-managed treatment links differ: leave them as the build set them
            s2 = FOOTER_RE.sub(lambda m: new, s, count=1)
            if s2 != s:
                open(path, "w", encoding="utf-8").write(s2)
                changed.append(os.path.relpath(path, FE))
    print(f"footer: {len(changed)} page(s) updated")
    for c in changed:
        print("  ", c)


if __name__ == "__main__":
    sys.exit(main())
