import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { dbError } from '@/lib/apiError';
import { getAdminSession } from '@/lib/supabase/authServer';

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const supabase = supabaseServer();
  const { error } = await supabase.from('blocked_slots').delete().eq('id', id);
  if (error) return dbError('blocked-slots/[id]', error, 500);
  return NextResponse.json({ ok: true });
}
