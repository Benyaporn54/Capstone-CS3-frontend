import "server-only";

import { auth } from "@/auth";

const API_URL = process.env.API_INTERNAL_URL ?? "http://localhost:8080";

export type Plan = Record<string, unknown>;

export async function getPlans(): Promise<Plan[]> {
  const session = await auth();
  if (!session?.backendToken) {
    throw new Error("Cannot fetch plans without a backend session token");
  }

  const res = await fetch(`${API_URL}/v1/plans`, {
    headers: {
      Authorization: `Bearer ${session.backendToken}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error(
        "GET /v1/plans returned 401: backend session expired; sign in again to sync a new token",
      );
    }
    throw new Error(`GET /v1/plans failed with status ${res.status}`);
  }

  const data: unknown = await res.json();
  if (Array.isArray(data)) return data as Plan[];
  if (
    data &&
    typeof data === "object" &&
    "data" in data &&
    Array.isArray(data.data)
  ) {
    return data.data as Plan[];
  }

  throw new Error("GET /v1/plans returned an invalid response");
}
