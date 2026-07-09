import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function GET() {
  const supabase = supabaseServer();

  const { data: campaigns, error } = await supabase
    .from('campaigns')
    .select('*, target_category:target_category_id(name)')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: recipients, error: recError } = await supabase
    .from('campaign_recipients')
    .select('campaign_id, status');
  if (recError) return NextResponse.json({ error: recError.message }, { status: 500 });

  const counts = new Map<string, { total: number; sent: number; failed: number; pending: number }>();
  for (const r of recipients ?? []) {
    const c = counts.get(r.campaign_id) ?? { total: 0, sent: 0, failed: 0, pending: 0 };
    c.total += 1;
    if (r.status === 'sent') c.sent += 1;
    if (r.status === 'failed') c.failed += 1;
    if (r.status === 'pending') c.pending += 1;
    counts.set(r.campaign_id, c);
  }

  const enriched = (campaigns ?? []).map((c) => ({
    ...c,
    targetCategoryName: c.target_category?.name ?? null,
    recipientCounts: counts.get(c.id) ?? { total: 0, sent: 0, failed: 0, pending: 0 },
  }));

  return NextResponse.json(enriched);
}

export async function POST(request: Request) {
  const supabase = supabaseServer();
  const body = await request.json();

  const { data, error } = await supabase
    .from('campaigns')
    .insert({
      title: body.title,
      message: body.message,
      discount_label: body.discountLabel ?? null,
      target_type: body.targetType,
      target_category_id: body.targetType === 'category' ? body.targetCategoryId : null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // For target_type='customers', materialize the recipient rows now so the
  // draft already shows the intended audience before sending.
  if (body.targetType === 'customers' && Array.isArray(body.customerIds) && body.customerIds.length > 0) {
    const rows = body.customerIds.map((customer_id: string) => ({ campaign_id: data.id, customer_id }));
    const { error: recError } = await supabase.from('campaign_recipients').insert(rows);
    if (recError) return NextResponse.json({ error: recError.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
