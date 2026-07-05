import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/database.types';

type AppointmentUpdate = Database['public']['Tables']['appointments']['Update'];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = supabaseServer();
  const body = await request.json();

  const patch: AppointmentUpdate = { updated_at: new Date().toISOString() };
  if ('customerId' in body) patch.customer_id = body.customerId;
  if ('categoryId' in body) patch.category_id = body.categoryId;
  if ('serviceName' in body) patch.service_name = body.serviceName;
  if ('price' in body) patch.price = body.price;
  if ('startsAt' in body) patch.starts_at = body.startsAt;
  if ('durationMin' in body) patch.duration_min = body.durationMin;
  if ('status' in body) patch.status = body.status;
  if ('notes' in body) patch.notes = body.notes;

  const { data, error } = await supabase.from('appointments').update(patch).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = supabaseServer();
  const { error } = await supabase.from('appointments').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
