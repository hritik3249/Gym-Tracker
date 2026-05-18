import { AppShell } from "@/components/app-shell";
import { WorkoutHistory } from "@/components/history/workout-history";
import { PageHeader } from "@/components/page-header";
import { requireUser } from "@/lib/auth";

export default async function HistoryPage() {
  await requireUser();

  return (
    <AppShell>
      <PageHeader title="Workout History" eyebrow="Review and compare" />
      <WorkoutHistory />
    </AppShell>
  );
}
