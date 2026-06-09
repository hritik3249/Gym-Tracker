"use client";

import { useMemo, useState } from "react";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { CATEGORIES, categoryLabel } from "@/lib/constants";
import type { Exercise, ExerciseCategory } from "@/types/domain";

const emptyForm = {
  id: "",
  name: "",
  category: "push" as ExerciseCategory,
  target_muscle: "",
  notes: "",
};

export function ExerciseManager({ initialExercises }: { initialExercises: Exercise[] }) {
  const { toast } = useToast();
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
  const [form, setForm] = useState(emptyForm);
  const [filter, setFilter] = useState<ExerciseCategory | "all">("all");
  const [saving, setSaving] = useState(false);

  const visibleExercises = useMemo(
    () => exercises.filter((exercise) => filter === "all" || exercise.category === filter),
    [exercises, filter],
  );

  async function saveExercise() {
    const editing = Boolean(form.id);
    setSaving(true);
    const response = await fetch(`/api/exercises${editing ? `/${form.id}` : ""}`, {
      method: editing ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!response.ok) {
      toast("Failed to save exercise", "error");
      return;
    }
    const payload = await response.json();
    const saved = payload.exercise as Exercise;
    setExercises((current) =>
      editing ? current.map((e) => (e.id === form.id ? saved : e)) : [...current, saved],
    );
    setForm(emptyForm);
    toast(editing ? "Exercise updated" : "Exercise added");
  }

  async function deleteExercise(id: string) {
    setExercises((current) => current.filter((e) => e.id !== id));
    const response = await fetch(`/api/exercises/${id}`, { method: "DELETE" });
    if (!response.ok) {
      toast("Failed to delete exercise", "error");
      const refetch = await fetch("/api/exercises");
      const payload = await refetch.json();
      setExercises(payload.exercises ?? []);
    } else {
      toast("Exercise removed");
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[24rem_1fr]">
      <Card>
        <h2 className="text-lg font-black text-cream">{form.id ? "Edit exercise" : "Add exercise"}</h2>
        <div className="mt-5 space-y-3">
          <Input
            placeholder="Exercise name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
          <Select
            value={form.category}
            onChange={(event) => setForm({ ...form, category: event.target.value as ExerciseCategory })}
          >
            {CATEGORIES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
          <Input
            placeholder="Target muscle"
            value={form.target_muscle}
            onChange={(event) => setForm({ ...form, target_muscle: event.target.value })}
          />
          <Textarea
            placeholder="Notes"
            value={form.notes}
            onChange={(event) => setForm({ ...form, notes: event.target.value })}
          />
          <div className="flex gap-2">
            <Button className="flex-1" onClick={saveExercise} disabled={!form.name.trim() || saving}>
              <Plus size={18} />
              {saving ? "Saving…" : "Save"}
            </Button>
            {form.id && (
              <Button variant="secondary" onClick={() => setForm(emptyForm)}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <h2 className="text-lg font-black text-cream">Exercise library</h2>
          <Select
            className="sm:w-44"
            value={filter}
            onChange={(event) => setFilter(event.target.value as ExerciseCategory | "all")}
          >
            <option value="all">All categories</option>
            {CATEGORIES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
        </div>

        {visibleExercises.length === 0 && (
          <div className="rounded-lg border border-dashed border-line py-10 text-center">
            <p className="text-sm text-steel">
              {filter === "all"
                ? "No exercises yet — add your first one."
                : `No ${categoryLabel(filter as ExerciseCategory)} exercises. Add one on the left.`}
            </p>
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-2">
          {visibleExercises.map((exercise) => (
            <div key={exercise.id} className="rounded-lg border border-line bg-white/[0.04] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black text-cream">{exercise.name}</p>
                  <p className="mt-1 text-sm text-steel">
                    {categoryLabel(exercise.category)}
                    {exercise.target_muscle ? ` • ${exercise.target_muscle}` : ""}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    className="h-9 w-9 p-0"
                    variant="ghost"
                    aria-label="Edit exercise"
                    onClick={() =>
                      setForm({
                        id: exercise.id,
                        name: exercise.name,
                        category: exercise.category,
                        target_muscle: exercise.target_muscle ?? "",
                        notes: exercise.notes ?? "",
                      })
                    }
                  >
                    <Edit3 size={16} />
                  </Button>
                  <Button
                    className="h-9 w-9 p-0"
                    variant="danger"
                    aria-label="Delete exercise"
                    onClick={() => deleteExercise(exercise.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
              {exercise.notes && <p className="mt-3 text-sm text-steel">{exercise.notes}</p>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
