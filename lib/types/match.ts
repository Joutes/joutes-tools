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
  matchDate: string;
  createdAt: string;
};

export type MatchupStats = {
  legend: MatchCard;
  matchesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
};

export type LegendStats = {
  legend: MatchCard;
  matchesPlayed: number;
  matchWins: number;
  matchLosses: number;
  matchDraws: number;
  gamesWon: number;
  gamesLost: number;
  winRate: number; // 0–100
  matchups: MatchupStats[];
};

export type MatchDb = {
  userId: ObjectId;
  userLegend: MatchCard;
  opponentName?: string;
  opponentLegend: MatchCard;
  games: MatchGame[];
  notes?: string;
  matchDate: Date;
  createdAt: Date;
};

