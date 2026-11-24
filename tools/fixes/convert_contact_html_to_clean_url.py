#!/usr/bin/env python3
"""
convert_contact_html_to_clean_url.py
------------------------------------
Converts /contact.html to clean folder URL /contact/
1. Creates frontend/contact/index.html with root-relative paths and updated canonical/schema.
2. Creates redirect stub in frontend/contact.html.
3. Updates all internal links across frontend/ HTML files.
4. Updates sitemap.xml.
5. Updates .htaccess.
6. Updates server.js.
7. Updates tools/css-bundles.json and tools/seo/taxonomy.json.
8. Updates frontend/js/quick-actions.js.
"""

import os, re, json

BASE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
FRONTEND = os.path.join(BASE, "frontend")

OLD_URL = "https://www.kezza.co.in/contact.html"
NEW_URL = "https://www.kezza.co.in/contact/"

# ── 1. Create frontend/contact/index.html ────────────────────────────
SRC_FILE = os.path.join(FRONTEND, "contact.html")
DEST_DIR = os.path.join(FRONTEND, "contact")
DEST_FILE = os.path.join(DEST_DIR, "index.html")

os.makedirs(DEST_DIR, exist_ok=True)

with open(SRC_FILE, "r", encoding="utf-8") as fh:
    contact_html = fh.read()

page = contact_html

# Update canonical and og:url
page = page.replace(OLD_URL, NEW_URL)
page = page.replace('"https://www.kezza.co.in/contact.html"', f'"{NEW_URL}"')

# Ensure bundle-contact.min.css has leading slash
page = re.sub(r'href=["\']css/', 'href="/css/', page)
page = re.sub(r'src=["\']js/', 'src="/js/', page)
page = re.sub(r'src=["\']images/', 'src="/images/', page)
page = re.sub(r'href=["\']images/', 'href="/images/', page)

# Prefix any relative href or src that doesn't start with / or protocol
def repl_attr(m):
    val = m.group(1)
    if not val.startswith('/') and not val.startswith('http') and not val.startswith('tel:') and not val.startswith('mailto:') and not val.startswith('javascript:') and not val.startswith('#'):
        return f'href="/{val}"'
    return m.group(0)

page = re.sub(r'href=[\"\']([a-zA-Z0-9_\-\./#]+)[\"\']', repl_attr, page)

def repl_src(m):
    val = m.group(1)
    if not val.startswith('/') and not val.startswith('http') and not val.startswith('data:'):
        return f'src="/{val}"'
    return m.group(0)

page = re.sub(r'src=[\"\']([a-zA-Z0-9_\-\./#]+)[\"\']', repl_src, page)

# Clean up contact.html references inside contact/index.html to /contact/
page = page.replace('href="/contact.html"', 'href="/contact/"')
page = page.replace('href="contact.html"', 'href="/contact/"')
page = page.replace('href="/branches.html"', 'href="/branches/"')
page = page.replace('href="branches.html"', 'href="/branches/"')
page = page.replace('href="/index.html"', 'href="/"')
page = page.replace('href="index.html"', 'href="/"')

with open(DEST_FILE, "w", encoding="utf-8") as fh:
    fh.write(page)
print(f"✅ Created {DEST_FILE}")

# ── 2. Create redirect stub in frontend/contact.html ─────────────────
STUB_HTML = f"""<!DOCTYPE html>
<html lang="en-IN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Book a Consultation | Contact Kezza Clinic Jaipur</title>
  <meta name="description" content="Book a consultation at Kezza Hair &amp; Skin Clinic. This page has moved — redirecting you now.">
  <meta name="robots" content="noindex, follow">
  <link rel="canonical" href="{NEW_URL}">
  <meta property="og:url" content="{NEW_URL}">
  <meta property="og:title" content="Book a Consultation | Contact Kezza Clinic Jaipur">
  <meta property="og:image" content="https://www.kezza.co.in/images/fallbacks/og/contact.html.webp">
  <meta http-equiv="refresh" content="0; url=/contact/">
  <script>window.location.replace("/contact/")</script>
</head>
<body>
  <p>This page has moved. <a href="/contact/">Click here to go to Contact</a>.</p>
</body>
</html>
"""
with open(SRC_FILE, "w", encoding="utf-8") as fh:
    fh.write(STUB_HTML)
print(f"✅ Replaced {SRC_FILE} with redirect stub")

# ── 3. Update all HTML files in frontend/ ────────────────────────────
html_files = []
for root, dirs, files in os.walk(FRONTEND):
    for f in files:
        if f.endswith(".html"):
            html_files.append(os.path.join(root, f))

