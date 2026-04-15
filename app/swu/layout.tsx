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
          <Breadcrumb>
              <BreadcrumbList>
                  <BreadcrumbItem>
                      <BreadcrumbLink href="/">Home</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                      <BreadcrumbLink href="/swu">Star Wars Unlimited</BreadcrumbLink>
                  </BreadcrumbItem>
              </BreadcrumbList>
          </Breadcrumb>
          {children}
      </>
    )
}