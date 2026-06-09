"use client";

import { useCallback, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Activity, BarChart3, Dumbbell, History, LogOut, Settings, Trophy } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const nav = [
  { href: "/", label: "Dashboard", icon: Activity },
  { href: "/workout", label: "Workout", icon: Dumbbell },
  { href: "/history", label: "History", icon: History },
  { href: "/exercises", label: "Exercises", icon: Trophy },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const prefetchTab = useCallback(
    (href: string) => {
      if (href !== pathname) router.prefetch(href);
    },
    [pathname, router],
  );

  useEffect(() => {
    const warmTabs = () => {
      for (const item of nav) prefetchTab(item.href);
    };

    const canIdle = typeof window.requestIdleCallback === "function";

    if (canIdle) {
      const idleId = window.requestIdleCallback(warmTabs, { timeout: 1800 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = globalThis.setTimeout(warmTabs, 250);
    return () => globalThis.clearTimeout(timeoutId);
  }, [prefetchTab]);

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen">
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-72 border-r border-line bg-ink/84 px-5 py-6 backdrop-blur-xl lg:block">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-acid text-ink">
            <Dumbbell size={22} />
          </span>
          <span>
            <span className="block text-lg font-black tracking-normal text-cream">LiftLoop</span>
            <span className="text-xs uppercase tracking-[0.18em] text-steel">PPLA Tracker</span>
          </span>
        </Link>

        <nav className="mt-10 space-y-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                onFocus={() => prefetchTab(item.href)}
                onMouseEnter={() => prefetchTab(item.href)}
                className={cn(
                  "flex h-12 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-steel transition hover:bg-white/5 hover:text-cream",
                  active && "bg-white/8 text-cream shadow-glow",
                )}
              >
                <Icon size={19} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Button variant="ghost" className="absolute bottom-6 left-5 right-5 w-[calc(100%-2.5rem)] justify-start" onClick={signOut}>
          <LogOut size={18} />
          Sign out
        </Button>
      </aside>

      <main className="pb-24 lg:ml-72 lg:pb-0">
        <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-line bg-ink/92 px-2 py-2 backdrop-blur-xl lg:hidden">
        <div className="grid grid-cols-6 gap-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                onFocus={() => prefetchTab(item.href)}
                onMouseEnter={() => prefetchTab(item.href)}
                aria-label={item.label}
                className={cn(
                  "grid h-12 place-items-center rounded-lg text-steel transition hover:bg-white/5",
                  active && "bg-white/10 text-acid",
                )}
              >
                <Icon size={20} />
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
