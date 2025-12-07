import {ObjectId} from "bson";

export type Game = {
  id: string;
  name: string;
  slug: string;
};

export type GameDb = {
  _id: ObjectId;
  name: string;
  slug: string;
};
