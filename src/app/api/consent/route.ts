import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { verifyConsentToken } from '@/lib/consentToken';
import { consentConfirmedEmail, sendEmail, getSiteUrl, CONSENT_BCC_EMAIL } from '@/lib/email/resend';
import { getRemainingEmailQuota, logEmailSent } from '@/lib/emailQuota';
import { logConsentEvent } from '@/lib/consentLog';
import { customerRequiresBehandlung } from '@/lib/consentRequest';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get('customerId') ?? '';
  const token = searchParams.get('token') ?? '';

  if (!customerId || !verifyConsentToken(customerId, token)) {
    return NextResponse.json({ error: 'Ungültiger Link' }, { status: 401 });
  }

  const supabase = supabaseServer();
  const { data: customer, error } = await supabase
    .from('customers')
    .select('name, category, consent_datenschutz_at, consent_behandlung_at, consent_marketing_at')
    .eq('id', customerId)
    .single();
  if (error || !customer) return NextResponse.json({ error: 'Kundin nicht gefunden' }, { status: 404 });

  return NextResponse.json({
    name: customer.name,
    datenschutz: !!customer.consent_datenschutz_at,
    behandlung: !!customer.consent_behandlung_at,
    marketing: !!customer.consent_marketing_at,
    requiresBehandlung: await customerRequiresBehandlung(supabase, customerId, customer.category),
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { customerId, token, datenschutz, behandlung, marketing } = body as {
    customerId: string; token: string; datenschutz: boolean; behandlung: boolean; marketing: boolean;
  };

  if (!customerId || !verifyConsentToken(customerId, token)) {
    return NextResponse.json({ error: 'Ungültiger Link' }, { status: 401 });
  }

  const supabase = supabaseServer();
  const { data: customer, error: fetchError } = await supabase
    .from('customers')
    .select('name, email, category, consent_datenschutz_at, consent_behandlung_at, consent_marketing_at')
    .eq('id', customerId)
    .single();
  if (fetchError || !customer) return NextResponse.json({ error: 'Kundin nicht gefunden' }, { status: 404 });

  const requiresBehandlung = await customerRequiresBehandlung(supabase, customerId, customer.category);
  if (!datenschutz || (requiresBehandlung && !behandlung)) {
    return NextResponse.json({ error: 'Datenschutz und Behandlungseinwilligung sind erforderlich.' }, { status: 400 });
  }

  const now = new Date().toISOString();
  const wasMarketingGranted = !!customer.consent_marketing_at;
  const isFirstConfirmation = !customer.consent_datenschutz_at || (requiresBehandlung && !customer.consent_behandlung_at);

  const { error } = await supabase
    .from('customers')
    .update({
      consent_datenschutz_at: customer.consent_datenschutz_at ?? now,
      consent_behandlung_at: requiresBehandlung && behandlung ? (customer.consent_behandlung_at ?? now) : customer.consent_behandlung_at,
      consent_marketing_at: marketing ? (customer.consent_marketing_at ?? now) : null,
      updated_at: now,
    })
    .eq('id', customerId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (!customer.consent_datenschutz_at) await logConsentEvent(supabase, customerId, 'datenschutz', 'granted', 'einwilligung_link');
  if (requiresBehandlung && behandlung && !customer.consent_behandlung_at) await logConsentEvent(supabase, customerId, 'behandlung', 'granted', 'einwilligung_link');
  if (marketing && !wasMarketingGranted) await logConsentEvent(supabase, customerId, 'marketing', 'granted', 'einwilligung_link');
  if (!marketing && wasMarketingGranted) await logConsentEvent(supabase, customerId, 'marketing', 'withdrawn', 'einwilligung_link');

  if (isFirstConfirmation && customer.email) {
    try {
      if ((await getRemainingEmailQuota(supabase)) > 0) {
        const manageUrl = `${getSiteUrl()}/de/einwilligung?c=${customerId}&t=${token}`;
        await sendEmail(
          customer.email,
          consentConfirmedEmail({ customerName: customer.name, manageUrl, marketingGranted: marketing }),
          { bcc: CONSENT_BCC_EMAIL }
        );
        await logEmailSent(supabase, 'consent_request', { customerId, email: customer.email });
      }
    } catch (err) {
      console.error('consent_confirmed email failed:', err);
    }
  }

  return NextResponse.json({ ok: true });
}
