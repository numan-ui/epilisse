import { NextResponse } from 'next/server';

/**
 * Log a DB/internal error server-side (with route context) and return a
 * generic message to the client. Never leaks Postgres/Supabase error text
 * — column names, constraint names, SQL — to the browser.
 */
export function dbError(context: string, error: unknown, status = 500) {
  console.error(`[api] ${context}:`, error);
  const message =
    status === 404
      ? 'Nicht gefunden.'
      : status === 400
        ? 'Die Anfrage konnte nicht verarbeitet werden.'
        : 'Ein interner Fehler ist aufgetreten.';
  return NextResponse.json({ error: message }, { status });
}
