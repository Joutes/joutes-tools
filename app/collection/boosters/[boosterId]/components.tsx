"use client";

import {Button} from "@/components/ui/button";
import {createBoosterAction} from "@/app/collection/boosters/action";
import {Copy} from "lucide-react";

export function DuplicateBoosterButton({ booster }: { booster: { gameId: string; setCode: string; type: string; lang: string } }) {
  return (
    <Button onClick={async () => {
      const formData = new FormData();
      formData.append('gameId', booster.gameId);
      formData.append('setCode', booster.setCode);
      formData.append('type', booster.type);
      formData.append('lang', booster.lang);

      await createBoosterAction(formData);
    }}>
      <Copy className="size-4" />
      Nouveau Booster
    </Button>
  )
}