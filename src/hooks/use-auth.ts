"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  mapUser,
  signOut as supaSignOut,
  signInWithGoogle as supaSignInWithGoogle,
  signInWithEmail as supaSignInWithEmail,
  signUpWithEmail as supaSignUpWithEmail,
  type User,
} from "@/lib/auth";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    // Hydrate from any existing session, then subscribe to changes.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setUser(mapUser(session?.user ?? null));
      setIsLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(mapUser(session?.user ?? null));
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const logout = useCallback(async () => {
    await supaSignOut();
    setUser(null);
    router.push("/login");
  }, [router]);

  const signInWithGoogle = useCallback(async (next?: string) => {
    await supaSignInWithGoogle(next);
  }, []);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      const u = await supaSignInWithEmail(email, password);
      setUser(u);
      return u;
    },
    []
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string, fullName?: string) => {
      const result = await supaSignUpWithEmail(email, password, fullName);
      if (result.user && !result.needsEmailConfirmation) {
        setUser(result.user);
      }
      return result;
    },
    []
  );

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    logout,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
  };
};
