// libs/google.ts
import { androidClientId, iosClientId } from "@/config";
import { OAuth2Client } from "google-auth-library";

const oauth2Client = new OAuth2Client();

export async function verifyGoogleToken(idToken: string) {
  const ticket = await oauth2Client.verifyIdToken({
    idToken,
    audience: [androidClientId, iosClientId],
  });

  const payload = ticket.getPayload();

  if (!payload || !payload.email_verified || !payload.email) {
    throw new Error("Invalid Google token");
  }

  return payload;
}
