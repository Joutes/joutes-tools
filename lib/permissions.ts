'use server';

import {isAdmin} from "@/lib/auth-utils";
import db from "@/lib/mongodb";
import {ObjectId} from "bson";
import {User} from "@/lib/types/user";

export async function hasPermission(permission: string) {
  const userWithPermission = await db.collection('user').findOne({
    $or: [
      {
        permissions: permission,
      },
      {
        isAdmin: true,
      }
    ]
  });

  if (userWithPermission) {
    return true;
  }

  return await isAdmin();
}

export async function addPermissionToUser(userId: string, permission: string) {
  await db.collection<User>('user').updateOne(
    { _id: new ObjectId(userId) },
    { $addToSet: { permissions: permission } }
  );
}

export async function removePermissionFromUser(userId: string, permission: string) {
  await db.collection<User>('user').updateOne(
    { _id: new ObjectId(userId) },
    { $pull: { permissions: permission } }
  );
}
