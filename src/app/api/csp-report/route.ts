import { NextResponse } from 'next/server';

// Sink for Content-Security-Policy-Report-Only violations (see next.config.ts).
// Browsers POST a small JSON body here on each violation; we just log it so the
// reports show up in the Vercel function logs while the CSP is in observation
// mode. No auth, no DB — it's temporary and side-effect-free.
export async function POST(request: Request) {
  try {
    const text = await request.text();
    // Cap the logged size so a hostile client can't flood the logs.
    console.warn('[csp-report]', text.slice(0, 2000));
  } catch {
    // ignore malformed reports
  }
  return new NextResponse(null, { status: 204 });
}
