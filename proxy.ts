import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth/server";

const authMiddleware = auth.middleware({
  loginUrl: "/auth/sign-in",
});

// @neondatabase/auth's middleware only appends a refreshed session as
// Set-Cookie on the *response* (for the browser's next request) — it never
// updates the *current* request's Cookie header. That leaves the same
// request's Server Components looking at the stale cookie, so they try to
// refresh the session themselves and call `cookies().set()` during render,
// which Next.js forbids and throws. Merge the refreshed cookie into the
// outgoing request headers so downstream Server Components see it immediately.
export default async function proxy(request: NextRequest) {
  const response = await authMiddleware(request);
  if (response.headers.has("location")) return response;

  const freshCookies = response.headers.getSetCookie();
  if (freshCookies.length === 0) return response;

  const cookieJar = new Map<string, string>();
  for (const pair of (request.headers.get("cookie") ?? "").split(";")) {
    const eq = pair.indexOf("=");
    if (eq === -1) continue;
    cookieJar.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
  }
  for (const cookieHeader of freshCookies) {
    const pair = cookieHeader.split(";", 1)[0];
    const eq = pair.indexOf("=");
    if (eq === -1) continue;
    cookieJar.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("cookie", [...cookieJar].map(([name, value]) => `${name}=${value}`).join("; "));

  const forwarded = NextResponse.next({ request: { headers: requestHeaders } });
  for (const cookieHeader of freshCookies) forwarded.headers.append("Set-Cookie", cookieHeader);
  return forwarded;
}

export const config = {
  matcher: ["/", "/roadmap/:path*"],
};
