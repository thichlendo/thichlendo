import { randomBytes, pbkdf2Sync, createHash, timingSafeEqual } from "crypto";

const PBKDF2_ITERATIONS = 120_000;
const KEY_LENGTH = 32;
const DIGEST = "sha256";

export function hashPasswordLegacySha256(password: string): string {
  return createHash("sha256").update(password, "utf8").digest("hex");
}

export function hashPasswordSalted(password: string, existingSalt?: string) {
  const salt = existingSalt ?? randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, DIGEST).toString("hex");
  return { salt, hash };
}

export function verifySaltedPassword(password: string, salt: string, expectedHash: string): boolean {
  const { hash } = hashPasswordSalted(password, salt);
  return timingSafeEqualHex(hash, expectedHash);
}

function timingSafeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
                          }
