import {Game} from "@/lib/types/game";
import {User} from "@/lib/types/user";
import {ObjectId} from "bson";

export type BoosterCard = {
  id: string;
  cardId?: string;
  boosterId?: string;
  name: string;
  setCode: string;
  collectorNumber: string;
  foil?: boolean;
  image: string;
  price?: string;
  newInCollection?: boolean;
};

export type BoosterCardDb = {
  boosterId: ObjectId;
  userId: ObjectId;
  cardId?: string;
  name: string;
  setCode: string;
  collectorNumber: string;
  foil?: boolean;
  image: string;
  price?: string;
  newInCollection?: boolean;
}

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
  price?: string;
  archived: boolean;
  createdAt: Date;
};
