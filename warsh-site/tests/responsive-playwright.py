"""Responsive/viewport checks for the rebuilt warsh.app site.

Verifies every canonical route at mobile, tablet, and desktop widths:
no horizontal overflow, no console/page errors, no failed responses, and
that the mobile nav toggle actually opens the menu. Writes full-page
screenshots to .artifacts/responsive/ for visual review.

Run against a dev or preview server:
    WARSH_SITE_BASE_URL=http://127.0.0.1:3101 python tests/responsive-playwright.py
"""

import os
from pathlib import Path

from playwright.sync_api import sync_playwright

BASE_URL = os.environ.get("WARSH_SITE_BASE_URL", "http://127.0.0.1:3100").rstrip("/")
SCREENSHOT_DIR = Path(__file__).resolve().parents[1] / ".artifacts" / "responsive"

ROUTES = [
    "/",
    "/features",
    "/pricing",
    "/about",
    "/blog",
    "/blog/understanding-al-fatiha",
    "/privacy",
    "/terms",
    "/help",
    "/delete-account",
]

VIEWPORTS = [
    ("mobile-small", 320, 720),
    ("mobile", 390, 844),
    ("tablet", 768, 1024),
    ("desktop", 1440, 1000),
]


def main() -> None:
    SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)
    failures: list[str] = []

    with sync_playwright() as playwright:
        # Match the other suites: drive the installed system Chrome.
        browser = playwright.chromium.launch(channel="chrome", headless=True)

        for label, width, height in VIEWPORTS:
            context = browser.new_context(
                viewport={"width": width, "height": height},
                device_scale_factor=2 if width <= 768 else 1,
                is_mobile=width <= 430,
                has_touch=width <= 430,
            )
            page = context.new_page()
            page.set_default_navigation_timeout(90_000)

            console_errors: list[str] = []
            page_errors: list[str] = []
            failed_responses: list[str] = []

            page.on(
                "console",
                lambda m: console_errors.append(m.text) if m.type == "error" else None,
            )
            page.on("pageerror", lambda e: page_errors.append(str(e)))
            page.on(
                "response",
                lambda r: failed_responses.append(f"{r.status} {r.url}")
                if r.status >= 400 and not r.url.endswith("/favicon.ico")
                else None,
            )

            for route in ROUTES:
                response = page.goto(f"{BASE_URL}{route}", wait_until="networkidle")
                if response is None or response.status != 200:
                    failures.append(f"{label} {route}: status {response and response.status}")
                    continue

                metrics = page.evaluate(
                    """() => ({
                      viewport: document.documentElement.clientWidth,
                      document: document.documentElement.scrollWidth,
                      body: document.body.scrollWidth,
                    })"""
                )
                if metrics["document"] > metrics["viewport"] + 1:
                    failures.append(f"{label} {route}: document overflow {metrics}")
                if metrics["body"] > metrics["viewport"] + 1:
                    failures.append(f"{label} {route}: body overflow {metrics}")

                # Any element wider than the viewport is a latent overflow bug even
                # when the document itself is clipped.
                wide = page.evaluate(
                    """(vw) => [...document.querySelectorAll('body *')]
                        .filter(el => !el.hasAttribute('data-sc-pan'))
                        .filter(el => !el.classList.contains('wh-plate__glow'))
                        .filter(el => el.getBoundingClientRect().width > vw + 1)
                        .slice(0, 5)
                        .map(el => el.tagName + '.' + (el.className || '').toString().slice(0, 60))""",
                    metrics["viewport"],
                )
                if wide:
                    failures.append(f"{label} {route}: elements wider than viewport {wide}")

                slug = route.strip("/").replace("/", "_") or "home"
                page.screenshot(
                    path=str(SCREENSHOT_DIR / f"{label}__{slug}.png"), full_page=True
                )

            # Mobile navigation must be reachable: the hamburger opens the menu.
            if width <= 430:
                page.goto(f"{BASE_URL}/", wait_until="networkidle")
                toggle = page.get_by_role("button", name="Open menu")
                if toggle.count() != 1:
                    failures.append(f"{label}: expected one 'Open menu' toggle, got {toggle.count()}")
                else:
                    mobile_nav = page.locator("#mobile-nav")
                    if mobile_nav.count() != 0:
                        failures.append(f"{label}: mobile nav rendered before toggle")
                    toggle.click()
                    page.wait_for_selector("#mobile-nav", state="visible", timeout=5_000)
                    links = page.locator("#mobile-nav a")
                    if links.count() < 5:
                        failures.append(f"{label}: mobile nav has {links.count()} links, expected >= 5")
                    page.screenshot(
                        path=str(SCREENSHOT_DIR / f"{label}__nav-open.png"), full_page=True
                    )
            else:
                # Desktop/tablet must show the inline nav, not the toggle.
                page.goto(f"{BASE_URL}/", wait_until="networkidle")
                if not page.locator("nav[aria-label='Primary']").is_visible():
                    failures.append(f"{label}: primary nav not visible")

            if console_errors:
                failures.append(f"{label}: console errors {console_errors}")
            if page_errors:
                failures.append(f"{label}: page errors {page_errors}")
            if failed_responses:
                failures.append(f"{label}: failed responses {failed_responses}")

            context.close()

        browser.close()

    if failures:
        raise AssertionError("\n".join(failures))

    print(f"PASS: {len(ROUTES)} routes x {len(VIEWPORTS)} viewports, no overflow or errors")
    print(f"Screenshots: {SCREENSHOT_DIR}")


if __name__ == "__main__":
    main()
