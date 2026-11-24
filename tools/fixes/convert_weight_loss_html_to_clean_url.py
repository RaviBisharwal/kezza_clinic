#!/usr/bin/env python3
"""
convert_weight_loss_html_to_clean_url.py
-----------------------------------------
Converts /weight-loss.html to clean folder URL /weight-loss/
1. Creates frontend/weight-loss/index.html with root-relative paths and updated canonical/schema.
2. Creates redirect stub in frontend/weight-loss.html.
3. Updates all internal links across frontend/ HTML files.
4. Updates sitemap.xml.
5. Updates .htaccess.
6. Updates server.js.
7. Updates tools/css-bundles.json and tools/seo/taxonomy.json.
8. Updates sync_footer.py, locations.json, site-data.json, llms.txt, etc.
"""

import os, re, json

BASE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
FRONTEND = os.path.join(BASE, "frontend")

OLD_URL = "https://www.kezza.co.in/weight-loss.html"
NEW_URL = "https://www.kezza.co.in/weight-loss/"

# ── 1. Create frontend/weight-loss/index.html ────────────────────────
SRC_FILE = os.path.join(FRONTEND, "weight-loss.html")
DEST_DIR = os.path.join(FRONTEND, "weight-loss")
DEST_FILE = os.path.join(DEST_DIR, "index.html")

os.makedirs(DEST_DIR, exist_ok=True)

with open(SRC_FILE, "r", encoding="utf-8") as fh:
    wl_html = fh.read()

page = wl_html

# Convert all relative assets & links to root-relative
page = re.sub(r'((?:href|src)=["\'])(?!(?:/|https?://|#|javascript:|mailto:|tel:))([^"\']+["\'])', r'\1/\2', page)

# Update full URL references in schemas, og, canonical
page = page.replace(OLD_URL + "#", NEW_URL + "#")
page = page.replace(OLD_URL, NEW_URL)

# Update internal references
page = page.replace('/weight-loss.html#', '/weight-loss/#')
page = page.replace('/weight-loss.html', '/weight-loss/')
page = page.replace('"weight-loss.html#', '"/weight-loss/#')
page = page.replace("'weight-loss.html#", "'/weight-loss/#")
page = page.replace('"weight-loss.html"', '"/weight-loss/"')
page = page.replace("'weight-loss.html'", "'/weight-loss/'")

with open(DEST_FILE, "w", encoding="utf-8") as fh:
    fh.write(page)
print(f"✅ Created {DEST_FILE}")

# ── 2. Create redirect stub in frontend/weight-loss.html ─────────────
STUB_HTML = f"""<!DOCTYPE html>
<html lang="en-IN">
<head>
  <meta charset="utf-8">
  <title>Redirecting to Weight Management &amp; Body Sculpting...</title>
  <link rel="canonical" href="{NEW_URL}">
  <meta name="robots" content="noindex, follow">
  <meta http-equiv="refresh" content="0; url=/weight-loss/">
  <script>window.location.replace('/weight-loss/');</script>
</head>
<body>
  <p>Redirecting to <a href="/weight-loss/">Weight Management &amp; Body Sculpting</a>...</p>
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

    # Replace absolute URLs with anchors
    content = content.replace('https://www.kezza.co.in/weight-loss.html#', 'https://www.kezza.co.in/weight-loss/#')
    content = content.replace('https://www.kezza.co.in/weight-loss.html', 'https://www.kezza.co.in/weight-loss/')

    # Replace root-relative links with anchors
    content = content.replace('href="/weight-loss.html#', 'href="/weight-loss/#')
    content = content.replace("href='/weight-loss.html#", "href='/weight-loss/#")
    content = content.replace('href="/weight-loss.html"', 'href="/weight-loss/"')
    content = content.replace("href='/weight-loss.html'", "href='/weight-loss/'")

    # Replace relative links with anchors
    content = content.replace('href="weight-loss.html#', 'href="/weight-loss/#')
    content = content.replace("href='weight-loss.html#", "href='/weight-loss/#")
    content = content.replace('href="weight-loss.html"', 'href="/weight-loss/"')
    content = content.replace("href='weight-loss.html'", "href='/weight-loss/'")

    # Replace data attributes or other quotes
    content = content.replace('"/weight-loss.html#', '"/weight-loss/#')
    content = content.replace('"/weight-loss.html"', '"/weight-loss/"')
    content = content.replace('"weight-loss.html#', '"/weight-loss/#')
    content = content.replace('"weight-loss.html"', '"/weight-loss/"')

    if content != orig:
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(content)
        updated_count += 1

print(f"✅ Updated links in {updated_count} HTML files to /weight-loss/")

# ── 4. Update sitemap.xml ────────────────────────────────────────────
SITEMAP = os.path.join(FRONTEND, "sitemap.xml")
with open(SITEMAP, "r", encoding="utf-8") as fh:
    sitemap = fh.read()

sitemap = sitemap.replace(
    "<loc>https://www.kezza.co.in/weight-loss.html</loc>",
    f"<loc>{NEW_URL}</loc>"
)
with open(SITEMAP, "w", encoding="utf-8") as fh:
    fh.write(sitemap)
print("✅ sitemap.xml updated")

# ── 5. Update .htaccess ──────────────────────────────────────────────
HTACCESS = os.path.join(FRONTEND, ".htaccess")
with open(HTACCESS, "r", encoding="utf-8") as fh:
    htaccess = fh.read()

if "RewriteRule ^weight-loss\\.html" not in htaccess:
    REDIRECT_LINE = "\n    # 301: /weight-loss.html -> /weight-loss/ (clean URL)\n    RewriteRule ^weight-loss\\.html$ /weight-loss/ [R=301,L]\n"
    htaccess = htaccess.replace("RewriteEngine On", "RewriteEngine On\n" + REDIRECT_LINE, 1)

# Add weight-loss to folder rewrite list if not present
if "|weight-loss|" not in htaccess and "(weight-loss|" not in htaccess:
    htaccess = htaccess.replace("RewriteRule ^(branches|", "RewriteRule ^(weight-loss|branches|")

with open(HTACCESS, "w", encoding="utf-8") as fh:
    fh.write(htaccess)
print("✅ .htaccess updated with 301 redirect")

# ── 6. Update server.js ──────────────────────────────────────────────
SERVER = os.path.join(BASE, "server.js")
with open(SERVER, "r", encoding="utf-8") as fh:
    server_js = fh.read()

if "app.use('/weight-loss.html'" not in server_js:
    REDIRECT_EXPRESS = """// ── 301 Permanent Redirects ────────────────────────────────────────
