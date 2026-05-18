import { AppShell } from "@/components/app-shell";
import { ExerciseManager } from "@/components/exercises/exercise-manager";
import { PageHeader } from "@/components/page-header";
import { requireUser } from "@/lib/auth";

export default async function ExercisesPage() {
  await requireUser();

  return (
    <AppShell>
      <PageHeader title="Exercises" eyebrow="Library management" />
      <ExerciseManager />
    </AppShell>
  );
}
