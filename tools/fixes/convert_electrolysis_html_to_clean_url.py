#!/usr/bin/env python3
"""
Convert /electrolysis.html to clean URL /electrolysis/ across Kezza Clinic website:
1. Creates frontend/electrolysis/index.html with root-relative paths and updated canonical/schema.
2. Creates a 301 / meta-refresh redirect stub in frontend/electrolysis.html.
3. Updates all internal links across the codebase from electrolysis.html -> /electrolysis/.
4. Updates sitemap.xml to /electrolysis/.
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

OLD_FILE = os.path.join(FRONTEND, "electrolysis.html")
DEST_DIR = os.path.join(FRONTEND, "electrolysis")
DEST_FILE = os.path.join(DEST_DIR, "index.html")

def main():
    os.makedirs(DEST_DIR, exist_ok=True)

    with open(OLD_FILE, "r", encoding="utf-8") as fp:
        raw_html = fp.read()

    # ── 1. Create frontend/electrolysis/index.html ─────────────────────
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
    page = page.replace('<link href="https://www.kezza.co.in/electrolysis.html" rel="canonical"/>', '<link href="https://www.kezza.co.in/electrolysis/" rel="canonical"/>')
    page = page.replace('<meta content="https://www.kezza.co.in/electrolysis.html" property="og:url"/>', '<meta content="https://www.kezza.co.in/electrolysis/" property="og:url"/>')

    # Schema JSON-LD fixes
    page = page.replace('"https://www.kezza.co.in/electrolysis.html#webpage"', '"https://www.kezza.co.in/electrolysis/#webpage"')
    page = page.replace('"url":"https://www.kezza.co.in/electrolysis.html"', '"url":"https://www.kezza.co.in/electrolysis/"')
    page = page.replace('"https://www.kezza.co.in/electrolysis.html#service"', '"https://www.kezza.co.in/electrolysis/#service"')
    page = page.replace('"https://www.kezza.co.in/electrolysis.html#breadcrumb"', '"https://www.kezza.co.in/electrolysis/#breadcrumb"')
    page = page.replace('"item":"https://www.kezza.co.in/electrolysis.html"', '"item":"https://www.kezza.co.in/electrolysis/"')
    page = page.replace('"https://www.kezza.co.in/electrolysis.html#faq"', '"https://www.kezza.co.in/electrolysis/#faq"')

    # Internal links inside electrolysis/index.html
    page = page.replace('href="/electrolysis.html#', 'href="/electrolysis/#')
    page = page.replace('href="/electrolysis.html"', 'href="/electrolysis/"')
    page = page.replace('href="electrolysis.html#', 'href="/electrolysis/#')
    page = page.replace('href="electrolysis.html"', 'href="/electrolysis/"')

    with open(DEST_FILE, "w", encoding="utf-8") as fp:
        fp.write(page)
    print(f"✅ Created {DEST_FILE}")

    # ── 2. Replace frontend/electrolysis.html with redirect stub ───────
    stub = """<!DOCTYPE html>
<html lang="en-IN">
<head>
  <meta charset="utf-8">
  <title>Redirecting to Electrolysis Hair Removal...</title>
  <link rel="canonical" href="https://www.kezza.co.in/electrolysis/">
  <meta name="robots" content="noindex, follow">
  <meta http-equiv="refresh" content="0; url=/electrolysis/">
  <script>window.location.replace('/electrolysis/');</script>
