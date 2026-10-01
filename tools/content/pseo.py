"""
Kezza Clinic — programmatic SEO engine.

Used by tools/content/build_content_pages.py (build) and tools/seo/pseo_audit.py (audit).

    Registry (what exists, where, how pages relate):  tools/seo/taxonomy.json
    Page content (what a page says, its status):      tools/content/pages/*.html
    Clinic facts (addresses, phones, doctors):        tools/seo/site-data.json

Page status (set as "status" in the page file's JSON header):
    draft      not built at all
    review     built for preview, but noindex: left out of the sitemap, llms.txt, menus and related links,
               and no "reviewed by" line is shown. New pages start here.
    approved   signed off, not live yet: treated like review
    published  indexable, in the sitemap and linked automatically, but only when every critical quality
               gate passes and a reviewer + review date are recorded; otherwise it is held back ("blocked")
    noindex    built for visitors (e.g. a campaign page) but never indexed

Links that should follow a page's status:
    <a href="…" data-pseo="acne-treatment" data-pseo-fallback="/skin-services.html#acne">   in menus, cards, footers
    <!--pseo:link id="acne-treatment" text="Read the acne treatment guide"--><!--/pseo:link-->   in hub page text
The build points them at the treatment page once it is published, and back to the fallback (or nothing) if not.
"""
import datetime
import html
import json
import os
import re
from collections import defaultdict
from itertools import combinations

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
FE = os.path.join(ROOT, "frontend")
TAX = json.load(open(os.path.join(ROOT, "tools", "seo", "taxonomy.json"), encoding="utf-8"))
CATS = TAX["categories"]
TREAT = {t["id"]: t for t in TAX["treatments"]}
REGPAGES = {p["id"]: p for p in TAX["pages"]}
SKIP_DIRS = {"images", "video", "posters", "uploads", "css", "js", "fonts"}

STATUSES = ("draft", "review", "approved", "published", "noindex")
INDEX_ROBOTS = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
NOINDEX_ROBOTS = "noindex, follow"
MIN_WORDS = 900          # page-specific words (template text not counted)
MAX_SIMILARITY = 0.30    # 6-word-shingle overlap with any other generated page
LINK_STYLE = "color:#008F9C;font-weight:600;text-decoration:underline;text-underline-offset:3px;"

# Wording a medical page must not use unless it is proven and approved.
CLAIMS = [
    (r"\b100\s?%\s*(safe|guarantee\w*|success|painless|results?)", "absolute 100% claim"),
    (r"\bguarantee(d|s)?\b", "guarantee"),
    (r"\bzero[\s-]+(risk|side[\s-]effects?|pain|burn\w*)", "zero-risk/zero-pain claim"),
    (r"\bno side[\s-]effects?\b", "no side effects"),
    (r"\brisk[\s-]free\b", "risk-free"),
    (r"\bworks for everyone\b", "works for everyone"),
    (r"\bbest (clinic|doctor|surgeon|hair transplant|treatment)\b", "best-clinic superlative"),
    (r"(?<![\w-])(number\s?1|no\.\s?1|#1)(?![\w-])", "number-one claim"),
    (r"\bpainless\b", "painless (needs qualifying)"),
    (r"\bpermanent results?\b", "permanent results"),
]
NEGATION = re.compile(r"\b(no|not|never|cannot|can't|isn't|doesn't|without|rather than|nor)\b[^.]{0,50}$", re.I)


def find_claims(text):
    """(label, context) for each claim phrase, skipping negated uses such as "no guarantee"."""
    out = []
    for pat, label in CLAIMS:
        for m in re.finditer(pat, text, re.I):
            if NEGATION.search(text[max(0, m.start() - 60): m.start()]):
                continue
            out.append((label, text[max(0, m.start() - 50): m.end() + 40]))
    return out


def strip_tags(s):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", str(s)))).strip()


def shingles(text, n=6):
    w = re.findall(r"[a-z0-9ऀ-ॿ]+", text.lower())
    return {" ".join(w[i:i + n]) for i in range(max(0, len(w) - n + 1))}


# ───────────────────────────── registry helpers ─────────────────────────────
def entry_for_source(fn):
    rel = os.path.join("tools", "content", "pages", fn).replace(os.sep, "/")
    for t in TREAT.values():
        if t.get("source") == rel:
            return t
    return None


def breadcrumb_for(tid):
    """Home › category hub › parent treatment › page, from the taxonomy."""
    t = TREAT[tid]
    cat = CATS[t["category"]]
    trail = [("Home", "/index.html"), (cat["label"], cat["hub"])]
    if t.get("parent"):
        par = TREAT[t["parent"]]
        trail.append((par["name"], par["url"]))
    trail.append((t["name"], t["url"]))
    return trail


