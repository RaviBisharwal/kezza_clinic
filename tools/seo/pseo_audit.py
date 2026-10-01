#!/usr/bin/env python3
"""
Kezza Clinic — page inventory and programmatic-SEO audit (no dependencies, Python 3.8+).

Reads every HTML page in frontend/ (it never changes them) and writes:
  docs/pseo/inventory.csv   one row per page: category, treatment, URL, title, H1, meta, canonical,
                            robots, schema, breadcrumbs, internal links in/out, intent, risks
  docs/pseo/inventory.md    the same as readable tables, plus every issue found
  docs/pseo/audit.json      everything above in machine-readable form

It checks duplicate titles / H1s / descriptions, near-duplicate content, pages competing for the same
search intent, orphan pages, breadcrumb/schema mismatches, sitemap coverage and unsupported medical claims.
Category, treatment, status and intent come from tools/seo/taxonomy.json when it exists.

    python3 tools/seo/pseo_audit.py                 # write the reports
    python3 tools/seo/pseo_audit.py --strict        # also exit 1 on critical issues (used by npm test)
    python3 tools/seo/pseo_audit.py --out DIR --label before
"""
import csv
import html
import json
import os
import re
import sys
from collections import defaultdict
from html.parser import HTMLParser
from itertools import combinations
from urllib.parse import unquote

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
FE = os.path.join(ROOT, "frontend")
DATA = json.load(open(os.path.join(ROOT, "tools", "seo", "site-data.json"), encoding="utf-8"))
BASE = DATA["base_url"]
TAX_FILE = os.path.join(ROOT, "tools", "seo", "taxonomy.json")
SKIP_DIRS = {"images", "video", "posters", "uploads", "css", "js", "fonts"}
UTILITY = {"404.html", "admin.html"}

# Wording a medical page should not use unless it is proven and approved (see SEO-CHANGES / pSEO report).
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
    """(label, context) for each claim phrase, skipping negated uses such as "no guarantee" or "rather than a guarantee"."""
    out = []
    for pat, label in CLAIMS:
        for m in re.finditer(pat, text, re.I):
            if NEGATION.search(text[max(0, m.start() - 60): m.start()]):
                continue
            out.append((label, text[max(0, m.start() - 50): m.end() + 40]))
    return out


def norm_space(s):
    return re.sub(r"\s+", " ", s).strip()


