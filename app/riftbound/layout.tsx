'use client';

import useGame from "@/hooks/use-game";
import { useEffect } from "react";

export default function RiftboundLayout({ children }: { children: React.ReactNode }) {
    const gameContext = useGame();

    useEffect(() => {
        if (gameContext.game.slug !== "riftbound") {
            gameContext.switchGame({
                id: 'riftbound',
                slug: "riftbound",
                name: "Riftbound",
                icon: "/games/riftbound/icon.png",
            });
        }
    }, [gameContext.game?.slug]);

    return (
        <>
            {children}
        </>
    )
}