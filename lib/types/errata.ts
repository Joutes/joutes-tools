import { ObjectId } from "bson";

export type ErrataType = "errata" | "clarification" | "ruling";

export type Errata = {
  id: string;
  cardId: string;
  type: ErrataType;
  details: string;
  source?: string;
  errataDate: Date;
  createdBy: string;
  createdAt: Date;
};

export type ErrataDb = {
  cardId: string;
  type: ErrataType;
  details: string;
  source?: string;
  errataDate: Date;
  createdBy: ObjectId;
  createdAt: Date;
};
