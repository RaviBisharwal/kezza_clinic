#!/usr/bin/env python3
"""
update_weight_loss_anchor.py
----------------------------
Replaces /weight-loss.html#treatments with /weight-loss.html#body-sculpting
across all HTML files in frontend/, and updates id anchors in weight-loss.html.
"""

import os, re

BASE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
FRONTEND = os.path.join(BASE, "frontend")

html_files = []
for root, dirs, files in os.walk(FRONTEND):
    for f in files:
        if f.endswith(".html"):
            html_files.append(os.path.join(root, f))

updated_count = 0
for path in html_files:
    with open(path, "r", encoding="utf-8") as fh:
        content = fh.read()

    orig = content

    # Replace mega-link and inline references
    content = content.replace('/weight-loss.html#treatments', '/weight-loss.html#body-sculpting')
    content = content.replace('weight-loss.html#treatments', 'weight-loss.html#body-sculpting')

    # Specifically for weight-loss.html itself
    if os.path.basename(path) == "weight-loss.html":
        # Replace hero button link
        content = content.replace('href="#treatments"', 'href="#body-sculpting"')
        content = content.replace("getElementById('treatments')", "getElementById('body-sculpting')")
        # Ensure both id="body-sculpting" and id="treatments" exist for backward compatibility
        if 'id="body-sculpting"' not in content:
            content = content.replace(
                '<div aria-hidden="true" class="kezza-anchor" id="treatments"></div>',
                '<div aria-hidden="true" class="kezza-anchor" id="body-sculpting"></div>\n<div aria-hidden="true" class="kezza-anchor" id="treatments"></div>'
            )

    if content != orig:
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(content)
        updated_count += 1

print(f"✅ Updated #treatments to #body-sculpting in {updated_count} HTML files.")
