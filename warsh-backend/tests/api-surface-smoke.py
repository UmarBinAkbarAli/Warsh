import json
import os
import urllib.error
import urllib.request


BASE_URL = os.environ.get("WARSH_API_BASE_URL", "http://127.0.0.1:3300").rstrip("/")
PUBLIC_SITE_URL = os.environ.get("WARSH_PUBLIC_SITE_URL", "https://warsh.app").rstrip("/")


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def main() -> None:
    with urllib.request.urlopen(f"{BASE_URL}/", timeout=15) as response:
        assert response.status == 200
        assert response.headers.get_content_type() == "application/json"
        payload = json.load(response)
        assert payload == {
            "service": "Warsh API",
            "status": "ok",
            "health": "https://api.warsh.app/api/health",
            "website": "https://warsh.app",
        }

    with urllib.request.urlopen(f"{BASE_URL}/api/health", timeout=15) as response:
        assert response.status == 200
        payload = json.load(response)
        assert payload["data"]["status"] == "ok"

    opener = urllib.request.build_opener(NoRedirect)
    redirects = {
        "/privacy": f"{PUBLIC_SITE_URL}/privacy",
        "/terms": f"{PUBLIC_SITE_URL}/terms",
        "/delete-account": f"{PUBLIC_SITE_URL}/delete-account",
        "/help": f"{PUBLIC_SITE_URL}/help",
    }
    for path, expected_location in redirects.items():
        try:
            opener.open(f"{BASE_URL}{path}", timeout=15)
        except urllib.error.HTTPError as error:
            assert error.code == 308, (path, error.code)
            assert error.headers["Location"] == expected_location, (path, error.headers)
        else:
            raise AssertionError(f"{path} did not return a redirect")

    print("PASS: API root, health, and canonical legal redirects")


if __name__ == "__main__":
    main()
