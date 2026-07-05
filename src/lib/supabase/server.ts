import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Server-only Supabase client using the service-role key, which bypasses RLS.
// Only import this from route handlers under src/app/api/** — never from a
// 'use client' component, since the service-role key must never reach the browser.
export function supabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
  }
  return createClient<Database>(url, key, {
    auth: { persistSession: false },
  });
}
