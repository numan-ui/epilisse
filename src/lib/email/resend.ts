import { Resend } from 'resend';

// resend.com dashboard: verify a sending domain (e.g. epilisse.de) before any
// send will actually deliver — the API key alone isn't enough. Until a domain
// is verified there, set RESEND_FROM_EMAIL to Resend's sandbox sender
// (onboarding@resend.dev) so sends succeed during testing.
const FROM = process.env.RESEND_FROM_EMAIL || 'EPILISSE <no-reply@epilisse.de>';

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
          <p style="margin:0;font-size:26px;font-weight:700;letter-spacing:.08em;color:${GOLD};text-transform:uppercase;font-family:Georgia,'Times New Roman',serif">EPILISSE</p>
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
  includeDatenschutz = true,
  includeBehandlung = true,
}: {
  customerName: string;
  consentUrl: string;
  includeDatenschutz?: boolean;
  includeBehandlung?: boolean;
}) {
  // Only name the consent(s) actually still missing — a customer who already
  // granted Datenschutz shouldn't be told we "still need" it again just
  // because a later, unrelated Behandlung requirement surfaced.
  const needed: string[] = [];
  if (includeDatenschutz) needed.push('Datenschutzerklärung');
  if (includeBehandlung) needed.push('Behandlungseinwilligung');
  const neededText = needed.length === 2 ? `${needed[0]} und zur ${needed[1]}` : (needed[0] ?? 'Einwilligung');

  return {
    subject: 'Bitte bestätigen Sie Ihre Einwilligung',
    html: layout({
      heading: 'Ihre Einwilligung wird benötigt',
      bodyHtml: `
        <p style="font-size:14px;line-height:1.6;color:#333;margin:0 0 20px">
          Liebe/r ${customerName},<br /><br />
          schön, dass Sie bei EPILISSE registriert sind. Damit wir Ihre Daten im Rahmen unserer
          Terminvereinbarung${includeBehandlung ? ' und Behandlung' : ''} datenschutzkonform verarbeiten dürfen, benötigen wir noch
          Ihre Einwilligung zur ${neededText}.
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

export function consentConfirmedEmail({
  customerName,
  manageUrl,
  marketingGranted,
}: {
  customerName: string;
  manageUrl: string;
  marketingGranted: boolean;
}) {
  return {
    subject: 'Vielen Dank für Ihre Einwilligung',
    html: layout({
      heading: 'Vielen Dank!',
      bodyHtml: `
        <p style="font-size:14px;line-height:1.6;color:#333;margin:0 0 16px">
          Liebe/r ${customerName},<br /><br />
          vielen Dank, dass Sie Ihre Einwilligung zur Datenschutzerklärung und Behandlungseinwilligung bestätigt haben.
          ${marketingGranted ? 'Sie erhalten künftig auch exklusive Kampagnen und Vorteilspreise per E-Mail.' : ''}
        </p>
        <p style="font-size:12px;line-height:1.6;color:${MUTED};margin:0">
          Diese Bestätigung dient als Nachweis Ihrer Einwilligung. Über den folgenden Link können Sie Ihre
          Einwilligungen jederzeit einsehen oder den Erhalt von Kampagnen-E-Mails widerrufen:
        </p>
        <div style="text-align:center;margin:20px 0">
          <a href="${manageUrl}" style="display:inline-block;border:1px solid ${GOLD};color:${GOLD};text-decoration:none;padding:10px 24px;font-size:12px;letter-spacing:.05em;text-transform:uppercase">
            Einwilligungen verwalten
          </a>
        </div>
        <p style="font-size:11px;line-height:1.6;color:#8a8a86;margin:0">
          Die Datenschutz- und Behandlungseinwilligung ist Voraussetzung für unsere Zusammenarbeit — für einen
          vollständigen Widerruf kontaktieren Sie uns bitte direkt.
        </p>
      `,
    }),
  };
}

// Consent (Einwilligung) mails are archived to an internal EPILISSE inbox via
// BCC, set here rather than hardcoded so it can be swapped once a real
// epilisse.de address exists.
export const CONSENT_BCC_EMAIL = process.env.CONSENT_BCC_EMAIL || undefined;

export async function sendEmail(to: string, content: { subject: string; html: string }, options?: { bcc?: string }) {
  const resend = getResend();
  const result = await resend.emails.send({
    from: FROM,
    to,
    subject: content.subject,
    html: content.html,
    ...(options?.bcc ? { bcc: options.bcc } : {}),
  });
  // The SDK resolves (doesn't throw) even when Resend rejects the send — e.g.
  // an unverified sending domain — so an unchecked result silently looks like
  // success and gets logged as "sent" even though nothing was delivered.
  if (result.error) throw new Error(`Resend error: ${result.error.message}`);
  return result;
}
