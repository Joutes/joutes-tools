"use client";
import { useContext } from "react";
import {GameContext} from "@/hooks/game-context";

export default function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameContextProvider");
  }
  return context;
}
