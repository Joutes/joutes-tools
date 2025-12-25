'use client';

import React, {useEffect, useState} from "react";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import {BoosterCard} from "@/lib/types/booster";
import {addCardAction} from "@/app/collection/boosters/action";

export default function AddCardBar({boosterId, setCode, lang}: {
  boosterId: string;
  setCode: string;
  lang: string;
}) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<BoosterCard[]>([]);

  async function search(): Promise<BoosterCard[]> {
    const resultsRaw = await fetch('/api/games/riftbound/cards?setCode=' + setCode + '&searchQuery=' + encodeURIComponent(searchQuery) + '&lang=' + lang);

    const results = await resultsRaw.json() as BoosterCard[];

    return results;
  }

  function selectItem(item: BoosterCard) {
    console.log("selectItem", item);

    addCardAction(boosterId, {
      id: item.id,
      setCode: item.setCode,
      collectorNumber: item.collectorNumber,
      name: item.name,
      image: item.image,
    }).then(() => {
      setSearchQuery("");
    });
  }

  useEffect(() => {
    if (searchQuery.length > 0) {
      search().then(results => setSearchResults(results));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  return (
    <div>
      <Command  shouldFilter={false} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)} className="rounded-lg border shadow-md md:min-w-[450px]">
        <CommandInput
          autoFocus
          value={searchQuery}
          placeholder="Rechercher (ex: cn:123, set:ABC, * pour toutes)"
        />
        <CommandList>
          <CommandEmpty>Aucun résultat</CommandEmpty>
          <CommandGroup>
            {searchResults.map((item) => (
              <CommandItem key={item.id} onSelect={() => selectItem(item)} value={item.id}>
                <div className="flex flex-row items-center gap-4">
                  <img src={item.image} alt={item.name} className="w-24" />
                  <div>
                    <div>{item.name}</div>
                    <div className="text-sm text-muted-foreground">{item.setCode} #{item.collectorNumber}</div>
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}