updated_count = 0
for path in html_files:
    if os.path.abspath(path) == os.path.abspath(SRC_FILE):
        continue

    with open(path, "r", encoding="utf-8") as fh:
        content = fh.read()

    orig = content
    content = content.replace('href="/contact.html"', 'href="/contact/"')
    content = content.replace('href="contact.html"', 'href="/contact/"')
    content = content.replace("href='/contact.html'", "href='/contact/'")
    content = content.replace("href='contact.html'", "href='/contact/'")
    content = content.replace('https://www.kezza.co.in/contact.html', 'https://www.kezza.co.in/contact/')

    if content != orig:
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(content)
        updated_count += 1

print(f"✅ Updated links in {updated_count} HTML files to /contact/")

# ── 4. Update sitemap.xml ────────────────────────────────────────────
SITEMAP = os.path.join(FRONTEND, "sitemap.xml")
with open(SITEMAP, "r", encoding="utf-8") as fh:
    sitemap = fh.read()

sitemap = sitemap.replace(
    "<loc>https://www.kezza.co.in/contact.html</loc>",
    f"<loc>{NEW_URL}</loc>"
)
with open(SITEMAP, "w", encoding="utf-8") as fh:
    fh.write(sitemap)
print("✅ sitemap.xml updated")

# ── 5. Update .htaccess ──────────────────────────────────────────────
HTACCESS = os.path.join(FRONTEND, ".htaccess")
with open(HTACCESS, "r", encoding="utf-8") as fh:
    htaccess = fh.read()

# Add redirect rule for contact.html
if "RewriteRule ^contact\\.html" not in htaccess:
    REDIRECT_LINE = "\n    # 301: /contact.html -> /contact/ (clean URL)\n    RewriteRule ^contact\\.html$ /contact/ [R=301,L]\n"
    htaccess = htaccess.replace("RewriteEngine On", "RewriteEngine On\n" + REDIRECT_LINE, 1)

# Add contact to folder rewrite list
if "|contact|" not in htaccess and "(contact|" not in htaccess:
    htaccess = htaccess.replace("RewriteRule ^(branches|", "RewriteRule ^(branches|contact|")

with open(HTACCESS, "w", encoding="utf-8") as fh:
    fh.write(htaccess)
print("✅ .htaccess updated with 301 redirect and trailing slash rule")

# ── 6. Update server.js ──────────────────────────────────────────────
SERVER = os.path.join(BASE, "server.js")
with open(SERVER, "r", encoding="utf-8") as fh:
    server_js = fh.read()

if "app.use('/contact.html'" not in server_js:
    REDIRECT_EXPRESS = """// ── 301 Permanent Redirects ────────────────────────────────────────
app.use('/contact.html', (req, res) => {
    res.redirect(301, '/contact/');
});
"""
    server_js = server_js.replace(
        "// ── 301 Permanent Redirects ────────────────────────────────────────",
        REDIRECT_EXPRESS.strip() + "\n",
        1
    )
    with open(SERVER, "w", encoding="utf-8") as fh:
        fh.write(server_js)
    print("✅ server.js updated with 301 redirect")

# ── 7. Update tools/css-bundles.json ──────────────────────────────────
CSS_BUNDLES = os.path.join(BASE, "tools", "css-bundles.json")
with open(CSS_BUNDLES, "r", encoding="utf-8") as fh:
    bundles = json.load(fh)

if "contact/index.html" not in bundles["pages"]:
    bundles["pages"]["contact/index.html"] = "contact"
    with open(CSS_BUNDLES, "w", encoding="utf-8") as fh:
        json.dump(bundles, fh, indent=2)
    print("✅ tools/css-bundles.json updated")

# ── 8. Update tools/seo/taxonomy.json ─────────────────────────────────
TAXONOMY = os.path.join(BASE, "tools", "seo", "taxonomy.json")
with open(TAXONOMY, "r", encoding="utf-8") as fh:
    tax_text = fh.read()

tax_text = tax_text.replace('"file": "contact.html", "url": "/contact.html"', '"file": "contact/index.html", "url": "/contact/"')
with open(TAXONOMY, "w", encoding="utf-8") as fh:
    fh.write(tax_text)
print("✅ tools/seo/taxonomy.json updated")

# ── 9. Update frontend/js/quick-actions.js ────────────────────────────
QA_JS = os.path.join(FRONTEND, "js", "quick-actions.js")
with open(QA_JS, "r", encoding="utf-8") as fh:
    qa = fh.read()

qa = qa.replace("targetHref.indexOf('contact.html') !== -1", "targetHref.indexOf('contact') !== -1")
with open(QA_JS, "w", encoding="utf-8") as fh:
    fh.write(qa)
print("✅ quick-actions.js updated")
