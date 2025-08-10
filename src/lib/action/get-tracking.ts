import { biteshipAPI, biteshipUrl } from "@/config";

export async function getTracking(id: string) {
  const raw = await fetch(`${biteshipUrl}/trackings/${id}`, {
    method: "GET",
    headers: {
      Authorization: biteshipAPI,
      "Content-Type": "application/json",
    },
  });

  const response = await raw.json();

  return { ok: raw.ok, response };
}
