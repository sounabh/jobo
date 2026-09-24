import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/** Next.js 16 proxy (replaces deprecated middleware.ts) — protects /dashboard */
//passes the request to updateSession() and returns whatever response updateSession() produces.

//request is the incoming HTTP request made to your Next.js app.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)", //static assets are unaffected auto done by next js
  ],
};



// User → proxy.ts → Check session/auth → Allow or redirect → Page
/** a request-level gatekeeper that runs before matching pages/routes, allowing you to maintain Supabase sessions and protect authenticated areas like /dashboard. */