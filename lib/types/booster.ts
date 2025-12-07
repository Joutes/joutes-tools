import {Game} from "@/lib/types/game";
import {User} from "@/lib/types/user";
import {ObjectId} from "bson";

export type Booster = {
  gameId: Game['id'];
  userId: User['id'];
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
  gameId: ObjectId;
  userId: ObjectId;
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
