import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services import gmail_service, email_service

logger = logging.getLogger(__name__)
router = APIRouter()


class ReceiptItem(BaseModel):
    name: str
    quantity: int
    price: float | None = None


class ReceiptRequest(BaseModel):
    to_email: str
    items: list[ReceiptItem]
    total: float
    order_date: str | None = None
    attachment_base64: str | None = None
    attachment_filename: str | None = None


class GenericEmailRequest(BaseModel):
    to_email: str
    subject: str
    html: str
    text: str | None = None
    attachment_base64: str | None = None
    attachment_filename: str | None = None


def _deliver(
    to_email: str,
    subject: str,
    text: str,
    html: str,
    attachment_base64: str | None = None,
    attachment_filename: str | None = None,
) -> str:
    """Send via Gmail (primary) then Resend (fallback). Returns the provider used or raises."""
    if not (gmail_service.is_configured() or email_service.is_configured()):
        raise HTTPException(
            status_code=503,
            detail="Email delivery isn't configured on the server. Set the Gmail (GMAIL_*) or Resend (RESEND_*) env vars in backend/.env.",
        )
    if gmail_service.is_configured():
        try:
            gmail_service.send_email(to_email, subject, text, html, attachment_base64, attachment_filename)
            return "gmail"
        except Exception as e:
            logger.warning(f"Gmail send failed ({e}); trying Resend fallback")
    if email_service.is_configured():
        try:
            email_service.send_email(to_email, subject, text, html, attachment_base64, attachment_filename)
            return "resend"
        except Exception as e:
            logger.error(f"Resend send failed: {e}")
            raise HTTPException(status_code=502, detail=f"Could not send the email: {e}")
    raise HTTPException(status_code=502, detail="Primary email provider failed and no fallback is configured.")


@router.post("/send")
def send_generic(req: GenericEmailRequest):
    via = _deliver(req.to_email, req.subject, req.text or "", req.html, req.attachment_base64, req.attachment_filename)
    return {"sent": True, "to": req.to_email, "via": via}


def _build_bodies(req: ReceiptRequest) -> tuple[str, str]:
    text_lines = "\n".join(
        f"  - {i.name} x{i.quantity} - " + (f"${(i.price or 0) * i.quantity:.2f}" if i.price is not None else "price n/a")
        for i in req.items
    )
    text = (
        f"Thank you for your EcoScope order!\n\n"
        f"Order date: {req.order_date or ''}\n\n"
        f"Items:\n{text_lines}\n\n"
        f"Total: ${req.total:.2f}\n\n"
        f"This is a demo order - no real payment was processed.\n"
        f"- The EcoScope Team"
    )

    rows = "".join(
        f"<tr><td style='padding:8px;border-bottom:1px solid #eee'>{i.name}</td>"
        f"<td style='padding:8px;border-bottom:1px solid #eee;text-align:center'>{i.quantity}</td>"
        f"<td style='padding:8px;border-bottom:1px solid #eee;text-align:right'>"
        + (f"${(i.price or 0) * i.quantity:.2f}" if i.price is not None else "n/a")
        + "</td></tr>"
        for i in req.items
    )
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1f2937">
      <div style="background:#10a757;padding:20px;border-radius:12px 12px 0 0">
        <h1 style="color:#fff;margin:0;font-size:22px">EcoScope</h1>
        <p style="color:#d1fae5;margin:4px 0 0;font-size:13px">Order Receipt</p>
      </div>
      <div style="border:1px solid #eee;border-top:none;border-radius:0 0 12px 12px;padding:20px">
        <p style="color:#6b7280;font-size:13px">Order date: {req.order_date or ''}</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><th style="text-align:left;padding:8px;border-bottom:2px solid #eee">Item</th>
              <th style="text-align:center;padding:8px;border-bottom:2px solid #eee">Qty</th>
              <th style="text-align:right;padding:8px;border-bottom:2px solid #eee">Amount</th></tr>
          {rows}
        </table>
        <p style="text-align:right;font-size:18px;font-weight:bold;color:#10a757;margin-top:16px">
          Total: ${req.total:.2f}
        </p>
        <p style="color:#9ca3af;font-size:12px;margin-top:20px">
          This is a demo order - no real payment was processed.<br/>- The EcoScope Team
        </p>
      </div>
    </div>
    """
    return text, html


@router.post("/send-receipt")
def send_receipt(req: ReceiptRequest):
    """Dual-provider email: try Gmail API (primary), fall back to Resend. The app is the sender;
    no personal password is used (Gmail = OAuth2 refresh token, Resend = API key)."""
    subject = "Your EcoScope Order Receipt"
    text, html = _build_bodies(req)
    via = _deliver(req.to_email, subject, text, html, req.attachment_base64, req.attachment_filename)
    return {"sent": True, "to": req.to_email, "via": via}
