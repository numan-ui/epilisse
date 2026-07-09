import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = supabaseServer();
  const { error } = await supabase.from('blocked_slots').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
