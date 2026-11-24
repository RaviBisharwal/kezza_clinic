#!/usr/bin/env python3
"""
Convert all index.html links across Kezza Clinic website to clean root '/'
and add 301 redirects in server.js and .htaccess.
"""

import os
import re
import glob

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FRONTEND = os.path.join(ROOT, "frontend")

def fix_html_files():
    html_files = sorted(glob.glob(os.path.join(FRONTEND, "**", "*.html"), recursive=True))
    modified = 0

    replacements = [
        ('href="/index.html"', 'href="/"'),
        ('href="index.html"', 'href="/"'),
        ("href='/index.html'", "href='/'"),
        ("href='index.html'", "href='/'"),
        ("window.location.href='/index.html'", "window.location.href='/'"),
        ('window.location.href="/index.html"', 'window.location.href="/"'),
        ("window.location.href='index.html'", "window.location.href='/'"),
        ('window.location.href="index.html"', 'window.location.href="/"'),
        ('onclick="window.location.href=\'index.html\'"', 'onclick="window.location.href=\'/\'"'),
        ('"item":"https://www.kezza.co.in/index.html"', '"item":"https://www.kezza.co.in/"'),
        ('"item": "https://www.kezza.co.in/index.html"', '"item": "https://www.kezza.co.in/"'),
        ("'item': 'https://www.kezza.co.in/index.html'", "'item': 'https://www.kezza.co.in/'"),
    ]

    for fpath in html_files:
        with open(fpath, "r", encoding="utf-8") as fp:
            orig = fp.read()
        
        updated = orig
        for old, new in replacements:
            updated = updated.replace(old, new)

        if updated != orig:
            with open(fpath, "w", encoding="utf-8") as fp:
                fp.write(updated)
            modified += 1

    print(f"✅ Updated index.html links to '/' in {modified} HTML files.")

def fix_mobile_menu():
    js_path = os.path.join(FRONTEND, "js", "mobile-menu.js")
    if os.path.exists(js_path):
        with open(js_path, "r", encoding="utf-8") as fp:
            content = fp.read()
        content = content.replace('href="/index.html"', 'href="/"')
        content = content.replace('href="index.html"', 'href="/"')
        with open(js_path, "w", encoding="utf-8") as fp:
            fp.write(content)
        print("✅ mobile-menu.js updated.")

