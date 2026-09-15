import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isAdminPath = /^\/(de|en)\/admin(\/|$)/.test(path);

  // Public pages (homepage, service pages, ...) never need the Supabase
  // auth-cookie refresh — skip it so they aren't gated on that network
  // round-trip. Only /admin/* pays for it.
  if (!isAdminPath) {
    return intlMiddleware(request);
  }

  const { response, user, role } = await updateSession(request);

  const isLoginPath = /^\/(de|en)\/admin\/login(\/|$)/.test(path);
  const isTeamPath = /^\/(de|en)\/admin\/team(\/|$)/.test(path);
  const locale = path.match(/^\/(de|en)\//)?.[1] ?? "de";

  if (!isLoginPath && !user) {
    return NextResponse.redirect(new URL(`/${locale}/admin/login`, request.url));
  }
  if (isTeamPath && role !== "super_admin") {
    return NextResponse.redirect(new URL(`/${locale}/admin`, request.url));
  }
  if (isLoginPath && user) {
    return NextResponse.redirect(new URL(`/${locale}/admin`, request.url));
  }

  const intlResponse = intlMiddleware(request);
  // Merge the Supabase-refreshed auth cookies onto next-intl's response so neither middleware's
  // cookie writes get silently dropped.
  response.cookies.getAll().forEach((c) => intlResponse.cookies.set(c));
  return intlResponse;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
