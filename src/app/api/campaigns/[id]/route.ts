import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
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

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
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
