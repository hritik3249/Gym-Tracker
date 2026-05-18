import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { WorkoutLogger } from "@/components/workout/workout-logger";
import { requireUser } from "@/lib/auth";

export default async function WorkoutPage() {
  await requireUser();

  return (
    <AppShell>
      <PageHeader title="Workout Logger" eyebrow="Push Pull Legs Arms" />
      <WorkoutLogger />
    </AppShell>
  );
}
