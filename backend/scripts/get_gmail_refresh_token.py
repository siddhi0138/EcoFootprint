"""One-time helper to obtain a Gmail API refresh token for the app's sender account.

Prerequisites (in Google Cloud Console, for your Firebase/Google project):
  1. Enable the "Gmail API" (APIs & Services -> Library).
  2. OAuth consent screen: User type "External", add scope .../auth/gmail.send, and add your
     sender Gmail under "Test users".
  3. Create an OAuth client ID of type "Web application" and add
     http://localhost:8765/  to the Authorized redirect URIs. Copy the Client ID + Secret.

Run:
    cd backend
    venv/Scripts/python scripts/get_gmail_refresh_token.py

It opens a browser, you approve as the SENDER Gmail account, and it prints the refresh token.
Paste GMAIL_CLIENT_ID / GMAIL_CLIENT_SECRET / GMAIL_REFRESH_TOKEN / GMAIL_SENDER_EMAIL into .env.
"""
import http.server
import urllib.parse
import webbrowser

import httpx

REDIRECT_URI = "http://localhost:8765/"
SCOPE = "https://www.googleapis.com/auth/gmail.send"
AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
TOKEN_URL = "https://oauth2.googleapis.com/token"


def main():
    client_id = input("GMAIL_CLIENT_ID: ").strip()
    client_secret = input("GMAIL_CLIENT_SECRET: ").strip()

    params = {
        "client_id": client_id,
        "redirect_uri": REDIRECT_URI,
        "response_type": "code",
        "scope": SCOPE,
        "access_type": "offline",
        "prompt": "consent",
    }
    url = f"{AUTH_URL}?{urllib.parse.urlencode(params)}"
    print("\nOpening browser to authorize as your SENDER Gmail account...")
    webbrowser.open(url)

    code_holder = {}

    class Handler(http.server.BaseHTTPRequestHandler):
        def do_GET(self):
            q = urllib.parse.urlparse(self.path).query
            code_holder["code"] = urllib.parse.parse_qs(q).get("code", [None])[0]
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"Authorization received. You can close this tab and return to the terminal.")

        def log_message(self, *args):
            pass

    server = http.server.HTTPServer(("localhost", 8765), Handler)
    server.handle_request()

    code = code_holder.get("code")
    if not code:
        print("No authorization code received.")
        return

    resp = httpx.post(TOKEN_URL, data={
        "code": code,
        "client_id": client_id,
        "client_secret": client_secret,
        "redirect_uri": REDIRECT_URI,
        "grant_type": "authorization_code",
    }, timeout=30)
    data = resp.json()
    refresh_token = data.get("refresh_token")
    if not refresh_token:
        print("No refresh token returned. Response:", data)
        print("Tip: remove the app's access at https://myaccount.google.com/permissions and retry (prompt=consent).")
        return

    print("\n=== SUCCESS - add these to backend/.env ===")
    print(f"GMAIL_CLIENT_ID={client_id}")
    print(f"GMAIL_CLIENT_SECRET={client_secret}")
    print(f"GMAIL_REFRESH_TOKEN={refresh_token}")
    print("GMAIL_SENDER_EMAIL=<the gmail you just authorized>")


if __name__ == "__main__":
    main()
