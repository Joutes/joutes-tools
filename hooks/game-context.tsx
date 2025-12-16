"use client";

import React, { createContext, useCallback, useMemo, useState } from "react";

interface GameContextProps {
  game: { id: string; name: string; icon?: string };
  switchGame: (game: { id: string; name: string; icon?: string }) => void;
}

const GameContext = createContext<GameContextProps | null>(null);

const GameContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [game, setGame] = useState<{ id: string; name: string; icon?: string }>({ id: "default", name: "Default Game" });

  const switchGame = useCallback((newGame: { id: string; name: string; icon?: string }) => {
    setGame(newGame);
  }, []);

  const contextValue = useMemo<GameContextProps>(() => ({ game, switchGame }), [game, switchGame]);

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

export { GameContextProvider, GameContext };