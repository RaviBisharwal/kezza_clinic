#!/usr/bin/env python3
"""
Safe mojibake fixer for HTML/CSS/JS files.

- Replaces common Latin-1 → UTF-8 mojibake sequences (â€" etc.)
- Attempts to recover non-ASCII runs by re-interpreting as latin-1 bytes
- Only edits frontend .html, .css, .js files

Usage:
    python tools/fix_mojibake.py
"""

import re
from pathlib import Path
from typing import Optional, Tuple

# ── Configuration ──────────────────────────────────────────────────
ROOT: Path = Path(__file__).resolve().parents[1]          # repo root
FRONTEND: Path = ROOT / "frontend"
TARGET_EXT: Tuple[str, ...] = (".html", ".css", ".js")

COMMON_MAP: dict[str, str] = {
    "\u00e2\u0080\u0094": "\u2014",   # â€" → em dash
    "\u00e2\u0080\u0093": "\u2013",   # â€" → en dash
    "\u00e2\u0080\u00a2": "\u2022",   # â€¢ → bullet
    "\u00e2\u0080\u00a6": "\u2026",   # â€¦ → ellipsis
    "\u00e2\u0080\u0098": "\u2018",   # â€˜ → left single quote
    "\u00e2\u0080\u0099": "\u2019",   # â€™ → right single quote
    "\u00e2\u0080\u009c": "\u201c",   # â€œ → left double quote
    "\u00e2\u0080\u009d": "\u201d",   # â€  → right double quote
    "\u0092": "'",                     # Windows-1252 apostrophe
}


# ── Helpers ────────────────────────────────────────────────────────
def recover_segment(seg: str) -> Optional[str]:
    """Try to re-interpret a Latin-1 encoded segment as UTF-8."""
    try:
        candidate = seg.encode("latin-1").decode("utf-8")
        if any(ord(ch) > 127 for ch in candidate):
            return candidate
    except Exception:
        pass
    return None


def process_text(text: str) -> Tuple[str, bool]:
    """Apply mojibake fixes and return (new_text, was_changed)."""
    original = text

    # Apply common character map
    for bad, good in COMMON_MAP.items():
        if bad in text:
            text = text.replace(bad, good)

    # Recover short non-ASCII runs that look like Latin-1 encoded UTF-8
    def repl(match: re.Match) -> str:  # type: ignore[type-arg]
        seg = match.group(0)
        recovered = recover_segment(seg)
        return recovered if recovered else seg

    text = re.sub(r"[\x80-\xff]{2,}", repl, text)
    return text, text != original


# ── Main ───────────────────────────────────────────────────────────
def main() -> None:
    scan_dirs = [
        FRONTEND.glob("*.html"),
        FRONTEND.glob("css/*.css"),
        FRONTEND.glob("js/*.js"),
    ]
    scan_paths = [path for gen in scan_dirs for path in gen]

    changed_files: list[str] = []

    for file_path in sorted(scan_paths):
        if not file_path.is_file():
            continue
        text = file_path.read_text(encoding="utf-8", errors="replace")
        new_text, changed = process_text(text)
        if changed:
            file_path.write_text(new_text, encoding="utf-8")
            changed_files.append(str(file_path.relative_to(ROOT)))

    if changed_files:
        print("✅ Updated files:\n" + "\n".join(changed_files))
    else:
        print("✅ No changes needed — all files are clean.")


if __name__ == "__main__":
    main()
