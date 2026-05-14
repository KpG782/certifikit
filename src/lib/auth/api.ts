import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export type AuthedHandler<T> = (ctx: { user: User; req: Request }) => Promise<T>;

// Returns the current authenticated Supabase user, or null. Use from route
// handlers when you need to branch based on auth state without erroring.
export async function getOptionalUser(): Promise<User | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

// Returns the user, or a 401 NextResponse. Standard pattern for protected
// route handlers:
//
//   export async function POST(req: Request) {
//     const auth = await requireUser();
//     if (auth instanceof Response) return auth;
//     const { user } = auth;
//     // ... use user.id ...
//   }
export async function requireUser(): Promise<{ user: User } | NextResponse> {
  const user = await getOptionalUser();
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Sign in required" },
      { status: 401 },
    );
  }
  return { user };
}
