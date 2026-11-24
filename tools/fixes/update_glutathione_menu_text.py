#!/usr/bin/env python3
"""
update_glutathione_menu_text.py
-------------------------------
Changes visible menu link text from "Glutathione Treatment" → "Skin Brightening"
across all HTML files, WITHOUT touching the URL /glutathione-treatment/.

Also updates:
  - <title> tag on the glutathione page
  - <h1> on the glutathione page
  - Breadcrumb JSON-LD display name on the glutathione page
  - Card heading on index.html (homepage treatment card)
"""

import os, re

FRONTEND = os.path.join(os.path.dirname(__file__), "..", "..", "frontend")
FRONTEND = os.path.abspath(FRONTEND)

# ── 1. Collect all HTML files ────────────────────────────────────────
html_files = []
for root, dirs, files in os.walk(FRONTEND):
    for f in files:
        if f.endswith(".html"):
            html_files.append(os.path.join(root, f))

# ── 2. Replacements for NAVIGATION LINK TEXT only ───────────────────
#    Pattern: anchor tag whose href contains glutathione-treatment
#    Replaces only the visible text between > and </a>
NAV_PATTERN = re.compile(
    r'(<a\b[^>]*href=["\'][^"\']*glutathione-treatment[^"\']*["\'][^>]*>)\s*Glutathione Treatment\s*(</a>)',
    re.IGNORECASE
)

updated_nav = []
for path in html_files:
    with open(path, "r", encoding="utf-8") as fh:
        content = fh.read()

    new_content = NAV_PATTERN.sub(r'\1Skin Brightening\2', content)

    if new_content != content:
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(new_content)
        updated_nav.append(os.path.relpath(path, FRONTEND))

print(f"✅ Navigation text updated in {len(updated_nav)} file(s):")
for f in updated_nav:
    print(f"   {f}")

# ── 3. Update the glutathione page itself ────────────────────────────
PAGE = os.path.join(FRONTEND, "glutathione-treatment", "index.html")

with open(PAGE, "r", encoding="utf-8") as fh:
    page = fh.read()

original_page = page

# 3a. <title> tag — keep "in Jaipur | Kezza" suffix
page = re.sub(
    r'<title>[^<]*Glutathione Treatment[^<]*</title>',
    '<title>Skin Brightening Treatment in Jaipur | Kezza Clinic</title>',
    page, count=1, flags=re.IGNORECASE
)

# 3b. <meta name="title"> if present
page = re.sub(
    r'(<meta\s+name=["\']title["\'][^>]*content=["\'])[^"\']*Glutathione Treatment[^"\']*(["\'])',
    r'\1Skin Brightening Treatment in Jaipur | Kezza Clinic\2',
    page, count=1, flags=re.IGNORECASE
)

# 3c. og:title
page = re.sub(
    r'(<meta[^>]*property=["\']og:title["\'][^>]*content=["\'])[^"\']*Glutathione Treatment[^"\']*(["\'])',
    r'\1Skin Brightening Treatment in Jaipur | Kezza Clinic\2',
    page, count=1, flags=re.IGNORECASE
)

# 3d. twitter:title
page = re.sub(
    r'(<meta[^>]*name=["\']twitter:title["\'][^>]*content=["\'])[^"\']*Glutathione Treatment[^"\']*(["\'])',
    r'\1Skin Brightening Treatment in Jaipur | Kezza Clinic\2',
    page, count=1, flags=re.IGNORECASE
)

# 3e. JSON-LD breadcrumb display name (name field only inside itemListElement)
page = re.sub(
    r'("name"\s*:\s*)"Glutathione Treatment"(\s*,"item"\s*:\s*"https://www\.kezza\.co\.in/glutathione-treatment/)',
    r'"name":"Skin Brightening Treatment"\2',
    page, count=1
)

# 3f. JSON-LD MedicalWebPage name
page = re.sub(
    r'("name"\s*:\s*)"Glutathione Treatment in Jaipur \| Kezza Clinic"',
    '"name":"Skin Brightening Treatment in Jaipur | Kezza Clinic"',
    page, count=1
)

if page != original_page:
    with open(PAGE, "w", encoding="utf-8") as fh:
        fh.write(page)
    print("\n✅ glutathione-treatment/index.html — title, og:title, twitter:title, breadcrumb JSON-LD updated")
else:
    print("\n⚠️  glutathione-treatment/index.html — no changes made (already up to date?)")

# ── 4. Update homepage treatment card heading ────────────────────────
INDEX = os.path.join(FRONTEND, "index.html")
with open(INDEX, "r", encoding="utf-8") as fh:
    idx = fh.read()

orig_idx = idx

# Card heading: <h3> or similar text adjacent to the glutathione link
idx = re.sub(
    r'(<a[^>]*href=["\'][^"\']*glutathione-treatment[^"\']*["\'][^>]*title=["\'])Glutathione Treatment(["\'])',
    r'\1Skin Brightening\2',
    idx, flags=re.IGNORECASE
)

if idx != orig_idx:
    with open(INDEX, "w", encoding="utf-8") as fh:
        fh.write(idx)
    print("✅ index.html — card title attribute updated")

print("\n🎉 Done. URL /glutathione-treatment/ is unchanged — only visible labels updated.")
print("   Run: npm test  to verify 0 errors.")

