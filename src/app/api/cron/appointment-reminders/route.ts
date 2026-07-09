import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { appointmentReminderEmail, sendEmail, getSiteUrl } from '@/lib/email/resend';
import { getRemainingEmailQuota, logEmailSent } from '@/lib/emailQuota';
import { signConsentToken } from '@/lib/consentToken';

export async function GET(request: Request) {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = supabaseServer();

  // "Tomorrow" relative to the naive salon-local clock (starts_at is stored
  // literally, no timezone conversion — see BookingModal/Termine admin).
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  const tomorrowDate = tomorrow.toISOString().slice(0, 10);
  const dayStart = `${tomorrowDate}T00:00:00.000Z`;
  const dayEnd = `${tomorrowDate}T23:59:59.999Z`;

  const { data: appointments, error } = await supabase
    .from('appointments')
    .select('id, customer_id, service_name, starts_at, customers(name, email, consent_datenschutz_at, consent_marketing_at)')
    .neq('status', 'cancelled')
    .eq('reminder_sent', false)
    .gte('starts_at', dayStart)
    .lte('starts_at', dayEnd);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let sent = 0;
  let skipped = 0;
  let quotaRemaining = await getRemainingEmailQuota(supabase);

  for (const appt of appointments ?? []) {
    if (quotaRemaining <= 0) { skipped++; continue; }
    if (!appt.customers?.email) { skipped++; continue; }
    if (!appt.customers?.consent_datenschutz_at) { skipped++; continue; }

    const d = new Date(appt.starts_at);
    const time = `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
    const content = appointmentReminderEmail({
      customerName: appt.customers.name,
      serviceName: appt.service_name,
      time,
      marketingConsentUrl: appt.customers.consent_marketing_at
        ? null
        : `${getSiteUrl()}/de/einwilligung?c=${appt.customer_id}&t=${signConsentToken(appt.customer_id)}`,
    });

    try {
      await sendEmail(appt.customers.email, content);
      await supabase.from('appointments').update({ reminder_sent: true }).eq('id', appt.id);
      await logEmailSent(supabase, 'appointment_reminder', { customerId: appt.customer_id, email: appt.customers.email });
      quotaRemaining--;
      sent++;
    } catch {
      skipped++;
    }
  }

  return NextResponse.json({ sent, skipped });
}
