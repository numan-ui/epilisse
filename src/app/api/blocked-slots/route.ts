import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { getAdminSession } from '@/lib/supabase/authServer';

export async function GET(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = supabaseServer();
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  let query = supabase.from('blocked_slots').select('*').order('starts_at');
  if (from) query = query.gte('starts_at', from);
  if (to) query = query.lte('starts_at', to);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const flattened = (data ?? []).map((row) => ({
    id: row.id,
    startsAt: row.starts_at,
    durationMin: row.duration_min,
    reason: row.reason,
  }));

  return NextResponse.json(flattened);
}

export async function POST(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = supabaseServer();
  const body = await request.json();

  if (!body.startsAt) {
    return NextResponse.json({ error: 'startsAt is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('blocked_slots')
    .insert({
      starts_at: body.startsAt,
      duration_min: body.durationMin ?? 30,
      reason: body.reason ?? '',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
