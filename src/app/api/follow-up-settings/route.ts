import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { getAdminSession } from '@/lib/supabase/authServer';

export async function GET() {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from('category_follow_up_settings')
    .select('*, categories(name)')
    .order('category_id');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const flattened = (data ?? []).map((row) => ({
    categoryId: row.category_id,
    categoryName: row.categories?.name ?? row.category_id,
    enabled: row.enabled,
    renewalIntervalWeeks: row.renewal_interval_weeks,
    reminderLeadDays: row.reminder_lead_days,
  }));

  return NextResponse.json(flattened);
}

export async function PATCH(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = supabaseServer();
  const body = await request.json();

  const { error } = await supabase
    .from('category_follow_up_settings')
    .update({
      enabled: body.enabled,
      renewal_interval_weeks: body.renewalIntervalWeeks,
      reminder_lead_days: body.reminderLeadDays,
      updated_at: new Date().toISOString(),
    })
    .eq('category_id', body.categoryId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
