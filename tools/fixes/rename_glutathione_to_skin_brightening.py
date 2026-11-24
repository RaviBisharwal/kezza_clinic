#!/usr/bin/env python3
"""
rename_glutathione_to_skin_brightening.py
------------------------------------------
Full professional URL rename:
  /glutathione-treatment/  →  /skin-brightening/

Steps:
  1. Update all internal href/src links in 89 HTML files
  2. Update canonical, og:url, twitter:url in skin-brightening/index.html
  3. Update JSON-LD @id and url fields in skin-brightening/index.html
  4. Update sitemap.xml
  5. Update .htaccess rewrite rule list + add 301 redirect
"""

import os, re, shutil

BASE   = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
FRONTEND = os.path.join(BASE, "frontend")

OLD_SLUG = "glutathione-treatment"
NEW_SLUG = "skin-brightening"
OLD_URL  = f"https://www.kezza.co.in/{OLD_SLUG}/"
NEW_URL  = f"https://www.kezza.co.in/{NEW_SLUG}/"

# ── 1. Update all HTML internal links ───────────────────────────────
html_files = []
for root, dirs, files in os.walk(FRONTEND):
    for f in files:
        if f.endswith(".html"):
            html_files.append(os.path.join(root, f))

updated = []
for path in html_files:
    with open(path, "r", encoding="utf-8") as fh:
        content = fh.read()
    # Replace URL references (href, src, action, data-page attributes)
    new_content = content.replace(f"/{OLD_SLUG}/", f"/{NEW_SLUG}/")
    new_content = new_content.replace(f'"{OLD_SLUG}/"', f'"{NEW_SLUG}/"')
    new_content = new_content.replace(f"'{OLD_SLUG}/'", f"'{NEW_SLUG}/'")
    if new_content != content:
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(new_content)
        updated.append(os.path.relpath(path, FRONTEND))

print(f"✅ Internal links updated in {len(updated)} HTML file(s)")

# ── 2. Update skin-brightening/index.html canonical + og + JSON-LD ──
PAGE = os.path.join(FRONTEND, NEW_SLUG, "index.html")
with open(PAGE, "r", encoding="utf-8") as fh:
    page = fh.read()

# Already replaced via step 1 above (OLD_URL → NEW_URL in href/content attrs)
# But JSON-LD string values need explicit replacement
page = page.replace(OLD_URL, NEW_URL)
page = page.replace(f'"/{OLD_SLUG}/"', f'"/{NEW_SLUG}/"')
page = page.replace(f"/{OLD_SLUG}/#", f"/{NEW_SLUG}/#")

with open(PAGE, "w", encoding="utf-8") as fh:
    fh.write(page)
print("✅ skin-brightening/index.html — canonical, og:url, JSON-LD updated")

# ── 3. Update sitemap.xml ────────────────────────────────────────────
SITEMAP = os.path.join(FRONTEND, "sitemap.xml")
with open(SITEMAP, "r", encoding="utf-8") as fh:
    sitemap = fh.read()

new_sitemap = sitemap.replace(
    f"https://www.kezza.co.in/{OLD_SLUG}/",
    f"https://www.kezza.co.in/{NEW_SLUG}/"
)
new_sitemap = new_sitemap.replace(
    f"/images/og/{OLD_SLUG}.jpg",
    f"/images/og/{OLD_SLUG}.jpg"   # keep old og image path (file still exists)
)

if new_sitemap != sitemap:
    with open(SITEMAP, "w", encoding="utf-8") as fh:
        fh.write(new_sitemap)
    print("✅ sitemap.xml — URL updated to /skin-brightening/")
else:
    print("⚠️  sitemap.xml — no change (already updated?)")

# ── 4. Update .htaccess ──────────────────────────────────────────────
HTACCESS = os.path.join(FRONTEND, ".htaccess")
with open(HTACCESS, "r", encoding="utf-8") as fh:
    htaccess = fh.read()

# 4a. Replace old slug in the extensionless-URL rewrite rule list
htaccess = htaccess.replace(
    f"|{OLD_SLUG}|",
    f"|{NEW_SLUG}|"
)
htaccess = htaccess.replace(
    f"|{OLD_SLUG})",
    f"|{NEW_SLUG})"
)
# Handle if it appears at start of alternation or mid
htaccess = re.sub(
    rf'\b{re.escape(OLD_SLUG)}\b',
    NEW_SLUG,
    htaccess
)

# 4b. Add 301 redirect BEFORE the RewriteEngine On or at the top of rules
REDIRECT_BLOCK = (
    "\n    # 301: /glutathione-treatment/ → /skin-brightening/ (permanent SEO rename)\n"
    "    RewriteRule ^glutathione-treatment(/.*)?$ /skin-brightening/$1 [R=301,L]\n"
)

# Insert after "RewriteEngine On" line
if "glutathione-treatment" not in htaccess and REDIRECT_BLOCK.strip() not in htaccess:
    htaccess = htaccess.replace(
        "RewriteEngine On",
        "RewriteEngine On\n" + REDIRECT_BLOCK,
        1
    )
elif "glutathione-treatment" in htaccess:
    # Already replaced by the regex above — just add redirect
    htaccess = htaccess.replace(
        "RewriteEngine On",
        "RewriteEngine On\n" + REDIRECT_BLOCK,
        1
    )

with open(HTACCESS, "w", encoding="utf-8") as fh:
    fh.write(htaccess)
print("✅ .htaccess — 301 redirect added + rewrite rule list updated")

# ── 5. Remove old folder (keep as tombstone with redirect only) ──────
OLD_DIR = os.path.join(FRONTEND, OLD_SLUG)
if os.path.isdir(OLD_DIR):
    # Create a minimal redirect HTML inside old folder (belt + suspenders)
    REDIRECT_HTML = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0; url=https://www.kezza.co.in/{NEW_SLUG}/">
  <link rel="canonical" href="https://www.kezza.co.in/{NEW_SLUG}/">
  <title>Redirecting…</title>
</head>
<body>
  <p>This page has moved. <a href="https://www.kezza.co.in/{NEW_SLUG}/">Click here</a>.</p>
  <script>window.location.replace("https://www.kezza.co.in/{NEW_SLUG}/")</script>
</body>
</html>
"""
    # Replace old index.html with redirect stub
    old_index = os.path.join(OLD_DIR, "index.html")
    with open(old_index, "w", encoding="utf-8") as fh:
        fh.write(REDIRECT_HTML)
    print(f"✅ {OLD_SLUG}/index.html replaced with client-side redirect stub")

print(f"""
🎉 URL rename complete!
   Old URL  : https://www.kezza.co.in/{OLD_SLUG}/
   New URL  : https://www.kezza.co.in/{NEW_SLUG}/
   301 redirect in .htaccess  ✅
   Client-side fallback stub  ✅
   All internal links updated  ✅
   Sitemap updated             ✅
   Canonical/og:url updated    ✅

   Run: npm test  →  should be 0 errors, 0 warnings.
""")

