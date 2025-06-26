import { sign, SignOptions, verify } from "jsonwebtoken";
import { jwtSecret } from "@/config";

export const signJWT = (
  payload: string | Buffer | object,
  options?: SignOptions
) => {
  return sign(payload, jwtSecret, options);
};

export function verifyJwt(
  token: string
): { sub: string; verified: boolean } | null {
  try {
    return verify(token, jwtSecret) as { sub: string; verified: boolean };
  } catch {
    return null;
  }
}

export const isAuth = async (req: Request) => {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return { status: false, userId: null };
  }

  const token = authHeader.replace("Bearer ", "");
  const payload = verifyJwt(token);

  if (
    !payload?.sub ||
    payload?.verified === undefined ||
    payload?.verified === null
  ) {
    return { status: false, userId: null };
  }

  return { status: true, userId: payload.sub };
};
