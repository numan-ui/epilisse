import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export async function GET() {
  const supabase = supabaseServer();

  const { data: customers, error } = await supabase
    .from('customers')
    .select('*')
    .order('name');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: appointments, error: apptError } = await supabase
    .from('appointments')
    .select('customer_id, service_name, price, starts_at, status')
    .neq('status', 'cancelled')
    .order('starts_at', { ascending: false });
  if (apptError) return NextResponse.json({ error: apptError.message }, { status: 500 });

  const byCustomer = new Map<string, typeof appointments>();
  for (const a of appointments ?? []) {
    const list = byCustomer.get(a.customer_id) ?? [];
    list.push(a);
    byCustomer.set(a.customer_id, list);
  }

  const enriched = (customers ?? []).map((c) => {
    const visits = byCustomer.get(c.id) ?? [];
    return {
      ...c,
      totalVisits: visits.length,
      totalSpent: visits.reduce((sum, v) => sum + (v.price ?? 0), 0),
      lastService: visits[0]?.service_name ?? null,
      lastVisit: visits[0]?.starts_at ?? null,
    };
  });

  return NextResponse.json(enriched);
}

export async function POST(request: Request) {
  const supabase = supabaseServer();
  const body = await request.json();

  const { data, error } = await supabase
    .from('customers')
    .insert({
      name: body.name,
      phone: body.phone ?? null,
      email: body.email ?? null,
      tags: body.tags ?? [],
      notes: body.notes ?? '',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
