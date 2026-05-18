"use client";

import { Download, RefreshCw, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { syncOfflineQueue } from "@/lib/offline";

export function SettingsPanel() {
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

  return (
    <div className="grid gap-5 lg:grid-cols-2">
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
