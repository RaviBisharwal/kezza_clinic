#!/usr/bin/env python3
"""
Kezza Clinic — derived images for the treatment pages (tools/content/pages/*.html).

Crops and resizes photos that already exist in frontend/images/ into the sizes the
service-page layout uses (hero 3:2, explainer 4:3, card thumbnail 4:3) and writes a
JPEG + WebP pair for each one into frontend/images/treatments/. The originals are
not changed. Needs Pillow:

    python3 tools/content/make_treatment_images.py                      # all images
    python3 tools/content/make_treatment_images.py skin-consultation    # one folder

To change a crop, edit its line in JOBS (an optional fifth value zooms in first): `focus` is where the crop window sits
inside the spare space (0 = top/left edge, 0.5 = centre, 1 = bottom/right edge).
"""
import os
import sys

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is needed: pip install pillow")

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
IMG = os.path.join(ROOT, "frontend", "images")

HERO, EXPLAINER, THUMB = (1200, 800), (800, 600), (400, 300)

# (source in frontend/images, output in frontend/images/treatments, size, (focus_x, focus_y))
JOBS = [
    # FUE
    ("fui-hair-2.jpg", "fue/fue-hair-transplant-hero", HERO, (0.5, 0.5)),
    ("micro-motor-fue-extraction.jpeg", "fue/fue-micro-motor-punch", EXPLAINER, (0.5, 0.5)),
    ("fui-hair-2.jpg", "fue/fue-hair-transplant-thumb", THUMB, (0.5, 0.5)),
    # DHI
    ("dhi-hair-2.jpg", "dhi/dhi-hair-transplant-hero", HERO, (0.5, 0.45)),
    ("dhi-hair-1.jpg", "dhi/dhi-implanter-pen", EXPLAINER, (0.5, 0.4)),
    ("dhi-hair-2.jpg", "dhi/dhi-hair-transplant-thumb", THUMB, (0.5, 0.45)),
    # Beard
    ("beard-transplant-2.jpg", "beard/beard-transplant-hero", HERO, (0.5, 0.35)),
    ("beard-transplant-1.jpg", "beard/beard-transplant-graft-placement", EXPLAINER, (0.5, 0.5)),
    ("beard-transplant-2.jpg", "beard/beard-transplant-thumb", THUMB, (0.5, 0.35)),
    # Eyebrow
    ("eyebro.jpg", "eyebrow/eyebrow-transplant-hero", HERO, (0.5, 0.55)),
    ("eyebro.jpg", "eyebrow/eyebrow-transplant-thumb", THUMB, (0.5, 0.5)),
    # GFC
    ("gfc-centrifuge-tube.jpg", "gfc/gfc-treatment-hero", HERO, (0.5, 0.5)),
    ("prp-scalp-injection.jpg", "gfc/gfc-scalp-injection", EXPLAINER, (0.5, 0.5)),
    # Laser hair removal
    ("laser-facial-2.jpg", "laser-hair-removal/laser-hair-removal-hero", HERO, (0.5, 0.6)),
    ("laser-facial.jpg", "laser-hair-removal/laser-hair-removal-underarm", EXPLAINER, (0.5, 0.3)),
    ("laser-facial.jpg", "laser-hair-removal/laser-hair-removal-thumb", THUMB, (0.5, 0.3)),
    # Card thumbnails for pages that link to existing treatments
    ("hair-services/hair-transplant/hair-transplant-hero-clinical-procedure-kezza-jaipur.jpg",
     "shared/hair-transplant-thumb", THUMB, (0.5, 0.5)),
    ("electrolysis-hero-procedure.jpg", "shared/electrolysis-thumb", THUMB, (0.5, 0.5)),
    ("pm-hero.jpg", "shared/microblading-thumb", THUMB, (0.5, 0.4)),
    ("hydra-facial.jpg", "shared/skin-treatments-thumb", THUMB, (0.5, 0.4)),
    ("chemical-peel-pigmentation.jpg", "shared/pigmentation-thumb", THUMB, (0.5, 0.45)),
    # pSEO treatment pages (status: review until the clinic approves them)
    # Acne treatment
    ("vitamin-c-pigmentation.jpg", "acne-treatment/acne-treatment-hero", HERO, (0.5, 0.35)),
    ("vitamin-c-pigmentation.jpg", "acne-treatment/acne-treatment-thumb", THUMB, (0.5, 0.35)),
    # Acne scar treatment
    ("scar-removal-before.jpg", "acne-scar-treatment/acne-scar-treatment-hero", HERO, (0.5, 0.45)),
    ("keeza-inside-clinic-room.jpg", "acne-scar-treatment/acne-scar-treatment-room", EXPLAINER, (0.5, 0.3)),
    ("scar-removal-before.jpg", "acne-scar-treatment/acne-scar-treatment-thumb", THUMB, (0.5, 0.45)),
    # Hydra facial
    ("hydra-facial-2.jpg", "hydra-facial/hydra-facial-hero", HERO, (0.5, 0.4)),
    ("keeza-machine.jpg", "hydra-facial/hydra-facial-machine", EXPLAINER, (0.5, 0.45)),
    ("hydra-facial-2.jpg", "hydra-facial/hydra-facial-thumb", THUMB, (0.5, 0.4)),
    # Botox
    ("anti-aging-2.jpg", "botox/botox-hero", HERO, (0.5, 0.3)),
    ("anti-aging-2.jpg", "botox/botox-thumb", THUMB, (0.5, 0.3)),
    # Dark circles
    ("pigmentation-removal.jpg", "dark-circles-treatment/dark-circles-treatment-hero", HERO, (0.5, 0.35)),
    ("pigmentation-removal.jpg", "dark-circles-treatment/dark-circles-treatment-thumb", THUMB, (0.5, 0.35)),
    # Cryolipolysis (full-body-cryo.jpg is not used: its applicator shows another company's brand name)
    ("body-sculpting-treatment.jpg", "cryolipolysis/cryolipolysis-hero", HERO, (0.5, 0.5)),
    ("body-sculpting-treatment.jpg", "cryolipolysis/cryolipolysis-thumb", THUMB, (0.5, 0.6)),
    # HIFU body sculpting
    ("hifu-body-sculpting-procedure.jpg", "hifu-body-sculpting/hifu-body-sculpting-hero", HERO, (0.5, 0.5)),
    ("hifu-body-sculpting-procedure.jpg", "hifu-body-sculpting/hifu-body-sculpting-thumb", THUMB, (0.5, 0.5)),
    # Weight management (real clinic photo; the source is 900 px wide, so the hero stays 900 x 600)
    ("keeza-inside-clinic-2.jpg", "weight-management/weight-management-hero", (900, 600), (0.5, 0.62)),
    ("keeza-inside-clinic-2.jpg", "weight-management/weight-management-thumb", THUMB, (0.5, 0.62)),
    # Microblading
    ("pm-eyebro.jpg", "microblading/microblading-hero", HERO, (0.5, 0.4)),
    ("pm-eyebro.jpg", "microblading/microblading-thumb", THUMB, (0.5, 0.4)),
    # Lip blush
    ("pm-lip.jpg", "lip-blush/lip-blush-hero", HERO, (0.5, 0.45)),
    ("pm-lip.jpg", "lip-blush/lip-blush-thumb", THUMB, (0.5, 0.45)),
    # Permanent eyeliner
    ("pm-eyeliner.jpg", "permanent-eyeliner/permanent-eyeliner-hero", HERO, (0.5, 0.4)),
    ("pm-eyeliner-2.jpg", "permanent-eyeliner/permanent-eyeliner-closeup", EXPLAINER, (0.5, 0.45)),
    ("pm-eyeliner.jpg", "permanent-eyeliner/permanent-eyeliner-thumb", THUMB, (0.5, 0.4)),
    # PMU correction
    ("beauty-spot-correction.jpg", "pmu-correction/pmu-correction-hero", HERO, (0.5, 0.35)),
    ("beauty-spot-correction.jpg", "pmu-correction/pmu-correction-thumb", THUMB, (0.5, 0.35)),
    # Botox & dermal fillers: filler injection in the cheek (illustrative)
    ("mesotherepy-2.jpg", "botox/dermal-fillers-cheek", EXPLAINER, (0.5, 0.5)),
    # Pigmentation & melasma
    ("chemical-peel-pigmentation.jpg", "pigmentation-treatment/pigmentation-treatment-hero", HERO, (0.5, 0.3)),
    ("facial-laser-2.jpg", "pigmentation-treatment/pigmentation-laser-toning", EXPLAINER, (0.5, 0.45)),
    # Stretch marks
    ("stretch-mark.jpg", "stretch-marks-treatment/stretch-marks-treatment-hero", HERO, (0.5, 0.45)),
    ("stretch-mark.jpg", "stretch-marks-treatment/stretch-marks-treatment-thumb", THUMB, (0.5, 0.45)),
    # Medical dermatology (mole, wart and skin tag removal)
    ("electrolysis-hero-procedure.jpg", "medical-dermatology/medical-dermatology-hero", HERO, (0.5, 0.4)),
    ("electrolysis-hero-procedure.jpg", "medical-dermatology/medical-dermatology-thumb", THUMB, (0.5, 0.4)),
    # Skin consultation (hero: real Kezza reception, 900 px wide source, so the hero stays 900 x 600; exam photo is illustrative)
    ("keeza-reception.jpg", "skin-consultation/skin-consultation-hero", (900, 600), (0.5, 0.55)),
    ("hero4.jpg", "skin-consultation/skin-consultation-exam", EXPLAINER, (0.6, 0.5)),
    ("hero4.jpg", "skin-consultation/skin-consultation-thumb", THUMB, (0.6, 0.5)),
    # Explainer photos added 6 Oct 2026 (illustrative photos)
    ("hydra-facial.jpg", "acne-treatment/acne-treatment-facial", EXPLAINER, (0.5, 0.35)),
    ("anti-aging.jpg", "dark-circles-treatment/dark-circles-under-eye", EXPLAINER, (0.5, 0.4)),
    ("stretch-mark.jpg", "stretch-marks-treatment/stretch-marks-closeup", EXPLAINER, (0.5, 0.5), (0.18, 0.42, 0.93, 0.985)),
    ("hero3.webp", "medical-dermatology/medical-dermatology-treatment-room", EXPLAINER, (0.62, 0.5)),
    # Card thumbnails for sections of the hub pages
    ("anti-aging.jpg", "shared/anti-ageing-thumb", THUMB, (0.5, 0.45)),
    ("jawline-slimming.jpg", "shared/body-sculpting-thumb", THUMB, (0.5, 0.5)),
]


