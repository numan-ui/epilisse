import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/resend';
import { getRemainingEmailQuota, logEmailSent } from '@/lib/emailQuota';
import { checkPasswordResetRateLimit, getClientIp } from '@/lib/rateLimit';

// Public endpoint (called from the logged-out login page). Never confirms or
// denies whether the email belongs to an admin account — just notifies every
// super_admin so they can reset the password from the Team page themselves.
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = (body.email as string)?.trim();
  if (!email) return NextResponse.json({ ok: true });

  const supabase = supabaseServer();

  const ip = getClientIp(request);
  if (!(await checkPasswordResetRateLimit(supabase, ip))) {
    return NextResponse.json({ ok: true }); // silently drop — don't reveal rate limiting to a possible attacker
  }

  const { data, error } = await supabase.auth.admin.listUsers();
  if (!error) {
    const superAdmins = data.users.filter((u) => u.app_metadata?.role === 'super_admin');
    for (const sa of superAdmins) {
      if (!sa.email) continue;
      if ((await getRemainingEmailQuota(supabase)) <= 0) break;
      try {
        await sendEmail(sa.email, {
          subject: 'EPILISSE Admin — Passwort-Reset angefragt',
          html: `<p>${email} hat im Admin-Login auf "Passwort vergessen?" geklickt.</p><p>Setze das Passwort im Team-Bereich zurück: <a href="${process.env.NEXT_PUBLIC_SITE_URL}/de/admin/team">Team-Verwaltung öffnen</a></p>`,
        });
        await logEmailSent(supabase, 'admin_password_reset', { email: sa.email });
      } catch {
        // Best-effort notification — don't leak send failures to the requester.
      }
    }
  }

  return NextResponse.json({ ok: true });
}
