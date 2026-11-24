#!/usr/bin/env python3
"""
Kezza Clinic – Audit Remediation Script
Applies all confirmed fixes in priority order.
Run from the project root: python3 tools/fixes/fix_all_issues.py
"""

import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
FRONTEND = ROOT / "frontend"

changes_log = []

def log(msg):
    print(msg)
    changes_log.append(msg)

def replace_in_file(filepath, old, new, description):
    """Replace all occurrences of old with new in filepath. Returns True if changed."""
    try:
        content = filepath.read_text(encoding="utf-8", errors="replace")
    except Exception as e:
        log(f"  ERROR reading {filepath.relative_to(FRONTEND)}: {e}")
        return False
    if old not in content:
        return False
    new_content = content.replace(old, new)
    filepath.write_text(new_content, encoding="utf-8")
    count = content.count(old)
    log(f"  ✓ [{description}] {filepath.relative_to(FRONTEND)} ({count} replacement(s))")
    return True

def replace_regex_in_file(filepath, pattern, replacement, description, flags=0):
    """Replace pattern (regex) with replacement in filepath. Returns True if changed."""
    try:
        content = filepath.read_text(encoding="utf-8", errors="replace")
    except Exception as e:
        log(f"  ERROR reading {filepath.relative_to(FRONTEND)}: {e}")
        return False
    new_content, n = re.subn(pattern, replacement, content, flags=flags)
    if n == 0:
        return False
    filepath.write_text(new_content, encoding="utf-8")
    log(f"  ✓ [{description}] {filepath.relative_to(FRONTEND)} ({n} replacement(s))")
    return True

def all_html_files():
    return sorted(FRONTEND.rglob("*.html"))

# ─────────────────────────────────────────────────────────────────────────────
# FIX 1 – ISS-009: medical-dermatology form action (CRITICAL)
# ─────────────────────────────────────────────────────────────────────────────
def fix_009_medderma_form():
    log("\n=== FIX 1 (ISS-009): Medical Dermatology broken form ===")
    filepath = FRONTEND / "medical-dermatology" / "index.html"

    # Fix the form action
    changed = replace_in_file(
        filepath,
        'action="/api/leads/consultation"',
        'action="/api/lead"',
        "ISS-009 form action"
    )

    # Add JS submit handler with success/error UI after the closing </form> tag
    handler_script = '''<script>
(function () {
  var form = document.querySelector(".md-consult-form");
  if (!form) return;

  // Inject feedback container right after the form
  var feedback = document.createElement("div");
  feedback.id = "md-form-feedback";
  feedback.style.cssText = "margin-top:12px;padding:14px 18px;border-radius:8px;font-size:15px;display:none;";
  form.parentNode.insertBefore(feedback, form.nextSibling);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var btn = form.querySelector("button[type=submit]");
    var origText = btn ? btn.innerHTML : "";
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Booking\u2026'; }

    var data = {
      name: form.fullName ? form.fullName.value.trim() : "",
      phone: form.phone ? form.phone.value.trim() : "",
      city: form.city ? form.city.value : "",
      service: form.treatment ? form.treatment.value : "",
      notes: form.notes ? form.notes.value.trim() : "",
      source: "medical-dermatology",
      category: "Skin"
    };

    fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
    .then(function (res) {
      return res.json().then(function (body) { return { ok: res.ok, body: body }; });
    })
    .then(function (r) {
      if (r.ok) {
        feedback.style.background = "#f0fdf4";
        feedback.style.border = "1px solid #86efac";
        feedback.style.color = "#166534";
        feedback.innerHTML = '<i class="fas fa-check-circle"></i> <strong>Consultation booked!</strong> Our team will call you within 2 hours to confirm your appointment.';
        feedback.style.display = "block";
        form.reset();
      } else {
        throw new Error(r.body && r.body.error ? r.body.error : "Server error");
      }
    })
    .catch(function (err) {
      feedback.style.background = "#fef2f2";
      feedback.style.border = "1px solid #fca5a5";
      feedback.style.color = "#991b1b";
      feedback.innerHTML = '<i class="fas fa-exclamation-circle"></i> Unable to submit. Please call us at <a href="tel:+919284517427" style="color:#991b1b;font-weight:600;">+91 92845 17427</a> to book directly.';
      feedback.style.display = "block";
      if (btn) { btn.disabled = false; btn.innerHTML = origText; }
    });
  });
})();
</script>'''

    content = filepath.read_text(encoding="utf-8", errors="replace")
    if "md-form-feedback" not in content:
        # Insert the handler after </form> inside the md-form-card
        new_content = content.replace("</form>\n</div>\n</div>\n</div>\n</section>", 
                                      "</form>\n" + handler_script + "\n</div>\n</div>\n</div>\n</section>", 1)
        if new_content == content:
            # Try alternate whitespace pattern (CRLF)
            new_content = content.replace("</form>\r\n</div>\r\n</div>\r\n</div>\r\n</section>",
                                          "</form>\r\n" + handler_script + "\r\n</div>\r\n</div>\r\n</div>\r\n</section>", 1)
        if new_content != content:
            filepath.write_text(new_content, encoding="utf-8")
            log("  ✓ [ISS-009 form JS handler] medical-dermatology/index.html (handler injected)")
        else:
            log("  ⚠ [ISS-009 form JS handler] Could not auto-inject handler — pattern not matched. Form action was fixed; handler needs manual insertion.")
    else:
        log("  ✓ [ISS-009 form JS handler] Already present, skipped.")

    if not changed:
        log("  ⚠ [ISS-009] form action was already correct or not found")

