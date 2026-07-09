import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { followUpEmail, sendEmail } from '@/lib/email/resend';
import { getRemainingEmailQuota, logEmailSent } from '@/lib/emailQuota';

const MS_PER_DAY = 86_400_000;

export async function GET(request: Request) {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = supabaseServer();
  const { data: settings, error } = await supabase
    .from('category_follow_up_settings')
    .select('*, categories(name)')
    .eq('enabled', true);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let sent = 0;
  let skipped = 0;
  let quotaRemaining = await getRemainingEmailQuota(supabase);
  const now = Date.now();

  for (const setting of settings ?? []) {
    const cutoffDays = setting.renewal_interval_weeks * 7 - setting.reminder_lead_days;

    const { data: candidates, error: rpcError } = await supabase.rpc('latest_appointments_by_category', {
      p_category_id: setting.category_id,
    });
    if (rpcError) {
      return NextResponse.json({ error: rpcError.message }, { status: 500 });
    }

    for (const candidate of candidates ?? []) {
      if (quotaRemaining <= 0) { skipped++; continue; }

      const daysSince = (now - new Date(candidate.starts_at).getTime()) / MS_PER_DAY;
      if (daysSince < cutoffDays) { skipped++; continue; }

      const { data: existing } = await supabase
        .from('follow_up_reminders')
        .select('id')
        .eq('customer_id', candidate.customer_id)
        .eq('category_id', setting.category_id)
        .eq('appointment_id', candidate.appointment_id)
        .maybeSingle();
      if (existing) { skipped++; continue; }

      const { data: customer } = await supabase
        .from('customers')
        .select('name, email, consent_marketing_at')
        .eq('id', candidate.customer_id)
        .single();
      if (!customer?.email) { skipped++; continue; }
      if (!customer?.consent_marketing_at) { skipped++; continue; }

      const content = followUpEmail({
        customerName: customer.name,
        categoryName: setting.categories?.name ?? setting.category_id,
      });

      try {
        await sendEmail(customer.email, content);
        await supabase.from('follow_up_reminders').insert({
          customer_id: candidate.customer_id,
          category_id: setting.category_id,
          appointment_id: candidate.appointment_id,
        });
        await logEmailSent(supabase, 'follow_up');
        quotaRemaining--;
        sent++;
      } catch {
        skipped++;
      }
    }
  }

  return NextResponse.json({ sent, skipped });
}
