"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BoosterCard } from "@/lib/types/booster";
import { MatchCard } from "@/lib/types/match";
import { ChevronsUpDown } from "lucide-react";

interface CardSearchInputProps {
  label: string;
  value: MatchCard | null;
  onChange: (card: MatchCard | null) => void;
  placeholder?: string;
}

export default function CardSearchInput({
  label,
  value,
  onChange,
  placeholder = "Rechercher une légende...",
}: CardSearchInputProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<BoosterCard[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setResults([]);
      return;
    }
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `/api/games/riftbound/cards?searchQuery=${encodeURIComponent(searchQuery)}&setCode=*&lang=fr&type=Legend`
        );
        const data: BoosterCard[] = await res.json();
        setResults(data.slice(0, 10));
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, open]);

  function selectCard(card: BoosterCard) {
    onChange({ cardId: card.id, name: card.name, image: card.image });
    setOpen(false);
  }

  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium">{label}</label>

      {value ? (
        <div className="flex items-center gap-3 p-2 border rounded-md bg-muted">
          <img src={value.image} alt={value.name} className="w-12 h-auto rounded" />
          <span className="flex-1 font-medium">{value.name}</span>
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
            Changer
          </Button>
        </div>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between font-normal text-muted-foreground"
            >
              {placeholder}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder={placeholder}
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList>
                {isSearching ? (
                  <div className="py-4 text-center text-sm text-muted-foreground">
                    Recherche en cours…
                  </div>
                ) : searchQuery.length < 2 ? (
                  <div className="py-4 text-center text-sm text-muted-foreground">
                    Tapez au moins 2 caractères…
                  </div>
                ) : results.length === 0 ? (
                  <CommandEmpty>Aucun résultat.</CommandEmpty>
                ) : (
                  <CommandGroup>
                    {results.map((card) => (
                      <CommandItem
                        key={`${card.id}-${card.setCode}-${card.collectorNumber}`}
                        value={card.id}
                        onSelect={() => selectCard(card)}
                        className="cursor-pointer gap-3 py-2"
                      >
                        <img src={card.image} alt={card.name} className="w-10 h-auto rounded shrink-0" />
                        <div className="min-w-0">
                          <div className="font-medium text-sm">{card.name}</div>
                          {card.subtitle && (
                            <div className="text-xs text-muted-foreground truncate">{card.subtitle}</div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            {card.setCode} #{card.collectorNumber}
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