class PageParser(HTMLParser):
    """Collects the SEO elements of one page and where each link sits (nav / footer / breadcrumb / body)."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.title, self.desc, self.robots, self.canonical, self.og_url, self.lang = "", None, None, None, None, None
        self.hreflang, self.h1, self.jsonld, self.links, self.crumbs = [], [], [], [], []
        self.text_main, self.text_body = [], []
        self._in = defaultdict(int)          # open-tag counters for regions
        self._navbar = self._footer = self._crumb = self._main = self._sources = 0
        self._cur_link = None
        self._cap = None                     # "title" | "h1" | "jsonld"
        self._buf = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "html":
            self.lang = a.get("lang")
        if tag == "nav":
            if self._navbar or "navbar" in (a.get("class") or "").split():
                self._navbar += 1
            if self._crumb or (a.get("aria-label") or "").lower() == "breadcrumb":
                self._crumb += 1
        if tag == "footer" or (self._footer and tag == "footer"):
            self._footer += 1
        if tag == "main":
            self._main += 1
        if tag == "ol" and (self._sources or "kz-sources" in (a.get("class") or "").split()):
            self._sources += 1                 # cited article titles are not the page's own claims
        if tag in ("script", "style", "noscript", "template"):
            self._in["skip"] += 1
            if tag == "script" and a.get("type") == "application/ld+json":
                self._cap, self._buf = "jsonld", []
        if tag == "title" and not self.title:
            self._cap, self._buf = "title", []
        if tag == "h1":
            self._cap, self._buf = "h1", []
        if tag == "meta":
            n, p = (a.get("name") or "").lower(), (a.get("property") or "").lower()
            if n == "description":
                self.desc = a.get("content", "")
            elif n == "robots":
                self.robots = a.get("content", "")
            elif p == "og:url":
                self.og_url = a.get("content")
        if tag == "link":
            rel = (a.get("rel") or "").lower()
            if rel == "canonical":
                self.canonical = a.get("href")
            elif rel == "alternate" and a.get("hreflang"):
                self.hreflang.append((a["hreflang"], a.get("href")))
        if tag == "a" and a.get("href"):
            region = ("breadcrumb" if self._crumb else "nav" if self._navbar else "footer" if self._footer
                      else "main" if self._main else "body")
            self._cur_link = {"href": a["href"], "region": region, "text": []}

    def handle_endtag(self, tag):
        if tag == "nav":
            if self._crumb:
                self._crumb -= 1
            if self._navbar:
                self._navbar -= 1
        if tag == "footer" and self._footer:
            self._footer -= 1
        if tag == "main" and self._main:
            self._main -= 1
        if tag == "ol" and self._sources:
            self._sources -= 1
        if tag in ("script", "style", "noscript", "template") and self._in["skip"]:
            self._in["skip"] -= 1
            if tag == "script" and self._cap == "jsonld":
                self.jsonld.append("".join(self._buf))
                self._cap = None
        if tag == "title" and self._cap == "title":
            self.title, self._cap = norm_space("".join(self._buf)), None
        if tag == "h1" and self._cap == "h1":
            self.h1.append(norm_space("".join(self._buf)))
            self._cap = None
        if tag == "a" and self._cur_link:
            self._cur_link["text"] = norm_space(" ".join(self._cur_link["text"]))
            self.links.append(self._cur_link)
            if self._cur_link["region"] == "breadcrumb":
                self.crumbs.append(self._cur_link["text"])
            self._cur_link = None
        if tag == "li" and self._crumb and self._cap == "crumb":
            self._cap = None

    def handle_data(self, data):
        if self._cap in ("title", "h1", "jsonld"):
            self._buf.append(data)
            if self._cap == "jsonld":
                return
        if self._in["skip"]:
            return
        if self._cur_link is not None:
            self._cur_link["text"].append(data)
        if self._crumb and not self._cur_link and data.strip():
            self.crumbs.append(norm_space(data))       # the current page (plain text, not a link)
        if not self._navbar and not self._footer and not self._sources:
            self.text_body.append(data)
            if self._main:
                self.text_main.append(data)


def walk():
    out = []
    for dp, dns, fns in os.walk(FE):
        dns[:] = [d for d in dns if d not in SKIP_DIRS]
        for fn in fns:
            if fn.endswith(".html") and not re.match(r"google[a-z0-9]+\.html$", fn):
                out.append(os.path.relpath(os.path.join(dp, fn), FE).replace(os.sep, "/"))
    return sorted(out)


def url_for(rel):
    if rel == "index.html":
        return BASE + "/"
    if rel.endswith("/index.html"):
        return BASE + "/" + rel[: -len("index.html")]
    return BASE + "/" + rel


def resolve(from_rel, href):
    """Local file (relative to frontend/) that a link points at, or None for external / special links."""
    href = href.strip()
    if href.startswith(BASE):
        href = href[len(BASE):] or "/"
    elif re.match(r"^(https?:|mailto:|tel:|javascript:|data:|#|//|whatsapp:)", href, re.I):
        return None
    path = unquote(href.split("#")[0].split("?")[0])
    if not path:
        return None
    if path.startswith("/"):
        target = path.lstrip("/")
    else:
        target = os.path.normpath(os.path.join(os.path.dirname(from_rel), path)).replace(os.sep, "/")
    if target in ("", "."):
        return "index.html"
    if path.endswith("/") or os.path.isdir(os.path.join(FE, target)):
        target = target.rstrip("/") + "/index.html"
    return target


def shingles(text, n=6):
    w = re.findall(r"[a-z0-9ऀ-ॿ]+", text.lower())
    return {" ".join(w[i:i + n]) for i in range(max(0, len(w) - n + 1))}


def title_core(t):
    t = t.lower()
    t = re.sub(r"\|.*$", "", t)                      # drop "| Kezza Clinic"
    t = re.sub(r"\b(in|at|for|of|the|and|&|a|with|clinic|kezza|rajasthan|india)\b", " ", t)  # city names stay: city pages are distinct targets
    return norm_space(re.sub(r"[^a-z0-9ऀ-ॿ ]", " ", t))


def load_taxonomy():
    if not os.path.exists(TAX_FILE):
        return {}, {}
    tax = json.load(open(TAX_FILE, encoding="utf-8"))
    by_file = {}
    for kind in ("treatments", "pages"):
        for t in tax.get(kind, []):
            f = t.get("file") or (t["url"].strip("/") + "/index.html" if t.get("type") == "generated" else None)
            if f:
                by_file[f] = dict(t, kind=kind)
    return tax, by_file


def page_status(entry, rel):
    """Status of a generated page lives in its source file; read it so the inventory matches the build."""
    if not entry:
        return ""
    if entry.get("source"):
        if not os.path.exists(os.path.join(ROOT, entry["source"])):
            return "draft"
        raw = open(os.path.join(ROOT, entry["source"]), encoding="utf-8").read()
        m = re.match(r"\s*<!--\s*(\{.*?\})\s*-->", raw, re.S)
        if m:
            return json.loads(m.group(1)).get("status", "published")
    return entry.get("status", "published")


def main():
    args = sys.argv[1:]
    out_dir = os.path.join(ROOT, args[args.index("--out") + 1]) if "--out" in args else os.path.join(ROOT, "docs", "pseo")
    label = args[args.index("--label") + 1] if "--label" in args else ""
    strict = "--strict" in args
    tax, by_file = load_taxonomy()
    cats = tax.get("categories", {})

    pages = {}
    for rel in walk():
        p = PageParser()
        p.feed(open(os.path.join(FE, rel), encoding="utf-8").read())
        robots = (p.robots or "index, follow (default)").lower()
        types, schema_crumbs, bad_json = [], [], False
        for block in p.jsonld:
            try:
                data = json.loads(block)
            except Exception:
                bad_json = True
                continue
            for n in data.get("@graph", [data]) if isinstance(data, dict) else data:
                t = n.get("@type")
                types += t if isinstance(t, list) else [t]
                if n.get("@type") == "BreadcrumbList":
                    schema_crumbs = [i.get("name") for i in n.get("itemListElement", [])]
        pages[rel] = {
            "file": rel, "url": url_for(rel), "title": p.title, "h1": p.h1, "desc": p.desc, "robots": robots,
            "noindex": "noindex" in robots or rel in UTILITY, "canonical": p.canonical, "og_url": p.og_url,
            "lang": p.lang, "hreflang": p.hreflang, "schema": sorted({t for t in types if t}), "bad_json": bad_json,
            "crumbs_visible": [c for c in p.crumbs if c and c not in ("›", ">", "/")],
            "crumbs_schema": schema_crumbs, "links": p.links, "jsonld_raw": p.jsonld,
            "main_text": norm_space(" ".join(p.text_main) or " ".join(p.text_body)),
        }

    # ── links in / out ─────────────────────────────────────────────
    inbound = defaultdict(lambda: {"contextual": set(), "navfooter": set()})   # counted from indexable pages only
    broken, leaks = [], []
    for rel, pg in pages.items():
        ctx, nf, ext = set(), set(), 0
        for ln in pg["links"]:
            t = resolve(rel, ln["href"])
            if t is None:
                ext += 1 if ln["href"].startswith("http") else 0
                continue
            if not os.path.exists(os.path.join(FE, t)):
                broken.append((rel, ln["href"]))
                continue
            if t == rel:
                continue
            (nf if ln["region"] in ("nav", "footer") else ctx).add(t)
            if pg["noindex"]:
                continue
            inbound[t]["navfooter" if ln["region"] in ("nav", "footer") else "contextual"].add(rel)
            if pages.get(t, {}).get("noindex") and t not in UTILITY:
                leaks.append((rel, ln["href"], ln["region"]))
        pg["out_ctx"], pg["out_nf"], pg["out_ext"] = sorted(ctx), sorted(nf), ext

    # ── sitemap ────────────────────────────────────────────────────
    sm = open(os.path.join(FE, "sitemap.xml"), encoding="utf-8").read()
    sitemap = {resolve("index.html", u) for u in re.findall(r"<loc>([^<]+)</loc>", sm)}

    # ── issues ─────────────────────────────────────────────────────
    issues = []                               # (severity, page, message)
    def issue(sev, rel, msg):
        issues.append({"severity": sev, "page": rel, "message": msg})

    indexable = [r for r, p in pages.items() if not p["noindex"]]
    for field, name in (("title", "title"), ("desc", "meta description")):
        seen = defaultdict(list)
        for r in indexable:
            v = (pages[r][field] or "").strip().lower()
            if v:
                seen[v].append(r)
            else:
                issue("critical", r, f"missing {name}")
        for v, rs in seen.items():
            if len(rs) > 1:
                for r in rs:
                    issue("critical", r, f"duplicate {name} (also on {', '.join(x for x in rs if x != r)})")
    h1seen = defaultdict(list)
    for r in indexable:
        if len(pages[r]["h1"]) != 1:
            issue("warning", r, f"{len(pages[r]['h1'])} H1 tags")
        for h in pages[r]["h1"]:
            h1seen[h.lower()].append(r)
    for h, rs in h1seen.items():
        if len(rs) > 1:
            for r in rs:
                issue("critical", r, f"duplicate H1 \"{h}\"")

    for r, p in pages.items():
        if p["bad_json"]:
            issue("critical", r, "JSON-LD does not parse")
        if p["noindex"]:
            if r in sitemap:
                issue("critical", r, "noindex page listed in sitemap.xml")
            continue
        if p["canonical"] != p["url"]:
            issue("critical", r, f"canonical {p['canonical']} is not the page's own URL {p['url']}")
        if p["og_url"] and p["og_url"] != p["canonical"]:
            issue("warning", r, "og:url differs from canonical")
        if r not in sitemap and r not in UTILITY:
            issue("critical", r, "indexable page missing from sitemap.xml")
        if p["crumbs_visible"] and p["crumbs_schema"] and [c.lower() for c in p["crumbs_visible"]] != [c.lower() for c in p["crumbs_schema"]]:
            issue("warning", r, f"visible breadcrumb {p['crumbs_visible']} differs from schema {p['crumbs_schema']}")
        if p["crumbs_schema"] and not p["crumbs_visible"] and r != "index.html":
            issue("info", r, "breadcrumb in schema only (no visible trail)")
        for label_, ctx in find_claims(p["main_text"]):
            issue("claim", r, f"{label_}: \"…{ctx}…\"")
    for r, h in broken:
        issue("critical", r, f"broken internal link: {h}")
    for r, h, region in leaks:   # e.g. a treatment page still in review: use data-pseo / pseo:link markers instead
        issue("critical", r, f"links to a page that is not published (noindex): {h} ({region})")
    for r in indexable:          # structured data should not advertise pages that are not published
        for u in sorted(set(re.findall(re.escape(BASE) + r"/[^\s\"'<>]*", " ".join(pages[r]["jsonld_raw"])))):
            t = resolve(r, u)
            if t and pages.get(t, {}).get("noindex") and t not in UTILITY:
                issue("warning", r, f"structured data refers to a page that is not published: {u}")

    # near-duplicate content (6-word shingles, Jaccard)
    sh = {r: shingles(pages[r]["main_text"]) for r in indexable}
    near = []
    for a, b in combinations(indexable, 2):
        if not sh[a] or not sh[b]:
            continue
        j = len(sh[a] & sh[b]) / len(sh[a] | sh[b])
        if j >= 0.20:
            near.append((round(j, 2), a, b))
            sev = "critical" if j >= 0.40 else "warning" if j >= 0.25 else "info"
            issue(sev, a, f"content {int(j * 100)}% similar to {b}" + (" (near-duplicate)" if j >= 0.40 else ""))
    # same title core = likely the same search target
    cores = defaultdict(list)
    for r in indexable:
        cores[title_core(pages[r]["title"])].append(r)
    for c, rs in cores.items():
        if c and len(rs) > 1:
            for r in rs:
                issue("warning", r, f"title targets the same words as {', '.join(x for x in rs if x != r)} (\"{c}\")")
    # same registered primary intent
    intents = defaultdict(list)
    for r in indexable:
        e = by_file.get(r)
        if e and e.get("intent"):
            intents[e["intent"]["primary"].lower()].append(r)
    for i, rs in intents.items():
        if len(rs) > 1:
            for r in rs:
                issue("critical", r, f"same primary intent \"{i}\" as {', '.join(x for x in rs if x != r)}")

    # orphans
    for r in indexable:
        if r in ("index.html",) or r in UTILITY:
            continue
        ctx, nf = len(inbound[r]["contextual"]), len(inbound[r]["navfooter"])
        if ctx + nf == 0:
            issue("critical", r, "orphan: no internal links point here")
        elif ctx == 0:
            issue("warning", r, f"weak: linked only from navigation/footer ({nf} pages)")

    # ── inventory rows ─────────────────────────────────────────────
    rows = []
    sev_by_page = defaultdict(list)
    for i in issues:
        sev_by_page[i["page"]].append(i)
    for r, p in pages.items():
        e = by_file.get(r, {})
        cat = cats.get(e.get("category", ""), {}).get("name", e.get("category", ""))
        parent = ""
        if e.get("parent"):
            parent = next((t["name"] for t in tax.get("treatments", []) if t["id"] == e["parent"]), e["parent"])
        risk = [i["message"] for i in sev_by_page[r] if i["severity"] in ("critical", "warning") and
                ("duplicate" in i["message"] or "similar" in i["message"] or "same" in i["message"])]
        orphan = next((i["message"].split(":")[0] for i in sev_by_page[r] if i["message"].startswith(("orphan", "weak"))), "linked")
        rows.append({
            "url": p["url"], "file": r, "category": cat, "treatment": e.get("name", ""), "parent": parent,
            "location": ", ".join(e.get("locations", [])) if e.get("kind") == "treatments" else e.get("location", ""),
            "status": page_status(e, r) or ("utility" if r in UTILITY else "published"),
            "indexable": "no" if p["noindex"] else "yes",
            "primary_intent": (e.get("intent") or {}).get("primary", ""),
            "secondary_intents": "; ".join((e.get("intent") or {}).get("secondary", [])),
            "title": p["title"], "title_len": len(html.unescape(p["title"])), "h1": " / ".join(p["h1"]),
            "meta_description": p["desc"] or "", "desc_len": len(p["desc"] or ""),
            "canonical": p["canonical"] or "", "robots": p["robots"], "schema": ", ".join(p["schema"]),
            "breadcrumb_visible": " > ".join(p["crumbs_visible"]), "breadcrumb_schema": " > ".join(p["crumbs_schema"]),
            "links_in_contextual": len(inbound[r]["contextual"]), "links_in_nav_footer": len(inbound[r]["navfooter"]),
            "links_out_contextual": len(p["out_ctx"]), "links_out_nav_footer": len(p["out_nf"]),
            "words_main": len(p["main_text"].split()), "in_sitemap": "yes" if r in sitemap else "no",
            "duplication_risk": "; ".join(risk) or "none found", "orphan_status": orphan,
        })

    os.makedirs(out_dir, exist_ok=True)
    suffix = f"-{label}" if label else ""
    with open(os.path.join(out_dir, f"inventory{suffix}.csv"), "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)
    json.dump({"pages": rows, "issues": issues, "near_duplicates": near, "broken_links": broken},
              open(os.path.join(out_dir, f"audit{suffix}.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)

    esc = lambda s: str(s).replace("|", "\\|")  # noqa: E731
    md = [f"# Page inventory and pSEO audit{(' — ' + label) if label else ''}", "",
          f"Generated by `tools/seo/pseo_audit.py`. {len(rows)} HTML pages, {len(indexable)} indexable, "
          f"{len(sitemap)} sitemap URLs. Full columns: `inventory{suffix}.csv`.", "",
          "| URL | Category | Treatment | Status | Index | Title | Words | Links in (body / menu) | Links out | Risk | Orphan |",
          "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |"]
    for x in rows:
        md.append(f"| {esc(x['url'].replace(BASE, '') or '/')} | {esc(x['category'])} | {esc(x['treatment'])} | {x['status']} | "
                  f"{x['indexable']} | {esc(x['title'])} | {x['words_main']} | {x['links_in_contextual']} / {x['links_in_nav_footer']} | "
                  f"{x['links_out_contextual']} | {'⚠' if x['duplication_risk'] != 'none found' else ''} | {x['orphan_status']} |")
    for sev, head in (("critical", "Critical issues"), ("warning", "Warnings"), ("claim", "Medical-claim wording to review"), ("info", "Notes")):
        items = [i for i in issues if i["severity"] == sev]
        md += ["", f"## {head} ({len(items)})", ""]
        md += [f"- `{i['page']}` — {esc(i['message'])}" for i in items] or ["None."]
    open(os.path.join(out_dir, f"inventory{suffix}.md"), "w", encoding="utf-8").write("\n".join(md) + "\n")

    counts = {s: sum(1 for i in issues if i["severity"] == s) for s in ("critical", "warning", "claim", "info")}
    print(f"pSEO audit: {len(rows)} pages ({len(indexable)} indexable) · critical {counts['critical']} · "
          f"warnings {counts['warning']} · claim wording {counts['claim']} · notes {counts['info']} → {os.path.relpath(out_dir, ROOT)}")
    if strict and counts["critical"]:
        for i in issues:
            if i["severity"] == "critical":
                print("  CRITICAL", i["page"], "—", i["message"])
        sys.exit(1)


if __name__ == "__main__":
    main()
