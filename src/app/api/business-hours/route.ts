import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { getAdminSession } from '@/lib/supabase/authServer';

export async function GET() {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = supabaseServer();
  const { data, error } = await supabase.from('business_hours').select('*').order('weekday');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const flattened = (data ?? []).map((row) => ({
    weekday: row.weekday,
    dayLabel: row.day_label,
    open: row.open_time.slice(0, 5),
    close: row.close_time.slice(0, 5),
    closed: row.closed,
  }));

  return NextResponse.json(flattened);
}

export async function PATCH(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = supabaseServer();
  const body = await request.json();

  if (typeof body.weekday !== 'number') {
    return NextResponse.json({ error: 'weekday is required' }, { status: 400 });
  }

  const update: { updated_at: string; open_time?: string; close_time?: string; closed?: boolean } = {
    updated_at: new Date().toISOString(),
  };
  if (body.open !== undefined) update.open_time = body.open;
  if (body.close !== undefined) update.close_time = body.close;
  if (body.closed !== undefined) update.closed = body.closed;

  const { error } = await supabase.from('business_hours').update(update).eq('weekday', body.weekday);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
