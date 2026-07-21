"""Fallback email provider: Resend (https://resend.com). Used when Gmail isn't configured.

Sends via the Resend REST API with just an API key + a verified sender address - no password.
"""
from __future__ import annotations

import httpx

from utils.config import get_settings

_RESEND_URL = "https://api.resend.com/emails"


def is_configured() -> bool:
    s = get_settings()
    return bool(s.resend_api_key and s.resend_from_email)


def send_email(
    to_email: str,
    subject: str,
    text: str,
    html: str,
    attachment_base64: str | None = None,
    attachment_filename: str | None = None,
) -> None:
    s = get_settings()
    payload = {
        "from": f"EcoScope <{s.resend_from_email}>",
        "to": [to_email],
        "subject": subject,
        "text": text,
        "html": html,
    }
    if attachment_base64:
        payload["attachments"] = [{"filename": attachment_filename or "attachment.pdf", "content": attachment_base64}]

    resp = httpx.post(
        _RESEND_URL,
        headers={"Authorization": f"Bearer {s.resend_api_key}", "Content-Type": "application/json"},
        json=payload,
        timeout=20,
    )
    if resp.status_code >= 300:
        raise RuntimeError(f"Resend API error {resp.status_code}: {resp.text}")