def page_text(p):
    """Only the page's own words (the template's fixed wording is excluded) for word counts and similarity."""
    parts = [p.get("lead", "")]
    x = p.get("explainer") or {}
    parts += x.get("paras", []) + [f"{a} {b}" for a, b in x.get("in_short", [])]
    for key in ("cards",):
        for it in (p.get(key) or {}).get("items", []):
            parts += it[1:3]
    c = p.get("candidacy") or {}
    parts += c.get("suited", []) + c.get("not_suited", []) + [c.get("note", ""), c.get("sub", "")]
    for it in (p.get("steps") or {}).get("items", []):
        parts += [it[0], it[1]]
    for it in (p.get("timeline") or {}).get("items", []):
        parts += [it[1], it[2]]
    parts.append(p.get("body", "").split('<h2 id="sources">')[0])   # cited titles are not the page's own words
    for q, a in p.get("faqs", []):
        parts += [q, a]
    parts.append((p.get("where") or {}).get("note", ""))
    return strip_tags(" ".join(str(s) for s in parts))


def html_links(p):
    """Every href inside the page's own content."""
    blob = json.dumps({k: v for k, v in p.items() if k != "body"}, ensure_ascii=False) + p.get("body", "")
    return re.findall(r'href=\\?"([^"\\]+)\\?"', blob)


def local_file(href):
    """frontend-relative file for a root-relative link, or None for external / tel / anchors."""
    if not href.startswith("/") or href.startswith("//"):
        return None
    path = href.split("#")[0].split("?")[0]
    if path.endswith("/"):
        path += "index.html"
    return path.lstrip("/")


class Resolver:
    """Which registry entries are live (published) after the quality gates have run."""

    def __init__(self, effective):
        self.effective = effective          # generated page id -> effective status

    def live(self, tid):
        t = TREAT.get(tid) or REGPAGES.get(tid)
        if not t:
            return False
        if t.get("type") == "generated":
            return self.effective.get(tid) == "published"
        return t.get("status", "published") == "published"

    def related(self, tid, limit=3):
        """Related treatments: explicit registry order, then parent/siblings, then same category.
        Only live entries that have a card; never the page itself."""
        t = TREAT[tid]
        out = []

        def add(x):
            if x != tid and x not in out and x in TREAT and self.live(x) and TREAT[x].get("card"):
                out.append(x)
        for x in t.get("related", []):
            add(x)
        if t.get("parent"):
            add(t["parent"])
            for s in TREAT.values():
                if s.get("parent") == t["parent"]:
                    add(s["id"])
        for s in TREAT.values():
            if s.get("category") == t.get("category") and s.get("type") != "section":
                add(s["id"])
        for s in TREAT.values():
            if s.get("category") == t.get("category"):
                add(s["id"])
        return out[:limit]

    def card(self, tid, override=None):
        c = dict(TREAT[tid]["card"])
        c["href"] = TREAT[tid]["url"]
        c.update(override or {})
        return c


# ───────────────────────────── quality gates ─────────────────────────────
def static_meta():
    """Title / description / H1 of every hand-built page, for site-wide uniqueness checks."""
    gen = {t["url"].strip("/") + "/index.html" for t in TREAT.values() if t.get("type") == "generated"}
    out = []
    for dp, dns, fns in os.walk(FE):
        dns[:] = [d for d in dns if d not in SKIP_DIRS]
        for fn in fns:
            rel = os.path.relpath(os.path.join(dp, fn), FE).replace(os.sep, "/")
            if not fn.endswith(".html") or rel in gen or re.match(r"google[a-z0-9]+\.html$", fn):
                continue
            s = open(os.path.join(dp, fn), encoding="utf-8").read()
            if re.search(r'<meta\s+name="robots"\s+content="[^"]*noindex', s):
                continue
            t = re.search(r"<title>(.*?)</title>", s, re.S)
            d = re.search(r'<meta\s+name="description"\s+content="([^"]*)"', s)
            h = re.findall(r"<h1[^>]*>(.*?)</h1>", s, re.S)
            out.append({"file": rel, "title": strip_tags(t.group(1)) if t else "", "desc": html.unescape(d.group(1)) if d else "",
                        "h1": [strip_tags(x) for x in h]})
    return out


