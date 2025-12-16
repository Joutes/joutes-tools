"use client";

import {SidebarMenuButton, SidebarMenuItem} from "./ui/sidebar";
import {ChevronDown} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from "./ui/dropdown-menu";
import useGame from "@/hooks/use-game";

export function MainSideBarGameSelector({ games }: { games: { id: string, name: string, icon?: string }[]}) {
  const gameContext = useGame();
  const activeGame = gameContext.game;


  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton className="w-full px-1.5" size="lg">
            <div className="text-sidebar-primary-foreground flex aspect-square size-5 items-center justify-center rounded-md">
              <img className="size-3" src={activeGame.icon} />
            </div>
            <span className="truncate font-medium grow">{activeGame.name}</span>
            <ChevronDown className="opacity-50" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-64 rounded-lg"
          align="start"
          side="bottom"
          sideOffset={4}
        >
          <DropdownMenuLabel className="text-muted-foreground text-xs">
            Jeux
          </DropdownMenuLabel>
          {games.map((game, index) => (
            <DropdownMenuItem
              key={game.id}
              className="gap-2 p-2"
              onClick={() => gameContext.switchGame(game)}
            >
              <div className="flex size-6 items-center justify-center rounded-xs border">
                <img alt="Icône" className="size-4 shrink-0" src={game.icon} />
              </div>
              {game.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}