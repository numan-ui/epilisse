import { Resend } from 'resend';

// resend.com dashboard: verify a sending domain (e.g. epilisse.de) before any
// send will actually deliver — the API key alone isn't enough.
const FROM = 'EPILISSE <no-reply@epilisse.de>';

export function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('Missing RESEND_API_KEY env var');
  return new Resend(key);
}

export function campaignEmail({
  title,
  message,
  discountLabel,
}: {
  title: string;
  message: string;
  discountLabel?: string | null;
}) {
  return {
    subject: title,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        ${discountLabel ? `<p style="color:#745b00;font-weight:700;letter-spacing:.05em;text-transform:uppercase;font-size:12px">${discountLabel}</p>` : ''}
        <h1 style="font-size:22px;margin:8px 0 16px">${title}</h1>
        <p style="font-size:14px;line-height:1.6;color:#333;white-space:pre-line">${message}</p>
      </div>
    `,
  };
}

export function followUpEmail({
  customerName,
  categoryName,
}: {
  customerName: string;
  categoryName: string;
}) {
  return {
    subject: `Zeit für Ihre nächste ${categoryName}-Behandlung`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <p style="font-size:14px;line-height:1.6;color:#333">
          Liebe/r ${customerName},<br /><br />
          es ist schon eine Weile her seit Ihrer letzten <strong>${categoryName}</strong>-Behandlung bei EPILISSE.
          Damit die Wirkung optimal bleibt, empfehlen wir eine baldige Auffrischung.
          Wir freuen uns, Sie bald wieder bei uns begrüßen zu dürfen!
        </p>
      </div>
    `,
  };
}

export async function sendEmail(to: string, content: { subject: string; html: string }) {
  const resend = getResend();
  return resend.emails.send({ from: FROM, to, subject: content.subject, html: content.html });
}
