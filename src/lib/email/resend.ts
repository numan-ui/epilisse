import { Resend } from 'resend';

// resend.com dashboard: verify a sending domain (e.g. epilisse.de) before any
// send will actually deliver — the API key alone isn't enough.
const FROM = 'EPILISSE <no-reply@epilisse.de>';

const GOLD = '#745b00';
const CREAM = '#faf6f0';
const INK = '#1c1c18';
const MUTED = '#5f5e5a';
const BORDER = '#e5e2dc';

export function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('Missing RESEND_API_KEY env var');
  return new Resend(key);
}

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://epilisse.de';
}

// Shared branded wrapper so every transactional email reads as one system
// (serif wordmark header, cream footer) instead of ad-hoc inline styles per template.
function layout({ heading, bodyHtml }: { heading: string; bodyHtml: string }) {
  return `
    <!doctype html>
    <html lang="de">
    <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width" /></head>
    <body style="margin:0">
    <div style="background:${CREAM};padding:32px 16px;font-family:Arial,Helvetica,sans-serif">
      <div style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid ${BORDER}">
        <div style="padding:28px 32px;border-bottom:1px solid ${BORDER};text-align:center">
          <p style="margin:0;font-size:20px;letter-spacing:.14em;color:${GOLD};text-transform:uppercase;font-family:Georgia,'Times New Roman',serif">EPILISSE</p>
          <p style="margin:4px 0 0;font-size:10px;letter-spacing:.2em;color:#8a8a86;text-transform:uppercase">Munich Studio</p>
        </div>
        <div style="padding:32px">
          <h1 style="margin:0 0 16px;font-size:19px;font-weight:400;color:${INK};font-family:Georgia,'Times New Roman',serif">${heading}</h1>
          ${bodyHtml}
        </div>
        <div style="padding:20px 32px;background:${CREAM};font-size:11px;color:#8a8a86;text-align:center">
          EPILISSE Beauty Studio &middot; M&uuml;nchen
        </div>
      </div>
    </div>
    </body>
    </html>
  `;
}

function marketingNudge(consentUrl: string) {
  return `
    <div style="margin-top:24px;padding:14px 16px;background:${CREAM};border-left:3px solid ${GOLD};font-size:12px;line-height:1.6;color:${MUTED}">
      Wir würden Ihnen gerne exklusive Kampagnen und Vorteilspreise per E-Mail zusenden.
      Hierfür benötigen wir Ihre gesonderte Einwilligung —
      <a href="${consentUrl}" style="color:${GOLD}">jetzt zustimmen</a>.
    </div>
  `;
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
    html: layout({
      heading: title,
      bodyHtml: `
        ${discountLabel ? `<p style="color:${GOLD};font-weight:700;letter-spacing:.05em;text-transform:uppercase;font-size:12px;margin:0 0 12px">${discountLabel}</p>` : ''}
        <p style="font-size:14px;line-height:1.6;color:#333;white-space:pre-line;margin:0">${message}</p>
      `,
    }),
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
    html: layout({
      heading: 'Zeit für eine Auffrischung',
      bodyHtml: `
        <p style="font-size:14px;line-height:1.6;color:#333;margin:0">
          Liebe/r ${customerName},<br /><br />
          es ist schon eine Weile her seit Ihrer letzten <strong>${categoryName}</strong>-Behandlung bei EPILISSE.
          Damit die Wirkung optimal bleibt, empfehlen wir eine baldige Auffrischung.
          Wir freuen uns, Sie bald wieder bei uns begrüßen zu dürfen!
        </p>
      `,
    }),
  };
}

export function appointmentReminderEmail({
  customerName,
  serviceName,
  time,
  marketingConsentUrl,
}: {
  customerName: string;
  serviceName: string;
  time: string;
  marketingConsentUrl?: string | null;
}) {
  return {
    subject: `Erinnerung: Ihr Termin morgen um ${time} Uhr`,
    html: layout({
      heading: 'Erinnerung an Ihren Termin',
      bodyHtml: `
        <p style="font-size:14px;line-height:1.6;color:#333;margin:0">
          Liebe/r ${customerName},<br /><br />
          wir freuen uns, Sie morgen um <strong>${time} Uhr</strong> zu Ihrem Termin
          (<strong>${serviceName}</strong>) bei EPILISSE begrüßen zu dürfen.
          Falls Sie den Termin verschieben oder absagen möchten, melden Sie sich bitte rechtzeitig bei uns.
        </p>
        ${marketingConsentUrl ? marketingNudge(marketingConsentUrl) : ''}
      `,
    }),
  };
}

