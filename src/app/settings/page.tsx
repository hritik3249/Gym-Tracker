import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { SettingsPanel } from "@/components/settings/settings-panel";
import { requireUser } from "@/lib/auth";
import { getProfile } from "@/lib/server-data";

export default async function SettingsPage() {
  const user = await requireUser();
  const profile = await getProfile(user.id);

  return (
    <AppShell>
      <PageHeader title="Settings" eyebrow="Data and sync" />
      <SettingsPanel profile={profile} />
    </AppShell>
  );
}
