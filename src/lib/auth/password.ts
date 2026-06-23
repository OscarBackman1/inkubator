import { createHash } from "crypto";

export function hashPassword(password: string) {
  return createHash("sha256")
    .update(`${password}:${process.env.NEXTAUTH_SECRET ?? "movexum-dev"}`)
    .digest("hex");
}

export function verifyPassword(password: string, passwordHash: string) {
  return hashPassword(password) === passwordHash;
}
