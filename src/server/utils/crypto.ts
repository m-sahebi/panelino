import { compare, hash as hashString } from "bcryptjs";
import "@/server/utils/server-only";

export async function hashPassword(password: string) {
  return hashString(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return compare(password, hash);
}
