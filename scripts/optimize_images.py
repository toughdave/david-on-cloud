#!/usr/bin/env python3
"""Generate web-sized WebP copies of the images the homepage loads up front.

Each output is written as <name>-web.webp beside its source.

The homepage was downloading about 2.6MB of images on first load, most of it
experience-card photos far below the fold. One 250x175 inset was an 838KB,
1888x1739 JPEG. This script writes a WebP beside each source, sized for how
the image is actually displayed. Originals are never modified or deleted.

Sizing comes from css/style.css:
  * inset   Desktop shows 250x175. Phones show it full width by 320px tall
            and tablets 420px tall, so 960px wide keeps it sharp on
            high-density screens.
  * card    The card backdrop is faded to 18-32% opacity and covers about
            half the card, so 1000px at moderate quality is enough.
  * portrait The hero portrait displays at 320-352px; 704px covers 2x screens.

Run:  python3 scripts/optimize_images.py
Then point the CMS JSON at the .webp files and run npm run audit, which checks
the per-image budget for everything the homepage loads.
"""

import os
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

PROFILES = {
    "inset": {"max_width": 960, "quality": 76},
    "card": {"max_width": 1000, "quality": 62},
    "portrait": {"max_width": 704, "quality": 82},
}

# (source, profile). The output is the same path with a .webp extension.
IMAGES = [
    ("img/profile/protrait-mtd-flip.jpg", "portrait"),
    # Anchor Coaching
    ("img/projects/web/DevOps-Pipeline.png", "card"),
    ("img/projects/web/website-hero-intro-blurred-.png", "inset"),
    # Outlier
    ("img/projects/ai/ai-evaluation-bg.jpg", "card"),
    ("img/projects/ai/Rubric-Unit-Test-Validity-Analysis.jpg", "inset"),
    # Pures College
    ("img/experience/Pures-classroom-3.jpg", "card"),
    ("img/experience/Pures-College-classroom.jpg", "inset"),
    # Federal University of Technology, Akure
    ("img/experience/futa-laptop-bg.jpg", "card"),
    ("img/experience/data-analysis-mtd.jpg", "inset"),
    # Community Secondary School
    ("img/experience/ict-teacher-lab-bg.jpg", "card"),
    ("img/experience/Teaching-Students-Anambra.jpg", "inset"),
]


def webp_path(source):
    # "-web" keeps these apart from older hand-made .webp thumbnails that share
    # the base name (for example a 200x200 futa-laptop-bg.webp).
    return os.path.splitext(source)[0] + "-web.webp"


def optimize(source, profile, force=False):
    src = os.path.join(ROOT, source)
    out = os.path.join(ROOT, webp_path(source))
    settings = PROFILES[profile]
    if not force and os.path.exists(out) and os.path.getmtime(out) >= os.path.getmtime(src):
        return None

    with Image.open(src) as image:
        image.load()
        has_alpha = image.mode in ("RGBA", "LA") or (image.mode == "P" and "transparency" in image.info)
        image = image.convert("RGBA" if has_alpha else "RGB")
        if image.width > settings["max_width"]:
            height = round(image.height * settings["max_width"] / image.width)
            image = image.resize((settings["max_width"], height), Image.Resampling.LANCZOS)
        # method=6 is the slowest, smallest encoder setting; output is deterministic.
        image.save(out, "WEBP", quality=settings["quality"], method=6)
        size = image.size

    return os.path.getsize(src), os.path.getsize(out), size


def main():
    force = "--force" in sys.argv
    before = after = 0
    for source, profile in IMAGES:
        result = optimize(source, profile, force)
        if result is None:
            print(f"  up to date  {webp_path(source)}")
            continue
        src_bytes, out_bytes, (w, h) = result
        before += src_bytes
        after += out_bytes
        print(f"  {src_bytes / 1024:6.0f} KB -> {out_bytes / 1024:5.0f} KB  {w}x{h}  {webp_path(source)}")
    if before:
        print(f"\n  {before / 1024:.0f} KB -> {after / 1024:.0f} KB ({100 - after * 100 / before:.0f}% smaller)")


if __name__ == "__main__":
    main()
