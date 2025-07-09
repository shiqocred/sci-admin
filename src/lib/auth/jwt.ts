import { sign, SignOptions, verify } from "jsonwebtoken";
import { jwtSecret } from "@/config";
import { errorRes } from "./response";

export const signJWT = (
  payload: string | Buffer | object,
  options?: SignOptions
) => {
  return sign(payload, jwtSecret, options);
};

const tokenJWT = (req: Request) => {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) return null;

  const token = authHeader.replace("Bearer ", "");

  return token;
};

// cek auth semua halaman
export const isAuth = async (
  req: Request,
  type: "verify" | "noverify" = "noverify"
) => {
  const token = tokenJWT(req);

  if (!token) return null;

  const payload: { sub: string; email: string; password: string } | null =
    verify(token, jwtSecret) as {
      sub: string;
      email: string;
      password: string;
    };

  if (
    (type === "noverify" && payload.email) ||
    (type === "noverify" && payload.password) ||
    (type === "verify" && payload.sub)
  )
    return null;

  return payload;
};
