"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Subscribes to postgres changes on public.email_queue and invokes `onChange`
// (debounced) whenever a row is inserted/updated/deleted. RLS scopes the
// stream to the current user's rows once migration 0003 is applied.
//
// Returns whether the realtime channel is currently connected so the caller
// can fall back to slower polling when it isn't.
export function useEmailQueueRealtime(onChange: () => void): { connected: boolean } {
  const [connected, setConnected] = useState(false);
  const cbRef = useRef(onChange);

  useEffect(() => {
    cbRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const supabase = createClient();
    let debounce: ReturnType<typeof setTimeout> | null = null;

    const fire = () => {
      if (debounce) clearTimeout(debounce);
      debounce = setTimeout(() => cbRef.current(), 250);
    };

    const channel = supabase
      .channel("email_queue_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "email_queue" },
        fire,
      )
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    return () => {
      if (debounce) clearTimeout(debounce);
      supabase.removeChannel(channel);
    };
  }, []);

  return { connected };
}
