"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Records the visitor's IANA timezone in a cookie so server components can work
 * out which calendar day "today" is for them (see `@/lib/timezone`). Only
 * refreshes when the stored value is actually stale, so there is no loop.
 */
export function TimeZoneSync() {
  const router = useRouter();

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!tz) return;

    const encoded = encodeURIComponent(tz);
    const current = document.cookie
      .split("; ")
      .find((c) => c.startsWith("tz="))
      ?.slice(3);

    if (current === encoded || current === tz) return;

    document.cookie = `tz=${encoded}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }, [router]);

  return null;
}
