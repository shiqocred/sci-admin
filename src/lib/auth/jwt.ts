import { sign, SignOptions, verify } from "jsonwebtoken";
import { jwtSecret } from "@/config";

export const signJWT = (
  payload: string | Buffer | object,
  options?: SignOptions
) => {
  return sign(payload, jwtSecret, options);
};

export function getUserFromToken(token: string): { sub: string } | null {
  try {
    return verify(token, jwtSecret) as { sub: string };
  } catch {
    return null;
  }
}
