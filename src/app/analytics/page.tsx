import { AppShell } from "@/components/app-shell";
import { ProgressAnalytics } from "@/components/analytics/progress-analytics";
import { PageHeader } from "@/components/page-header";
import { requireUser } from "@/lib/auth";
import { getProgressAnalytics } from "@/lib/server-data";

export default async function AnalyticsPage() {
  const user = await requireUser();
  const analytics = await getProgressAnalytics(user.id);

  return (
    <AppShell>
      <PageHeader title="Analytics" eyebrow="Progress and records" />
      <ProgressAnalytics initialData={analytics} />
    </AppShell>
  );
}
