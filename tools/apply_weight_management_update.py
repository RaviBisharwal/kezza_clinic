#!/usr/bin/env python3
"""
apply_weight_management_update.py
Replaces "Weight Loss" and variants with "Weight Management" across HTML, JS, JSON, and server files
while safely preserving functional URLs, CSS classes, asset filenames, and external links.
"""

import os
import re

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
FRONTEND_DIR = os.path.join(BASE_DIR, 'frontend')

# Protected patterns: files, URLs, anchors, css bundles, asset names
PROTECT_PATTERNS = [
    r'https?://[^\s\"\'<>]+', # Full URLs (including external citations, canonicals, etc.)
    r'(/blog/(?:body-sculpting-vs-weight-loss|semaglutide-for-weight-loss)/[^\s\"\'<>]*)',
    r'(/images/[^\s\"\'<>]*(?:weight-loss|body-sculpting-vs-weight-loss|semaglutide-for-weight-loss)[^\s\"\'<>]*)',
    r'(images/[^\s\"\'<>]*(?:weight-loss|body-sculpting-vs-weight-loss|semaglutide-for-weight-loss)[^\s\"\'<>]*)',
    r'(css/bundle-weight-loss\.min\.css[^\s\"\'<>]*)',
    r'(/css/bundle-weight-loss\.min\.css[^\s\"\'<>]*)',
    r'(href=[\"\'\'](?:/|#)?weight-loss\.html[^\s\"\'<>]*[\"\'\'])',
    r'(href=[\"\'\']/blog/(?:body-sculpting-vs-weight-loss|semaglutide-for-weight-loss)/?[\"\'\'])',
    r'(action=[\"\'\'][^\s\"\'<>]*weight-loss\.html[^\s\"\'<>]*[\"\'\'])',
    r'(weight-loss-body)',
    r'(data-url=[\"\'\']weight-loss\.html[^\s\"\'<>]*[\"\'\'])',
    r'(window\.location\.href\s*=\s*[\"\'\']/weight-loss\.html[\"\'\'])'
]

