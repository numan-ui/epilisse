import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { verifyConsentToken } from '@/lib/consentToken';

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
    .select('name, consent_datenschutz_at, consent_behandlung_at, consent_marketing_at')
    .eq('id', customerId)
    .single();
  if (error || !customer) return NextResponse.json({ error: 'Kundin nicht gefunden' }, { status: 404 });

  return NextResponse.json({
    name: customer.name,
    datenschutz: !!customer.consent_datenschutz_at,
    behandlung: !!customer.consent_behandlung_at,
    marketing: !!customer.consent_marketing_at,
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
  if (!datenschutz || !behandlung) {
    return NextResponse.json({ error: 'Datenschutz und Behandlungseinwilligung sind erforderlich.' }, { status: 400 });
  }

  const supabase = supabaseServer();
  const { data: customer, error: fetchError } = await supabase
    .from('customers')
    .select('consent_datenschutz_at, consent_behandlung_at, consent_marketing_at')
    .eq('id', customerId)
    .single();
  if (fetchError || !customer) return NextResponse.json({ error: 'Kundin nicht gefunden' }, { status: 404 });

  const now = new Date().toISOString();
  const { error } = await supabase
    .from('customers')
    .update({
      consent_datenschutz_at: customer.consent_datenschutz_at ?? now,
      consent_behandlung_at: customer.consent_behandlung_at ?? now,
      consent_marketing_at: marketing ? (customer.consent_marketing_at ?? now) : null,
      updated_at: now,
    })
    .eq('id', customerId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
