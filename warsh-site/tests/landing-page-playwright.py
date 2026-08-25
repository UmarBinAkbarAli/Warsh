import os
from pathlib import Path

from playwright.sync_api import sync_playwright


BASE_URL = os.environ.get("WARSH_SITE_BASE_URL", "http://127.0.0.1:3100").rstrip("/")
SCREENSHOT_DIR = Path(__file__).resolve().parents[1] / ".artifacts" / "landing-page"


def assert_no_horizontal_overflow(page, label: str) -> None:
    metrics = page.evaluate(
        """() => ({
          viewport: document.documentElement.clientWidth,
          document: document.documentElement.scrollWidth,
          body: document.body.scrollWidth,
        })"""
    )
    assert metrics["document"] <= metrics["viewport"] + 1, (label, metrics)
    assert metrics["body"] <= metrics["viewport"] + 1, (label, metrics)


def main() -> None:
    SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)
    failures: list[str] = []

    with sync_playwright() as playwright:
        # Match legal-pages-playwright.py: drive the installed system Chrome rather
        # than a Playwright-managed build.
        browser = playwright.chromium.launch(channel="chrome", headless=True)

        for label, width, height in (
            ("mobile", 390, 844),
            ("tablet", 768, 1024),
            ("desktop", 1440, 1000),
        ):
            context = browser.new_context(viewport={"width": width, "height": height})
            page = context.new_page()
            page.set_default_navigation_timeout(90_000)
            console_errors: list[str] = []
            page_errors: list[str] = []
            failed_responses: list[str] = []

            page.on(
                "console",
                lambda message: console_errors.append(message.text)
                if message.type == "error"
                else None,
            )
            page.on("pageerror", lambda error: page_errors.append(str(error)))
            page.on(
                "response",
                lambda response: failed_responses.append(
                    f"{response.status} {response.url}"
                )
                if response.status >= 400
                else None,
            )

            response = page.goto(BASE_URL, wait_until="networkidle", timeout=90_000)
            assert response is not None and response.status == 200
            assert page.title() == "Understand the Arabic of the Quran"
            assert page.get_by_role("heading", name="Where Arabic is crafted.").count() == 1
            # The app is publicly installable (open beta) — the download CTA must not
            # read as gated access.
            assert page.get_by_role("link", name="Download on Google Play").count() >= 1
            # Appears twice by design: the closing CTA and the footer product link.
            assert page.get_by_role("link", name="Open Warsh Web").count() >= 1
            assert page.get_by_text("beta", exact=False).count() == 0
            assert page.locator("main[role='main']").count() == 1
            assert page.locator("footer[role='contentinfo']").count() == 1
            assert page.locator("nav[aria-label='Primary']").count() == 1

            hrefs = page.locator("a[href]").evaluate_all(
                "elements => elements.map(element => element.getAttribute('href'))"
            )
            assert "#" not in hrefs
            for href in hrefs:
                if href and href.startswith("#"):
                    assert page.locator(href).count() == 1, f"Missing anchor target {href}"

            assert_no_horizontal_overflow(page, label)
            assert not console_errors, (label, console_errors)
            assert not page_errors, (label, page_errors)
            assert not failed_responses, (label, failed_responses)

            page.screenshot(
                path=str(SCREENSHOT_DIR / f"{label}.png"),
                full_page=True,
            )
            context.close()

        content_pages = {
            "/features": "A structured path, not a shortcut",
            "/pricing": "Honest. Simple. Affordable.",
            "/about": "Built to close one specific gap",
            "/blog": "Notes on Quranic Arabic",
            "/privacy": "Privacy Policy",
            "/terms": "Terms of Service",
            "/delete-account": "Delete your Warsh account",
            "/help": "Help & FAQ",
        }
        context = browser.new_context(viewport={"width": 390, "height": 844})
        page = context.new_page()
        page.set_default_navigation_timeout(90_000)
        for path, heading in content_pages.items():
            response = page.goto(
                f"{BASE_URL}{path}", wait_until="networkidle", timeout=90_000
            )
            assert response is not None and response.status == 200, path
            assert page.get_by_role("heading", name=heading, level=1).count() == 1, path
            assert_no_horizontal_overflow(page, path)

        robots_response = page.request.get(f"{BASE_URL}/robots.txt")
        assert robots_response.status == 200
        assert "Sitemap: https://warsh.app/sitemap.xml" in robots_response.text()

        sitemap_response = page.request.get(f"{BASE_URL}/sitemap.xml")
        assert sitemap_response.status == 200
        sitemap_text = sitemap_response.text()
        for canonical_url in (
            "https://warsh.app",
            "https://warsh.app/features",
            "https://warsh.app/pricing",
            "https://warsh.app/about",
            "https://warsh.app/blog",
            "https://warsh.app/blog/understanding-al-fatiha",
            "https://warsh.app/privacy",
            "https://warsh.app/terms",
            "https://warsh.app/delete-account",
            "https://warsh.app/help",
        ):
            assert canonical_url in sitemap_text

        context.close()
        browser.close()

    if failures:
        raise AssertionError("\n".join(failures))

    print("PASS: landing page and canonical legal routes")
    print(f"Screenshots: {SCREENSHOT_DIR}")


if __name__ == "__main__":
    main()
