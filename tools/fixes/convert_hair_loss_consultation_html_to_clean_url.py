#!/usr/bin/env python3
"""
Convert /hair-loss-consultation.html to clean URL /hair-loss-consultation/ across Kezza Clinic website:
1. Creates frontend/hair-loss-consultation/index.html with root-relative paths and updated canonical/schema.
2. Creates a 301 / meta-refresh redirect stub in frontend/hair-loss-consultation.html.
3. Updates all internal links across the codebase from hair-loss-consultation.html -> /hair-loss-consultation/.
4. Updates sitemap.xml to /hair-loss-consultation/.
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

OLD_FILE = os.path.join(FRONTEND, "hair-loss-consultation.html")
DEST_DIR = os.path.join(FRONTEND, "hair-loss-consultation")
DEST_FILE = os.path.join(DEST_DIR, "index.html")

def main():
    os.makedirs(DEST_DIR, exist_ok=True)

    with open(OLD_FILE, "r", encoding="utf-8") as fp:
        raw_html = fp.read()

    # ── 1. Create frontend/hair-loss-consultation/index.html ───────────
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
    page = page.replace('<link href="https://www.kezza.co.in/hair-loss-consultation.html" rel="canonical"/>', '<link href="https://www.kezza.co.in/hair-loss-consultation/" rel="canonical"/>')
    page = page.replace('<meta content="https://www.kezza.co.in/hair-loss-consultation.html" property="og:url"/>', '<meta content="https://www.kezza.co.in/hair-loss-consultation/" property="og:url"/>')

    # Schema JSON-LD fixes
    page = page.replace('"https://www.kezza.co.in/hair-loss-consultation.html#webpage"', '"https://www.kezza.co.in/hair-loss-consultation/#webpage"')
    page = page.replace('"url":"https://www.kezza.co.in/hair-loss-consultation.html"', '"url":"https://www.kezza.co.in/hair-loss-consultation/"')
    page = page.replace('"https://www.kezza.co.in/hair-loss-consultation.html#service"', '"https://www.kezza.co.in/hair-loss-consultation/#service"')
    page = page.replace('"https://www.kezza.co.in/hair-loss-consultation.html#breadcrumb"', '"https://www.kezza.co.in/hair-loss-consultation/#breadcrumb"')
    page = page.replace('"item":"https://www.kezza.co.in/hair-loss-consultation.html"', '"item":"https://www.kezza.co.in/hair-loss-consultation/"')
    page = page.replace('"https://www.kezza.co.in/hair-loss-consultation.html#faq"', '"https://www.kezza.co.in/hair-loss-consultation/#faq"')

    # Internal links inside hair-loss-consultation/index.html
    page = page.replace('href="/hair-loss-consultation.html#', 'href="/hair-loss-consultation/#')
    page = page.replace('href="/hair-loss-consultation.html"', 'href="/hair-loss-consultation/"')
    page = page.replace('href="hair-loss-consultation.html#', 'href="/hair-loss-consultation/#')
    page = page.replace('href="hair-loss-consultation.html"', 'href="/hair-loss-consultation/"')

    with open(DEST_FILE, "w", encoding="utf-8") as fp:
        fp.write(page)
    print(f"✅ Created {DEST_FILE}")

    # ── 2. Replace frontend/hair-loss-consultation.html with redirect stub ──
    stub = """<!DOCTYPE html>
<html lang="en-IN">
<head>
  <meta charset="utf-8">
  <title>Redirecting to Hair Loss Consultation...</title>
  <link rel="canonical" href="https://www.kezza.co.in/hair-loss-consultation/">
  <meta name="robots" content="noindex, follow">
  <meta http-equiv="refresh" content="0; url=/hair-loss-consultation/">
  <script>window.location.replace('/hair-loss-consultation/');</script>
