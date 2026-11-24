import os, subprocess, shutil

def get_dimensions(path):
    res = subprocess.run(['sips', '-g', 'pixelWidth', '-g', 'pixelHeight', path], capture_output=True, text=True)
    w, h = 0, 0
    for line in res.stdout.splitlines():
        if 'pixelWidth:' in line:
            w = int(line.split(':')[1].strip())
        elif 'pixelHeight:' in line:
            h = int(line.split(':')[1].strip())
    return w, h

def process_image(src_path, dest_base_path, target_w, target_h, quality=80, is_retina=False):
    src_w, src_h = get_dimensions(src_path)
    if src_w == 0 or src_h == 0:
        raise ValueError(f"Could not read dimensions for {src_path}")
    
    target_ratio = target_w / target_h
    src_ratio = src_w / src_h
    
    if src_ratio > target_ratio:
        crop_h = src_h
        crop_w = int(round(src_h * target_ratio))
    else:
        crop_w = src_w
        crop_h = int(round(src_w / target_ratio))
        
    temp_crop = dest_base_path + ".temp_crop.jpg"
    temp_resized = dest_base_path + ".temp_resized.jpg"
    out_jpg = dest_base_path + ".jpg"
    out_webp = dest_base_path + ".webp"
    
    # 1. Crop to aspect ratio
    subprocess.run(['sips', '-c', str(crop_h), str(crop_w), src_path, '--out', temp_crop], capture_output=True, check=True)
    
    # 2. Resize to target dimension
    subprocess.run(['sips', '-z', str(target_h), str(target_w), temp_crop, '--out', temp_resized], capture_output=True, check=True)
    
    # 3. Save as stripped JPG
    subprocess.run(['sips', '-s', 'format', 'jpeg', '-s', 'formatOptions', '82', temp_resized, '--out', out_jpg], capture_output=True, check=True)
    
    # 4. Save as stripped WebP with cwebp
    subprocess.run(['cwebp', '-q', str(quality), '-metadata', 'none', out_jpg, '-o', out_webp], capture_output=True, check=True)
    
    # Clean up temps
    if os.path.exists(temp_crop): os.remove(temp_crop)
    if os.path.exists(temp_resized): os.remove(temp_resized)
    
    jpg_kb = round(os.path.getsize(out_jpg) / 1024, 1)
    webp_kb = round(os.path.getsize(out_webp) / 1024, 1)
    print(f"Created: {os.path.basename(out_webp)} ({webp_kb} KB) | JPG ({jpg_kb} KB) [{target_w}x{target_h}]")
    return webp_kb

tasks = [
    # Hero (1200x800 & 2400x1600)
    ("frontend/images/fui-hair-1.jpg", "frontend/images/hair-services/hair-transplant/hair-transplant-hero-clinical-procedure-kezza-jaipur", 1200, 800, 80),
    ("frontend/images/fui-hair-1.jpg", "frontend/images/hair-services/hair-transplant/hair-transplant-hero-clinical-procedure-kezza-jaipur@2x", 2400, 1600, 75),

    # Explainer (800x600)
    ("frontend/images/dhi-hair-1.jpg", "frontend/images/hair-services/hair-transplant/hair-transplant-follicular-unit-technique-kezza-jaipur", 800, 600, 80),

    # Steps (600x400)
    ("frontend/images/hair-fall-control-program.jpg", "frontend/images/hair-services/hair-transplant/hair-transplant-step1-hairline-design-kezza-jaipur", 600, 400, 80),
    ("frontend/images/micro-motor-fue-extraction.jpeg", "frontend/images/hair-services/hair-transplant/hair-transplant-step2-micro-motor-fue-extraction-kezza-jaipur", 600, 400, 80),
    ("frontend/images/sapphire-blade-incisions.jpeg", "frontend/images/hair-services/hair-transplant/hair-transplant-step3-sapphire-blade-incisions-kezza-jaipur", 600, 400, 80),
    ("frontend/images/fui-hair-2.jpg", "frontend/images/hair-services/hair-transplant/hair-transplant-step4-graft-implantation-kezza-jaipur", 600, 400, 80),

    # Before & After (600x600 & 1200x1200 @2x)
    ("frontend/images/crown-area-transplant.jpg", "frontend/images/hair-services/hair-transplant/hair-transplant-before-after-crown-area-kezza-jaipur", 600, 600, 80),
    ("frontend/images/crown-area-transplant.jpg", "frontend/images/hair-services/hair-transplant/hair-transplant-before-after-crown-area-kezza-jaipur@2x", 1200, 1200, 75),

    ("frontend/images/revision-repair-hair-transplant.jpg", "frontend/images/hair-services/hair-transplant/hair-transplant-before-after-revision-repair-kezza-jaipur", 600, 600, 80),
    ("frontend/images/revision-repair-hair-transplant.jpg", "frontend/images/hair-services/hair-transplant/hair-transplant-before-after-revision-repair-kezza-jaipur@2x", 1200, 1200, 75),

    ("frontend/images/female-hair-restoration.jpg", "frontend/images/hair-services/hair-transplant/hair-transplant-before-after-female-restoration-kezza-jaipur", 600, 600, 80),
    ("frontend/images/female-hair-restoration.jpg", "frontend/images/hair-services/hair-transplant/hair-transplant-before-after-female-restoration-kezza-jaipur@2x", 1200, 1200, 75),

    ("frontend/images/beard-transplant-1.jpg", "frontend/images/hair-services/hair-transplant/hair-transplant-before-after-beard-transplant-kezza-jaipur", 600, 600, 80),
    ("frontend/images/beard-transplant-1.jpg", "frontend/images/hair-services/hair-transplant/hair-transplant-before-after-beard-transplant-kezza-jaipur@2x", 1200, 1200, 75),

    # Shared Clinic Interior (1000x667)
    ("frontend/images/keeza-inside-photo.jpg", "frontend/images/hair-services/shared/shared-clinic-interior-surgical-suite-kezza-jaipur", 1000, 667, 80),

    # Shared Doctor Portrait (500x500)
    ("frontend/images/dr-nakul-somani.jpg", "frontend/images/hair-services/shared/shared-doctor-specialist-portrait-kezza-jaipur", 500, 500, 80),

    # Related Service Thumbs (400x300)
    ("frontend/images/prp-1.jpg", "frontend/images/hair-services/shared/shared-service-thumb-prp-therapy-kezza-jaipur", 400, 300, 80),
    ("frontend/images/gfc-therepy-2.jpg", "frontend/images/hair-services/shared/shared-service-thumb-gfc-therapy-kezza-jaipur", 400, 300, 80),
    ("frontend/images/hair-fall-control-program.jpg", "frontend/images/hair-services/shared/shared-service-thumb-hair-loss-consultation-kezza-jaipur", 400, 300, 80),

    # CTA Band Background (1600x600)
    ("frontend/images/hero1.jpg", "frontend/images/hair-services/hair-transplant/hair-transplant-cta-background-kezza-jaipur", 1600, 600, 75),

    # OG Image (1200x630)
    ("frontend/images/fui-hair-1.jpg", "frontend/images/hair-services/og/hair-transplant-og-kezza-jaipur", 1200, 630, 80),
]

total_initial_webp_kb = 0
for src, dest, w, h, q in tasks:
    # We sum standard assets (non-retina) for standard page load weight check
    kb = process_image(src, dest, w, h, q)
    if not dest.endswith("@2x"):
        total_initial_webp_kb += kb

print(f"\n==> Total standard WebP weight on initial page load: {round(total_initial_webp_kb, 1)} KB (Budget: <= 800 KB)")