def crop_to(im, size, focus):
    """Largest window with the target aspect ratio, placed by `focus`, then resized."""
    tw, th = size
    w, h = im.size
    target = tw / th
    if w / h > target:            # too wide: trim the sides
        cw, ch = round(h * target), h
    else:                         # too tall: trim top/bottom
        cw, ch = w, round(w / target)
    x = round((w - cw) * focus[0])
    y = round((h - ch) * focus[1])
    return im.crop((x, y, x + cw, y + ch)).resize(size, Image.LANCZOS)


def main():
    only = sys.argv[1:]   # optional: folder or file prefixes to build, e.g. skin-consultation
    for job in JOBS:
        src, out, size, focus = job[:4]
        if only and not any(out.startswith(o) for o in only):
            continue
        im = Image.open(os.path.join(IMG, src)).convert("RGB")
        if len(job) > 4:              # optional zoom: (left, top, right, bottom) as fractions of the photo
            l, t, r, b = job[4]
            w, h = im.size
            im = im.crop((round(l * w), round(t * h), round(r * w), round(b * h)))
        res = crop_to(im, size, focus)
        base = os.path.join(IMG, "treatments", out)
        os.makedirs(os.path.dirname(base), exist_ok=True)
        res.save(base + ".jpg", "JPEG", quality=80, optimize=True, progressive=True)
        res.save(base + ".webp", "WEBP", quality=76, method=6)
        kb = (os.path.getsize(base + ".jpg") // 1024, os.path.getsize(base + ".webp") // 1024)
        print(f"wrote images/treatments/{out}.jpg/.webp  {size[0]}x{size[1]}  {kb[0]} KB / {kb[1]} KB")


if __name__ == "__main__":
    main()