# ─────────────────────────────────────────────────────────────────────────────
# FIX 2 – ISS-002: Security headers in .htaccess
# ─────────────────────────────────────────────────────────────────────────────
def fix_002_security_headers():
    log("\n=== FIX 2 (ISS-002): Security headers ===")
    filepath = FRONTEND / ".htaccess"
    content = filepath.read_text(encoding="utf-8", errors="replace")

    if "X-Frame-Options" in content:
        log("  ✓ X-Frame-Options already present, skipped.")
        return

    new_headers = (
        '    Header always set Referrer-Policy "strict-origin-when-cross-origin"\n'
        '    Header always set X-Frame-Options "SAMEORIGIN"\n'
        '    Header always set X-XSS-Protection "1; mode=block"\n'
        '    Header always set Permissions-Policy "camera=(), microphone=(), geolocation=(self), fullscreen=(self)"\n'
    )

    old = '    Header always set Referrer-Policy "strict-origin-when-cross-origin"\n'
    if old in content:
        new_content = content.replace(old, new_headers, 1)
        filepath.write_text(new_content, encoding="utf-8")
        log("  ✓ [ISS-002] .htaccess: X-Frame-Options, X-XSS-Protection, Permissions-Policy added")
    else:
        log("  ⚠ [ISS-002] Referrer-Policy anchor not found; skipping automatic insertion.")

# ─────────────────────────────────────────────────────────────────────────────
# FIX 3 – ISS-016: robots.txt
# ─────────────────────────────────────────────────────────────────────────────
def fix_016_robots_txt():
    log("\n=== FIX 3 (ISS-016): robots.txt ===")
    filepath = FRONTEND / "robots.txt"
    content = filepath.read_text(encoding="utf-8", errors="replace")

    additions = []
    if "Disallow: /admin.html" not in content:
        additions.append("Disallow: /admin.html")
    if "Disallow: /review.html" not in content:
        additions.append("Disallow: /review.html")
    if "Disallow: /data/" not in content:
        additions.append("Disallow: /data/")
    if "Disallow: /google3190ebd4fd81712c.html" not in content:
        additions.append("Disallow: /google3190ebd4fd81712c.html")

    if not additions:
        log("  ✓ robots.txt already has all required Disallow entries, skipped.")
        return

    # Insert after "Disallow: /server.py"
    insert_block = "\n".join(additions)
    new_content = content.replace(
        "Disallow: /server.py",
        "Disallow: /server.py\n" + insert_block
    )
    filepath.write_text(new_content, encoding="utf-8")
    log(f"  ✓ [ISS-016] robots.txt: added {', '.join(additions)}")

# ─────────────────────────────────────────────────────────────────────────────
# FIX 4 – ISS-011: consultation-confirmed.html robots meta
# ─────────────────────────────────────────────────────────────────────────────
def fix_011_consultation_confirmed():
    log("\n=== FIX 4 (ISS-011): consultation-confirmed robots meta ===")
    filepath = FRONTEND / "consultation-confirmed.html"
    if not filepath.exists():
        log("  ⚠ consultation-confirmed.html not found, skipped.")
        return
    replace_in_file(
        filepath,
        'content="noindex, follow"',
        'content="noindex, nofollow"',
        "ISS-011 robots meta"
    ) or log("  ✓ Already noindex, nofollow or not found.")

