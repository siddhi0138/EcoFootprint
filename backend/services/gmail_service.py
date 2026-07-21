"""Primary email provider: the Gmail API, authenticated server-side with an OAuth2 refresh token.

The app sends from ONE fixed sender Gmail account (GMAIL_SENDER_EMAIL) to any user - no SMTP, no
password. A long-lived refresh token (obtained once via scripts/get_gmail_refresh_token.py) is
exchanged for a short-lived access token on each send, then the message goes through the official
Gmail REST API.
"""
from __future__ import annotations

import base64
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import httpx

from utils.config import get_settings

_TOKEN_URL = "https://oauth2.googleapis.com/token"
_SEND_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send"


def is_configured() -> bool:
    s = get_settings()
    return bool(s.gmail_client_id and s.gmail_client_secret and s.gmail_refresh_token and s.gmail_sender_email)


def _access_token() -> str:
    s = get_settings()
    resp = httpx.post(
        _TOKEN_URL,
        data={
            "client_id": s.gmail_client_id,
            "client_secret": s.gmail_client_secret,
            "refresh_token": s.gmail_refresh_token,
            "grant_type": "refresh_token",
        },
        timeout=20,
    )
    resp.raise_for_status()
    return resp.json()["access_token"]


def send_email(
    to_email: str,
    subject: str,
    text: str,
    html: str,
    attachment_base64: str | None = None,
    attachment_filename: str | None = None,
) -> None:
    s = get_settings()
    body = MIMEMultipart("alternative")
    body.attach(MIMEText(text, "plain", "utf-8"))
    body.attach(MIMEText(html, "html", "utf-8"))

    if attachment_base64:
        msg = MIMEMultipart("mixed")
        msg.attach(body)
        attachment = MIMEApplication(base64.b64decode(attachment_base64), _subtype="pdf")
        attachment.add_header(
            "Content-Disposition", "attachment", filename=attachment_filename or "attachment.pdf"
        )
        msg.attach(attachment)
    else:
        msg = body

    msg["To"] = to_email
    msg["From"] = f"EcoScope <{s.gmail_sender_email}>"
    msg["Subject"] = subject

    raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()
    token = _access_token()
    resp = httpx.post(
        _SEND_URL,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        json={"raw": raw},
        timeout=20,
    )
    if resp.status_code >= 300:
        raise RuntimeError(f"Gmail API error {resp.status_code}: {resp.text}")
