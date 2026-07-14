import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { getAdminSession } from '@/lib/supabase/authServer';
import type { Database } from '@/lib/supabase/database.types';

type CustomerUpdate = Database['public']['Tables']['customers']['Update'];

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const supabase = supabaseServer();

  const { data: customer, error } = await supabase.from('customers').select('*').eq('id', id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });

  const { data: appointments, error: apptError } = await supabase
    .from('appointments')
    .select('*')
    .eq('customer_id', id)
    .order('starts_at', { ascending: false });
  if (apptError) return NextResponse.json({ error: apptError.message }, { status: 500 });

  return NextResponse.json({ ...customer, appointments: appointments ?? [] });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const supabase = supabaseServer();
  const body = await request.json();

  const patch: CustomerUpdate = { updated_at: new Date().toISOString() };
  for (const key of ['name', 'phone', 'email', 'tags', 'notes', 'gender', 'is_active', 'class'] as const) {
    if (key in body) patch[key] = body[key];
  }

  const { data, error } = await supabase.from('customers').update(patch).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const supabase = supabaseServer();
  const { error } = await supabase.from('customers').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
