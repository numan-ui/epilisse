import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';

// Browser-only Supabase client using the anon key — safe to expose, RLS-scoped.
// Only used for admin login/logout (auth.signInWithPassword / signOut).
export function supabaseBrowser() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
