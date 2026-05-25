import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { WorkoutLogger } from "@/components/workout/workout-logger";
import { requireUser } from "@/lib/auth";
import { getWorkoutBootstrap } from "@/lib/server-data";

export default async function WorkoutPage() {
  const user = await requireUser();
  const { exercises, previousWorkout, recentWorkouts } = await getWorkoutBootstrap(user.id);

  return (
    <AppShell>
      <PageHeader title="Workout Logger" eyebrow="Push Pull Legs Arms" />
      <WorkoutLogger initialExercises={exercises} previousWorkout={previousWorkout} recentWorkouts={recentWorkouts} />
    </AppShell>
  );
}