# ─────────────────────────────────────────────────────────────────────────────
# FIX 5 – ISS-003: Accessibility of void booking buttons
# ─────────────────────────────────────────────────────────────────────────────
def fix_003_void_buttons():
    log("\n=== FIX 5 (ISS-003): Void href booking buttons ===")

    # doctor-videos.html: JS already intercepts with e.preventDefault()
    dv = FRONTEND / "doctor-videos.html"
    if dv.exists():
        changed = replace_in_file(
            dv,
            'href="javascript:void(0)"',
            'href="/book-appointment.html"',
            "ISS-003 doctor-videos href fallback"
        )
        if not changed:
            log("  ✓ [ISS-003] doctor-videos.html already updated or no matches.")

    # before-after.html: add fallback href + inject JS handler
    ba = FRONTEND / "before-after.html"
    if ba.exists():
        replace_in_file(
            ba,
            'href="javascript:void(0)"',
            'href="/contact.html"',
            "ISS-003 before-after href fallback"
        )
        # Inject click handler script if not already present
        content = ba.read_text(encoding="utf-8", errors="replace")
        if "ba-book-btn" in content and "KezzaBooking" not in content:
            handler = """
<script>
(function () {
  document.querySelectorAll(".ba-book-btn").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      if (window.KezzaBooking && typeof window.KezzaBooking.open === "function") {
        window.KezzaBooking.open();
      } else {
        window.location.href = "/contact.html";
      }
    });
  });
})();
</script>"""
            # Insert before </body>
            new_content = content.replace("</body>", handler + "\n</body>", 1)
            if new_content != content:
                ba.write_text(new_content, encoding="utf-8")
                log("  ✓ [ISS-003] before-after.html: KezzaBooking click handler injected")

# ─────────────────────────────────────────────────────────────────────────────
# FIX 6 – ISS-015: Hamburger accessibility (div → semantic with role)
# ─────────────────────────────────────────────────────────────────────────────
def fix_015_hamburger():
    log("\n=== FIX 6 (ISS-015): Hamburger accessibility ===")
    # The JS (mobile-menu.js) already sets aria-expanded, aria-label, aria-haspopup.
    # We only need to add role="button" and tabindex="0" to the div in HTML.
    # (Converting div→button would require CSS/JS audit; safe approach: role+tabindex)
    total = 0
    for filepath in all_html_files():
        changed = replace_in_file(
            filepath,
            '<div class="hamburger" id="hamburger">',
            '<div aria-controls="navMenu" aria-expanded="false" aria-label="Open navigation menu" class="hamburger" id="hamburger" role="button" tabindex="0">',
            "ISS-015 hamburger role+aria"
        )
        if changed:
            total += 1
    log(f"  → Total files updated: {total}")

# ─────────────────────────────────────────────────────────────────────────────
# FIX 7 – ISS-001: logo.png → logo.webp (nav/header references only)
# ─────────────────────────────────────────────────────────────────────────────
def fix_001_logo():
    log("\n=== FIX 7 (ISS-001): Logo standardization (logo.png → logo.webp) ===")
    total = 0
    for filepath in all_html_files():
        content = filepath.read_text(encoding="utf-8", errors="replace")
        # Replace absolute path references (/images/logo.png)
        new_content = content.replace('src="/images/logo.png"', 'src="/images/logo.webp"')
        # Replace relative path references (images/logo.png) — root-level pages
        new_content = new_content.replace('src="images/logo.png"', 'src="/images/logo.webp"')
        # Fix JSON-LD logo URL in any page
        new_content = new_content.replace(
            '"logo": "https://www.kezza.co.in/logo.png"',
            '"logo": "https://www.kezza.co.in/images/logo.webp"'
        )
        # Fix JSON-LD logo URL with images/ path
        new_content = new_content.replace(
            '"logo": "https://www.kezza.co.in/images/logo.png"',
            '"logo": "https://www.kezza.co.in/images/logo.webp"'
        )
        if new_content != content:
            filepath.write_text(new_content, encoding="utf-8")
            log(f"  ✓ [ISS-001] {filepath.relative_to(FRONTEND)}")
            total += 1
    log(f"  → Total files updated: {total}")

