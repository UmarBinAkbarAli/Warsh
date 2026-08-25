import os
from playwright.sync_api import sync_playwright
from pathlib import Path


BASE_URL = os.environ.get("WARSH_LEGAL_BASE_URL", "http://127.0.0.1:3101").rstrip("/")
STATIC_PRIVACY_URI = os.environ.get(
    "WARSH_STATIC_PRIVACY_URL",
    (Path(__file__).resolve().parents[2] / "Docs" / "privacy-policy.html").as_uri(),
)


def assert_no_horizontal_overflow(page) -> None:
    overflow = page.evaluate(
        "document.documentElement.scrollWidth > document.documentElement.clientWidth"
    )
    assert not overflow, f"horizontal overflow on {page.url}"


def run() -> None:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(channel="chrome", headless=True)

        for viewport in ({"width": 390, "height": 844}, {"width": 1280, "height": 900}):
            context = browser.new_context(viewport=viewport)
            page = context.new_page()
            console_errors: list[str] = []
            bad_responses: list[str] = []
            page.on(
                "console",
                lambda message: console_errors.append(message.text)
                if message.type == "error"
                and "status of 404" not in message.text
                else None,
            )
            page.on(
                "response",
                lambda response: bad_responses.append(
                    f"{response.status} {response.url}"
                )
                if response.status >= 400 and not response.url.endswith("/favicon.ico")
                else None,
            )

            page.goto(f"{BASE_URL}/privacy")
            page.wait_for_load_state("networkidle")
            assert page.title() == "Privacy Policy · Warsh"
            assert page.get_by_role("heading", name="Privacy Policy", exact=True).is_visible()
            assert page.get_by_text("Mixpanel:", exact=False).is_visible()
            assert page.get_by_text("OpenAI:", exact=False).is_visible()
            assert page.get_by_text("does not upload that raw recording", exact=False).is_visible()
            assert page.get_by_role("link", name="https://warsh.app/delete-account").is_visible()
            assert "180 days" not in page.locator("body").inner_text()
            assert_no_horizontal_overflow(page)

            page.goto(f"{BASE_URL}/terms")
            page.wait_for_load_state("networkidle")
            assert page.get_by_role("heading", name="Terms of Service", exact=True).is_visible()
            assert "180 days" not in page.locator("body").inner_text()
            assert_no_horizontal_overflow(page)

            page.goto(f"{BASE_URL}/delete-account")
            page.wait_for_load_state("networkidle")
            assert page.title() == "Delete Your Account · Warsh"
            assert page.get_by_role("heading", name="Delete your Warsh account", exact=True).is_visible()
            delete_link = page.get_by_role("link", name="Email deletion request")
            assert delete_link.get_attribute("href", timeout=5000).startswith(
                "mailto:support@warsh.app"
            )
            assert page.get_by_role("link", name="Warsh Privacy Policy").get_attribute("href") == "/privacy"
            assert page.get_by_text("does not automatically cancel", exact=False).is_visible()
            assert_no_horizontal_overflow(page)

            page.goto(STATIC_PRIVACY_URI)
            page.wait_for_load_state("networkidle")
            assert page.title() == "Privacy Policy - Warsh"
            assert page.get_by_text("Mixpanel:", exact=False).is_visible()
            assert page.get_by_text("OpenAI:", exact=False).is_visible()
            assert page.get_by_text("does not upload that raw recording", exact=False).is_visible()
            assert "180 days" not in page.locator("body").inner_text()
            assert_no_horizontal_overflow(page)

            assert not console_errors, f"console errors: {console_errors}"
            assert not bad_responses, f"bad responses: {bad_responses}"
            context.close()

        browser.close()


if __name__ == "__main__":
    run()
    print("legal pages Playwright verification passed")
