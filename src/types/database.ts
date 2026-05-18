import type { ExerciseCategory } from "./domain";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          display_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      exercises: {
        Row: {
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
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          category: ExerciseCategory;
          target_muscle?: string | null;
          notes?: string | null;
          archived_at?: string | null;
        };
        Update: {
          name?: string;
          category?: ExerciseCategory;
          target_muscle?: string | null;
          notes?: string | null;
          archived_at?: string | null;
        };
        Relationships: [];
      };
      workouts: {
        Row: {
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
        Insert: {
          id?: string;
          user_id: string;
          category: ExerciseCategory;
          performed_at?: string;
          duration_seconds?: number;
          notes?: string | null;
          status?: "draft" | "completed";
        };
        Update: {
          category?: ExerciseCategory;
          performed_at?: string;
          duration_seconds?: number;
          notes?: string | null;
          status?: "draft" | "completed";
        };
        Relationships: [];
      };
      workout_sets: {
        Row: {
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
        };
        Insert: {
          id?: string;
          user_id: string;
          workout_id: string;
          exercise_id: string;
          set_index: number;
          reps?: number;
          weight?: number;
          notes?: string | null;
          completed?: boolean;
        };
        Update: {
          set_index?: number;
          reps?: number;
          weight?: number;
          notes?: string | null;
          completed?: boolean;
        };
        Relationships: [];
      };
    };
    Views: {
      exercise_personal_records: {
        Row: {
          user_id: string;
          exercise_id: string;
          exercise_name: string;
          category: ExerciseCategory;
          max_weight: number;
          max_reps: number;
          max_volume_set: number;
          latest_set_at: string;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: {
      exercise_category: ExerciseCategory;
    };
    CompositeTypes: Record<string, never>;
  };
};
