import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

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
  const filters: string[] = [];
  if (email) filters.push(`email.ilike.${email}`);
  if (phone) filters.push(`phone.eq.${phone}`);

  const { data, error } = await supabase
    .from('customers')
    .select('consent_datenschutz_at, consent_behandlung_at, consent_marketing_at')
    .or(filters.join(','))
    .limit(1)
    .maybeSingle();

  if (error || !data) return NextResponse.json({ found: false });

  return NextResponse.json({
    found: true,
    datenschutz: !!data.consent_datenschutz_at,
    behandlung: !!data.consent_behandlung_at,
    marketing: !!data.consent_marketing_at,
  });
}
