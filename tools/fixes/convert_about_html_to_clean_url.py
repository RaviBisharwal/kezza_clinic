#!/usr/bin/env python3
"""
Convert /about.html to clean URL /about/ across Kezza Clinic website:
1. Creates frontend/about/index.html with root-relative paths and updated canonical/schema.
2. Creates a 301 / meta-refresh redirect stub in frontend/about.html.
3. Updates all internal links across the codebase from about.html -> /about/.
4. Updates sitemap.xml to /about/.
5. Updates .htaccess with 301 redirect and trailing-slash rule.
6. Updates server.js with 301 redirect.
7. Updates tools/css-bundles.json and tools/seo/taxonomy.json.
8. Updates tools/content/*.py, tools/treatment-pages/*.py, tools/seo/site-data.json, and llms.txt.
"""

import os
import re
import json
import glob

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FRONTEND = os.path.join(ROOT, "frontend")

OLD_FILE = os.path.join(FRONTEND, "about.html")
DEST_DIR = os.path.join(FRONTEND, "about")
DEST_FILE = os.path.join(DEST_DIR, "index.html")

def main():
    os.makedirs(DEST_DIR, exist_ok=True)

    with open(OLD_FILE, "r", encoding="utf-8") as fp:
        raw_html = fp.read()

    # ── 1. Create frontend/about/index.html ────────────────────────────
    page = raw_html

    # Ensure all relative asset paths have root-relative /
    def prefix_rel(m):
        return m.group(1) + '/' + m.group(2)

    page = re.sub(
        r'((?:href|src)=["\'])(?!(?:/|https?://|#|javascript:|mailto:|tel:))([^"\']+["\'])',
        prefix_rel,
        page
    )

    # Canonical and Open Graph URL
    page = page.replace('<link href="https://www.kezza.co.in/about.html" rel="canonical"/>', '<link href="https://www.kezza.co.in/about/" rel="canonical"/>')
    page = page.replace('<meta content="https://www.kezza.co.in/about.html" property="og:url"/>', '<meta content="https://www.kezza.co.in/about/" property="og:url"/>')

    # Schema JSON-LD fixes
    page = page.replace('"https://www.kezza.co.in/about.html#webpage"', '"https://www.kezza.co.in/about/#webpage"')
    page = page.replace('"url":"https://www.kezza.co.in/about.html"', '"url":"https://www.kezza.co.in/about/"')
    page = page.replace('"https://www.kezza.co.in/about.html#breadcrumb"', '"https://www.kezza.co.in/about/#breadcrumb"')
    page = page.replace('"item":"https://www.kezza.co.in/about.html"', '"item":"https://www.kezza.co.in/about/"')
    page = page.replace('"https://www.kezza.co.in/about.html#pawan-bhalothia"', '"https://www.kezza.co.in/about/#pawan-bhalothia"')

    # Internal links inside about/index.html
    page = page.replace('href="/about.html#', 'href="/about/#')
    page = page.replace('href="/about.html"', 'href="/about/"')
    page = page.replace('href="about.html#', 'href="/about/#')
    page = page.replace('href="about.html"', 'href="/about/"')

    with open(DEST_FILE, "w", encoding="utf-8") as fp:
        fp.write(page)
    print(f"✅ Created {DEST_FILE}")

    # ── 2. Replace frontend/about.html with redirect stub ─────────────
    stub = """<!DOCTYPE html>
<html lang="en-IN">
<head>
  <meta charset="utf-8">
  <title>Redirecting to About Kezza Clinic...</title>
  <link rel="canonical" href="https://www.kezza.co.in/about/">
  <meta name="robots" content="noindex, follow">
  <meta http-equiv="refresh" content="0; url=/about/">
  <script>window.location.replace('/about/');</script>
</head>
<body>
  <p>Redirecting to <a href="/about/">About Kezza Clinic</a>...</p>
</body>
</html>
"""
    with open(OLD_FILE, "w", encoding="utf-8") as fp:
        fp.write(stub)
    print(f"✅ Replaced {OLD_FILE} with redirect stub")

    # ── 3. Update all HTML files across frontend ─────────────────────
    html_files = sorted(glob.glob(os.path.join(FRONTEND, "**", "*.html"), recursive=True))
    modified = 0

    for fpath in html_files:
        if os.path.abspath(fpath) == os.path.abspath(OLD_FILE):
            continue  # don't touch the stub itself

        with open(fpath, "r", encoding="utf-8") as fp:
            orig = fp.read()

        updated = orig
        # Replace hash anchors first
        updated = updated.replace('href="/about.html#', 'href="/about/#')
        updated = updated.replace('href="about.html#', 'href="/about/#')
        updated = updated.replace("href='/about.html#", "href='/about/#")
        updated = updated.replace("href='about.html#", "href='/about/#")

        # Replace base links
        updated = updated.replace('href="/about.html"', 'href="/about/"')
        updated = updated.replace('href="about.html"', 'href="/about/"')
        updated = updated.replace("href='/about.html'", "href='/about/'")
        updated = updated.replace("href='about.html'", "href='/about/'")

        # Full URL occurrences
        updated = updated.replace('https://www.kezza.co.in/about.html#', 'https://www.kezza.co.in/about/#')
        updated = updated.replace('https://www.kezza.co.in/about.html', 'https://www.kezza.co.in/about/')

        if updated != orig:
            with open(fpath, "w", encoding="utf-8") as fp:
                fp.write(updated)
            modified += 1

    print(f"✅ Updated links in {modified} HTML files to /about/")

    # ── 4. Update sitemap.xml ─────────────────────────────────────────
    sitemap_path = os.path.join(FRONTEND, "sitemap.xml")
    if os.path.exists(sitemap_path):
        with open(sitemap_path, "r", encoding="utf-8") as fp:
            sm = fp.read()
        sm = sm.replace("<loc>https://www.kezza.co.in/about.html</loc>", "<loc>https://www.kezza.co.in/about/</loc>")
        with open(sitemap_path, "w", encoding="utf-8") as fp:
            fp.write(sm)
        print("✅ sitemap.xml updated")

    # ── 5. Update .htaccess ───────────────────────────────────────────
    ht_path = os.path.join(FRONTEND, ".htaccess")
    if os.path.exists(ht_path):
        with open(ht_path, "r", encoding="utf-8") as fp:
            ht = fp.read()

        # Add 301 redirect
        rule = (
            "    # 301: /about.html -> /about/ (clean URL)\n"
            "    RewriteRule ^about\\.html$ /about/ [R=301,L]\n\n"
        )
        if "RewriteRule ^about\\.html$" not in ht:
            ht = re.sub(
                r"(RewriteEngine On\s*\n)",
                r"\1\n" + rule,
                ht,
                count=1
            )

        # Update trailing-slash folder rule to include 'about'
        ht = re.sub(
            r'RewriteRule \^\((?!about\|)([a-zA-Z0-9_\-\|/]+)\)\$ /\$1/ \[L,R=301\]',
            r'RewriteRule ^(about|\1)$ /$1/ [L,R=301]',
            ht
        )

        # Update doctors rewrite rule
        ht = ht.replace('/about.html#doctors', '/about/#doctors')

        with open(ht_path, "w", encoding="utf-8") as fp:
            fp.write(ht)
        print("✅ .htaccess updated with 301 redirect and trailing slash rule")

    # ── 6. Update server.js ───────────────────────────────────────────
    server_path = os.path.join(ROOT, "server.js")
    if os.path.exists(server_path):
        with open(server_path, "r", encoding="utf-8") as fp:
            sj = fp.read()

        redirect_entry = (
            "app.use('/about.html', (req, res) => {\n"
            "    res.redirect(301, '/about/');\n"
            "});\n\n"
        )
        if "app.use('/about.html'" not in sj:
            target = "// ── 301 Permanent Redirects ────────────────────────────────────────\n"
            if target in sj:
                # Place after the clean URL block
                pos = sj.find(target) + len(target)
                sj = sj[:pos] + redirect_entry + sj[pos:]
                with open(server_path, "w", encoding="utf-8") as fp:
                    fp.write(sj)
                print("✅ server.js updated with 301 redirect")

    # ── 7. Update css-bundles.json ────────────────────────────────────
    bundles_path = os.path.join(ROOT, "tools", "css-bundles.json")
    if os.path.exists(bundles_path):
        with open(bundles_path, "r", encoding="utf-8") as fp:
            bundles = json.load(fp)
        if "about/index.html" not in bundles.get("pages", {}):
            bundles["pages"]["about/index.html"] = "about"
            with open(bundles_path, "w", encoding="utf-8") as fp:
                json.dump(bundles, fp, indent=2)
            print("✅ tools/css-bundles.json updated")

    # ── 8. Update taxonomy.json ───────────────────────────────────────
    tax_path = os.path.join(ROOT, "tools", "seo", "taxonomy.json")
    if os.path.exists(tax_path):
        with open(tax_path, "r", encoding="utf-8") as fp:
            tax_text = fp.read()
        tax_text = tax_text.replace('"file": "about.html", "url": "/about.html"', '"file": "about/index.html", "url": "/about/"')
        with open(tax_path, "w", encoding="utf-8") as fp:
            fp.write(tax_text)
        print("✅ tools/seo/taxonomy.json updated")

    # ── 9. Update supporting tool scripts ─────────────────────────────
    # tools/content/sync_footer.py
    sf_path = os.path.join(ROOT, "tools", "content", "sync_footer.py")
    if os.path.exists(sf_path):
        with open(sf_path, "r", encoding="utf-8") as fp:
            sfc = fp.read()
        sfc = sfc.replace('("About Us", "/about.html")', '("About Us", "/about/")')
        with open(sf_path, "w", encoding="utf-8") as fp:
            fp.write(sfc)
        print("✅ sync_footer.py updated")

    # tools/content/locations.json
    loc_path = os.path.join(ROOT, "tools", "content", "locations.json")
    if os.path.exists(loc_path):
        with open(loc_path, "r", encoding="utf-8") as fp:
            lc = fp.read()
        lc = lc.replace('/about.html#', '/about/#')
        with open(loc_path, "w", encoding="utf-8") as fp:
            fp.write(lc)
        print("✅ locations.json updated")

    # tools/content/build_content_pages.py
    bcp_path = os.path.join(ROOT, "tools", "content", "build_content_pages.py")
    if os.path.exists(bcp_path):
        with open(bcp_path, "r", encoding="utf-8") as fp:
            bc = fp.read()
        bc = bc.replace('/about.html#', '/about/#')
        bc = bc.replace('/about.html', '/about/')
        with open(bcp_path, "w", encoding="utf-8") as fp:
            fp.write(bc)
        print("✅ build_content_pages.py updated")

    # tools/treatment-pages/build_pages.py
    tp_path = os.path.join(ROOT, "tools", "treatment-pages", "build_pages.py")
    if os.path.exists(tp_path):
        with open(tp_path, "r", encoding="utf-8") as fp:
            tc = fp.read()
        tc = tc.replace('/about.html#', '/about/#')
        tc = tc.replace('/about.html', '/about/')
        with open(tp_path, "w", encoding="utf-8") as fp:
            fp.write(tc)
        print("✅ tools/treatment-pages/build_pages.py updated")

    # tools/treatment-pages/pages_doctors.py
    doc_path = os.path.join(ROOT, "tools", "treatment-pages", "pages_doctors.py")
    if os.path.exists(doc_path):
        with open(doc_path, "r", encoding="utf-8") as fp:
            dc = fp.read()
        dc = dc.replace('https://www.kezza.co.in/about.html', 'https://www.kezza.co.in/about/')
        with open(doc_path, "w", encoding="utf-8") as fp:
            fp.write(dc)
        print("✅ tools/treatment-pages/pages_doctors.py updated")

    # tools/seo/site-data.json
    sd_path = os.path.join(ROOT, "tools", "seo", "site-data.json")
    if os.path.exists(sd_path):
        with open(sd_path, "r", encoding="utf-8") as fp:
            sc = fp.read()
        sc = sc.replace('/about.html#', '/about/#')
        with open(sd_path, "w", encoding="utf-8") as fp:
            fp.write(sc)
        print("✅ site-data.json updated")

    # frontend/llms.txt
    llms_path = os.path.join(FRONTEND, "llms.txt")
    if os.path.exists(llms_path):
        with open(llms_path, "r", encoding="utf-8") as fp:
            llms = fp.read()
        llms = llms.replace('https://www.kezza.co.in/about.html', 'https://www.kezza.co.in/about/')
        with open(llms_path, "w", encoding="utf-8") as fp:
            fp.write(llms)
        print("✅ llms.txt updated")

if __name__ == "__main__":
    main()