def run_gates(pages, data):
    """Checks every generated page. Returns {id: [(level, message)]}; level is critical, warning or review."""
    res = defaultdict(list)
    people, branches = data["people"], data["branches"]
    statics = static_meta()
    # site-wide values
    seen_title, seen_desc, seen_h1, seen_lead, seen_q = (defaultdict(list) for _ in range(5))
    for s in statics:
        seen_title[s["title"].lower()].append(s["file"])
        seen_desc[s["desc"].lower()].append(s["file"])
        for h in s["h1"]:
            seen_h1[h.lower()].append(s["file"])
    for p in pages:
        h1 = strip_tags(p.get("h1", "") + " " + p.get("h1_span", ""))
        seen_title[p.get("title", "").lower()].append(p["id"])
        seen_desc[p.get("description", "").lower()].append(p["id"])
        seen_h1[h1.lower()].append(p["id"])
        seen_lead[" ".join(strip_tags(p.get("lead", "")).lower().split()[:12])].append(p["id"])
        for q, _ in p.get("faqs", []):
            seen_q[strip_tags(q).lower()].append(p["id"])

    texts = {p["id"]: page_text(p) for p in pages}
    sh = {k: shingles(v) for k, v in texts.items()}
    for a, b in combinations(list(sh), 2):
        if sh[a] and sh[b]:
            j = len(sh[a] & sh[b]) / len(sh[a] | sh[b])
            if j >= MAX_SIMILARITY:
                res[a].append(("critical", f"content {int(j * 100)}% similar to {b}"))
                res[b].append(("critical", f"content {int(j * 100)}% similar to {a}"))

    for p in pages:
        pid = p["id"]

        def crit(m, pid=pid):
            res[pid].append(("critical", m))

        def warn(m, pid=pid):
            res[pid].append(("warning", m))
        t = TREAT[pid]
        for f in ("title", "description", "h1", "lead", "hero_image", "faqs", "cta", "procedure"):
            if not p.get(f):
                crit(f"missing {f}")
        title, desc = p.get("title", ""), p.get("description", "")
        if len(title) > 60:
            crit(f"title is {len(title)} characters (max 60)")
        if not 70 <= len(desc) <= 160:
            crit(f"meta description is {len(desc)} characters (70–160)")
        if len(seen_title[title.lower()]) > 1:
            crit("title is not unique: " + ", ".join(x for x in seen_title[title.lower()] if x != pid))
        if len(seen_desc[desc.lower()]) > 1:
            crit("meta description is not unique")
        h1 = strip_tags(p.get("h1", "") + " " + p.get("h1_span", "")).lower()
        if len(seen_h1[h1]) > 1:
            crit("H1 is not unique: " + ", ".join(x for x in seen_h1[h1] if x != pid))
        lead = " ".join(strip_tags(p.get("lead", "")).lower().split()[:12])
        if len(seen_lead[lead]) > 1:
            crit("introduction starts like another page's")
        words = len(texts[pid].split())
        if words < MIN_WORDS:
            crit(f"only {words} page-specific words (minimum {MIN_WORDS})")
        if len(p.get("faqs", [])) < 4:
            crit("fewer than 4 FAQs")
        for q, _ in p.get("faqs", []):
            if len(seen_q[strip_tags(q).lower()]) > 1:
                warn(f"FAQ also used on another page: \"{strip_tags(q)}\"")
        for label, ctx in find_claims(texts[pid]):
            crit(f"unsupported-claim wording ({label}): …{ctx}…")
        # canonical / taxonomy
        if p["path"] != t["url"] or not p["path"].startswith("/") or not p["path"].endswith("/"):
            crit(f"path {p['path']} does not match the registry URL {t['url']}")
        if t.get("category") not in CATS:
            crit("category missing from taxonomy")
        if t.get("parent") and t["parent"] not in TREAT:
            crit("parent treatment missing from taxonomy")
        for loc in t.get("locations", []):
            if loc not in branches:
                crit(f"unknown clinic location {loc}")
        # images
        if p.get("og") and not os.path.exists(os.path.join(FE, p["og"].lstrip("/"))):
            crit(f"social share image missing: {p['og']} (add a card in tools/og/make_og_images.py)")
        imgs = [p.get("hero_image")] + [(p.get("explainer") or {}).get("image")]
        imgs += [it[2] for it in (p.get("steps") or {}).get("items", []) if len(it) > 2 and isinstance(it[2], dict)]
        for img in [i for i in imgs if i]:
            for k in ("src", "webp"):
                if img.get(k) and not os.path.exists(os.path.join(FE, img[k].lstrip("/"))):
                    crit(f"image missing: {img[k]}")
            if not img.get("alt") or len(img["alt"]) > 125:
                crit(f"image alt text missing or too long: {img.get('src')}")
            if not img.get("w") or not img.get("h"):
                crit(f"image without width/height: {img.get('src')}")
        # links inside the content
        for href in html_links(p):
            f = local_file(href)
            if f and not os.path.exists(os.path.join(FE, f)):
                target = next((x for x in TREAT.values() if x["url"] == href.split("#")[0]), None)
                if not target:
                    crit(f"broken link: {href}")
        # approval
        status = p.get("status")
        if status == "published":
            if p.get("reviewer") not in people:
                crit("published without a known reviewer (reviewer must be a person in site-data.json)")
            try:
                datetime.date.fromisoformat(p.get("reviewed", ""))
            except ValueError:
                crit("published without a review date (reviewed: YYYY-MM-DD)")
        for note in p.get("review_notes", []):
            res[pid].append(("review", note))
    return res


