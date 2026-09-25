import re, json, urllib.request, os

file_path = "frontend/hair-transplant/index.html"
with open(file_path, "r", encoding="utf-8") as f:
    html = f.read()

print("=== 1. CHECK BANNED WORDS ===")
banned = [r'\bguarantee\b', r'\bguaranteed\b', r'100%', r'\bpermanent cure\b', r'\bpainless\b', r'\bmiracle\b', r'\bno side effects?\b']
found_banned = []
for b in banned:
    matches = re.findall(b, html, re.IGNORECASE)
    if matches:
        found_banned.append((b, matches))
print(f"Banned words found: {found_banned}")

print("\n=== 2. CHECK PRICE FIGURES ===")
price_patterns = [r'₹', r'\bRs\.?\b', r'\bINR\b', r'cost\s+from', r'starting\s+at', r'starting\s+from']
found_prices = []
for p in price_patterns:
    matches = re.findall(p, html, re.IGNORECASE)
    if matches:
        found_prices.append((p, matches))
print(f"Price figures found: {found_prices}")

print("\n=== 3. CHECK JSON-LD BLOCKS ===")
json_blocks = re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.DOTALL)
print(f"Total JSON-LD blocks found: {len(json_blocks)}")
for i, block in enumerate(json_blocks, 1):
    try:
        parsed = json.loads(block)
        print(f"Block {i} ({parsed.get('@type')}): VALID JSON")
    except Exception as e:
        print(f"Block {i} ERROR: {e}")

print("\n=== 4. CHECK IMAGES (alt, width, height, loading/priority) ===")
imgs = re.findall(r'<img\s+([^>]+)>', html)
print(f"Total <img> tags found: {len(imgs)}")
for i, img_attrs in enumerate(imgs, 1):
    has_alt = 'alt=' in img_attrs
    has_w = 'width=' in img_attrs
    has_h = 'height=' in img_attrs
    src_match = re.search(r'src=["\']([^"\']+)["\']', img_attrs)
    src = src_match.group(1) if src_match else "unknown"
    print(f"Img {i}: src={src} | alt={has_alt} | width={has_w} | height={has_h}")

print("\n=== 5. CHECK ASSET EXISTENCE ON DISK ===")
paths = re.findall(r'(?:src|href)=["\'](/[^"\']+\.(?:css|js|jpg|jpeg|png|webp|svg))["\']', html)
missing_assets = []
for p in set(paths):
    disk_path = "frontend" + p
    if not os.path.exists(disk_path):
        missing_assets.append((p, disk_path))
print(f"Total linked assets: {len(set(paths))}")
print(f"Missing assets: {missing_assets}")

print("\n=== 6. WORD COUNT ESTIMATE OF MAIN BODY ===")
# Extract main content text
main_match = re.search(r'<main[^>]*>(.*?)</main>', html, re.DOTALL)
if main_match:
    main_text = re.sub(r'<[^>]+>', ' ', main_match.group(1))
    words = [w for w in main_text.split() if re.search(r'\w', w)]
    print(f"Main body word count: {len(words)} words (Target: 800-1200)")

print("\n=== 7. H1 COUNT ===")
h1s = re.findall(r'<h1[^>]*>(.*?)</h1>', html, re.DOTALL)
print(f"Total H1 tags: {len(h1s)}")
if h1s:
    print(f"H1 content: {h1s[0].strip()}")
