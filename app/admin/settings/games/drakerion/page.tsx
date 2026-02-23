'use client';

import {Button} from "@/components/ui/button";
import {importCards} from "@/app/admin/settings/games/drakerion/action";
import {useRequireAuth} from "@/hooks/use-auth";

export default function DrakerionSettingsPage() {
  const { session, isPending } = useRequireAuth();

  if (!session) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Drakerion Settings</h1>
      <p className="text-gray-600">Configure settings specific to the Drakerion game here.</p>
      {/* Add more settings components as needed */}

      <Button onClick={async () => {
        await importCards();
      }}>Check collection</Button>
    </div>
  );
}