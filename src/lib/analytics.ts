import { differenceInCalendarDays, eachDayOfInterval, endOfDay, format, startOfDay, subDays } from "date-fns";
import type { DashboardAnalytics, ExerciseCategory, WorkoutSet, WorkoutWithSets } from "@/types/domain";

function setVolume(set: WorkoutSet) {
  return Number(set.weight) * Number(set.reps);
}

export function buildDashboardAnalytics(workouts: WorkoutWithSets[]): DashboardAnalytics {
  const completed = workouts
    .filter((workout) => workout.status === "completed")
    .sort((a, b) => new Date(b.performed_at).getTime() - new Date(a.performed_at).getTime());

  const today = endOfDay(new Date());
  const weekStart = startOfDay(subDays(today, 6));
  const weekDays = eachDayOfInterval({ start: weekStart, end: today });

  const weeklyConsistency = weekDays.map((day) => {
    const dayWorkouts = completed.filter((workout) => {
      const performed = new Date(workout.performed_at);
      return performed >= startOfDay(day) && performed <= endOfDay(day);
    });

    return {
      day: format(day, "EEE"),
      completed: dayWorkouts.length > 0,
      volume: dayWorkouts.flatMap((workout) => workout.workout_sets).reduce((total, set) => total + setVolume(set), 0),
    };
  });

  const bestByExercise = new Map<string, { exercise: string; weight: number; reps: number }>();
  const volumeByCategory = new Map<ExerciseCategory, number>();
  const muscleFrequency = new Map<string, Set<string>>();

  for (const workout of completed) {
    const sessionMuscles = new Set<string>();

    for (const set of workout.workout_sets) {
      const name = set.exercises?.name ?? "Exercise";
      const existing = bestByExercise.get(name);
      if (!existing || Number(set.weight) > existing.weight) {
        bestByExercise.set(name, { exercise: name, weight: Number(set.weight), reps: Number(set.reps) });
      }

      const category = set.exercises?.category ?? workout.category;
      volumeByCategory.set(category, (volumeByCategory.get(category) ?? 0) + setVolume(set));

      if (set.exercises?.target_muscle) {
        sessionMuscles.add(set.exercises.target_muscle);
      }
    }

    for (const muscle of sessionMuscles) {
      const sessions = muscleFrequency.get(muscle) ?? new Set<string>();
      sessions.add(workout.id);
      muscleFrequency.set(muscle, sessions);
    }
  }

  return {
    totalWorkouts: completed.length,
    currentStreak: calculateWorkoutStreak(completed.map((workout) => workout.performed_at)),
    weeklyConsistency,
    bestLifts: [...bestByExercise.values()].sort((a, b) => b.weight - a.weight).slice(0, 5),
    volumeByCategory: [...volumeByCategory.entries()].map(([category, volume]) => ({ category, volume })),
    muscleFrequency: [...muscleFrequency.entries()]
      .map(([muscle, sessions]) => ({ muscle, sessions: sessions.size }))
      .sort((a, b) => b.sessions - a.sessions),
    recentWorkouts: completed.slice(0, 6),
  };
}

export function calculateWorkoutStreak(performedDates: string[]) {
  const uniqueDays = [...new Set(performedDates.map((date) => format(new Date(date), "yyyy-MM-dd")))]
    .map((date) => new Date(`${date}T00:00:00`))
    .sort((a, b) => b.getTime() - a.getTime());

  if (uniqueDays.length === 0) return 0;

  let streak = differenceInCalendarDays(new Date(), uniqueDays[0]) <= 1 ? 1 : 0;
  for (let index = 1; index < uniqueDays.length && streak > 0; index += 1) {
    const gap = differenceInCalendarDays(uniqueDays[index - 1], uniqueDays[index]);
    if (gap === 1) streak += 1;
    else break;
  }

  return streak;
}

export function buildProgressPoints(sets: WorkoutSet[]) {
  const grouped = new Map<string, { weight: number; reps: number; volume: number }>();

  for (const set of sets) {
    const day = format(new Date(set.created_at), "MMM d");
    const current = grouped.get(day) ?? { weight: 0, reps: 0, volume: 0 };
    grouped.set(day, {
      weight: Math.max(current.weight, Number(set.weight)),
      reps: current.reps + Number(set.reps),
      volume: current.volume + setVolume(set),
    });
  }

  return [...grouped.entries()].map(([date, values]) => ({ date, ...values }));
}