def fix_content_scripts():
    # sync_footer.py
    sf_path = os.path.join(ROOT, "tools", "content", "sync_footer.py")
    if os.path.exists(sf_path):
        with open(sf_path, "r", encoding="utf-8") as fp:
            content = fp.read()
        content = content.replace('("Home", "/index.html")', '("Home", "/")')
        content = content.replace('("Franchise", "/branches.html")', '("Franchise", "/branches/")')
        content = content.replace('("Contact Us", "/contact.html")', '("Contact Us", "/contact/")')
        content = content.replace('("GFC Therapy", "/gfc-treatment/", "gfc-treatment"', '("GFC Therapy", "/gfc/", "gfc-treatment"')
        content = content.replace('("Acne &amp; Acne Scars", "/acne-treatment/", "acne-treatment"', '("Acne &amp; Acne Scars", "/acne/", "acne-treatment"')
        content = content.replace('("Pigmentation &amp; Melasma", "/pigmentation-treatment/", "pigmentation-treatment"', '("Pigmentation &amp; Melasma", "/pigmentation/", "pigmentation-treatment"')
        content = content.replace('("Botox &amp; Fillers", "/botox/", "botox"', '("Botox &amp; Fillers", "/dermal-fillers/", "botox"')
        content = content.replace('("Dark Circle Treatment", "/dark-circles-treatment/", "dark-circles-treatment"', '("Dark Circle Treatment", "/dark-circles/", "dark-circles-treatment"')
        content = content.replace('("Stretch Marks", "/stretch-marks-treatment/", "stretch-marks"', '("Stretch Marks", "/stretch-marks/", "stretch-marks"')
        with open(sf_path, "w", encoding="utf-8") as fp:
            fp.write(content)
        print("✅ sync_footer.py updated.")

    # pseo.py
    pseo_path = os.path.join(ROOT, "tools", "content", "pseo.py")
    if os.path.exists(pseo_path):
        with open(pseo_path, "r", encoding="utf-8") as fp:
            content = fp.read()
        content = content.replace('("Home", "/index.html")', '("Home", "/")')
        with open(pseo_path, "w", encoding="utf-8") as fp:
            fp.write(content)
        print("✅ pseo.py updated.")

    # build_content_pages.py
    bcp_path = os.path.join(ROOT, "tools", "content", "build_content_pages.py")
    if os.path.exists(bcp_path):
        with open(bcp_path, "r", encoding="utf-8") as fp:
            content = fp.read()
        content = content.replace('("Home", "/index.html")', '("Home", "/")')
        with open(bcp_path, "w", encoding="utf-8") as fp:
            fp.write(content)
        print("✅ build_content_pages.py updated.")

    # tools/content/pages/*.html
    pages_dir = os.path.join(ROOT, "tools", "content", "pages")
    if os.path.exists(pages_dir):
        for pfile in glob.glob(os.path.join(pages_dir, "*.html")):
            with open(pfile, "r", encoding="utf-8") as fp:
                c = fp.read()
            c = c.replace('["Home", "/index.html"]', '["Home", "/"]')
            c = c.replace('["होम", "/index.html"]', '["होम", "/"]')
            with open(pfile, "w", encoding="utf-8") as fp:
                fp.write(c)
        print("✅ tools/content/pages/*.html updated.")

def fix_htaccess():
    htaccess_path = os.path.join(FRONTEND, ".htaccess")
    if os.path.exists(htaccess_path):
        with open(htaccess_path, "r", encoding="utf-8") as fp:
            content = fp.read()
        
        rule = (
            "    # 301: /index.html -> / (clean URL)\n"
            "    RewriteCond %{THE_REQUEST} ^[A-Z]{3,9}\\ /.*index\\.html\\ HTTP/ [NC]\n"
            "    RewriteRule ^(.*)index\\.html$ /$1 [R=301,L]\n\n"
        )
        if "RewriteRule ^(.*)index\\.html$ /$1 [R=301,L]" not in content:
            content = re.sub(
                r"(RewriteEngine On\s*\n)",
                r"\1\n" + rule,
                content,
                count=1
            )
            with open(htaccess_path, "w", encoding="utf-8") as fp:
                fp.write(content)
            print("✅ .htaccess updated with 301 redirect for index.html.")

def fix_server_js():
    server_path = os.path.join(ROOT, "server.js")
    if os.path.exists(server_path):
        with open(server_path, "r", encoding="utf-8") as fp:
            content = fp.read()
        
        redirect_block = (
            "// ── Clean URL Redirects: strip /index.html ────────────────────────\n"
            "app.use((req, res, next) => {\n"
            "    if (req.path === '/index.html') {\n"
            "        return res.redirect(301, '/');\n"
            "    }\n"
            "    if (req.path.endsWith('/index.html')) {\n"
            "        return res.redirect(301, req.path.slice(0, -10));\n"
            "    }\n"
            "    next();\n"
            "});\n\n"
        )

        if "if (req.path === '/index.html')" not in content:
            target = "// ── 301 Permanent Redirects ────────────────────────────────────────\n"
            if target in content:
                content = content.replace(target, target + redirect_block)
                with open(server_path, "w", encoding="utf-8") as fp:
                    fp.write(content)
                print("✅ server.js updated with index.html 301 redirect.")

if __name__ == "__main__":
    fix_html_files()
    fix_mobile_menu()
    fix_content_scripts()
    fix_htaccess()
    fix_server_js()
