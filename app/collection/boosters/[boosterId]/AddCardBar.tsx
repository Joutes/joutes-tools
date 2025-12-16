'use client';

import {MeiliSearch} from "meilisearch";
import React, {FormEvent, useEffect, useState} from "react";
import {CircleAlertIcon, SearchIcon} from "lucide-react";
import {Command, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";

const client = new MeiliSearch({
  host: 'http://localhost:7700',
});

type Card = {
  id: string;
  name: string;
  collectorNumber: string;
  setCode: string;
  price?: string;
  foilPrice?: string;
  imageUrl?: string;
};

export default function AddCardBar({setCode, lang, addCard}: {
  setCode: string;
  lang: string;
  addCard: (({setCode, collectorNumber}: { setCode: string; collectorNumber: string }) => Promise<void>)
}) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Card[]>([]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
  }

  async function search(): Promise<Card[]> {
    const index = client.index<Card>('cards-riftbound');

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
          `collectorNumber = ${queryNumber}`,
        );
      } else {
        queryString = searchQuery;
      }
    }

    const result = await index.search(queryString, queryOptions);

    return result.hits;
  }

  function selectItem(item: Card) {
    console.log("selectItem", item);

    addCard({
      setCode: item.setCode,
      collectorNumber: item.collectorNumber,
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

  console.log(searchResults)
  console.log(searchQuery);

  return (
    <div>
      <form onSubmit={handleSearch}>
        <Command onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}>
          <div className="flex items-center px-2">
            <SearchIcon className="mr-2"/>
            <CommandInput
              value={searchQuery}
              placeholder="Rechercher (ex: cn:123, set:ABC, * pour toutes)"
            />
          </div>

          <CommandList>
            {searchResults.length === 0 && searchQuery.length > 0 ? (
              <CommandItem disabled>
                <CircleAlertIcon className="mr-2"/>
                Aucun résultat
              </CommandItem>
            ) : (
              <CommandGroup>
                {searchResults.map((item) => (
                  <CommandItem key={item.id} onSelect={() => selectItem(item)}>
                    <div>
                      <div>{item.name} — {item.collectorNumber}</div>
                      <div className="text-sm text-muted-foreground">{item.setCode}</div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </form>
    </div>
  );
}