</head>
<body>
  <p>Redirecting to <a href="/hair-loss-consultation/">Hair Loss Consultation</a>...</p>
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
        updated = updated.replace('href="/hair-loss-consultation.html#', 'href="/hair-loss-consultation/#')
        updated = updated.replace('href="hair-loss-consultation.html#', 'href="/hair-loss-consultation/#')
        updated = updated.replace("href='/hair-loss-consultation.html#", "href='/hair-loss-consultation/#")
        updated = updated.replace("href='hair-loss-consultation.html#", "href='/hair-loss-consultation/#")

        # Replace base links
        updated = updated.replace('href="/hair-loss-consultation.html"', 'href="/hair-loss-consultation/"')
        updated = updated.replace('href="hair-loss-consultation.html"', 'href="/hair-loss-consultation/"')
        updated = updated.replace("href='/hair-loss-consultation.html'", "href='/hair-loss-consultation/'")
        updated = updated.replace("href='hair-loss-consultation.html'", "href='/hair-loss-consultation/'")

        # Full URL occurrences
        updated = updated.replace('https://www.kezza.co.in/hair-loss-consultation.html#', 'https://www.kezza.co.in/hair-loss-consultation/#')
        updated = updated.replace('https://www.kezza.co.in/hair-loss-consultation.html', 'https://www.kezza.co.in/hair-loss-consultation/')

        if updated != orig:
            with open(fpath, "w", encoding="utf-8") as fp:
                fp.write(updated)
            modified += 1

    print(f"✅ Updated links in {modified} HTML files to /hair-loss-consultation/")

    # ── 4. Update sitemap.xml ─────────────────────────────────────────
    sitemap_path = os.path.join(FRONTEND, "sitemap.xml")
    if os.path.exists(sitemap_path):
        with open(sitemap_path, "r", encoding="utf-8") as fp:
            sm = fp.read()
        sm = sm.replace("<loc>https://www.kezza.co.in/hair-loss-consultation.html</loc>", "<loc>https://www.kezza.co.in/hair-loss-consultation/</loc>")
        with open(sitemap_path, "w", encoding="utf-8") as fp:
            fp.write(sm)
        print("✅ sitemap.xml updated")

    # ── 5. Update .htaccess ───────────────────────────────────────────
    ht_path = os.path.join(FRONTEND, ".htaccess")
    if os.path.exists(ht_path):
        with open(ht_path, "r", encoding="utf-8") as fp:
            ht = fp.read()

        rule = (
            "    # 301: /hair-loss-consultation.html -> /hair-loss-consultation/ (clean URL)\n"
            "    RewriteRule ^hair-loss-consultation\\.html$ /hair-loss-consultation/ [R=301,L]\n\n"
        )
        if "RewriteRule ^hair-loss-consultation\\.html$" not in ht:
            ht = re.sub(
                r"(RewriteEngine On\s*\n)",
                r"\1\n" + rule,
                ht,
                count=1
            )

        # Update trailing-slash folder rule to include 'hair-loss-consultation'
        ht = re.sub(
            r'RewriteRule \^\((?!hair-loss-consultation\|)([a-zA-Z0-9_\-\|/]+)\)\$ /\$1/ \[L,R=301\]',
            r'RewriteRule ^(hair-loss-consultation|\1)$ /$1/ [L,R=301]',
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
            "app.use('/hair-loss-consultation.html', (req, res) => {\n"
            "    res.redirect(301, '/hair-loss-consultation/');\n"
            "});\n\n"
        )
        if "app.use('/hair-loss-consultation.html'" not in sj:
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
        if "hair-loss-consultation/index.html" not in bundles.get("pages", {}):
            bundles["pages"]["hair-loss-consultation/index.html"] = "hair-loss-consultation"
            with open(bundles_path, "w", encoding="utf-8") as fp:
                json.dump(bundles, fp, indent=2)
            print("✅ tools/css-bundles.json updated")

    # ── 8. Update taxonomy.json ───────────────────────────────────────
    tax_path = os.path.join(ROOT, "tools", "seo", "taxonomy.json")
    if os.path.exists(tax_path):
        with open(tax_path, "r", encoding="utf-8") as fp:
            tax_text = fp.read()
        tax_text = tax_text.replace('"consultation": "/hair-loss-consultation.html"', '"consultation": "/hair-loss-consultation/"')
        tax_text = tax_text.replace('"file": "hair-loss-consultation.html", "url": "/hair-loss-consultation.html"', '"file": "hair-loss-consultation/index.html", "url": "/hair-loss-consultation/"')
        tax_text = tax_text.replace('"url": "/hair-loss-consultation.html", "file": "hair-loss-consultation.html"', '"url": "/hair-loss-consultation/", "file": "hair-loss-consultation/index.html"')
        with open(tax_path, "w", encoding="utf-8") as fp:
            fp.write(tax_text)
        print("✅ tools/seo/taxonomy.json updated")

    # ── 9. Update supporting tool scripts ─────────────────────────────
    # tools/content/sync_footer.py
    sf_path = os.path.join(ROOT, "tools", "content", "sync_footer.py")
    if os.path.exists(sf_path):
        with open(sf_path, "r", encoding="utf-8") as fp:
            sfc = fp.read()
        sfc = sfc.replace('("Hair Loss Consultation", "/hair-loss-consultation.html"', '("Hair Loss Consultation", "/hair-loss-consultation/"')
        with open(sf_path, "w", encoding="utf-8") as fp:
            fp.write(sfc)
        print("✅ sync_footer.py updated")

    # tools/content/locations.json
    loc_path = os.path.join(ROOT, "tools", "content", "locations.json")
    if os.path.exists(loc_path):
        with open(loc_path, "r", encoding="utf-8") as fp:
            lc = fp.read()
        lc = lc.replace('/hair-loss-consultation.html#', '/hair-loss-consultation/#')
        lc = lc.replace('/hair-loss-consultation.html', '/hair-loss-consultation/')
        with open(loc_path, "w", encoding="utf-8") as fp:
            fp.write(lc)
        print("✅ locations.json updated")

    # tools/content/blog/*.html
    for bfile in glob.glob(os.path.join(ROOT, "tools", "content", "blog", "*.html")):
        with open(bfile, "r", encoding="utf-8") as fp:
            bc = fp.read()
        bc = bc.replace('/hair-loss-consultation.html#', '/hair-loss-consultation/#')
        bc = bc.replace('/hair-loss-consultation.html', '/hair-loss-consultation/')
        bc = bc.replace("'/hair-loss-consultation.html'", "'/hair-loss-consultation/'")
        with open(bfile, "w", encoding="utf-8") as fp:
            fp.write(bc)

    # tools/content/pages/*.html
    for pfile in glob.glob(os.path.join(ROOT, "tools", "content", "pages", "*.html")):
        with open(pfile, "r", encoding="utf-8") as fp:
            pc = fp.read()
        pc = pc.replace('/hair-loss-consultation.html#', '/hair-loss-consultation/#')
        pc = pc.replace('/hair-loss-consultation.html', '/hair-loss-consultation/')
        with open(pfile, "w", encoding="utf-8") as fp:
            fp.write(pc)

    # tools/treatment-pages/build_pages.py
    tp_path = os.path.join(ROOT, "tools", "treatment-pages", "build_pages.py")
    if os.path.exists(tp_path):
        with open(tp_path, "r", encoding="utf-8") as fp:
            tc = fp.read()
        tc = tc.replace('/hair-loss-consultation.html#', '/hair-loss-consultation/#')
        tc = tc.replace('/hair-loss-consultation.html', '/hair-loss-consultation/')
        with open(tp_path, "w", encoding="utf-8") as fp:
            fp.write(tc)

    # tools/treatment-pages/pages_doctors.py
    doc_path = os.path.join(ROOT, "tools", "treatment-pages", "pages_doctors.py")
    if os.path.exists(doc_path):
        with open(doc_path, "r", encoding="utf-8") as fp:
            dc = fp.read()
        dc = dc.replace('https://www.kezza.co.in/hair-loss-consultation.html', 'https://www.kezza.co.in/hair-loss-consultation/')
        dc = dc.replace('/hair-loss-consultation.html', '/hair-loss-consultation/')
        with open(doc_path, "w", encoding="utf-8") as fp:
            fp.write(dc)

    # tools/seo/site-data.json
    sd_path = os.path.join(ROOT, "tools", "seo", "site-data.json")
    if os.path.exists(sd_path):
        with open(sd_path, "r", encoding="utf-8") as fp:
            sc = fp.read()
        sc = sc.replace('/hair-loss-consultation.html#', '/hair-loss-consultation/#')
        sc = sc.replace('/hair-loss-consultation.html', '/hair-loss-consultation/')
        with open(sd_path, "w", encoding="utf-8") as fp:
            fp.write(sc)
        print("✅ site-data.json updated")

    # frontend/llms.txt
    llms_path = os.path.join(FRONTEND, "llms.txt")
    if os.path.exists(llms_path):
        with open(llms_path, "r", encoding="utf-8") as fp:
            llms = fp.read()
        llms = llms.replace('https://www.kezza.co.in/hair-loss-consultation.html', 'https://www.kezza.co.in/hair-loss-consultation/')
        with open(llms_path, "w", encoding="utf-8") as fp:
            fp.write(llms)
        print("✅ llms.txt updated")

if __name__ == "__main__":
    main()
