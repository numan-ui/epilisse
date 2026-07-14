import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { campaignEmail, sendEmail } from '@/lib/email/resend';
import { getRemainingEmailQuota, logEmailSent } from '@/lib/emailQuota';
import { getAdminSession } from '@/lib/supabase/authServer';

// Resolves the campaign's audience into campaign_recipients rows (if not
// already materialized at creation time, i.e. target_type is 'all'/'category'),
// then sends via Resend and flips each recipient's status. Safe to call more
// than once: recipients already 'sent' are skipped.
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const supabase = supabaseServer();

  const { data: campaign, error } = await supabase.from('campaigns').select('*').eq('id', id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  if (campaign.status === 'sent') {
    return NextResponse.json({ error: 'Kampagne wurde bereits gesendet.' }, { status: 400 });
  }

  await supabase.from('campaigns').update({ status: 'sending' }).eq('id', id);

  // Materialize the audience for 'all' / 'category' targets. For 'customers',
  // rows were already inserted at creation time (POST /api/campaigns).
  if (campaign.target_type !== 'customers') {
    let query = supabase.from('customers').select('id').not('email', 'is', null).not('consent_marketing_at', 'is', null);
    if (campaign.target_type === 'category') {
      const { data: apts } = await supabase
        .from('appointments')
        .select('customer_id')
        .eq('category_id', campaign.target_category_id!);
      const ids = [...new Set((apts ?? []).map((a) => a.customer_id))];
      if (ids.length === 0) {
        await supabase.from('campaigns').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', id);
        return NextResponse.json({ sent: 0, failed: 0 });
      }
      query = query.in('id', ids);
    }
    const { data: targetCustomers, error: targetError } = await query;
    if (targetError) return NextResponse.json({ error: targetError.message }, { status: 500 });

    const rows = (targetCustomers ?? []).map((c) => ({ campaign_id: id, customer_id: c.id }));
    if (rows.length > 0) {
      await supabase.from('campaign_recipients').upsert(rows, { onConflict: 'campaign_id,customer_id', ignoreDuplicates: true });
    }
  }

  const { data: recipients, error: recError } = await supabase
    .from('campaign_recipients')
    .select('*, customers(email, consent_marketing_at)')
    .eq('campaign_id', id)
    .eq('status', 'pending');
  if (recError) return NextResponse.json({ error: recError.message }, { status: 500 });

  const content = campaignEmail({
    title: campaign.title,
    message: campaign.message,
    discountLabel: campaign.discount_label,
  });

  let sent = 0;
  let failed = 0;
  let quotaExhausted = false;
  let quotaRemaining = await getRemainingEmailQuota(supabase);

  for (const r of recipients ?? []) {
    if (quotaRemaining <= 0) { quotaExhausted = true; break; }

    const email = r.customers?.email;
    if (!email) {
      await supabase.from('campaign_recipients').update({ status: 'failed', error: 'Keine E-Mail-Adresse' }).eq('id', r.id);
      failed++;
      continue;
    }
    if (!r.customers?.consent_marketing_at) {
      await supabase.from('campaign_recipients').update({ status: 'failed', error: 'Kein Marketing-Einverständnis' }).eq('id', r.id);
      failed++;
      continue;
    }
    try {
      await sendEmail(email, content);
      await supabase.from('campaign_recipients').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', r.id);
      await logEmailSent(supabase, 'campaign', { customerId: r.customer_id, email });
      quotaRemaining--;
      sent++;
    } catch (err) {
      await supabase.from('campaign_recipients').update({ status: 'failed', error: (err as Error).message }).eq('id', r.id);
      failed++;
    }
  }

  // Recipients left untouched here keep status 'pending' — not marked
  // 'failed' — so a re-send tomorrow (once quota resets) picks them up.
  if (!quotaExhausted) {
    await supabase.from('campaigns').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', id);
  }

  return NextResponse.json({ sent, failed, quotaExhausted });
}
