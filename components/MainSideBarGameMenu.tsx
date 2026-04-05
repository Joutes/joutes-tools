'use client';

import useGame from "@/hooks/use-game";
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";
import { LibraryIcon, ScanIcon, SearchIcon, WatchIcon } from "lucide-react";
import Link from "next/link";

const gamesMenus: { [slug: string]: {
    title: string;
    url: string;
    icon?: React.ComponentType<any>;
}[]} = {
    'riftbound': [
        {
            title: "Cartes",
            url: "/riftbound/cards",
            icon: SearchIcon,
        },
        {
            title: "Erratas & Rulings",
            url: "/riftbound/erratas",
            icon: LibraryIcon,
        },
        {
            title: "Deck Checker",
            url: "/riftbound/deck-checker",
            icon: ScanIcon,
        },
    ],
    'swu': [
        {
            title: "Timers (ronde, draft)",
            url: "/swu/timers",
            icon: WatchIcon,
        },
        {
            title: "Deck Checker",
            url: "/swu/deck-checker",
            icon: ScanIcon,
        },
    ],
};

export default function MainSideBarGameMenu() {
    const gameContext = useGame();
    const activeGame = gameContext.game;

    if (!activeGame) {
        return null;
    }

    const gameMenu = gamesMenus[activeGame.slug || ""] || [];

    if (gameMenu.length === 0) {
        return null;
    }

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Outils de Jeu</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    {gameMenu.map((item) => (
                        <SidebarMenuItem
                            key={item.title}
                        >
                            <SidebarMenuButton asChild>
                                <Link href={item.url} className="flex items-center gap-2">
                                    {item.icon ? <item.icon size={16} /> : null}
                                    {item.title}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}