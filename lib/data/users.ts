import 'server-only';

import db from "@/lib/mongodb";
import { ObjectId } from "bson";
import { User } from "@/lib/types/user";

type UserWithId = User & { id: string };

function mapUser(u: Record<string, unknown>): UserWithId {
  return {
    id: (u._id as ObjectId).toString(),
    username: (u.name as string) || (u.email as string) || (u._id as ObjectId).toString(),
    email: u.email as string | undefined,
    emailVerified: u.emailVerified as boolean | undefined,
    image: u.image as string | undefined,
    createdAt: u.createdAt as Date | undefined,
    updatedAt: u.updatedAt as Date | undefined,
    permissions: (u.permissions as string[]) || [],
  };
}

export async function searchUsersByEmail(email: string): Promise<UserWithId[]> {
  const users = await db
    .collection("user")
    .find({ email: { $regex: email, $options: "i" } })
    .limit(20)
    .toArray();

  return users.map(mapUser);
}

export async function getUserById(userId: string): Promise<UserWithId | null> {
  let objectId: ObjectId;
  try {
    objectId = new ObjectId(userId);
  } catch {
    return null;
  }

  const u = await db.collection("user").findOne({ _id: objectId });
  if (!u) return null;

  return mapUser(u as Record<string, unknown>);
}

