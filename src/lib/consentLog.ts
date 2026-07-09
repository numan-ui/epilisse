import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';

export type ConsentKind = 'datenschutz' | 'behandlung' | 'marketing';
export type ConsentSource = 'booking' | 'einwilligung_link' | 'admin';

// Creating a customer and then booking their first appointment minutes later
// shouldn't fire two separate "please confirm consent" emails the same day.
export function wasConsentRequestSentToday(lastSentAt: string | null): boolean {
  if (!lastSentAt) return false;
  const last = new Date(lastSentAt);
  const now = new Date();
  return (
    last.getUTCFullYear() === now.getUTCFullYear() &&
    last.getUTCMonth() === now.getUTCMonth() &&
    last.getUTCDate() === now.getUTCDate()
  );
}

export async function logConsentEvent(
  supabase: SupabaseClient<Database>,
  customerId: string,
  kind: ConsentKind,
  action: 'granted' | 'withdrawn',
  source: ConsentSource
) {
  await supabase.from('consent_log').insert({ customer_id: customerId, kind, action, source });
}