</head>
<body>
  <p>Redirecting to <a href="/electrolysis/">Electrolysis Hair Removal</a>...</p>
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
        updated = updated.replace('href="/electrolysis.html#', 'href="/electrolysis/#')
        updated = updated.replace('href="electrolysis.html#', 'href="/electrolysis/#')
        updated = updated.replace("href='/electrolysis.html#", "href='/electrolysis/#")
        updated = updated.replace("href='electrolysis.html#", "href='/electrolysis/#")

        # Replace base links
        updated = updated.replace('href="/electrolysis.html"', 'href="/electrolysis/"')
        updated = updated.replace('href="electrolysis.html"', 'href="/electrolysis/"')
        updated = updated.replace("href='/electrolysis.html'", "href='/electrolysis/'")
        updated = updated.replace("href='electrolysis.html'", "href='/electrolysis/'")

        # Full URL occurrences
        updated = updated.replace('https://www.kezza.co.in/electrolysis.html#', 'https://www.kezza.co.in/electrolysis/#')
        updated = updated.replace('https://www.kezza.co.in/electrolysis.html', 'https://www.kezza.co.in/electrolysis/')

        if updated != orig:
            with open(fpath, "w", encoding="utf-8") as fp:
                fp.write(updated)
            modified += 1

    print(f"✅ Updated links in {modified} HTML files to /electrolysis/")

    # ── 4. Update sitemap.xml ─────────────────────────────────────────
    sitemap_path = os.path.join(FRONTEND, "sitemap.xml")
    if os.path.exists(sitemap_path):
        with open(sitemap_path, "r", encoding="utf-8") as fp:
            sm = fp.read()
        sm = sm.replace("<loc>https://www.kezza.co.in/electrolysis.html</loc>", "<loc>https://www.kezza.co.in/electrolysis/</loc>")
        with open(sitemap_path, "w", encoding="utf-8") as fp:
            fp.write(sm)
        print("✅ sitemap.xml updated")

    # ── 5. Update .htaccess ───────────────────────────────────────────
    ht_path = os.path.join(FRONTEND, ".htaccess")
    if os.path.exists(ht_path):
        with open(ht_path, "r", encoding="utf-8") as fp:
            ht = fp.read()

        rule = (
            "    # 301: /electrolysis.html -> /electrolysis/ (clean URL)\n"
            "    RewriteRule ^electrolysis\\.html$ /electrolysis/ [R=301,L]\n\n"
        )
        if "RewriteRule ^electrolysis\\.html$" not in ht:
            ht = re.sub(
                r"(RewriteEngine On\s*\n)",
                r"\1\n" + rule,
                ht,
                count=1
            )

        # Update trailing-slash folder rule to include 'electrolysis'
        ht = re.sub(
            r'RewriteRule \^\((?!electrolysis\|)([a-zA-Z0-9_\-\|/]+)\)\$ /\$1/ \[L,R=301\]',
            r'RewriteRule ^(electrolysis|\1)$ /$1/ [L,R=301]',
            ht
        )

        with open(ht_path, "w", encoding="utf-8") as fp:
            fp.write(ht)
        print("✅ .htaccess updated with 301 redirect and trailing slash rule")

    # ── 6. Update server.js ───────────────────────────────────────────
    server_path = os.path.join(ROOT, "server.js")
    if os.path.exists(server_path):
        with open(server_path, "r", encoding="utf-8") as fp:
            sj = fp.read()

        redirect_entry = (
            "app.use('/electrolysis.html', (req, res) => {\n"
            "    res.redirect(301, '/electrolysis/');\n"
            "});\n\n"
        )
        if "app.use('/electrolysis.html'" not in sj:
            target = "// ── 301 Permanent Redirects ────────────────────────────────────────\n"
            if target in sj:
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
        if "electrolysis/index.html" not in bundles.get("pages", {}):
            bundles["pages"]["electrolysis/index.html"] = "electrolysis"
            with open(bundles_path, "w", encoding="utf-8") as fp:
                json.dump(bundles, fp, indent=2)
            print("✅ tools/css-bundles.json updated")

    # ── 8. Update taxonomy.json ───────────────────────────────────────
    tax_path = os.path.join(ROOT, "tools", "seo", "taxonomy.json")
    if os.path.exists(tax_path):
        with open(tax_path, "r", encoding="utf-8") as fp:
            tax_text = fp.read()
        tax_text = tax_text.replace('"file": "electrolysis.html", "url": "/electrolysis.html"', '"file": "electrolysis/index.html", "url": "/electrolysis/"')
        tax_text = tax_text.replace('"url": "/electrolysis.html", "file": "electrolysis.html"', '"url": "/electrolysis/", "file": "electrolysis/index.html"')
        with open(tax_path, "w", encoding="utf-8") as fp:
            fp.write(tax_text)
        print("✅ tools/seo/taxonomy.json updated")

    # ── 9. Update supporting tool scripts ─────────────────────────────
    # tools/content/sync_footer.py
    sf_path = os.path.join(ROOT, "tools", "content", "sync_footer.py")
    if os.path.exists(sf_path):
        with open(sf_path, "r", encoding="utf-8") as fp:
            sfc = fp.read()
        sfc = sfc.replace('("Electrolysis", "/electrolysis.html"', '("Electrolysis", "/electrolysis/"')
        with open(sf_path, "w", encoding="utf-8") as fp:
            fp.write(sfc)
        print("✅ sync_footer.py updated")

    # tools/content/locations.json
    loc_path = os.path.join(ROOT, "tools", "content", "locations.json")
    if os.path.exists(loc_path):
        with open(loc_path, "r", encoding="utf-8") as fp:
            lc = fp.read()
        lc = lc.replace('/electrolysis.html#', '/electrolysis/#')
        lc = lc.replace('/electrolysis.html', '/electrolysis/')
        with open(loc_path, "w", encoding="utf-8") as fp:
            fp.write(lc)
        print("✅ locations.json updated")

    # tools/content/blog/*.html
    for bfile in glob.glob(os.path.join(ROOT, "tools", "content", "blog", "*.html")):
        with open(bfile, "r", encoding="utf-8") as fp:
            bc = fp.read()
        bc = bc.replace('/electrolysis.html#', '/electrolysis/#')
        bc = bc.replace('/electrolysis.html', '/electrolysis/')
        bc = bc.replace("'/electrolysis.html'", "'/electrolysis/'")
        with open(bfile, "w", encoding="utf-8") as fp:
            fp.write(bc)

    # tools/content/pages/*.html
    for pfile in glob.glob(os.path.join(ROOT, "tools", "content", "pages", "*.html")):
        with open(pfile, "r", encoding="utf-8") as fp:
            pc = fp.read()
        pc = pc.replace('/electrolysis.html#', '/electrolysis/#')
        pc = pc.replace('/electrolysis.html', '/electrolysis/')
        with open(pfile, "w", encoding="utf-8") as fp:
            fp.write(pc)

    # tools/treatment-pages/build_pages.py
    tp_path = os.path.join(ROOT, "tools", "treatment-pages", "build_pages.py")
    if os.path.exists(tp_path):
        with open(tp_path, "r", encoding="utf-8") as fp:
            tc = fp.read()
        tc = tc.replace('/electrolysis.html#', '/electrolysis/#')
        tc = tc.replace('/electrolysis.html', '/electrolysis/')
        with open(tp_path, "w", encoding="utf-8") as fp:
            fp.write(tc)

    # tools/seo/site-data.json
    sd_path = os.path.join(ROOT, "tools", "seo", "site-data.json")
    if os.path.exists(sd_path):
        with open(sd_path, "r", encoding="utf-8") as fp:
            sc = fp.read()
        sc = sc.replace('/electrolysis.html#', '/electrolysis/#')
        sc = sc.replace('/electrolysis.html', '/electrolysis/')
        with open(sd_path, "w", encoding="utf-8") as fp:
            fp.write(sc)
        print("✅ site-data.json updated")

    # frontend/llms.txt
    llms_path = os.path.join(FRONTEND, "llms.txt")
    if os.path.exists(llms_path):
        with open(llms_path, "r", encoding="utf-8") as fp:
            llms = fp.read()
        llms = llms.replace('https://www.kezza.co.in/electrolysis.html', 'https://www.kezza.co.in/electrolysis/')
        with open(llms_path, "w", encoding="utf-8") as fp:
            fp.write(llms)
        print("✅ llms.txt updated")

if __name__ == "__main__":
    main()
