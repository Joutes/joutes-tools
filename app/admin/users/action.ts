"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-utils";
import db from "@/lib/mongodb";
import { ObjectId } from "bson";
import { User } from "@/lib/types/user";

export async function addPermissionAction(userId: string, permission: string) {
  await requireAdmin();

  const trimmed = permission.trim();
  if (!trimmed) throw new Error("Permission invalide");

  await db.collection<User>("user").updateOne(
    { _id: new ObjectId(userId) },
    { $addToSet: { permissions: trimmed } }
  );

  revalidatePath(`/admin/users/${userId}`);
}

export async function removePermissionAction(userId: string, permission: string) {
  await requireAdmin();

  await db.collection<User>("user").updateOne(
    { _id: new ObjectId(userId) },
    { $pull: { permissions: permission } }
  );

  revalidatePath(`/admin/users/${userId}`);
}

