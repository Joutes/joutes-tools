import { ObjectId } from "bson";
import {BoosterCard} from "@/lib/types/booster";

export type ErrataType = "errata" | "clarification" | "ruling";

export type Errata = {
  id: string;
  cardId: string;
  card?: BoosterCard;
  type: ErrataType;
  details: string;
  source?: string;
  errataDate: Date;
  createdBy: string;
  createdAt: Date;
  deprecatedAt?: Date;
};

export type ErrataDb = {
  cardId: string;
  type: ErrataType;
  details: string;
  source?: string;
  errataDate: Date;
  createdBy: ObjectId;
  createdAt: Date;
  deprecatedAt?: Date;
};
