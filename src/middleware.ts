import { type NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

// Routes that intentionally bypass auth.
//   /api/update-status: n8n callback. Will be protected by HMAC in Phase 2B.
//   /api/share/*:       public read of share tokens (Phase 4A).
const API_PUBLIC_PATHS = [/^\/api\/update-status(\/.*)?$/, /^\/api\/share(\/.*)?$/];

// Pages that are public (no session required).
const PUBLIC_PAGE_PATHS = [
  /^\/$/,
  /^\/login(\/.*)?$/,
  /^\/auth(\/.*)?$/,
  /^\/c\/.+$/, // public certificate viewer (Phase 4A)
  /^\/tutorials(\/.*)?$/,
];

function isApiPublic(pathname: string): boolean {
  return API_PUBLIC_PATHS.some((re) => re.test(pathname));
}

function isPagePublic(pathname: string): boolean {
  return PUBLIC_PAGE_PATHS.some((re) => re.test(pathname));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Build a response we can attach refreshed cookies to.
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // IMPORTANT: must call getUser() so that Supabase refreshes the auth cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Gate API routes
  if (pathname.startsWith("/api/")) {
    if (!isApiPublic(pathname) && !user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Sign in required" },
        { status: 401 },
      );
    }
    return response;
  }

  // Gate pages
  if (!isPagePublic(pathname) && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  // Match everything except next internals, public files, and image optimization.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|certificates/|fonts/|assets/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf|eot)$).*)",
  ],
};
