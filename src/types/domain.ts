export type ExerciseCategory = "push" | "pull" | "legs" | "arms";
export type Gender = "female" | "male" | "non_binary" | "prefer_not_to_say";

export type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  age: number | null;
  body_weight: number | null;
  gender: Gender | null;
  created_at: string;
  updated_at: string;
};

export type Exercise = {
  id: string;
  user_id: string;
  name: string;
  category: ExerciseCategory;
  target_muscle: string | null;
  notes: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Workout = {
  id: string;
  user_id: string;
  category: ExerciseCategory;
  performed_at: string;
  duration_seconds: number;
  notes: string | null;
  status: "draft" | "completed";
  created_at: string;
  updated_at: string;
};

export type WorkoutSet = {
  id: string;
  user_id: string;
  workout_id: string;
  exercise_id: string;
  set_index: number;
  reps: number;
  weight: number;
  notes: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
  exercises?: Pick<Exercise, "id" | "name" | "category" | "target_muscle">;
};

export type WorkoutWithSets = Workout & {
  workout_sets: WorkoutSet[];
};

export type ProgressPoint = {
  date: string;
  weight: number;
  reps: number;
  volume: number;
};

export type DashboardAnalytics = {
  totalWorkouts: number;
  currentStreak: number;
  weeklyConsistency: { day: string; completed: boolean; volume: number }[];
  bestLifts: { exercise: string; weight: number; reps: number }[];
  volumeByCategory: { category: ExerciseCategory; volume: number }[];
  muscleFrequency: { muscle: string; sessions: number }[];
  recentWorkouts: WorkoutWithSets[];
  heatmap: { date: string; count: number }[];
};
