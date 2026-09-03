#!/usr/bin/env python3
"""Regenerate the subsetted WOFF2 faces that app/layout.tsx loads.

Masters and their .woff2 both live in assets/fonts, outside the served tree:
next/font emits the copies the browser loads into /_next/static, so a build
product under public/ would only ship a second copy nobody requests. Two
masters are load-bearing beyond this script: app/opengraph-image.tsx reads
Inter-Regular.ttf and CormorantGaramond-SemiBold.ttf at build time, because
satori parses TTF/OTF and not WOFF2.

Usage:
    pip install "fonttools[woff]"
    python scripts/build-fonts.py        # from warsh-site/

Adding a weight here is not enough on its own — add the matching entry to the
localFont() call in app/layout.tsx too, or it will be built and never used.
"""

from __future__ import annotations

import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MASTER_DIR = ROOT / "assets" / "fonts"
OUT_DIR = MASTER_DIR  # side by side with the masters; neither is served

# Latin + Latin Extended, punctuation and currency. Deliberately wider than the
# copy currently on the site: blog bodies are authored in Warsh Studio, so the
# character set is not fully known at build time and an over-tight subset would
# show up as tofu in a post nobody thought to re-check.
LATIN = (
    "U+0000-00FF,U+0100-024F,U+0259,U+02BB-02BC,U+02C6,U+02DA,U+02DC,"
    "U+0304,U+0308,U+0329,U+1E00-1EFF,U+2000-206F,U+2074,U+20A0-20CF,"
    "U+2113,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD"
)

# Arabic, its presentation forms, and the joiners shaping depends on. Basic
# Latin rides along so digits and punctuation inside an Arabic run do not fall
# back to a different face mid-line.
ARABIC = (
    "U+0000-00FF,U+0600-06FF,U+0750-077F,U+0870-088E,U+08A0-08FF,"
    "U+200C-200F,U+2000-206F,U+2E41,U+FB50-FDFF,U+FE70-FEFF,U+FEFF,U+FFFD"
)

# Only the faces that render somewhere. Verified by walking getComputedStyle over
# every route, not by reading the stylesheets.
FACES = [
    ("Inter-Regular", LATIN),
    ("Inter-Italic", LATIN),
    ("Inter-SemiBold", LATIN),
    ("Inter-Bold", LATIN),
    ("CormorantGaramond-Regular", LATIN),
    ("CormorantGaramond-SemiBold", LATIN),
    ("ScheherazadeNew-Regular", ARABIC),
    ("ScheherazadeNew-SemiBold", ARABIC),
]


def main() -> int:
    old = new = 0
    for name, unicodes in FACES:
        src = MASTER_DIR / f"{name}.ttf"
        dst = OUT_DIR / f"{name}.woff2"
        if not src.exists():
            print(f"missing master: {src}", file=sys.stderr)
            return 1
        subprocess.run(
            [
                sys.executable, "-m", "fontTools.subset", str(src),
                f"--unicodes={unicodes}",
                # Keep every OpenType feature the master defines. Arabic does not
                # render as words without init/medi/fina/rlig/mark.
                "--layout-features=*",
                "--flavor=woff2",
                f"--output-file={dst}",
            ],
            check=True,
        )
        a, b = os.path.getsize(src), os.path.getsize(dst)
        old += a
        new += b
        print(f"{name:30s} {a / 1024:7.1f} KB ttf -> {b / 1024:6.1f} KB woff2  (-{100 - 100 * b / a:.0f}%)")

    print(f"\n{len(FACES)} faces: {old / 1024:.0f} KB -> {new / 1024:.0f} KB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
