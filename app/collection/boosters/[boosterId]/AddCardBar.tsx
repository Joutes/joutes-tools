'use client';

import {MeiliSearch} from "meilisearch";
import React, {useEffect, useState} from "react";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import {BoosterCard} from "@/lib/types/booster";
import {addCardAction} from "@/app/collection/boosters/action";

const client = new MeiliSearch({
  host: 'http://localhost:7700',
});

export default function AddCardBar({boosterId, setCode, lang}: {
  boosterId: string;
  setCode: string;
  lang: string;
}) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<BoosterCard[]>([]);

  async function search(): Promise<BoosterCard[]> {
    const index = client.index<BoosterCard>('cards-riftbound');

    const queryOptions: { filter: string[] } = {filter: []};
    let queryString = "";

    if (searchQuery.includes(' lang:')) {

    } else if (lang !== 'en') {
      queryOptions.filter.push(
        `lang IN [en, ${lang}]`,
      );
    } else {
      queryOptions.filter.push(
        `lang IN [en]`,
      );
    }


    const setRegex = /(?: e|^e|^set| set):(?<set>[\w\*]+)/gm;
    const setResult = setRegex.exec(searchQuery);
    if (setResult?.groups?.set === '*') {
    } else if (setResult?.groups?.set) {
      queryOptions.filter.push(
        `setCode = ${setResult?.groups?.set}`,
      );
    } else {
      queryOptions.filter.push(
        `setCode = ${setCode}`,
      );
    }

    const cnRegex = /(?: cn|^cn):(?<cn>[\w\*]+)/gm;
    const cnResult = cnRegex.exec(searchQuery);
    if (cnResult?.groups?.cn) {
      queryOptions.filter.push(
        `collectorNumber = ${cnResult?.groups?.cn}`,
      );
    } else {
      const queryNumber = parseInt(searchQuery);
      if (!isNaN(queryNumber)) {
        queryOptions.filter.push(
          `collectorNumber CONTAINS "${queryNumber}"`,
        );
      } else {
        queryString = searchQuery;
      }
    }

    const result = await index.search(queryString, queryOptions);

    return result.hits;
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
