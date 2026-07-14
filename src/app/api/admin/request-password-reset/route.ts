import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email/resend';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

// Public endpoint (called from the logged-out login page). Never confirms or
// denies whether the email belongs to an admin account — just notifies every
// super_admin so they can reset the password from the Team page themselves.
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = (body.email as string)?.trim();
  if (!email) return NextResponse.json({ ok: true });

  const supabase = adminClient();
  const { data, error } = await supabase.auth.admin.listUsers();
  if (!error) {
    const superAdmins = data.users.filter((u) => u.app_metadata?.role === 'super_admin');
    for (const sa of superAdmins) {
      if (!sa.email) continue;
      try {
        await sendEmail(sa.email, {
          subject: 'EPILISSE Admin — Passwort-Reset angefragt',
          html: `<p>${email} hat im Admin-Login auf "Passwort vergessen?" geklickt.</p><p>Setze das Passwort im Team-Bereich zurück: <a href="${process.env.NEXT_PUBLIC_SITE_URL}/de/admin/team">Team-Verwaltung öffnen</a></p>`,
        });
      } catch {
        // Best-effort notification — don't leak send failures to the requester.
      }
    }
  }

  return NextResponse.json({ ok: true });
}
