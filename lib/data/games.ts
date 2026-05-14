import db from "@/lib/mongodb";
import {Game} from "@/lib/types/game";

export function getGameBySlug(slug: string) {
  return db.collection<Game>("games").findOne({ slug });
}