def update_file_content(content, is_html=True):
    original = content
    placeholders = {}

    def repl_hold(m):
        key = f'___PROTECTED_{len(placeholders)}___'
        placeholders[key] = m.group(0)
        return key

    if is_html:
        for pat in PROTECT_PATTERNS:
            content = re.sub(pat, repl_hold, content)

    # WhatsApp URL-encoded text
    content = content.replace('%20weight-loss%20', '%20weight-management%20')
    content = content.replace('%20weight%20loss%20', '%20weight%20management%20')
    content = content.replace('%20Weight%20Loss%20', '%20Weight%20Management%20')

    # Common phrases
    replacements = [
        (r'\bWeight\s+Loss\s+&\s+Body\s+Sculpting\b', 'Weight Management & Body Sculpting'),
        (r'\bWeight\s+Loss\s+&amp;\s+Body\s+Sculpting\b', 'Weight Management &amp; Body Sculpting'),
        (r'\bWeight\s+Loss\s+&\s+Body\s+Contouring\b', 'Weight Management & Body Contouring'),
        (r'\bWeight\s+Loss\s+&amp;\s+Body\s+Contouring\b', 'Weight Management &amp; Body Contouring'),
        (r'\bMedical\s+Weight\s+Loss\s+Programme\b', 'Medical Weight Management Programme'),
        (r'\bMedical\s+weight-loss\s+programme\b', 'Medical weight-management programme'),
        (r'\bmedical\s+weight-loss\s+programme\b', 'medical weight-management programme'),
        (r'\bmedical\s+weight\s+loss\s+programme\b', 'medical weight management programme'),
        (r'\bMedical\s+Weight\s+Loss\b', 'Medical Weight Management'),
        (r'\bMedical\s+weight\s+loss\b', 'Medical weight management'),
        (r'\bmedical\s+weight\s+loss\b', 'medical weight management'),
        (r'\bAdvanced\s+Weight\s+Loss\b', 'Advanced Weight Management'),
        (r'\bWeight-loss\s+medicines\b', 'Weight-management medicines'),
        (r'\bweight-loss\s+medicines\b', 'weight-management medicines'),
        (r'\bWeight-loss\s+medicine\b', 'Weight-management medicine'),
        (r'\bweight-loss\s+medicine\b', 'weight-management medicine'),
        (r'\bweight-loss\s+treatment\b', 'weight-management treatment'),
        (r'\bweight\s+loss\s+treatment\b', 'weight management treatment'),
        (r'\bWeight\s+Loss\s+Department\b', 'Weight Management Department'),
        (r'\bWeight\s+Loss\s+Team\b', 'Weight Management Team'),
        (r'\bWeight\s+Loss\s+Consultation\b', 'Weight Management Consultation'),
        (r'\bWeight\s+loss\s+specialists\b', 'Weight management specialists'),
        (r'\bweight\s+loss\s+specialists\b', 'weight management specialists'),
        (r'\bCall\s+Weight\s+Loss\s+Team\b', 'Call Weight Management Team'),
        (r'\bSystemic\s+Weight\s+Loss\b', 'Systemic Weight Management'),
        (r'\bsystemic\s+weight\s+loss\b', 'systemic weight management'),
        (r'\boverall\s+weight\s+loss\b', 'overall weight management'),
        (r'\bsustained\s+weight\s+loss\b', 'sustained weight management'),
        (r'\bNon-Surgical\s+Weight\s+Loss\b', 'Non-Surgical Weight Management'),
        (r'\bnon-surgical\s+weight\s+loss\b', 'non-surgical weight management'),
        (r'\bNon-surgical\s+weight\s+loss\b', 'Non-surgical weight management'),
        (r'\bBody\s+Sculpting\s+vs\s+Weight\s+Loss\b', 'Body Sculpting vs Weight Management'),
        (r'\bbody\s+sculpting\s+vs\s+weight\s+loss\b', 'body sculpting vs weight management'),
        (r'\bSemaglutide\s+for\s+Weight\s+Loss\b', 'Semaglutide for Weight Management'),
        (r'\bSemaglutide\s+for\s+weight\s+loss\b', 'Semaglutide for weight management'),
        (r'\bsemaglutide\s+for\s+weight\s+loss\b', 'semaglutide for weight management'),
        (r'\bWeight\s+Loss\s+/\s+Slimming\b', 'Weight Management / Slimming'),
        (r'\bWeight\s+loss\s+treatment\s+cards\b', 'Weight management treatment cards'),
        (r'\bDoctor-supervised\s+weight\s+loss\b', 'Doctor-supervised weight management'),
        (r'\bdoctor-supervised\s+weight\s+loss\b', 'doctor-supervised weight management'),
        (r'\bweight-loss\s+surgery\b', 'weight-management surgery'),
        (r'\bweight\s+loss\s+doctor\b', 'weight management doctor'),
        (r'\bweight\s+loss\s+drug\b', 'weight management drug'),
        (r'\bweight-loss\s+drug\b', 'weight-management drug'),
        (r'\bweight\s+loss\s+trial\b', 'weight management trial'),
        (r'\bweight-loss\s+trial\b', 'weight-management trial'),
        (r'\bweight\s+loss\s+injection\b', 'weight management injection'),
        (r'\bweight-loss\s+injection\b', 'weight-management injection'),
        # General word boundaries
        (r'\bWeight\s+Loss\b', 'Weight Management'),
        (r'\bWeight\s+loss\b', 'Weight management'),
        (r'\bweight\s+loss\b', 'weight management'),
        (r'\bWEIGHT\s+LOSS\b', 'WEIGHT MANAGEMENT'),
        (r'\bWeight-Loss\b', 'Weight-Management'),
        (r'\bWeight-loss\b', 'Weight-management'),
        (r'\bweight-loss\b', 'weight-management'),
    ]

    for pat, repl in replacements:
        content = re.sub(pat, repl, content)

    if is_html:
        for k, v in reversed(list(placeholders.items())):
            content = content.replace(k, v)

    return content, content != original

