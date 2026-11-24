#!/usr/bin/env python3
"""
Ensure Google Tag Manager (GTM-P5C9295R) and gtag() definition
are present across all public website pages.
"""

from pathlib import Path
import re

FE = Path(__file__).resolve().parents[2] / "frontend"

# Target files that are missing GTM
targets = [
    FE / "404.html",
    FE / "before-after.html",
    FE / "book-appointment.html",
    FE / "cost-estimator.html",
    FE / "doctor-videos.html",
    FE / "hi" / "index.html",
    FE / "offers" / "bridal-packages" / "index.html",
    FE / "offers" / "hair-transplant" / "index.html",
    FE / "offers" / "laser-hair-reduction" / "index.html",
    FE / "offers" / "rhinoplasty" / "index.html",
    FE / "review.html",
    FE / "reviews.html",
]

GTM_HEAD = """<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-P5C9295R');</script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
</script>
<!-- End Google Tag Manager -->"""

GTM_BODY = """<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-P5C9295R"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->"""

for p in targets:
    if not p.exists():
        print(f"Skipping missing: {p}")
        continue
    
    content = p.read_text(encoding="utf-8", errors="ignore")
    changed = False

    # 1. Add GTM in <head>
    if "GTM-P5C9295R" not in content:
        # Insert right after <head>
        if "<head>" in content:
            content = content.replace("<head>", f"<head>\n{GTM_HEAD}", 1)
            changed = True
        elif "<head " in content:
            content = re.sub(r"(<head[^>]*>)", r"\1\n" + GTM_HEAD, content, count=1)
            changed = True
            
    # 2. Add noscript right after <body>
    if "ns.html?id=GTM-P5C9295R" not in content:
        if "<body>" in content:
            content = content.replace("<body>", f"<body>\n{GTM_BODY}", 1)
            changed = True
        elif "<body " in content:
            content = re.sub(r"(<body[^>]*>)", r"\1\n" + GTM_BODY, content, count=1)
            changed = True

    if changed:
        p.write_text(content, encoding="utf-8")
        print(f"✓ Updated: {p.relative_to(FE)}")
    else:
        print(f"- Already has GTM: {p.relative_to(FE)}")

print("\nDone applying GTM to missing pages.")

