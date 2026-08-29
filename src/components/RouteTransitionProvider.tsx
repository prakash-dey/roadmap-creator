"use client";

import { createContext, useContext, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { DashboardShimmer } from "@/components/DashboardShimmer";

type RouteTransitionContextValue = {
  isPending: boolean;
  navigate: (href: string) => void;
};

const RouteTransitionContext = createContext<RouteTransitionContextValue | null>(null);

// Client-only navigation pending state. Deliberately NOT a route `loading.tsx`:
// under Cache Components, a loading boundary lets Next.js serve the route's
// static shell with a committed 200 before dynamic (auth-gated) content is
// known, which turns our sign-in redirect into a client-side-only redirect —
// verified this leaks a flash of the dashboard shell to signed-out requests
// even in a production build. Driving the shimmer from `useTransition`
// instead never touches the response — the router still fetches the new
// page's RSC payload in the background as soon as `navigate` is called.
export function RouteTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function navigate(href: string) {
    startTransition(() => {
      router.push(href);
    });
  }

  return (
    <RouteTransitionContext.Provider value={{ isPending, navigate }}>
      {children}
      {isPending && <DashboardShimmer />}
    </RouteTransitionContext.Provider>
  );
}

export function useRouteTransition() {
  const ctx = useContext(RouteTransitionContext);
  if (!ctx) throw new Error("useRouteTransition must be used within RouteTransitionProvider");
  return ctx;
}
