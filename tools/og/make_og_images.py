#!/usr/bin/env python3
"""
Kezza Clinic — Open Graph card generator (1200x630, the size WhatsApp,
Facebook, LinkedIn and X all display without cropping).

Usage (from the repo root):
    pip install pillow
    python3 tools/og/make_og_images.py            # build every card below
    python3 tools/og/make_og_images.py blog-norwood-scale   # build one card

Cards are written to frontend/images/og/<slug>.jpg. To add a card for a new
page or blog post, add one entry to CARDS and re-run. Then point the page's
og:image / twitter:image at https://www.kezza.co.in/images/og/<slug>.jpg.
"""
import os
import sys
import textwrap

from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
IMG = os.path.join(ROOT, "frontend", "images")
OUT = os.path.join(IMG, "og")
FONTS = os.path.join(os.path.dirname(__file__), "fonts")

W, H = 1200, 630
NAVY = (11, 19, 43)
TEAL = (0, 175, 192)
MUTED = (203, 213, 225)

# slug, small label, title, photo (relative to frontend/images)
CARDS = [
    ("home", "Hair · Skin · Aesthetics", "Hair Transplant & Skin Clinic in Jaipur", "hero1.jpg"),
    ("about", "Our Doctors & Story", "The Team Behind Kezza Clinic", "keeza-reception.jpg"),
    ("hair-services", "Hair Restoration", "Hair Loss Treatment in Jaipur", "fui-hair-1.jpg"),
    ("prp-therapy", "PRP & GFC Therapy", "PRP & GFC Hair Treatment in Jaipur", "prp-scalp-injection.jpg"),
    ("white-hair-removal", "Electrolysis", "White & Grey Hair Removal in Jaipur", "keeza-inside-clinic.jpg"),
    ("skin-services", "Skin & Laser", "Skin Care & Laser Treatment in Jaipur", "hydra-facial.jpg"),
    ("weight-loss", "Body Contouring", "Non-Surgical Weight Loss in Jaipur", "body-sculpting-treatment.jpg"),
    ("permanent-makeup", "Brows · Lips · Eyeliner", "Permanent Makeup in Jaipur", "pm-hero.jpg"),
    ("face-scanner", "Free Online Tool", "AI Skin & Scalp Scanner", "keeza-machine.jpg"),
    ("branches", "Franchise", "Partner With Kezza Clinic", "kezza-building-main.jpg"),
    ("contact", "Book a Consultation", "Contact Kezza Hair & Skin Clinic", "keeza-reception.jpg"),
    ("terms", "Policies", "Terms, Privacy & Medical Disclaimer", "keeza-inside-clinic.jpg"),
    # Locations
    ("locations", "Our Clinics", "Kezza Clinics in Jaipur, Sikar & Ajmer", "kezza-building-main.jpg"),
    ("location-jaipur", "Jaipur · Khatipura", "Kezza Hair & Skin Clinic, Jaipur", "kezza-jaipur-building.jpg"),
    ("location-sikar", "Sikar · Silver Jubilee Road", "Kezza Hair & Skin Clinic, Sikar", "kezza-sikar-building.jpg"),
    ("location-ajmer", "Ajmer · Jawahar Nagar", "Kezza Hair & Skin Clinic, Ajmer", "kezza-ajmer-building.jpg"),
    # Blog
    ("blog", "Kezza Clinic Blog", "Hair & Skin Answers From Our Doctors", "gallery-hairline-marking.jpg"),
    ("blog-fue-vs-dhi", "Hair Transplant Guide", "FUE vs DHI: Which Is Right for You?", "dhi-hair-1.jpg"),
    ("blog-hair-transplant-cost-jaipur", "Hair Transplant Guide", "Hair Transplant Cost in Jaipur", "hair-services/hair-transplant/hair-transplant-step1-hairline-design-kezza-jaipur.jpg"),
    ("blog-prp-vs-gfc", "Hair Loss Therapy", "PRP vs GFC: A Clinical Comparison", "gfc-centrifuge-tube.jpg"),
    ("blog-prp-sessions", "Hair Loss Therapy", "How Many PRP Sessions Do You Need?", "prp-1.jpg"),
    ("blog-white-hair-laser", "White Hair Removal", "Why Laser Can't Remove White Hair", "keeza-machine.jpg"),
    ("blog-norwood-scale", "Hair Loss Basics", "The Norwood Scale, Explained", "norwood-stage-3.jpg"),
]


