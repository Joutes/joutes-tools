'use client';

import {Button} from "@/components/ui/button";
import {importCards} from "@/app/admin/settings/games/riftbound/action";

export default function RiftboundSettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Riftbound Settings</h1>
      <p className="text-gray-600">Configure settings specific to the Riftbound game here.</p>
      {/* Add more settings components as needed */}

      <Button onClick={async () => {
        await importCards();
      }}>Check collection</Button>
    </div>
  );
}