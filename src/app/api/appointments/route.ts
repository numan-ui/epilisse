import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = supabaseServer();
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  let query = supabase
    .from('appointments')
    .select('*, customers(name, phone), categories(name)')
    .order('starts_at');

  if (from) query = query.gte('starts_at', from);
  if (to) query = query.lte('starts_at', to);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const flattened = (data ?? []).map((a) => ({
    id: a.id,
    customerId: a.customer_id,
    customerName: a.customers?.name ?? '',
    customerPhone: a.customers?.phone ?? '',
    categoryId: a.category_id,
    categoryName: a.categories?.name ?? '',
    serviceName: a.service_name,
    price: a.price,
    startsAt: a.starts_at,
    durationMin: a.duration_min,
    status: a.status,
    notes: a.notes,
  }));

  return NextResponse.json(flattened);
}

export async function POST(request: Request) {
  const supabase = supabaseServer();
  const body = await request.json();

  const { data, error } = await supabase
    .from('appointments')
    .insert({
      customer_id: body.customerId,
      category_id: body.categoryId,
      service_name: body.serviceName,
      price: body.price ?? null,
      starts_at: body.startsAt,
      duration_min: body.durationMin ?? 30,
      status: body.status ?? 'confirmed',
      notes: body.notes ?? '',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
