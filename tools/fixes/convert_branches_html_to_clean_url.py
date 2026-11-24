#!/usr/bin/env python3
"""
convert_branches_html_to_clean_url.py
--------------------------------------
Converts /branches.html to clean folder URL /branches/
1. Creates frontend/branches/index.html with root-relative paths and updated canonical/schema.
2. Creates redirect stub in frontend/branches.html.
3. Updates all internal links across frontend/ HTML files.
4. Updates sitemap.xml.
5. Updates .htaccess.
6. Updates server.js.
7. Updates tools/css-bundles.json and tools/seo/taxonomy.json.
"""

import os, re, json

BASE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
FRONTEND = os.path.join(BASE, "frontend")

OLD_URL = "https://www.kezza.co.in/branches.html"
NEW_URL = "https://www.kezza.co.in/branches/"

# ── 1. Create frontend/branches/index.html ───────────────────────────
SRC_FILE = os.path.join(FRONTEND, "branches.html")
DEST_DIR = os.path.join(FRONTEND, "branches")
DEST_FILE = os.path.join(DEST_DIR, "index.html")

os.makedirs(DEST_DIR, exist_ok=True)

with open(SRC_FILE, "r", encoding="utf-8") as fh:
    branches_html = fh.read()

page = branches_html

# Update canonical, og:url, twitter
page = page.replace(OLD_URL, NEW_URL)

# Update relative asset paths to root-relative paths
# css/
page = re.sub(r'href=["\']css/', 'href="/css/', page)
# js/
page = re.sub(r'src=["\']js/', 'src="/js/', page)
# images/
page = re.sub(r'src=["\']images/', 'src="/images/', page)
page = re.sub(r'href=["\']images/', 'href="/images/', page)
# pages
page = re.sub(r'href=["\']index\.html["\']', 'href="/"', page)
page = re.sub(r'href=["\']about\.html["\']', 'href="/about.html"', page)
page = re.sub(r'href=["\']contact\.html["\']', 'href="/contact.html"', page)
page = re.sub(r'href=["\']face-scanner\.html["\']', 'href="/face-scanner.html"', page)
page = re.sub(r'href=["\']branches\.html["\']', 'href="/branches/"', page)
page = re.sub(r'href=["\']permanent-makeup\.html["\']', 'href="/permanent-makeup.html"', page)
page = re.sub(r'href=["\']weight-loss\.html["\']', 'href="/weight-loss.html"', page)
page = re.sub(r'href=["\']terms\.html["\']', 'href="/terms.html"', page)
page = re.sub(r'href=["\']skin-services\.html["\']', 'href="/skin-services.html"', page)
page = re.sub(r'href=["\']white-hair-removal\.html["\']', 'href="/white-hair-removal.html"', page)
page = re.sub(r'href=["\']electrolysis\.html["\']', 'href="/electrolysis.html"', page)
page = re.sub(r'href=["\']prp-therapy\.html["\']', 'href="/prp-therapy.html"', page)
page = re.sub(r'href=["\']locations/["\']', 'href="/locations/"', page)
page = re.sub(r'href=["\']locations/jaipur/["\']', 'href="/locations/jaipur/"', page)
page = re.sub(r'href=["\']locations/sikar/["\']', 'href="/locations/sikar/"', page)
page = re.sub(r'href=["\']locations/ajmer/["\']', 'href="/locations/ajmer/"', page)
page = re.sub(r'href=["\']blog/["\']', 'href="/blog/"', page)

with open(DEST_FILE, "w", encoding="utf-8") as fh:
    fh.write(page)
print(f"✅ Created {DEST_FILE}")

