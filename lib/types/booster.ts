import {Game, GameDb} from "@/lib/types/game";

export type Booster = {
  gameId: Game['id'];
  setCode: string;
  lang: string;
  type: string;
  id: string;
  cards: {
    name: string;
    quantity: number;
  }[];
  price?: string;
  archived: boolean;
  createdAt: string;
};

export type BoosterDb = {
  gameId: GameDb['_id'];
  setCode: string;
  lang: string;
  type: string;
  cards: {
    name: string;
    quantity: number;
  }[];
  price?: string;
  archived: boolean;
  createdAt: Date;
};
