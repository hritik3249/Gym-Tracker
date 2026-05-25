import { AppShell } from "@/components/app-shell";
import { DashboardActions } from "@/components/dashboard/dashboard-actions";
import { Dashboard } from "@/components/dashboard/dashboard";
import { PageHeader } from "@/components/page-header";
import { requireUser } from "@/lib/auth";
import { getDashboardData, getProfile } from "@/lib/server-data";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const [dashboard, profile] = await Promise.all([getDashboardData(user.id), getProfile(user.id)]);
  const name = profile.display_name?.trim();

  return (
    <AppShell>
      <PageHeader
        title={name ? `Welcome, ${name}` : "Welcome"}
        eyebrow="Today in the loop"
        action={<DashboardActions />}
      />
      <Dashboard data={dashboard} />
    </AppShell>
  );
}
