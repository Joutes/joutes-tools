'use client';

import useGame from "@/hooks/use-game";
import { useEffect } from "react";

export default function SWULayout({ children }: { children: React.ReactNode }) {
    const gameContext = useGame();

    useEffect(() => {
        if (gameContext.game.slug !== "swu") {
            gameContext.switchGame({
                id: 'swu',
                slug: "swu",
                name: "SWU",
                icon: "/games/swu/icon.png",
            });
        }
    }, [gameContext.game?.slug]);

    return (
        <>
            {children}
        </>
    )
}