'use server';

import {isAdmin} from "@/lib/auth-utils";
import db from "@/lib/mongodb";
import {ObjectId} from "bson";
import {User} from "@/lib/types/user";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";

export async function requirePermission(permission: string) {
  if (await hasPermission(permission)) {
    return true;
  }

  throw new Error('Not authorized.');
}

export async function hasPermission(permission: string) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.email) {
    return false;
  }

  const userWithPermission = await db.collection('user').findOne({
    $and: [
      { _id: new ObjectId(session.user.id) },
      {
        $or: [
          {
            permissions: permission,
          },
          {
            isAdmin: true,
          }
        ]
      },
    ],
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
