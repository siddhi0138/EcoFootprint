import { api } from './api';

export interface ReceiptEmailRequest {
  to_email: string;
  items: { name: string; quantity: number; price: number | null }[];
  total: number;
  order_date?: string;
  attachment_base64?: string;
  attachment_filename?: string;
}

export function emailReceipt(req: ReceiptEmailRequest) {
  return api.post<{ sent: boolean; to: string }>('/api/email/send-receipt', req);
}

export interface GenericEmailRequest {
  to_email: string;
  subject: string;
  html: string;
  text?: string;
  attachment_base64?: string;
  attachment_filename?: string;
}

export function sendEmail(req: GenericEmailRequest) {
  return api.post<{ sent: boolean; to: string; via: string }>('/api/email/send', req);
}
