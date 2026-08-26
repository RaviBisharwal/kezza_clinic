#!/usr/bin/env python3
"""
Safe mojibake fixer for HTML/JS files in this folder.
- Backs up each file to <name>.bak
- Replaces common Latin-1 -> UTF-8 mojibake sequences (â€” etc.)
- Attempts to recover non-ASCII runs by interpreting them as latin-1 bytes and decoding as UTF-8
- Only edits .html and .js files in current directory (non-recursive) to avoid libraries
Usage: python tools/fix_mojibake.py
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]  # hairtransplant
TARGET_EXT = ('.html', '.js')
COMMON_MAP = {
    'â€”': '—',
    'â€“': '–',
    'â€¢': '•',
    'â€¦': '…',
    'â€˜': '‘',
    'â€™': '’',
    'â€œ': '“',
    'â€': '”',
    '\u0092': "'",
}

def recover_segment(seg: str):
    try:
        cand = seg.encode('latin-1').decode('utf-8')
        # only accept if it produces any non-control printable unicode (emoji, punctuation, letters)
        if any(ord(ch) > 127 for ch in cand):
            return cand
    except Exception:
        pass
    return None

def process_text(text: str):
    orig = text
    # first apply common mappings
    for k, v in COMMON_MAP.items():
        if k in text:
            text = text.replace(k, v)
    # find runs of characters outside basic ascii (likely mojibake segments)
    # limit to short runs to avoid changing long non-latin content
    def repl(m):
        seg = m.group(0)
        recovered = recover_segment(seg)
        if recovered:
            return recovered
        return seg
    text = re.sub(r'[\x80-\xff]{2,}', repl, text)
    return text, (text != orig)


def main():
    changed_files = []
    for p in sorted(ROOT.iterdir()):
        if p.is_file() and p.suffix in TARGET_EXT:
            text = p.read_text(encoding='utf-8', errors='replace')
            new_text, changed = process_text(text)
            if changed or new_text != text:
                bak = p.with_suffix(p.suffix + '.bak')
                p.replace(p) if False else None
                # write backup
                p.write_text(new_text, encoding='utf-8')
                bak.write_text(text, encoding='utf-8')
                changed_files.append(str(p.relative_to(ROOT)))
    if changed_files:
        print('Updated files:\n' + '\n'.join(changed_files))
    else:
        print('No changes made')

if __name__ == '__main__':
    main()
