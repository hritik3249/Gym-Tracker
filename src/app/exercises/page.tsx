import { AppShell } from "@/components/app-shell";
import { ExerciseManager } from "@/components/exercises/exercise-manager";
import { PageHeader } from "@/components/page-header";
import { requireUser } from "@/lib/auth";
import { getExercises } from "@/lib/server-data";

export default async function ExercisesPage() {
  const user = await requireUser();
  const exercises = await getExercises(user.id);

  return (
    <AppShell>
      <PageHeader title="Exercises" eyebrow="Library management" />
      <ExerciseManager initialExercises={exercises} />
    </AppShell>
  );
}
