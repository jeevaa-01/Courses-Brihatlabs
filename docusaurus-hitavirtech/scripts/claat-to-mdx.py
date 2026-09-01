#!/usr/bin/env python3
"""
claat-to-mdx.py — convert a Google Codelabs (claat) markdown file into a
Docusaurus course skeleton with Coursera-style lesson scaffolding.

Usage:
    python scripts/claat-to-mdx.py <codelab.md> <course-slug> [--site-dir DIR]

What it does (the mechanical 80%):
  * parses claat metadata            -> course _category_ metadata + report
  * splits '## Step' sections        -> one numbered .mdx lesson per step
  * 'Duration: m:ss' lines           -> <DurationBadge minutes={m}/>
  * image paths                      -> /img/courses/<pool>/... (+ copies files)
  * MDX hazard scan                  -> escapes stray '<' / '{' outside code
  * emits docs/courses/<slug>/_convert-report.md for the manual pass

What it does NOT do (the manual enrichment pass):
  * module grouping (steps land flat; move them into module-N folders)
  * <LearningObjectives> / <KeyTakeaways> / <Quiz> authoring
  * admonition conversion for Note/Warning/Tip paragraphs
"""
import argparse
import re
import shutil
import sys
from pathlib import Path

SITE_DIR = Path(__file__).resolve().parent.parent
# Where the claat codelabs repo lives (image pools are resolved against it).
CODELABS_DIR = Path(r"C:/hitavirtect_codelabs/my-codelabs")

META_KEYS = ("summary", "id", "categories", "tags", "status", "authors")


