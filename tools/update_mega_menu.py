#!/usr/bin/env python3
"""
Replace the old accordion services dropdown with the new wide mega-menu
across every HTML page. Uses regex so it handles per-page active-class variants.
Run from kezza_clinic-main/:  python3 tools/update_mega_menu.py
"""
import os, re, glob

# Pattern that captures the entire old services li block.
# We match from the comment just before it through the closing </li>.
OLD_PATTERN = re.compile(
    r'([ \t]*)<!-- SERVICES DROPDOWN.*?-->\s*'   # comment + indent
    r'<li class="nav-item-services-dropdown">.*?'  # opening li
    r'</li>',                                      # closing li (of the outer dropdown)
    re.DOTALL
)

# The new mega-menu block (absolute paths — works from any depth because
# every page already uses root-relative links in its own nav)
NEW_BLOCK = '''\
                <!-- SERVICES MEGA MENU -->
                <li class="nav-item-services-dropdown">
                    <a href="javascript:void(0)" class="services-nav-toggle" id="servicesNavToggle" role="button" aria-haspopup="true" aria-expanded="false" aria-controls="servicesDropdownMenu">
                        <span>SERVICES</span> <i class="fas fa-chevron-down nav-arrow"></i>
                    </a>
                    <div class="services-dropdown-menu mega-menu-panel" id="servicesDropdownMenu" role="region" aria-label="Services Menu">
                        <div class="mega-menu-grid">

                            <!-- Column 1: Hair Services -->
                            <div class="mega-col">
                                <div class="mega-col-header">
                                    <i class="fas fa-user-md mega-col-icon"></i>
                                    <a href="hair-services.html" class="mega-col-title">Hair Services</a>
                                </div>
                                <ul class="mega-link-list">
                                    <li><a href="hair-transplant/" class="mega-link">Hair Transplant (HT)</a></li>
                                    <li><a href="hair-transplant/fue/" data-pseo="fue-hair-transplant" data-pseo-fallback="hair-services.html#hair-transplant" class="mega-link">FUE Hair Transplant</a></li>
                                    <li><a href="hair-transplant/dhi/" data-pseo="dhi-hair-transplant" data-pseo-fallback="hair-services.html#dhi-transplant" class="mega-link">DHI Hair Transplant</a></li>
                                    <li><a href="hair-transplant/beard/" data-pseo="beard-transplant" data-pseo-fallback="hair-services.html#beard-transplant" class="mega-link">Beard Transplant</a></li>
                                    <li><a href="hair-transplant/eyebrow/" data-pseo="eyebrow-transplant" data-pseo-fallback="hair-services.html#eyebrow-transplant" class="mega-link">Eyebrow Transplant</a></li>
                                    <li><a href="prp-therapy.html" class="mega-link">PRP Therapy</a></li>
                                    <li><a href="gfc-treatment/" data-pseo="gfc-treatment" data-pseo-fallback="prp-therapy.html#gfc-therapy" class="mega-link">GFC Therapy</a></li>
                                    <li><a href="white-hair-removal.html" class="mega-link">White Hair Removal</a></li>
                                    <li><a href="electrolysis.html" class="mega-link">Electrolysis</a></li>
                                    <li><a href="hair-wig.html" class="mega-link">Hair Wig / Hair Replacement</a></li>
                                    <li><a href="hair-loss-consultation.html" class="mega-link">Hair Loss Consultation</a></li>
                                </ul>
                            </div>

                            <!-- Column 2: Skin Services -->
                            <div class="mega-col">
                                <div class="mega-col-header">
                                    <i class="fas fa-spa mega-col-icon"></i>
                                    <a href="skin-services.html" class="mega-col-title">Skin Services</a>
                                </div>
                                <ul class="mega-link-list">
                                    <li><a href="skin-services.html#hydra-facial" data-pseo="hydra-facial" data-pseo-fallback="skin-services.html#hydra-facial" class="mega-link">Hydra Facial</a></li>
                                    <li><a href="skin-services.html#acne" data-pseo="acne-treatment" data-pseo-fallback="skin-services.html#acne" class="mega-link">Acne &amp; Acne Scars</a></li>
                                    <li><a href="skin-services.html#pigmentation" data-pseo="pigmentation-treatment" data-pseo-fallback="skin-services.html#pigmentation" class="mega-link">Pigmentation &amp; Melasma</a></li>
                                    <li><a href="skin-services.html#botox" data-pseo="botox" data-pseo-fallback="skin-services.html#botox" class="mega-link">Botox &amp; Fillers</a></li>
                                    <li><a href="skin-services.html#dark-circles" data-pseo="dark-circles-treatment" data-pseo-fallback="skin-services.html#dark-circles" class="mega-link">Dark Circle Treatment</a></li>
                                    <li><a href="skin-services.html#stretch-marks" data-pseo="stretch-marks" data-pseo-fallback="skin-services.html#stretch-marks" class="mega-link">Stretch Marks</a></li>
                                    <li><a href="skin-services.html#medical-derma" data-pseo="medical-dermatology" data-pseo-fallback="skin-services.html#medical-derma" class="mega-link">Medical Dermatology</a></li>
                                    <li><a href="laser-hair-removal/" data-pseo="laser-hair-removal" data-pseo-fallback="skin-services.html#laser" class="mega-link">Laser Hair Removal</a></li>
                                    <li><a href="skin-services.html#consultation" data-pseo="skin-consultation" data-pseo-fallback="skin-services.html#consultation" class="mega-link">Skin Consultation</a></li>
                                </ul>
                            </div>

                            <!-- Column 3: Weight Loss + PMU -->
                            <div class="mega-col">
                                <div class="mega-col-header">
                                    <i class="fas fa-weight-scale mega-col-icon"></i>
                                    <a href="weight-loss.html" class="mega-col-title">Weight Management</a>
                                </div>
                                <ul class="mega-link-list">
                                    <li><a href="weight-loss.html#treatments" class="mega-link">Non-Surgical Weight Loss</a></li>
                                    <li><a href="cryolipolysis/" data-pseo="cryolipolysis" data-pseo-fallback="weight-loss.html#treatments" class="mega-link">Body Sculpting (Cryolipolysis)</a></li>
                                    <li><a href="hifu-body-sculpting/" data-pseo="hifu-body-sculpting" data-pseo-fallback="weight-loss.html#treatments" class="mega-link">HIFU Body Sculpting</a></li>
                                    <li><a href="weight-loss.html#consultation" data-pseo="weight-management" data-pseo-fallback="weight-loss.html#consultation" class="mega-link">Weight Management Consultation</a></li>
                                </ul>

                                <div class="mega-col-header" style="margin-top:18px;">
                                    <i class="fas fa-paint-brush mega-col-icon"></i>
                                    <a href="permanent-makeup.html" class="mega-col-title">Permanent Makeup</a>
                                </div>
                                <ul class="mega-link-list">
                                    <li><a href="permanent-makeup.html#microblading" data-pseo="microblading" data-pseo-fallback="permanent-makeup.html#microblading" class="mega-link">Eyebrow PMU / Microblading</a></li>
                                    <li><a href="permanent-makeup.html#lip-blush" data-pseo="lip-blush" data-pseo-fallback="permanent-makeup.html#lip-blush" class="mega-link">Lip Blush PMU</a></li>
                                    <li><a href="permanent-makeup.html#eyeliner" data-pseo="permanent-eyeliner" data-pseo-fallback="permanent-makeup.html#eyeliner" class="mega-link">Permanent Eyeliner</a></li>
                                    <li><a href="permanent-makeup.html#consultation" class="mega-link">PMU Consultation</a></li>
                                </ul>
                            </div>

                        </div><!-- /.mega-menu-grid -->
                    </div>
                </li>'''

def update_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Skip files that already have the new mega-menu
    if 'mega-menu-panel' in content:
        return 'already-new'

    # Skip files without any dropdown at all
    if 'nav-item-services-dropdown' not in content:
        return 'no-nav'

    new_content, count = OLD_PATTERN.subn(NEW_BLOCK, content, count=1)
    if count == 0:
        return 'no-match'

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    return 'updated'

# ── Walk all HTML files under frontend/ ─────────────────────────────────────
base = os.path.join(os.path.dirname(__file__), '..', 'frontend')
html_files = sorted(glob.glob(os.path.join(base, '**', '*.html'), recursive=True))

counts = {'updated': 0, 'already-new': 0, 'no-match': 0, 'no-nav': 0}
for fp in html_files:
    result = update_file(fp)
    counts[result] += 1
    if result == 'updated':
        print(f'  ✅  {os.path.relpath(fp)}')
    elif result == 'no-match':
        print(f'  ⚠️   no-match: {os.path.relpath(fp)}')

print(f'\nDone — updated:{counts["updated"]}  already-new:{counts["already-new"]}  no-match:{counts["no-match"]}  no-nav:{counts["no-nav"]}')
