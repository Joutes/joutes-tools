'use client';

import {MeiliSearch} from "meilisearch";
import React, {FormEvent, useEffect, useState} from "react";
import {cn} from "@/lib/utils";
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

export default function AddCardBar({ setCode, lang, addCard }: { setCode: string; lang: string; addCard: (({ setCode, collectorNumber }: { setCode: string; collectorNumber: string }) => Promise<void>) }) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Card[]>([]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
  }

  async function search(): Promise<Card[]> {
    const index = client.index<Card>('cards-riftbound');

    const queryOptions: { filter: string[] } = { filter: [] };
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

    console.log(queryOptions)

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

  return (
    <div>

    </div>
  );
}