def slugify(text: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return re.sub(r"-{2,}", "-", s) or "section"


def parse_metadata(lines):
    meta = {}
    body_start = 0
    for i, line in enumerate(lines):
        m = re.match(r"^([A-Za-z ]+):\s*(.+)$", line)
        if m and m.group(1).strip().lower().replace(" ", "_") in (
            "summary", "id", "categories", "tags", "status", "authors", "feedback_link"
        ):
            meta[m.group(1).strip().lower()] = m.group(2).strip()
            body_start = i + 1
        elif line.startswith("# "):
            meta["title"] = line[2:].strip()
            body_start = i + 1
            break
        elif line.strip() == "":
            continue
        else:
            break
    return meta, body_start


def split_steps(lines):
    """Split body into steps at '## ' headings. Returns [(title, [lines])]."""
    steps, current, title = [], [], None
    in_fence = False
    for line in lines:
        if re.match(r"^\s*```", line):
            in_fence = not in_fence
        if not in_fence and line.startswith("## ") and not line.startswith("###"):
            if title is not None:
                steps.append((title, current))
            title, current = line[3:].strip(), []
        elif title is not None:
            current.append(line)
    if title is not None:
        steps.append((title, current))
    return steps


def extract_duration(step_lines):
    """Pop a leading 'Duration: m:ss' line; return (minutes, remaining)."""
    for i, line in enumerate(step_lines[:4]):
        m = re.match(r"^Duration:\s*(\d+)(?::(\d+))?\s*$", line.strip())
        if m:
            minutes = int(m.group(1))
            if m.group(2) and minutes == 0:
                minutes = 1  # 0:30 -> round up
            return max(minutes, 1), step_lines[:i] + step_lines[i + 1:]
    return None, step_lines


IMG_POOLS = {
    "assets/diagrams/": "diagrams/",
    "aws-icons/": "aws-icons/",
    "azure-icons/": "azure-icons/",
}


def rewrite_images(text, copied, missing):
    def repl(m):
        alt, path = m.group(1), m.group(2)
        if path.startswith(("http://", "https://")):
            return m.group(0)
        for src_prefix, dst_prefix in IMG_POOLS.items():
            if path.startswith(src_prefix):
                rel = path[len(src_prefix):]
                src = CODELABS_DIR / path
                dst = SITE_DIR / "static" / "img" / "courses" / dst_prefix / rel
                if src.exists():
                    dst.parent.mkdir(parents=True, exist_ok=True)
                    if not dst.exists():
                        shutil.copy2(src, dst)
                    copied.add(str(src))
                else:
                    missing.add(path)
                return f"![{alt}](/img/courses/{dst_prefix}{rel})"
        missing.add(path)
        return m.group(0)

    return re.sub(r"!\[([^\]]*)\]\(([^)\s]+)\)", repl, text)


def escape_mdx(text):
    """Escape MDX-hostile chars outside code fences/inline code."""
    out, in_fence = [], False
    for line in text.splitlines(keepends=True):
        if re.match(r"^\s*```", line):
            in_fence = not in_fence
            out.append(line)
            continue
        if in_fence:
            out.append(line)
            continue
        # protect inline code spans, then escape < and { in the rest
        parts = re.split(r"(`[^`]*`)", line)
        for j, part in enumerate(parts):
            if j % 2 == 0:
                part = re.sub(r"<(?![a-zA-Z/!])", r"\\<", part)  # keep real tags
                part = re.sub(r"(?<!\\)\{", r"\\{", part)
                parts[j] = part
        out.append("".join(parts))
    return "".join(out)


def convert(md_path: Path, slug: str):
    lines = md_path.read_text(encoding="utf-8").splitlines()
    meta, body_start = parse_metadata(lines)
    steps = split_steps(lines[body_start:])
    if not steps:
        sys.exit("No '## ' steps found — is this a claat markdown file?")

    course_dir = SITE_DIR / "docs" / "courses" / slug
    course_dir.mkdir(parents=True, exist_ok=True)

    copied, missing, report_rows = set(), set(), []
    total_minutes = 0

    for idx, (title, step_lines) in enumerate(steps, start=1):
        minutes, step_lines = extract_duration(step_lines)
        total_minutes += minutes or 0
        body = "\n".join(step_lines).strip() + "\n"
        body = rewrite_images(body, copied, missing)
        body = escape_mdx(body)
        # demote nothing: claat '###' inside a step stays h3 (lesson h1 = title)

        lesson_slug = slugify(title)
        fname = f"{idx:02d}-{lesson_slug}.mdx"
        fm = [
            "---",
            f"title: {title!r}",
            f"sidebar_position: {idx}",
            f"description: {meta.get('summary', '')!r}",
            "---",
            "",
        ]
        if minutes:
            fm.append(f"<DurationBadge minutes={{{minutes}}} />")
            fm.append("")
        content = "\n".join(fm) + body + "\n<LessonComplete />\n"
        (course_dir / fname).write_text(content, encoding="utf-8", newline="\n")
        report_rows.append(f"| {idx:02d} | {title} | {minutes or '?'} min | {fname} |")

    # conversion report for the manual enrichment pass
    report = [
        f"# Conversion report: {meta.get('title', slug)}",
        "",
        f"- Source: `{md_path.name}` | claat id: `{meta.get('id', '?')}`",
        f"- Steps: {len(steps)} | Total duration: ~{total_minutes} min",
        f"- Images copied: {len(copied)} | **Images MISSING: {len(missing)}**",
        "",
        "## Manual pass checklist",
        "- [ ] Group lessons into module-N folders + _category_.json",
        "- [ ] Write course landing index.mdx (About / syllabus / prerequisites)",
        "- [ ] Add LearningObjectives + KeyTakeaways per lesson",
        "- [ ] Add Quiz knowledge checks + final quiz",
        "- [ ] Convert Note/Warning/Tip paragraphs to admonitions",
        "- [ ] Add sidebar entry in sidebars.js + course card in src/data/courses.js",
        "- [ ] Navbar dropdown entry in docusaurus.config.js",
        "",
        "| # | Step | Duration | File |",
        "|---|------|----------|------|",
        *report_rows,
    ]
    if missing:
        report += ["", "## MISSING IMAGES", *[f"- `{p}`" for p in sorted(missing)]]
    (course_dir / "_convert-report.md").write_text(
        "\n".join(report) + "\n", encoding="utf-8", newline="\n"
    )
    print(f"Converted {len(steps)} steps -> {course_dir}")
    print(f"Images copied: {len(copied)}, missing: {len(missing)}")
    print(f"Report: {course_dir / '_convert-report.md'}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("codelab", type=Path)
    ap.add_argument("slug")
    args = ap.parse_args()
    convert(args.codelab, args.slug)
