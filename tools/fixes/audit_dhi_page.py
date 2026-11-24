#!/usr/bin/env python3
import json
import os
import re
from pathlib import Path

html_path = Path("frontend/hair-transplant/dhi/index.html")
content = html_path.read_text(encoding="utf-8")

print("=== 1. SEO & META ===")
m_title = re.search(r"<title>(.*?)</title>", content)
print("Title:", m_title.group(1) if m_title else "NONE")
m_desc = re.search(r'<meta[^>]+name="description"[^>]+content="([^"]+)"', content)
desc_text = m_desc.group(1) if m_desc else "NONE"
print(f"Description ({len(desc_text)} chars):", desc_text)
m_canon = re.search(r'<link[^>]+rel="canonical"[^>]+href="([^"]+)"', content)
print("Canonical:", m_canon.group(1) if m_canon else "NONE")
m_robots = re.search(r'<meta[^>]+name="robots"[^>]+content="([^"]+)"', content)
print("Robots:", m_robots.group(1) if m_robots else "NONE")

# OpenGraph
og_title = re.search(r'<meta[^>]+property="og:title"[^>]+content="([^"]+)"', content)
og_desc = re.search(r'<meta[^>]+property="og:description"[^>]+content="([^"]+)"', content)
og_img = re.search(r'<meta[^>]+property="og:image"[^>]+content="([^"]+)"', content)
print("OG Title:", og_title.group(1) if og_title else "NONE")
print("OG Image:", og_img.group(1) if og_img else "NONE")

print("\n=== 2. HEADINGS HIERARCHY ===")
h_tags = re.findall(r'<(h[1-4])[^>]*>(.*?)</\1>', content, re.DOTALL)
h1_count = 0
for tag, text in h_tags:
    clean = re.sub(r'<[^>]+>', ' ', text).strip()
    if tag == 'h1':
        h1_count += 1
    print(f"<{tag}>: {clean[:80]}")
print(f"Total H1: {h1_count}")

print("\n=== 3. IMAGES AUDIT ===")
imgs = re.findall(r'<img\s+([^>]+)>', content)
print(f"Total <img> tags: {len(imgs)}")
for i, img_attrs in enumerate(imgs, 1):
    src_m = re.search(r'src=["\']([^"\']+)["\']', img_attrs)
    alt_m = re.search(r'alt=["\']([^"\']*)["\']', img_attrs)
    w_m = re.search(r'width=["\']([^"\']+)["\']', img_attrs)
    h_m = re.search(r'height=["\']([^"\']+)["\']', img_attrs)
    load_m = re.search(r'loading=["\']([^"\']+)["\']', img_attrs)
    fp_m = re.search(r'fetchpriority=["\']([^"\']+)["\']', img_attrs)
    src = src_m.group(1) if src_m else "NONE"
    alt = alt_m.group(1) if alt_m else "NONE"
    w = w_m.group(1) if w_m else "NONE"
    h = h_m.group(1) if h_m else "NONE"
    load = load_m.group(1) if load_m else "NONE"
    fp = fp_m.group(1) if fp_m else "NONE"
    exists = os.path.exists("frontend" + src) if src.startswith("/") else os.path.exists("frontend/hair-transplant/dhi/" + src)
    print(f"  Img {i}: src={src} | exists={exists} | alt=\"{alt[:35]}\" | {w}x{h} | load={load} | fp={fp}")

print("\n=== 4. ASSETS (CSS / JS / Images) EXISTENCE ON DISK ===")
paths = re.findall(r'(?:src|href)=["\'](/[^"\']+\.(?:css|js|jpg|jpeg|png|webp|svg))["\']', content)
missing = [p for p in set(paths) if not os.path.exists("frontend" + p)]
print(f"Total linked assets: {len(set(paths))}")
print(f"Missing assets: {missing}")

print("\n=== 5. INTERNAL LINKS CHECK ===")
links = re.findall(r'<a\s+[^>]*href=["\']([^"\']+)["\']', content)
broken_internal = []
external_links = []
for h in links:
    if h.startswith("http"):
        external_links.append(h)
    elif h.startswith("/"):
        clean_path = h.split("#")[0].split("?")[0]
        if clean_path.endswith("/"):
            target = "frontend" + clean_path + "index.html"
        else:
            target = "frontend" + clean_path
        if not os.path.exists(target) and not os.path.exists("frontend" + clean_path):
            broken_internal.append(h)

print(f"Total internal links checked: {len(links) - len(external_links)}")
print(f"Broken internal links: {broken_internal}")
print(f"External links ({len(external_links)}): {external_links}")

print("\n=== 6. JSON-LD VALIDATION ===")
json_blocks = re.findall(r'<script[^>]+type="application/ld\+json"[^>]*>(.*?)</script>', content, re.DOTALL)
print(f"Total JSON-LD blocks: {len(json_blocks)}")
for i, b in enumerate(json_blocks, 1):
    try:
        data = json.loads(b)
        types = [x.get("@type") for x in data.get("@graph", [])] if "@graph" in data else data.get("@type")
        print(f"  Block {i}: Valid JSON | Types: {types}")
    except Exception as e:
        print(f"  Block {i} ERROR: {e}")

print("\n=== 7. CLINICAL BANNED / RISK WORDS ===")
banned = [r'\bguarantee\b', r'\bguaranteed\b', r'100%', r'\bpermanent cure\b', r'\bpainless\b', r'\bmiracle\b', r'\bno side effects?\b']
found_risks = []
for b in banned:
    m = re.findall(b, content, re.IGNORECASE)
    if m:
        found_risks.append((b, m))
print(f"Risk words found: {found_risks}")

print("\n=== 8. WORD COUNT ===")
text_only = re.sub(r'<[^>]+>', ' ', content)
words = [w for w in text_only.split() if re.search(r'\w', w)]
print(f"Total word count: {len(words)}")

