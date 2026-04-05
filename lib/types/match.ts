import { ObjectId } from "bson";

export type GameResult = "win" | "loss";

export type MatchGame = {
  result: GameResult;
};

export type MatchCard = {
  cardId: string;
  name: string;
  image: string;
};

export type Match = {
  id: string;
  userId: string;
  userLegend: MatchCard;
  opponentName?: string;
  opponentLegend: MatchCard;
  games: MatchGame[];
  notes?: string;
  createdAt: string;
};

export type MatchDb = {
  userId: ObjectId;
  userLegend: MatchCard;
  opponentName?: string;
  opponentLegend: MatchCard;
  games: MatchGame[];
  notes?: string;
  createdAt: Date;
};