app.use('/weight-loss.html', (req, res) => {
    res.redirect(301, '/weight-loss/');
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

if "weight-loss/index.html" not in bundles["pages"]:
    bundles["pages"]["weight-loss/index.html"] = "weight-loss"
    with open(CSS_BUNDLES, "w", encoding="utf-8") as fh:
        json.dump(bundles, fh, indent=2)
    print("✅ tools/css-bundles.json updated")

# ── 8. Update tools/seo/taxonomy.json ─────────────────────────────────
TAXONOMY = os.path.join(BASE, "tools", "seo", "taxonomy.json")
with open(TAXONOMY, "r", encoding="utf-8") as fh:
    tax_text = fh.read()

tax_text = tax_text.replace('"hub": "/weight-loss.html"', '"hub": "/weight-loss/"')
tax_text = tax_text.replace('"consultation": "/weight-loss.html#consultation"', '"consultation": "/weight-loss/#consultation"')
with open(TAXONOMY, "w", encoding="utf-8") as fh:
    fh.write(tax_text)
print("✅ tools/seo/taxonomy.json updated")

# ── 9. Update additional files ───────────────────────────────────────
files_to_update = [
    os.path.join(BASE, "tools", "content", "sync_footer.py"),
    os.path.join(BASE, "tools", "content", "locations.json"),
    os.path.join(BASE, "tools", "seo", "site-data.json"),
    os.path.join(BASE, "frontend", "llms.txt"),
    os.path.join(BASE, "frontend", "llms-full.txt"),
    os.path.join(BASE, "frontend", "js", "kezza-ai.js"),
    os.path.join(BASE, "frontend", "js", "kezza-ai.min.js"),
    os.path.join(BASE, "tools", "update_mega_menu.py"),
    os.path.join(BASE, "tools", "treatment-pages", "build_pages.py"),
    os.path.join(BASE, "tools", "content", "blog", "20-semaglutide-for-weight-loss.html"),
    os.path.join(BASE, "tools", "content", "blog", "13-cryolipolysis-fat-freezing-guide.html"),
    os.path.join(BASE, "tools", "content", "blog", "14-body-sculpting-vs-weight-loss.html"),
]

for fp in files_to_update:
    if os.path.exists(fp):
        with open(fp, "r", encoding="utf-8") as fh:
            c = fh.read()
        c2 = c.replace("https://www.kezza.co.in/weight-loss.html#", "https://www.kezza.co.in/weight-loss/#")
        c2 = c2.replace("https://www.kezza.co.in/weight-loss.html", "https://www.kezza.co.in/weight-loss/")
        c2 = c2.replace("/weight-loss.html#", "/weight-loss/#")
        c2 = c2.replace("/weight-loss.html", "/weight-loss/")
        c2 = c2.replace('"weight-loss.html#', '"/weight-loss/#')
        c2 = c2.replace('"weight-loss.html"', '"/weight-loss/"')
        c2 = c2.replace("'weight-loss.html#", "'/weight-loss/#")
        c2 = c2.replace("'weight-loss.html'", "'/weight-loss/'")
        if c2 != c:
            with open(fp, "w", encoding="utf-8") as fh:
                fh.write(c2)
            print(f"✅ Updated {fp}")

print("✨ All updates complete!")
