import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { AdminRole } from './middleware';

/**
 * Reads the current session from the request cookies inside a Route Handler.
 * Returns null if there is no logged-in admin. Every admin-only API route
 * must call this and return 401 when it comes back null — the middleware
 * check on page navigation is not sufficient by itself, since API routes can
 * be called directly.
 */
export async function getAdminSession() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // Route handlers only read the session here; cookies are refreshed by the middleware.
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const role = (user.app_metadata?.role as AdminRole | undefined) ?? 'admin';
  return { user, role };
}
