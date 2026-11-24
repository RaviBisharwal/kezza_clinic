#!/usr/bin/env python3
"""
rename_botox_to_dermal_fillers.py
---------------------------------
Full professional URL and navigation rename:
  /botox/ -> /dermal-fillers/

1. Updates internal links across all HTML files.
2. Updates canonical, og, and JSON-LD in dermal-fillers/index.html.
3. Creates a client-side redirect stub in botox/index.html.
4. Updates sitemap.xml.
5. Updates .htaccess.
6. Updates server.js.
"""

import os, re

BASE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
FRONTEND = os.path.join(BASE, "frontend")

OLD_SLUG = "botox"
NEW_SLUG = "dermal-fillers"
OLD_URL = f"https://www.kezza.co.in/{OLD_SLUG}/"
NEW_URL = f"https://www.kezza.co.in/{NEW_SLUG}/"

# ── 1. Update all HTML files ─────────────────────────────────────────
html_files = []
for root, dirs, files in os.walk(FRONTEND):
    for f in files:
        if f.endswith(".html"):
            html_files.append(os.path.join(root, f))

# Pattern for nav link: <a ... href="/botox/">Botox &amp; Fillers</a> -> <a ... href="/dermal-fillers/">Dermal Fillers</a>
NAV_PATTERN = re.compile(
    r'(<a\b[^>]*href=["\'][^"\']*)/botox/(["\'][^>]*>)\s*Botox\s*(?:&amp;|&)\s*Fillers\s*(</a>)',
    re.IGNORECASE
)

updated_count = 0
for path in html_files:
    if os.path.abspath(path) == os.path.abspath(os.path.join(FRONTEND, OLD_SLUG, "index.html")):
        continue  # will overwrite stub separately

    with open(path, "r", encoding="utf-8") as fh:
        content = fh.read()

    orig = content
    # Update navigation menu text and href
    content = NAV_PATTERN.sub(r'\1/dermal-fillers/\2Dermal Fillers\3', content)

    # Update other href references
    content = content.replace('href="/botox/"', 'href="/dermal-fillers/"')
    content = content.replace('href="botox/"', 'href="dermal-fillers/"')
    content = content.replace("href='/botox/'", "href='/dermal-fillers/'")
    content = content.replace('data-page="/botox/"', 'data-page="/dermal-fillers/"')

    if content != orig:
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(content)
        updated_count += 1

print(f"✅ Updated links in {updated_count} HTML files.")

# ── 2. Update dermal-fillers/index.html ──────────────────────────────
PAGE = os.path.join(FRONTEND, NEW_SLUG, "index.html")
with open(PAGE, "r", encoding="utf-8") as fh:
    page = fh.read()

page = page.replace(OLD_URL, NEW_URL)
page = page.replace(f'"/{OLD_SLUG}/"', f'"/{NEW_SLUG}/"')
page = page.replace(f"/{OLD_SLUG}/#", f"/{NEW_SLUG}/#")
page = page.replace(f"https://www.kezza.co.in/{OLD_SLUG}#", f"https://www.kezza.co.in/{NEW_SLUG}/#")

# Update canonical and og:url explicitly if not matched
page = re.sub(
    r'<link\s+href="[^"]*kezza\.co\.in/botox/?"\s+rel="canonical"/>',
    f'<link href="{NEW_URL}" rel="canonical"/>',
    page
)
page = re.sub(
    r'<meta\s+content="[^"]*kezza\.co\.in/botox/?"\s+property="og:url"/>',
    f'<meta content="{NEW_URL}" property="og:url"/>',
    page
)

with open(PAGE, "w", encoding="utf-8") as fh:
    fh.write(page)
print("✅ dermal-fillers/index.html metadata and schema updated.")

# ── 3. Create redirect stub in botox/index.html ──────────────────────
STUB_PATH = os.path.join(FRONTEND, OLD_SLUG, "index.html")
STUB_HTML = f"""<!DOCTYPE html>
<html lang="en-IN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dermal Fillers in Jaipur | Kezza Clinic</title>
  <meta name="description" content="Dermal fillers and anti-aging treatments at Kezza Clinic. This page has moved — redirecting you now.">
  <meta name="robots" content="noindex, follow">
  <link rel="canonical" href="{NEW_URL}">
  <meta property="og:url" content="{NEW_URL}">
  <meta property="og:title" content="Dermal Fillers in Jaipur | Kezza Clinic">
  <meta property="og:image" content="https://www.kezza.co.in/images/fallbacks/og/botox.webp">
  <meta http-equiv="refresh" content="0; url=/{NEW_SLUG}/">
  <script>window.location.replace("/{NEW_SLUG}/")</script>
</head>
<body>
  <p>This page has moved. <a href="/{NEW_SLUG}/">Click here to go to Dermal Fillers</a>.</p>
</body>
</html>
"""
with open(STUB_PATH, "w", encoding="utf-8") as fh:
    fh.write(STUB_HTML)
print("✅ botox/index.html replaced with redirect stub.")

# ── 4. Update sitemap.xml ────────────────────────────────────────────
SITEMAP = os.path.join(FRONTEND, "sitemap.xml")
with open(SITEMAP, "r", encoding="utf-8") as fh:
    sitemap = fh.read()

sitemap = sitemap.replace(
    f"https://www.kezza.co.in/{OLD_SLUG}/",
    f"https://www.kezza.co.in/{NEW_SLUG}/"
)
with open(SITEMAP, "w", encoding="utf-8") as fh:
    fh.write(sitemap)
print("✅ sitemap.xml updated.")

# ── 5. Update .htaccess ──────────────────────────────────────────────
HTACCESS = os.path.join(FRONTEND, ".htaccess")
with open(HTACCESS, "r", encoding="utf-8") as fh:
    htaccess = fh.read()

# Replace slug in rewrite rule
htaccess = re.sub(rf'\b{re.escape(OLD_SLUG)}\b', NEW_SLUG, htaccess)

# Add 301 redirect rule
if "RewriteRule ^botox" not in htaccess:
    REDIRECT_LINE = f"\n    # 301: /botox/ -> /dermal-fillers/ (permanent rename)\n    RewriteRule ^botox(/.*)?$ /{NEW_SLUG}/$1 [R=301,L]\n"
    htaccess = htaccess.replace("RewriteEngine On", "RewriteEngine On\n" + REDIRECT_LINE, 1)

with open(HTACCESS, "w", encoding="utf-8") as fh:
    fh.write(htaccess)
print("✅ .htaccess updated with 301 redirect.")

# ── 6. Update server.js ──────────────────────────────────────────────
SERVER = os.path.join(BASE, "server.js")
with open(SERVER, "r", encoding="utf-8") as fh:
    server_js = fh.read()

if f"app.use('/{OLD_SLUG}'" not in server_js:
    REDIRECT_EXPRESS = f"""// ── 301 Permanent Redirects ────────────────────────────────────────
app.use('/{OLD_SLUG}', (req, res) => {{
    res.redirect(301, '/{NEW_SLUG}/');
}});
"""
    server_js = server_js.replace(
        "// ── 301 Permanent Redirects ────────────────────────────────────────",
        REDIRECT_EXPRESS.strip() + "\n",
        1
    )
    with open(SERVER, "w", encoding="utf-8") as fh:
        fh.write(server_js)
    print("✅ server.js updated with 301 redirect.")