def links_to_unpublished(p, resolver):
    """Content links from this page to generated pages that are not live (visitors would reach an unapproved page)."""
    out = []
    for href in html_links(p):
        base = href.split("#")[0]
        for t in TREAT.values():
            if t.get("type") == "generated" and t["url"] == base and not resolver.live(t["id"]):
                out.append(href)
    return out


HREF_RE = re.compile(r'(<a\b(?![^>]*\bdata-pseo=)[^>]*?\bhref=")(/[^"#?]*)((?:#[^"]*)?)(")')


def neutralize(text, resolver, self_url=None):
    """For pages the build writes as indexable: a link to a generated page that is not live points to that
    treatment's fallback (or its category hub) instead, so publishing can happen one page at a time.
    Returns (text, [(url, fallback)])."""
    by_url = {t["url"]: t for t in TREAT.values() if t.get("type") == "generated"}
    fixed = []

    def fix(m):
        t = by_url.get(m.group(2))
        if not t or m.group(2) == self_url or resolver.live(t["id"]):
            return m.group(0)
        fb = t.get("fallback") or CATS[t["category"]]["hub"]
        fixed.append((m.group(2), fb))
        return m.group(1) + fb + m.group(4)
    return HREF_RE.sub(fix, text), fixed


def effective_status(p, gates):
    """published only when no critical gate fails; a failing published page is held back as 'blocked'."""
    if p["status"] == "published":
        return "blocked" if any(level == "critical" for level, _ in gates.get(p["id"], [])) else "published"
    return p["status"]


# ───────────────────────────── link sync ─────────────────────────────
ANCHOR_RE = re.compile(r'<a\b[^>]*\bdata-pseo="([^"]+)"[^>]*>')
SLOT_RE = re.compile(r'<!--pseo:link id="([^"]+)" text="([^"]+)"( plain="1")?-->(.*?)<!--/pseo:link-->', re.S)


def sync_links(resolver):
    """Point status-aware links at live pages (or their fallbacks) in every HTML file. Returns changed files."""
    changed, unknown = [], set()
    for dp, dns, fns in os.walk(FE):
        dns[:] = [d for d in dns if d not in SKIP_DIRS]
        for fn in fns:
            if not fn.endswith(".html"):
                continue
            path = os.path.join(dp, fn)
            s = open(path, encoding="utf-8").read()
            if "pseo" not in s:
                continue
            # pages in the site root use relative links (they also open from disk); pages in folders use /root links
            at_root = os.path.dirname(os.path.relpath(path, FE)) == ""

            def fix_anchor(m):
                tag, tid = m.group(0), m.group(1)
                fb = re.search(r'data-pseo-fallback="([^"]*)"', tag)
                if tid not in TREAT or not fb:
                    unknown.add(f"{fn}: {tid}")
                    return tag
                url = TREAT[tid]["url"]
                target = (url if fb.group(1).startswith(("/", "http")) else url.lstrip("/")) if resolver.live(tid) else fb.group(1)
                return re.sub(r'\bhref="[^"]*"', f'href="{target}"', tag, count=1)

            def fix_slot(m):
                tid, text, plain = m.group(1), m.group(2), m.group(3) or ""
                if tid not in TREAT:
                    unknown.add(f"{fn}: {tid}")
                    return m.group(0)
                style = "" if plain else f' style="{LINK_STYLE}"'
                href = TREAT[tid]["url"].lstrip("/") if at_root else TREAT[tid]["url"]
                inner = f' <a href="{href}"{style}>{text}</a>.' if resolver.live(tid) else ""
                return f'<!--pseo:link id="{tid}" text="{text}"{plain}-->{inner}<!--/pseo:link-->'

            s2 = SLOT_RE.sub(fix_slot, ANCHOR_RE.sub(fix_anchor, s))
            if s2 != s:
                open(path, "w", encoding="utf-8").write(s2)
                changed.append(os.path.relpath(path, FE))
    return changed, sorted(unknown)


def update_htaccess(folders):
    """Keep the trailing-slash redirect rule in .htaccess in step with the page folders that exist."""
    path = os.path.join(FE, ".htaccess")
    s = open(path, encoding="utf-8").read()
    line = "    RewriteRule ^(" + "|".join(folders) + ")$ /$1/ [L,R=301]"
    s2 = re.sub(r"^\s*RewriteRule \^\(locations\|blog[^\n]*$", line, s, count=1, flags=re.M)
    if s2 != s:
        open(path, "w", encoding="utf-8").write(s2)
        return True
    return False
