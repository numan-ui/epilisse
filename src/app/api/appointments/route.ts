import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { maybeSendConsentRequest } from '@/lib/consentRequest';
import { getAdminSession } from '@/lib/supabase/authServer';

export async function GET(request: Request) {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

  // Admin can create a customer with just a name (no email/phone required), then
  // add an email later and book them — that first appointment is when we need to
  // catch them up on the DSGVO consent they never got asked for. If this
  // appointment is Laser and Behandlungseinwilligung is still missing, that
  // request goes out immediately regardless of the customer's on-file category.
  const { data: customer } = await supabase
    .from('customers')
    .select('id, name, email, consent_datenschutz_at, consent_behandlung_at, consent_request_last_sent_at, consent_request_behandlung_sent_at')
    .eq('id', body.customerId)
    .maybeSingle();

  if (customer) {
    await maybeSendConsentRequest(supabase, customer, body.categoryId === 'laser');
  }

  return NextResponse.json(data, { status: 201 });
}
