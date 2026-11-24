#!/usr/bin/env python3
"""
Fix ISS-007: Merge aggregateRating from duplicate JSON-LD block into the
primary @graph block's MedicalOrganization entity, then delete the duplicate.
Run from the project root.
"""
import json, re, sys
from pathlib import Path

FRONTEND = Path(__file__).resolve().parents[2] / "frontend"
filepath = FRONTEND / "index.html"
content = filepath.read_text(encoding="utf-8", errors="replace")

# Find all JSON-LD script blocks
pattern = re.compile(
    r'<script[^>]+type="application/ld\+json"[^>]*>(.*?)</script>',
    re.DOTALL | re.IGNORECASE
)
matches = list(pattern.finditer(content))
print(f"Found {len(matches)} JSON-LD blocks.")

if len(matches) < 2:
    print("Nothing to do — only one block found.")
    sys.exit(0)

# Parse the primary block (first match)
primary_raw = matches[0].group(1).strip()
primary_data = json.loads(primary_raw)
assert "@graph" in primary_data, "First block must have @graph"

# Parse the duplicate block (second match)
dup_raw = matches[1].group(1).strip()
dup_data = json.loads(dup_raw)
agg_rating = dup_data.get("aggregateRating")
assert agg_rating is not None, "Second block must have aggregateRating"

# Add aggregateRating to the MedicalOrganization in the @graph
inserted = False
for node in primary_data["@graph"]:
    if node.get("@type") == "MedicalOrganization" and "aggregateRating" not in node:
        node["aggregateRating"] = agg_rating
        inserted = True
        print(f"  ✓ aggregateRating inserted into MedicalOrganization node")
        break

if not inserted:
    print("  ⚠ MedicalOrganization node not found or already has aggregateRating")
    sys.exit(1)

# Serialize back (compact, no trailing space) and rebuild the script tag
new_primary_json = json.dumps(primary_data, ensure_ascii=False, separators=(',', ':'))
new_primary_tag = f'<script type="application/ld+json">{new_primary_json}</script>'

# Replace the original first block with the updated one
new_content = content[:matches[0].start()] + new_primary_tag + content[matches[0].end():]

# Now remove the duplicate (second) block — re-search in new_content
matches2 = list(pattern.finditer(new_content))
if len(matches2) >= 2:
    dup_match = matches2[1]
    # Remove it including any surrounding blank lines
    start = dup_match.start()
    end = dup_match.end()
    # Eat the newline before it
    while start > 0 and new_content[start-1] in ('\n', '\r', ' '):
        start -= 1
    new_content = new_content[:start] + new_content[end:]
    print(f"  ✓ Duplicate JSON-LD block removed")
else:
    print("  ⚠ Could not find duplicate block to remove after replacement")

# Clean up triple blank lines
new_content = re.sub(r'\n{3,}', '\n\n', new_content)

filepath.write_text(new_content, encoding="utf-8")
print("  ✓ index.html updated successfully")

