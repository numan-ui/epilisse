import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';
import { consentRequestEmail, sendEmail, getSiteUrl, CONSENT_BCC_EMAIL } from '@/lib/email/resend';
import { signConsentToken } from '@/lib/consentToken';
import { getRemainingEmailQuota, logEmailSent } from '@/lib/emailQuota';
import { wasConsentRequestSentToday } from '@/lib/consentLog';

interface ConsentCustomer {
  id: string;
  name: string;
  email: string | null;
  consent_datenschutz_at: string | null;
  consent_behandlung_at: string | null;
  consent_request_last_sent_at: string | null;
  consent_request_behandlung_sent_at: string | null;
}

// A customer's `category` is just their admin-set primary interest at signup
// time — it never updates when they later book a different category. So
// whether Behandlungseinwilligung is actually required has to also check for
// any real (non-cancelled) Laser appointment on file, not just that one field.
export async function customerRequiresBehandlung(
  supabase: SupabaseClient<Database>,
  customerId: string,
  category: string | null
): Promise<boolean> {
  if (category === 'laser') return true;
  const { data } = await supabase
    .from('appointments')
    .select('id')
    .eq('customer_id', customerId)
    .eq('category_id', 'laser')
    .neq('status', 'cancelled')
    .limit(1)
    .maybeSingle();
  return !!data;
}

// Behandlungseinwilligung is only legally relevant for Laser-Haarentfernung —
// every other category only ever needs Datenschutz (+ optional Marketing), so
// callers pass whether the customer's current context (their on-file category,
// or the category of an appointment just created for them) requires it.
//
// A newly-surfaced Behandlung requirement (e.g. a Laser appointment booked for
// a customer who was only ever asked for Datenschutz) must go out right away,
// so it's deduped against its own timestamp column rather than the general one
// — otherwise an earlier, unrelated request sent the same day would suppress it.
export async function maybeSendConsentRequest(
  supabase: SupabaseClient<Database>,
  customer: ConsentCustomer,
  requiresBehandlung: boolean
) {
  if (!customer.email) return;

  const missingDatenschutz = !customer.consent_datenschutz_at;
  const missingBehandlung = requiresBehandlung && !customer.consent_behandlung_at;
  if (!missingDatenschutz && !missingBehandlung) return;

  const alreadySentToday = missingBehandlung
    ? wasConsentRequestSentToday(customer.consent_request_behandlung_sent_at)
    : wasConsentRequestSentToday(customer.consent_request_last_sent_at);
  if (alreadySentToday) return;

  try {
    if ((await getRemainingEmailQuota(supabase)) <= 0) return;
    const token = signConsentToken(customer.id);
    const consentUrl = `${getSiteUrl()}/de/einwilligung?c=${customer.id}&t=${token}`;
    await sendEmail(
      customer.email,
      consentRequestEmail({
        customerName: customer.name,
        consentUrl,
        includeDatenschutz: missingDatenschutz,
        includeBehandlung: missingBehandlung,
      }),
      { bcc: CONSENT_BCC_EMAIL }
    );
    await logEmailSent(supabase, 'consent_request', { customerId: customer.id, email: customer.email });
    const now = new Date().toISOString();
    const updates: { consent_request_last_sent_at: string; consent_request_behandlung_sent_at?: string } = {
      consent_request_last_sent_at: now,
    };
    if (missingBehandlung) updates.consent_request_behandlung_sent_at = now;
    await supabase.from('customers').update(updates).eq('id', customer.id);
  } catch (err) {
    console.error('consent_request email failed:', err);
  }
}
