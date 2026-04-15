'use client';

import useGame from "@/hooks/use-game";
import { useEffect } from "react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";

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
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/riftbound">Riftbound</BreadcrumbLink>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            {children}
        </>
    )
}