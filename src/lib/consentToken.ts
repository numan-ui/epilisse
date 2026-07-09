import crypto from 'crypto';

// Lets an unauthenticated customer open a consent link from an email and
// confirm/withdraw consent without a login system. Signed with an HMAC so the
// customerId in the URL can't be swapped to view/edit someone else's consent.
function secret() {
  return process.env.CONSENT_TOKEN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'dev-only-fallback-secret';
}

export function signConsentToken(customerId: string): string {
  return crypto.createHmac('sha256', secret()).update(customerId).digest('hex');
}

export function verifyConsentToken(customerId: string, token: string): boolean {
  if (!token) return false;
  const expected = signConsentToken(customerId);
  const a = Buffer.from(expected);
  const b = Buffer.from(token);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
