#!/usr/bin/env python3
"""
update_book_consultation_to_contact.py
--------------------------------------
Updates all header navbar "Book Consultation" buttons across all HTML files
to point directly to /contact.html without triggering any modal or chatbot.
"""

import os, re

BASE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
FRONTEND = os.path.join(BASE, "frontend")

html_files = []
for root, dirs, files in os.walk(FRONTEND):
    for f in files:
        if f.endswith(".html"):
            html_files.append(os.path.join(root, f))

# Replace any <a class="btn-primary" ...>Book Consultation</a> inside nav/header
# with <a class="btn-primary" href="/contact.html">Book Consultation</a>
TARGET_PATTERN = re.compile(
    r'<a\b(?=[^>]*\bclass=["\'][^"\']*btn-primary[^"\']*["\'])(?=[^>]*\bhref=["\'][^"\']*["\'])[^>]*>\s*Book\s+Consultation\s*</a>',
    re.IGNORECASE
)

updated_count = 0
for path in html_files:
    with open(path, "r", encoding="utf-8") as fh:
        content = fh.read()

    # Find the header/nav region
    # Most pages have: <header ...> ... </header> or <nav ...> ... </nav>
    # Within header/nav or nav-cta, update the button
    orig = content

    def replacer(match):
        return '<a class="btn-primary" href="/contact.html">Book Consultation</a>'

    # 1. First specifically target the button within nav-cta or nav or header
    def replace_in_header(block_match):
        block = block_match.group(0)
        return TARGET_PATTERN.sub(replacer, block)

    content = re.sub(r'<header\b[\s\S]*?</header>', replace_in_header, content)
    content = re.sub(r'<nav\b[\s\S]*?</nav>', replace_in_header, content)

    if content != orig:
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(content)
        updated_count += 1

print(f"✅ Updated 'Book Consultation' navbar button in {updated_count} HTML files to href='/contact.html'")

