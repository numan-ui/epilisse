import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

interface BookingService {
  name: string;
  price: number | null;
  durationMin: number;
}

interface BookingBody {
  name: string;
  email: string;
  phone: string;
  categoryId: string;
  services: BookingService[];
  startsAt: string;
  notes?: string;
}

export async function POST(request: Request) {
  const body: BookingBody = await request.json();

  if (!body.name?.trim() || !body.email?.trim() || !body.phone?.trim()) {
    return NextResponse.json({ error: 'Name, E-Mail und Telefon sind erforderlich.' }, { status: 400 });
  }
  if (!body.categoryId || !Array.isArray(body.services) || body.services.length === 0) {
    return NextResponse.json({ error: 'Bitte mindestens einen Service auswählen.' }, { status: 400 });
  }
  if (!body.startsAt) {
    return NextResponse.json({ error: 'Bitte Datum und Uhrzeit auswählen.' }, { status: 400 });
  }

  const supabase = supabaseServer();
  const email = body.email.trim().toLowerCase();

  const { data: existing, error: findError } = await supabase
    .from('customers')
    .select('id')
    .ilike('email', email)
    .maybeSingle();
  if (findError) return NextResponse.json({ error: findError.message }, { status: 500 });

  let customerId = existing?.id as string | undefined;

  if (!customerId) {
    const { data: created, error: createError } = await supabase
      .from('customers')
      .insert({ name: body.name.trim(), email, phone: body.phone.trim() })
      .select('id')
      .single();
    if (createError) return NextResponse.json({ error: createError.message }, { status: 500 });
    customerId = created.id;
  }

  const rows = body.services.map((svc) => ({
    customer_id: customerId,
    category_id: body.categoryId,
    service_name: svc.name,
    price: svc.price,
    starts_at: body.startsAt,
    duration_min: svc.durationMin,
    status: 'pending' as const,
    notes: body.notes ?? '',
  }));

  const { data: appointments, error: apptError } = await supabase
    .from('appointments')
    .insert(rows)
    .select();
  if (apptError) return NextResponse.json({ error: apptError.message }, { status: 500 });

  return NextResponse.json({ customerId, appointments }, { status: 201 });
}
