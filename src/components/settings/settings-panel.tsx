"use client";

import { useState } from "react";
import { Download, RefreshCw, Save, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { syncOfflineQueue } from "@/lib/offline";
import type { Gender, Profile } from "@/types/domain";

const genderOptions: { value: Gender; label: string }[] = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "non_binary", label: "Non-binary" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export function SettingsPanel({ profile }: { profile: Profile }) {
  const [form, setForm] = useState({
    display_name: profile.display_name ?? "",
    age: profile.age?.toString() ?? "",
    body_weight: profile.body_weight?.toString() ?? "",
    gender: profile.gender ?? "prefer_not_to_say",
  });
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");

  async function exportData(format: "json" | "csv") {
    const response = await fetch(`/api/export${format === "csv" ? "?format=csv" : ""}`);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `liftloop-workouts.${format}`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function saveProfile() {
    setSaveState("saving");
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaveState(response.ok ? "saved" : "idle");
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card className="lg:col-span-2">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-black">Profile</h2>
            <p className="mt-1 text-sm text-steel">This name appears on your dashboard welcome.</p>
          </div>
          <Button onClick={saveProfile} disabled={saveState === "saving"}>
            <Save size={18} />
            {saveState === "saving" ? "Saving" : saveState === "saved" ? "Saved" : "Save profile"}
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-steel">Name</label>
            <Input
              placeholder="Your name"
              value={form.display_name}
              onChange={(event) => setForm((current) => ({ ...current, display_name: event.target.value }))}
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-steel">Age</label>
            <Input
              type="number"
              min={1}
              max={130}
              placeholder="Age"
              value={form.age}
              onChange={(event) => setForm((current) => ({ ...current, age: event.target.value }))}
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-steel">Weight</label>
            <Input
              type="number"
              min={0}
              step="0.1"
              placeholder="Weight"
              value={form.body_weight}
              onChange={(event) => setForm((current) => ({ ...current, body_weight: event.target.value }))}
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-steel">Gender</label>
            <Select
              value={form.gender}
              onChange={(event) => setForm((current) => ({ ...current, gender: event.target.value as Gender }))}
            >
              {genderOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-black">Export workout data</h2>
        <p className="mt-2 text-sm text-steel">Download a complete archive for spreadsheets, backups, or coaching review.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button onClick={() => exportData("json")}>
            <Download size={18} />
            JSON
          </Button>
          <Button variant="secondary" onClick={() => exportData("csv")}>
            <Download size={18} />
            CSV
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-black">Offline sync</h2>
        <p className="mt-2 text-sm text-steel">LiftLoop queues workout saves while offline and pushes them when the connection returns.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => syncOfflineQueue()}>
            <RefreshCw size={18} />
            Sync now
          </Button>
          <span className="inline-flex h-11 items-center gap-2 rounded-lg border border-line px-4 text-sm text-steel">
            <Wifi size={18} />
            Browser managed
          </span>
        </div>
      </Card>
    </div>
  );
}
