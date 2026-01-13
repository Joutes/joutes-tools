"use client";

import React, { createContext, useCallback, useMemo, useState } from "react";

interface GameContextProps {
  game: { id: string; name: string; icon?: string; slug?: string };
  switchGame: (game: { id: string; name: string; icon?: string; slug?: string }) => void;
}

const GameContext = createContext<GameContextProps | null>(null);

const GameContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [game, setGame] = useState<{ id: string; name: string; icon?: string; slug?: string }>({ id: "default", name: "Default Game" });

  const switchGame = useCallback((newGame: { id: string; name: string; icon?: string; slug?: string }) => {
    setGame(newGame);
    if (localStorage) {
      localStorage.setItem("activeGame", JSON.stringify(newGame));
    }
  }, []);

  const contextValue = useMemo<GameContextProps>(() => ({ game, switchGame }), [game, switchGame]);

  React.useEffect(() => {
    if (localStorage) {
      const savedGame = localStorage.getItem("activeGame");
      if (savedGame) {
        setGame(JSON.parse(savedGame));
      }
    }
  }, []);

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

export { GameContextProvider, GameContext };