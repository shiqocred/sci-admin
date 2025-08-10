import { biteshipAPI, biteshipUrl } from "@/config";

export async function createOrder(body: any) {
  const raw = await fetch(`${biteshipUrl}/orders`, {
    method: "POST",
    headers: {
      Authorization: biteshipAPI,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const response = await raw.json();

  return { ok: raw.ok, response };
}
