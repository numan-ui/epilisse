import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { checkConsentStatusRateLimit, getClientIp } from '@/lib/rateLimit';

// Public, privacy-safe lookup used by the booking form: a returning customer
// who already gave consent shouldn't be forced to re-tick the checkboxes.
// Only boolean flags go back to the client — never name/id/other PII.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email')?.trim().toLowerCase();
  const phone = searchParams.get('phone')?.trim();

  if (!email && !phone) {
    return NextResponse.json({ found: false });
  }

  const supabase = supabaseServer();

  if (!(await checkConsentStatusRateLimit(supabase, getClientIp(request)))) {
    return NextResponse.json({ error: 'Zu viele Anfragen. Bitte später erneut versuchen.' }, { status: 429 });
  }

  // Two bound queries instead of a hand-built .or() filter string — the old
  // version interpolated raw user input into PostgREST filter syntax, letting
  // commas/wildcards in email/phone inject extra filter clauses.
  let data = null;
  if (email) {
    const { data: byEmail } = await supabase
      .from('customers')
      .select('consent_datenschutz_at, consent_behandlung_at, consent_marketing_at')
      .ilike('email', email)
      .limit(1)
      .maybeSingle();
    data = byEmail;
  }
  if (!data && phone) {
    const { data: byPhone } = await supabase
      .from('customers')
      .select('consent_datenschutz_at, consent_behandlung_at, consent_marketing_at')
      .eq('phone', phone)
      .limit(1)
      .maybeSingle();
    data = byPhone;
  }

  if (!data) return NextResponse.json({ found: false });

  return NextResponse.json({
    found: true,
    datenschutz: !!data.consent_datenschutz_at,
    behandlung: !!data.consent_behandlung_at,
    marketing: !!data.consent_marketing_at,
  });
}
