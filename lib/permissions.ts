'use server';

import {isAdmin} from "@/lib/auth-utils";

export async function hasPermission(permission: string) {
  return await isAdmin();
}