# ─────────────────────────────────────────────────────────────────────────────
# FIX 8 – ISS-004: Render-blocking Google Fonts (non-noscript occurrences)
# ─────────────────────────────────────────────────────────────────────────────
def fix_004_fonts():
    log("\n=== FIX 8 (ISS-004): Render-blocking Google Fonts ===")
    total = 0
    pattern = re.compile(
        r'<link\s+href="(https://fonts\.googleapis\.com/css2\?[^"]+)"\s+rel="stylesheet"\s*/?>',
        re.IGNORECASE
    )
    for filepath in all_html_files():
        content = filepath.read_text(encoding="utf-8", errors="replace")
        # Skip if already inside a <noscript> block — those are fine
        # Find matches NOT inside noscript
        lines = content.split('\n')
        new_lines = []
        changed = False
        in_noscript = False
        for line in lines:
            if '<noscript>' in line:
                in_noscript = True
            if '</noscript>' in line:
                in_noscript = False

            if not in_noscript:
                m = pattern.search(line)
                if m:
                    url = m.group(1)
                    async_link = (
                        f'<link rel="preload" as="style" href="{url}" '
                        f'onload="this.onload=null;this.rel=\'stylesheet\'" />'
                        f'<noscript><link rel="stylesheet" href="{url}"/></noscript>'
                    )
                    new_line = pattern.sub(async_link, line)
                    new_lines.append(new_line)
                    changed = True
                    continue
            new_lines.append(line)

        if changed:
            filepath.write_text('\n'.join(new_lines), encoding="utf-8")
            log(f"  ✓ [ISS-004] {filepath.relative_to(FRONTEND)}: fonts made async")
            total += 1

    log(f"  → Total files updated: {total}")

# ─────────────────────────────────────────────────────────────────────────────
# FIX 9 – ISS-012: PMU mega-menu links (hash → dedicated pages)
# ─────────────────────────────────────────────────────────────────────────────
def fix_012_pmu_links():
    log("\n=== FIX 9 (ISS-012): PMU mega-menu links ===")
    total_lip = total_eyeliner = 0
    for filepath in all_html_files():
        c1 = replace_in_file(
            filepath,
            'href="/permanent-makeup.html#lip-blush"',
            'href="/lip-blush/"',
            "ISS-012 lip-blush link"
        )
        c2 = replace_in_file(
            filepath,
            'href="/permanent-makeup.html#eyeliner"',
            'href="/permanent-eyeliner/"',
            "ISS-012 eyeliner link"
        )
        if c1: total_lip += 1
        if c2: total_eyeliner += 1
    log(f"  → lip-blush updated in {total_lip} files, eyeliner updated in {total_eyeliner} files")

# ─────────────────────────────────────────────────────────────────────────────
# FIX 10 – ISS-010: Add acne-scar-treatment to mega-menu Skin Services column
# ─────────────────────────────────────────────────────────────────────────────
def fix_010_acne_scar_menu():
    log("\n=== FIX 10 (ISS-010): Add acne-scar-treatment to mega-menu ===")
    total = 0
    # Insert the new <li> after the acne-treatment entry
    # Two known variants of the acne-treatment link text
    targets = [
        '<li><a class="mega-link" href="/acne-treatment/">Acne &amp; Acne Scars</a></li>',
        '<li><a class="mega-link" href="/acne-treatment/">Acne & Acne Scars</a></li>',
    ]
    insertion = '\n<li><a class="mega-link" href="/acne-scar-treatment/">Acne Scar Treatment</a></li>'

    for filepath in all_html_files():
        content = filepath.read_text(encoding="utf-8", errors="replace")
        if 'href="/acne-scar-treatment/"' in content:
            continue  # already present
        for target in targets:
            if target in content:
                new_content = content.replace(target, target + insertion, 1)
                filepath.write_text(new_content, encoding="utf-8")
                log(f"  ✓ [ISS-010] {filepath.relative_to(FRONTEND)}")
                total += 1
                break
    log(f"  → Total files updated: {total}")

