import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { getAppointmentsForDate, getBlockedSlotsForDate, hasOverlap } from '@/lib/availability';

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
  consentDatenschutz: boolean;
  consentBehandlung: boolean;
  consentMarketing?: boolean;
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
  if (!body.consentDatenschutz || !body.consentBehandlung) {
    return NextResponse.json({ error: 'Zustimmung zu Datenschutz und Behandlung erforderlich.' }, { status: 400 });
  }

  const supabase = supabaseServer();

  const totalDurationMin = body.services.reduce((sum, svc) => sum + svc.durationMin, 0);
  const startsAtDate = new Date(body.startsAt);
  const dateStr = body.startsAt.slice(0, 10);
  const [existingAppointments, blockedSlots] = await Promise.all([
    getAppointmentsForDate(supabase, dateStr),
    getBlockedSlotsForDate(supabase, dateStr),
  ]);
  if (hasOverlap([...existingAppointments, ...blockedSlots], startsAtDate, totalDurationMin)) {
    return NextResponse.json({ error: 'Dieser Termin ist leider nicht mehr verfügbar.' }, { status: 409 });
  }

  const email = body.email.trim().toLowerCase();

  const { data: existingCustomer, error: findError } = await supabase
    .from('customers')
    .select('id, consent_datenschutz_at, consent_behandlung_at, consent_marketing_at')
    .ilike('email', email)
    .maybeSingle();
  if (findError) return NextResponse.json({ error: findError.message }, { status: 500 });

  let customerId = existingCustomer?.id as string | undefined;
  const now = new Date().toISOString();

  if (!customerId) {
    const { data: created, error: createError } = await supabase
      .from('customers')
      .insert({
        name: body.name.trim(),
        email,
        phone: body.phone.trim(),
        consent_datenschutz_at: now,
        consent_behandlung_at: now,
        consent_marketing_at: body.consentMarketing ? now : null,
      })
      .select('id')
      .single();
    if (createError) return NextResponse.json({ error: createError.message }, { status: 500 });
    customerId = created.id;
  } else if (existingCustomer) {
    const updates: { consent_datenschutz_at?: string; consent_behandlung_at?: string; consent_marketing_at?: string } = {};
    if (!existingCustomer.consent_datenschutz_at) updates.consent_datenschutz_at = now;
    if (!existingCustomer.consent_behandlung_at) updates.consent_behandlung_at = now;
    if (!existingCustomer.consent_marketing_at && body.consentMarketing) updates.consent_marketing_at = now;
    if (Object.keys(updates).length > 0) {
      await supabase.from('customers').update(updates).eq('id', customerId);
    }
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
