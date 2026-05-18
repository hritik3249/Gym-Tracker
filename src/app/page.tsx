import Link from "next/link";
import { Dumbbell } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Dashboard } from "@/components/dashboard/dashboard";
import { PageHeader } from "@/components/page-header";
import { requireUser } from "@/lib/auth";
import { getDashboardData, getProfile } from "@/lib/server-data";

export default async function DashboardPage() {
  const user = await requireUser();
  const [dashboard, profile] = await Promise.all([getDashboardData(user.id), getProfile(user.id)]);
  const name = profile.display_name?.trim();

  return (
    <AppShell>
      <PageHeader
        title={name ? `Welcome, ${name}` : "Welcome"}
        eyebrow="Today in the loop"
        action={
          <Link
            href="/workout"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-acid px-4 text-sm font-semibold text-ink transition duration-200 hover:bg-lime-200"
          >
            <Dumbbell size={18} />
            Track workout
          </Link>
        }
      />
      <Dashboard data={dashboard} />
    </AppShell>
  );
}