# ── 2. Create redirect stub in frontend/branches.html ───────────────
STUB_HTML = f"""<!DOCTYPE html>
<html lang="en-IN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hair &amp; Skin Clinic Franchise in Rajasthan | Kezza Clinic</title>
  <meta name="description" content="Partner with Kezza Hair &amp; Skin Clinic. This page has moved — redirecting you now.">
  <meta name="robots" content="noindex, follow">
  <link rel="canonical" href="{NEW_URL}">
  <meta property="og:url" content="{NEW_URL}">
  <meta property="og:title" content="Hair &amp; Skin Clinic Franchise in Rajasthan | Kezza Clinic">
  <meta property="og:image" content="https://www.kezza.co.in/images/fallbacks/og/branches.html.webp">
  <meta http-equiv="refresh" content="0; url=/branches/">
  <script>window.location.replace("/branches/")</script>
</head>
<body>
  <p>This page has moved. <a href="/branches/">Click here to go to Franchise</a>.</p>
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
    content = content.replace('href="/branches.html"', 'href="/branches/"')
    content = content.replace('href="branches.html"', 'href="/branches/"')
    content = content.replace("href='/branches.html'", "href='/branches/'")
    content = content.replace("href='branches.html'", "href='/branches/'")
    content = content.replace('https://www.kezza.co.in/branches.html', 'https://www.kezza.co.in/branches/')

    if content != orig:
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(content)
        updated_count += 1

print(f"✅ Updated links in {updated_count} HTML files to /branches/")

# ── 4. Update sitemap.xml ────────────────────────────────────────────
SITEMAP = os.path.join(FRONTEND, "sitemap.xml")
with open(SITEMAP, "r", encoding="utf-8") as fh:
    sitemap = fh.read()

sitemap = sitemap.replace(
    "<loc>https://www.kezza.co.in/branches.html</loc>",
    f"<loc>{NEW_URL}</loc>"
)
with open(SITEMAP, "w", encoding="utf-8") as fh:
    fh.write(sitemap)
print("✅ sitemap.xml updated")

# ── 5. Update .htaccess ──────────────────────────────────────────────
HTACCESS = os.path.join(FRONTEND, ".htaccess")
with open(HTACCESS, "r", encoding="utf-8") as fh:
    htaccess = fh.read()

# Add redirect rule for branches.html
if "RewriteRule ^branches\\.html" not in htaccess:
    REDIRECT_LINE = "\n    # 301: /branches.html -> /branches/ (clean URL)\n    RewriteRule ^branches\\.html$ /branches/ [R=301,L]\n"
    htaccess = htaccess.replace("RewriteEngine On", "RewriteEngine On\n" + REDIRECT_LINE, 1)

# Add branches to folder rewrite list
if "|branches|" not in htaccess and "(branches|" not in htaccess:
    htaccess = htaccess.replace("RewriteRule ^(locations|", "RewriteRule ^(branches|locations|")

with open(HTACCESS, "w", encoding="utf-8") as fh:
    fh.write(htaccess)
print("✅ .htaccess updated with 301 redirect and trailing slash rule")

# ── 6. Update server.js ──────────────────────────────────────────────
SERVER = os.path.join(BASE, "server.js")
with open(SERVER, "r", encoding="utf-8") as fh:
    server_js = fh.read()

if "app.use('/branches.html'" not in server_js:
    REDIRECT_EXPRESS = """// ── 301 Permanent Redirects ────────────────────────────────────────
app.use('/branches.html', (req, res) => {
    res.redirect(301, '/branches/');
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

if "branches/index.html" not in bundles["pages"]:
    bundles["pages"]["branches/index.html"] = "branches"
    with open(CSS_BUNDLES, "w", encoding="utf-8") as fh:
        json.dump(bundles, fh, indent=2)
    print("✅ tools/css-bundles.json updated")

# ── 8. Update tools/seo/taxonomy.json ─────────────────────────────────
TAXONOMY = os.path.join(BASE, "tools", "seo", "taxonomy.json")
with open(TAXONOMY, "r", encoding="utf-8") as fh:
    tax_text = fh.read()

tax_text = tax_text.replace('"file": "branches.html", "url": "/branches.html"', '"file": "branches/index.html", "url": "/branches/"')
with open(TAXONOMY, "w", encoding="utf-8") as fh:
    fh.write(tax_text)
print("✅ tools/seo/taxonomy.json updated")
