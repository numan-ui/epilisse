import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { consentRequestEmail, sendEmail, getSiteUrl } from '@/lib/email/resend';
import { signConsentToken } from '@/lib/consentToken';
import { getRemainingEmailQuota, logEmailSent } from '@/lib/emailQuota';

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

  // Customers added directly by admin skip the public booking form's consent
  // checkboxes — send them a consent-request email so Datenschutz/Behandlung
  // (mandatory) get confirmed before/alongside their first real appointment.
  if (data.email && !data.consent_datenschutz_at && !data.consent_behandlung_at) {
    try {
      if ((await getRemainingEmailQuota(supabase)) > 0) {
        const token = signConsentToken(data.id);
        const consentUrl = `${getSiteUrl()}/de/einwilligung?c=${data.id}&t=${token}`;
        await sendEmail(data.email, consentRequestEmail({ customerName: data.name, consentUrl }));
        await logEmailSent(supabase, 'consent_request');
      }
    } catch {
      // Don't fail customer creation just because the consent email couldn't send.
    }
  }

  return NextResponse.json(data, { status: 201 });
}