def main():
    modified_files = []

    # 1. Frontend HTML files
    for root, dirs, files in os.walk(FRONTEND_DIR):
        for f in files:
            if f.endswith('.html'):
                path = os.path.join(root, f)
                with open(path, 'r', encoding='utf-8', errors='ignore') as fp:
                    orig = fp.read()
                updated, changed = update_file_content(orig, is_html=True)
                if changed:
                    with open(path, 'w', encoding='utf-8') as fp:
                        fp.write(updated)
                    modified_files.append(os.path.relpath(path, BASE_DIR))

    # 2. Key JS files
    js_files = [
        'frontend/js/whatsapp-form.js',
        'frontend/js/scanner-modal.js',
        'frontend/js/face-scanner-script.js',
        'frontend/js/kezza-ai.js'
    ]
    for rel_path in js_files:
        full_path = os.path.join(BASE_DIR, rel_path)
        if os.path.exists(full_path):
            with open(full_path, 'r', encoding='utf-8') as fp:
                content = fp.read()
            # Custom JS adjustments:
            new_content = content
            # whatsapp-form.js: add Weight Management
            if 'whatsapp-form.js' in rel_path:
                if "'Weight Management':" not in new_content:
                    new_content = new_content.replace(
                        "'Weight Loss': {",
                        "'Weight Management': {\n            badge: 'Body Contouring',\n            doctor: 'Clinical Body Sculpting Specialist & Nutritionist',\n            procedures: [\n                { id: 'Cryolipolysis (360° Fat Freezing)', name: '360° Fat Freezing', icon: 'fa-snowflake', popular: true },\n                { id: 'HIFU Non-Surgical Body Sculpting', name: 'HIFU Body Sculpting', icon: 'fa-wave-square', popular: true },\n                { id: 'Inch Loss & Tummy Tightening', name: 'Inch Loss & Tummy Tightening', icon: 'fa-compress-arrows-alt', popular: true },\n                { id: 'Double Chin Reduction', name: 'Double Chin Reduction', icon: 'fa-smile', popular: true },\n                { id: 'Medical Weight Management Protocol', name: 'Medical Weight Management Protocol', icon: 'fa-weight', popular: false },\n                { id: 'Other Body Sculpting Concern', name: 'Other Body Concern', icon: 'fa-comment-medical', popular: false }\n            ]\n        },\n        'Weight Loss': {"
                    )
                    new_content = new_content.replace('Medical Weight Loss Protocol', 'Medical Weight Management Protocol')
            # scanner-modal.js
            if 'scanner-modal.js' in rel_path:
                new_content = new_content.replace('> Weight Loss</button>', '> Weight Management</button>')
                new_content = new_content.replace('weight_loss:{label:"Weight Loss"', 'weight_loss:{label:"Weight Management"')
                new_content = new_content.replace('"Medical Weight Loss Management"', '"Medical Weight Management"')
            # face-scanner-script.js
            if 'face-scanner-script.js' in rel_path:
                new_content = new_content.replace('Weight Loss & Body Slimming Consultation', 'Weight Management & Body Slimming Consultation')
            # kezza-ai.js
            if 'kezza-ai.js' in rel_path:
                new_content = new_content.replace('Weight Loss Department', 'Weight Management Department')
                new_content = new_content.replace('Book Weight Loss Consultation', 'Book Weight Management Consultation')
                new_content = new_content.replace('Chat with Weight Loss Team', 'Chat with Weight Management Team')
                new_content = new_content.replace('Weight Loss Team se Chat Karein', 'Weight Management Team se Chat Karein')
                new_content = new_content.replace('Weight Loss / Body', 'Weight Management / Body')
                new_content = new_content.replace('Medical Weight Loss', 'Medical Weight Management')
                new_content = new_content.replace('label:"⚖️ Weight Loss"', 'label:"⚖️ Weight Management"')

            if new_content != content:
                with open(full_path, 'w', encoding='utf-8') as fp:
                    fp.write(new_content)
                modified_files.append(rel_path)

    # 3. server.js
    server_path = os.path.join(BASE_DIR, 'server.js')
    with open(server_path, 'r', encoding='utf-8') as fp:
        s_content = fp.read()
    s_new = s_content.replace('4. Weight Loss & Body Contouring:', '4. Weight Management & Body Contouring:')
    s_new = s_new.replace("resolvedDepartment = 'Weight Loss';", "resolvedDepartment = 'Weight Management';")
    s_new = s_new.replace('6. WEIGHT_LOSS: Kezza Wellness Team', '6. WEIGHT_MANAGEMENT / WEIGHT_LOSS: Kezza Wellness Team')
    if s_new != s_content:
        with open(server_path, 'w', encoding='utf-8') as fp:
            fp.write(s_new)
        modified_files.append('server.js')

    # 4. tools
    tool_files = [
        'tools/update_mega_menu.py',
        'tools/treatment-pages/build_pages.py',
        'tools/seo/taxonomy.json'
    ]
    for t_rel in tool_files:
        t_full = os.path.join(BASE_DIR, t_rel)
        if os.path.exists(t_full):
            with open(t_full, 'r', encoding='utf-8') as fp:
                t_content = fp.read()
            t_new = t_content.replace('>Weight Loss</a>', '>Weight Management</a>')
            t_new = t_new.replace('"name": "Weight Loss", "label": "Weight Loss"', '"name": "Weight Management", "label": "Weight Management"')
            t_new = t_new.replace('"name": "Weight Loss"', '"name": "Weight Management"')
            if t_new != t_content:
                with open(t_full, 'w', encoding='utf-8') as fp:
                    fp.write(t_new)
                modified_files.append(t_rel)

    print(f'Done! Modified {len(modified_files)} files.')
    for m in modified_files[:20]:
        print(f' - {m}')
    if len(modified_files) > 20:
        print(f' ... and {len(modified_files) - 20} more files')

if __name__ == '__main__':
    main()
