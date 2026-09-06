import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Supabase project origin — the browser auth client (src/lib/supabase/browser.ts)
// talks to it directly, so connect-src has to allow it.
const supabaseOrigin = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").origin;
  } catch {
    return "";
  }
})();
const supabaseWs = supabaseOrigin.replace(/^https:/, "wss:");

// Content-Security-Policy — shipped Report-Only first (2026-09-06 pre-launch
// audit item 5). It logs violations to /api/csp-report without blocking
// anything; once the reports come back clean under real traffic, flip the
// header key to "Content-Security-Policy" and drop 'unsafe-inline' from
// script-src (needs a nonce/middleware pass for Next's inline bootstrap).
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  // 'unsafe-inline' stays for now: Next app-router injects inline bootstrap
  // scripts with no nonce. Tighten when moving to enforcing mode.
  "script-src 'self' 'unsafe-inline'",
  // Inline <style id=\"theme-vars\"> + Google Fonts stylesheet (Material Symbols).
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob:",
  "font-src 'self' https://fonts.gstatic.com",
  `connect-src 'self' ${supabaseOrigin} ${supabaseWs}`.trim(),
  "frame-src 'none'",
  // "upgrade-insecure-requests" — add back when flipping to enforcing mode.
  // It's ignored (with a console warning) in Report-Only, so it's omitted here.
  "report-uri /api/csp-report",
].join("; ");

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Content-Security-Policy-Report-Only', value: csp },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