export function appointmentConfirmationEmail({
  customerName,
  serviceName,
  categoryName,
  dateLabel,
  time,
  durationMin,
  price,
  notes,
  marketingConsentUrl,
}: {
  customerName: string;
  serviceName: string;
  categoryName: string;
  dateLabel: string;
  time: string;
  durationMin: number;
  price: number | null;
  notes?: string | null;
  marketingConsentUrl?: string | null;
}) {
  return {
    subject: `Ihr Termin am ${dateLabel} um ${time} Uhr`,
    html: layout({
      heading: 'Terminbestätigung',
      bodyHtml: `
        <p style="font-size:14px;line-height:1.6;color:#333;margin:0 0 20px">
          Liebe/r ${customerName},<br /><br />
          wir bestätigen Ihnen hiermit gerne folgenden Termin bei EPILISSE:
        </p>
        <table style="width:100%;border-collapse:collapse;font-size:13px;color:${INK}">
          <tr>
            <td style="padding:8px 0;border-top:1px solid ${BORDER};color:${MUTED}">Service</td>
            <td style="padding:8px 0;border-top:1px solid ${BORDER};text-align:right">${serviceName}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;border-top:1px solid ${BORDER};color:${MUTED}">Kategorie</td>
            <td style="padding:8px 0;border-top:1px solid ${BORDER};text-align:right">${categoryName}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;border-top:1px solid ${BORDER};color:${MUTED}">Datum</td>
            <td style="padding:8px 0;border-top:1px solid ${BORDER};text-align:right">${dateLabel}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;border-top:1px solid ${BORDER};color:${MUTED}">Uhrzeit</td>
            <td style="padding:8px 0;border-top:1px solid ${BORDER};text-align:right">${time} Uhr</td>
          </tr>
          <tr>
            <td style="padding:8px 0;border-top:1px solid ${BORDER};color:${MUTED}">Dauer</td>
            <td style="padding:8px 0;border-top:1px solid ${BORDER};text-align:right">${durationMin} Minuten</td>
          </tr>
          ${price != null ? `
          <tr>
            <td style="padding:8px 0;border-top:1px solid ${BORDER};color:${MUTED}">Preis</td>
            <td style="padding:8px 0;border-top:1px solid ${BORDER};text-align:right">${price.toLocaleString('de-DE', { minimumFractionDigits: 2 })}&euro;</td>
          </tr>` : ''}
        </table>
        ${notes ? `<p style="font-size:12px;line-height:1.6;color:${MUTED};margin:16px 0 0"><strong>Notiz:</strong> ${notes}</p>` : ''}
        <p style="font-size:13px;line-height:1.6;color:${MUTED};margin:20px 0 0">
          Falls Sie den Termin verschieben oder absagen möchten, melden Sie sich bitte rechtzeitig bei uns.
        </p>
        ${marketingConsentUrl ? marketingNudge(marketingConsentUrl) : ''}
      `,
    }),
  };
}

export function consentRequestEmail({
  customerName,
  consentUrl,
}: {
  customerName: string;
  consentUrl: string;
}) {
  return {
    subject: 'Bitte bestätigen Sie Ihre Einwilligung',
    html: layout({
      heading: 'Ihre Einwilligung wird benötigt',
      bodyHtml: `
        <p style="font-size:14px;line-height:1.6;color:#333;margin:0 0 20px">
          Liebe/r ${customerName},<br /><br />
          schön, dass Sie bei EPILISSE registriert sind. Damit wir Ihre Daten im Rahmen unserer
          Terminvereinbarung und Behandlung datenschutzkonform verarbeiten dürfen, benötigen wir noch
          Ihre Einwilligung zur Datenschutzerklärung und zur Behandlungseinwilligung.
        </p>
        <div style="text-align:center;margin:24px 0">
          <a href="${consentUrl}" style="display:inline-block;background:${GOLD};color:#ffffff;text-decoration:none;padding:12px 28px;font-size:13px;letter-spacing:.05em;text-transform:uppercase">
            Einwilligung bestätigen
          </a>
        </div>
        <p style="font-size:12px;line-height:1.6;color:${MUTED};margin:0">
          Auf derselben Seite können Sie optional auch zustimmen, künftig Kampagnen und Vorteilspreise per E-Mail zu erhalten.
        </p>
      `,
    }),
  };
}

export async function sendEmail(to: string, content: { subject: string; html: string }) {
  const resend = getResend();
  return resend.emails.send({ from: FROM, to, subject: content.subject, html: content.html });
}
