import { AppShell } from "@/components/app-shell";
import { Dashboard } from "@/components/dashboard/dashboard";
import { PageHeader } from "@/components/page-header";
import { requireUser } from "@/lib/auth";

export default async function DashboardPage() {
  await requireUser();

  return (
    <AppShell>
      <PageHeader title="Dashboard" eyebrow="Today in the loop" />
      <Dashboard />
    </AppShell>
  );
}