def font(name, size, variation=None):
    f = ImageFont.truetype(os.path.join(FONTS, name), size)
    if variation:
        try:
            f.set_variation_by_name(variation)
        except Exception:
            pass
    return f


def cover(im, w, h):
    """Resize + center-crop an image to exactly w x h."""
    ratio = max(w / im.width, h / im.height)
    im = im.resize((int(im.width * ratio + 0.5), int(im.height * ratio + 0.5)), Image.LANCZOS)
    left = (im.width - w) // 2
    top = max(0, (im.height - h) // 3)  # bias upward: faces/signage sit high
    return im.crop((left, top, left + w, top + h))


def wrap(draw, text, fnt, max_w):
    words, lines, cur = text.split(), [], ""
    for word in words:
        trial = (cur + " " + word).strip()
        if draw.textlength(trial, font=fnt) <= max_w:
            cur = trial
        else:
            lines.append(cur)
            cur = word
    lines.append(cur)
    return lines


def make(slug, label, title, photo):
    canvas = Image.new("RGB", (W, H), NAVY)

    # Photo panel on the right with a soft fade into the navy panel
    photo_w = 560
    src = Image.open(os.path.join(IMG, photo)).convert("RGB")
    panel = cover(src, photo_w, H)
    canvas.paste(panel, (W - photo_w, 0))
    fade = Image.new("L", (photo_w, H), 0)
    fd = ImageDraw.Draw(fade)
    for x in range(200):
        fd.line([(x, 0), (x, H)], fill=int(255 * (1 - x / 200) ** 1.6))
    navy_layer = Image.new("RGB", (photo_w, H), NAVY)
    region = canvas.crop((W - photo_w, 0, W, H))
    canvas.paste(Image.composite(navy_layer, region, fade), (W - photo_w, 0))

    d = ImageDraw.Draw(canvas)
    x0, text_w = 64, 556

    # Logo
    logo = Image.open(os.path.join(IMG, "logo.png")).convert("RGBA")
    lh = 84
    logo = logo.resize((int(logo.width * lh / logo.height), lh), Image.LANCZOS)
    canvas.paste(logo, (x0 - 8, 44), logo)

    # Label
    f_label = font("Poppins-Medium.ttf", 24)
    d.text((x0, 160), label.upper(), font=f_label, fill=TEAL, spacing=2)

    # Title (auto-shrink to max 3 lines)
    for size in (66, 60, 54, 48):
        f_title = font("Lora-Variable.ttf", size, "Bold")
        lines = wrap(d, title, f_title, text_w)
        if len(lines) <= 3:
            break
    y = 204
    for line in lines:
        d.text((x0, y), line, font=f_title, fill=(255, 255, 255))
        y += int(size * 1.18)

    # Accent + footer
    d.rectangle([x0, y + 18, x0 + 84, y + 23], fill=TEAL)
    f_sub = font("Poppins-Regular.ttf", 25)
    d.text((x0, H - 108), "Kezza Hair & Skin Clinic", font=f_sub, fill=(255, 255, 255))
    f_small = font("Poppins-Regular.ttf", 21)
    d.text((x0, H - 72), "Jaipur  ·  Sikar  ·  Ajmer   |   www.kezza.co.in", font=f_small, fill=MUTED)

    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, f"{slug}.jpg")
    canvas.save(path, "JPEG", quality=84, optimize=True, progressive=True)
    return path


if __name__ == "__main__":
    wanted = set(sys.argv[1:])
    for card in CARDS:
        if wanted and card[0] not in wanted:
            continue
        print("wrote", os.path.relpath(make(*card), ROOT))
