import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { SettingsPanel } from "@/components/settings/settings-panel";
import { requireUser } from "@/lib/auth";

export default async function SettingsPage() {
  await requireUser();

  return (
    <AppShell>
      <PageHeader title="Settings" eyebrow="Data and sync" />
      <SettingsPanel />
    </AppShell>
  );
}