# ─────────────────────────────────────────────────────────────────────────────
# FIX 11 – ISS-019: face-scanner.html WhatsApp fallback href
# ─────────────────────────────────────────────────────────────────────────────
def fix_019_face_scanner():
    log("\n=== FIX 11 (ISS-019): Face scanner WhatsApp button fallback ===")
    filepath = FRONTEND / "face-scanner.html"
    if not filepath.exists():
        log("  ⚠ face-scanner.html not found, skipped.")
        return
    content = filepath.read_text(encoding="utf-8", errors="replace")
    # Replace href="#" on btnBookWA specifically
    new_content = re.sub(
        r'(<a\s[^>]*id="btnBookWA"[^>]*)href="#"',
        r'\1href="https://wa.me/919284517427"',
        content
    )
    if new_content == content:
        # Try alternate attribute order
        new_content = re.sub(
            r'href="#"([^>]*id="btnBookWA")',
            r'href="https://wa.me/919284517427"\1',
            content
        )
    if new_content != content:
        filepath.write_text(new_content, encoding="utf-8")
        log("  ✓ [ISS-019] face-scanner.html: btnBookWA href updated to WhatsApp URL")
    else:
        log("  ⚠ [ISS-019] Pattern not matched in face-scanner.html — manual check needed.")

# ─────────────────────────────────────────────────────────────────────────────
# FIX 12 – ISS-020: Sitemap EOF newline
# ─────────────────────────────────────────────────────────────────────────────
def fix_020_sitemap_newline():
    log("\n=== FIX 12 (ISS-020): Sitemap trailing newline ===")
    filepath = FRONTEND / "sitemap.xml"
    if not filepath.exists():
        log("  ⚠ sitemap.xml not found, skipped.")
        return
    content = filepath.read_bytes()
    if content and content[-1:] != b'\n':
        filepath.write_bytes(content + b'\n')
        log("  ✓ [ISS-020] sitemap.xml: trailing newline added")
    else:
        log("  ✓ [ISS-020] sitemap.xml already has trailing newline, skipped.")

# ─────────────────────────────────────────────────────────────────────────────
# FIX 13 – ISS-007: Remove duplicate JSON-LD from index.html
# ─────────────────────────────────────────────────────────────────────────────
def fix_007_duplicate_jsonld():
    log("\n=== FIX 13 (ISS-007): Duplicate JSON-LD in index.html ===")
    filepath = FRONTEND / "index.html"
    content = filepath.read_text(encoding="utf-8", errors="replace")

    # Count JSON-LD blocks
    blocks = re.findall(r'<script[^>]+type="application/ld\+json"[^>]*>.*?</script>', content, re.DOTALL | re.IGNORECASE)
    if len(blocks) <= 1:
        log("  ✓ [ISS-007] Only one JSON-LD block found, nothing to remove.")
        return

    log(f"  Found {len(blocks)} JSON-LD blocks.")

    # The second block is standalone MedicalClinic — identify it
    # It should contain "MedicalClinic" but NOT "@graph"
    blocks_to_remove = []
    for block in blocks[1:]:  # keep first block (@graph)
        if '"@graph"' not in block and 'MedicalClinic' in block:
            blocks_to_remove.append(block)

    for block in blocks_to_remove:
        # Check if aggregateRating is in this block but not in the first block
        agg_in_block = '"aggregateRating"' in block
        agg_in_first = '"aggregateRating"' in blocks[0]
        if agg_in_block and not agg_in_first:
            log("  ⚠ [ISS-007] Duplicate block has aggregateRating not present in primary block. Manual merge required.")
            continue
        new_content = content.replace(block, "", 1)
        if new_content != content:
            # Also remove blank line left behind
            new_content = re.sub(r'\n\n\n+', '\n\n', new_content)
            filepath.write_text(new_content, encoding="utf-8")
            log(f"  ✓ [ISS-007] Removed duplicate MedicalClinic JSON-LD block from index.html")
            content = new_content

# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print(f"Working directory: {FRONTEND}")
    print(f"HTML files found: {len(list(all_html_files()))}\n")

    fix_009_medderma_form()
    fix_002_security_headers()
    fix_016_robots_txt()
    fix_011_consultation_confirmed()
    fix_003_void_buttons()
    fix_015_hamburger()
    fix_001_logo()
    fix_004_fonts()
    fix_012_pmu_links()
    fix_010_acne_scar_menu()
    fix_019_face_scanner()
    fix_020_sitemap_newline()
    fix_007_duplicate_jsonld()

    print("\n" + "="*60)
    print("All fixes completed. Run 'npm test' to verify.")
    print("="*60)

