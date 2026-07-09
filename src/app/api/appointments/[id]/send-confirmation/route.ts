import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { appointmentConfirmationEmail, sendEmail, getSiteUrl } from '@/lib/email/resend';
import { signConsentToken } from '@/lib/consentToken';
import { getRemainingEmailQuota, logEmailSent } from '@/lib/emailQuota';

const DE_MONTHS = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = supabaseServer();

  const { data: appt, error } = await supabase
    .from('appointments')
    .select('service_name, price, starts_at, duration_min, notes, customers(id, name, email, consent_marketing_at), categories(name)')
    .eq('id', id)
    .single();
  if (error || !appt) return NextResponse.json({ error: 'Termin nicht gefunden' }, { status: 404 });
  if (!appt.customers?.email) return NextResponse.json({ error: 'Kundin hat keine E-Mail-Adresse.' }, { status: 400 });

  if ((await getRemainingEmailQuota(supabase)) <= 0) {
    return NextResponse.json({ error: 'Tägliches E-Mail-Limit erreicht.' }, { status: 429 });
  }

  // starts_at is stored literally (naive wall-clock, no timezone conversion — see BookingModal/Termine admin).
  const d = new Date(appt.starts_at);
  const dateLabel = `${d.getUTCDate()}. ${DE_MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  const time = `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;

  let marketingConsentUrl: string | null = null;
  if (!appt.customers.consent_marketing_at) {
    const token = signConsentToken(appt.customers.id);
    marketingConsentUrl = `${getSiteUrl()}/de/einwilligung?c=${appt.customers.id}&t=${token}`;
  }

  const content = appointmentConfirmationEmail({
    customerName: appt.customers.name,
    serviceName: appt.service_name,
    categoryName: appt.categories?.name ?? '',
    dateLabel,
    time,
    durationMin: appt.duration_min,
    price: appt.price,
    notes: appt.notes,
    marketingConsentUrl,
  });

  try {
    await sendEmail(appt.customers.email, content);
    await logEmailSent(supabase, 'appointment_confirmation');
  } catch {
    return NextResponse.json({ error: 'E-Mail konnte nicht gesendet werden.' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
