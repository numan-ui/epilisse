import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { maybeSendConsentRequest } from '@/lib/consentRequest';
import { getAdminSession } from '@/lib/supabase/authServer';

export async function GET() {
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = supabaseServer();

  const { data: customers, error } = await supabase
    .from('customers')
    .select('*')
    .order('name');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: appointments, error: apptError } = await supabase
    .from('appointments')
    .select('customer_id, service_name, price, starts_at, status')
    .order('starts_at', { ascending: false });
  if (apptError) return NextResponse.json({ error: apptError.message }, { status: 500 });

  const byCustomer = new Map<string, typeof appointments>();
  for (const a of appointments ?? []) {
    const list = byCustomer.get(a.customer_id) ?? [];
    list.push(a);
    byCustomer.set(a.customer_id, list);
  }

  // Only appointments the admin actually confirmed ("geldi") count as real visits/revenue —
  // pending and cancelled ("gelmedi") ones don't.
  const enriched = (customers ?? []).map((c) => {
    const all = byCustomer.get(c.id) ?? [];
    const visits = all.filter((a) => a.status === 'confirmed');
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
  if (!(await getAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = supabaseServer();
  const body = await request.json();

  // Same email + same phone already on file → this is the same person, not a
  // new customer. (Same email with a different phone is left alone — could
  // legitimately be a different person sharing an inbox.)
  if (body.email && body.phone) {
    const { data: dup } = await supabase
      .from('customers')
      .select('id')
      .ilike('email', body.email)
      .eq('phone', body.phone)
      .maybeSingle();
    if (dup) {
      return NextResponse.json(
        { error: 'Eine Kundin mit dieser E-Mail und Telefonnummer existiert bereits.' },
        { status: 409 }
      );
    }
  }

  const { data, error } = await supabase
    .from('customers')
    .insert({
      name: body.name,
      phone: body.phone ?? null,
      email: body.email ?? null,
      tags: body.tags ?? [],
      notes: body.notes ?? '',
      gender: body.gender ?? 'keine_angabe',
      class: body.class ?? null,
      category: body.category ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Customers added directly by admin skip the public booking form's consent
  // checkboxes — send them a consent-request email so Datenschutz (mandatory)
  // and, if their category is Laser, Behandlungseinwilligung get confirmed
  // before/alongside their first real appointment.
  await maybeSendConsentRequest(supabase, data, data.category === 'laser');

  return NextResponse.json(data, { status: 201 });
}
