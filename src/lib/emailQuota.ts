import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';

// Resend's free-tier daily send cap. Shared across follow-up reminders,
// appointment reminders, and campaigns so campaigns never push the account
// over the limit after reminders already used part of it that day.
export const DAILY_EMAIL_LIMIT = 100;

export type EmailKind = 'follow_up' | 'appointment_reminder' | 'campaign' | 'appointment_confirmation' | 'consent_request';

export async function getRemainingEmailQuota(supabase: SupabaseClient<Database>): Promise<number> {
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const { count, error } = await supabase
    .from('email_sends')
    .select('*', { count: 'exact', head: true })
    .gte('sent_at', todayStart.toISOString());
  if (error) return 0;
  return Math.max(0, DAILY_EMAIL_LIMIT - (count ?? 0));
}

export async function logEmailSent(supabase: SupabaseClient<Database>, kind: EmailKind): Promise<void> {
  await supabase.from('email_sends').insert({ kind });
}
