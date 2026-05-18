import { AppShell } from "@/components/app-shell";
import { WorkoutHistory } from "@/components/history/workout-history";
import { PageHeader } from "@/components/page-header";
import { requireUser } from "@/lib/auth";
import { getWorkouts } from "@/lib/server-data";

export default async function HistoryPage() {
  const user = await requireUser();
  const workouts = await getWorkouts(user.id, 80);

  return (
    <AppShell>
      <PageHeader title="Workout History" eyebrow="Review and compare" />
      <WorkoutHistory initialWorkouts={workouts} />
    </AppShell>
  );
}
