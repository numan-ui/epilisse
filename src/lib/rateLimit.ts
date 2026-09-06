import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}

/** Returns true if the IP is allowed to proceed; false if it has hit the rate limit for this action. */
export async function checkRateLimit(
  supabase: SupabaseClient<Database>,
  action: string,
  ip: string,
  { windowMs, maxAttempts }: { windowMs: number; maxAttempts: number }
): Promise<boolean> {
  const windowStart = new Date(Date.now() - windowMs).toISOString();
  const { count, error } = await supabase
    .from('rate_limit_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('action', action)
    .eq('ip', ip)
    .gte('created_at', windowStart);
  if (error) return true; // fail open — don't block on a rate-limit read error
  if ((count ?? 0) >= maxAttempts) return false;
  await supabase.from('rate_limit_attempts').insert({ action, ip });
  return true;
}

export const checkBookingRateLimit = (supabase: SupabaseClient<Database>, ip: string) =>
  checkRateLimit(supabase, 'book', ip, { windowMs: 10 * 60 * 1000, maxAttempts: 5 });

export const checkPasswordResetRateLimit = (supabase: SupabaseClient<Database>, ip: string) =>
  checkRateLimit(supabase, 'admin_password_reset', ip, { windowMs: 15 * 60 * 1000, maxAttempts: 3 });

// Public booking-form helpers. consent-status returns whether an email/phone
// belongs to a salon customer, so it's an enumeration target — keep it tight.
// availability is polled once per date the visitor previews; allow more.
export const checkConsentStatusRateLimit = (supabase: SupabaseClient<Database>, ip: string) =>
  checkRateLimit(supabase, 'consent_status', ip, { windowMs: 10 * 60 * 1000, maxAttempts: 20 });

export const checkAvailabilityRateLimit = (supabase: SupabaseClient<Database>, ip: string) =>
  checkRateLimit(supabase, 'availability', ip, { windowMs: 5 * 60 * 1000, maxAttempts: 80 });
