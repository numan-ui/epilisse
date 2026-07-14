import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { getAdminSession } from '@/lib/supabase/authServer';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const supabase = supabaseServer();

  const { data: campaign, error } = await supabase.from('campaigns').select('*').eq('id', id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });

  const { data: recipients, error: recError } = await supabase
    .from('campaign_recipients')
    .select('*, customers(name, email)')
    .eq('campaign_id', id);
  if (recError) return NextResponse.json({ error: recError.message }, { status: 500 });

  return NextResponse.json({ ...campaign, recipients: recipients ?? [] });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const supabase = supabaseServer();
  const body = await request.json();

  // Only the internal name label is editable after a campaign has gone out —
  // title/message/audience are historical record of what was actually sent.
  const { data, error } = await supabase
    .from('campaigns')
    .update({ name: body.name ?? null })
    .eq('id', id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const supabase = supabaseServer();

  const { data: campaign, error } = await supabase.from('campaigns').select('status').eq('id', id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  if (campaign.status !== 'draft') {
    return NextResponse.json({ error: 'Nur Entwürfe können gelöscht werden.' }, { status: 400 });
  }

  const { error: delError } = await supabase.from('campaigns').delete().eq('id', id);
  if (delError) return NextResponse.json({ error: delError.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
