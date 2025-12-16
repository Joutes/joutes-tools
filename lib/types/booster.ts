import {Game} from "@/lib/types/game";
import {User} from "@/lib/types/user";
import {ObjectId} from "bson";

export type BoosterCard = {
  id: string;
  name: string;
  setCode: string;
  collectorNumber: string;
  foil: boolean;
  imageUrl: string;
  price?: string;
  newInCollection?: boolean;
};

export type Booster = {
  gameId: Game['id'];
  userId: User['id'];
  setCode: string;
  lang: string;
  type: string;
  id: string;
  cards: BoosterCard[];
  value?: string;
  archived: boolean;
  createdAt: string;
};

export type BoosterDb = {
  gameId: ObjectId;
  userId: ObjectId;
  setCode: string;
  lang: string;
  type: string;
  cards: BoosterCard[];
  price?: string;
  archived: boolean;
  createdAt: Date;
};
