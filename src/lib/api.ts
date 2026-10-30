// Server-side API client. Only call from Server Components:
// API_INTERNAL_URL is not exposed to the browser.

const BASE_URL = process.env.API_INTERNAL_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type QueryValue = string | number | undefined;

export async function apiGet<T>(
  path: string,
  query?: Record<string, QueryValue>,
  init?: RequestInit,
): Promise<T> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) params.set(key, String(value));
  }
  const qs = params.size > 0 ? `?${params}` : "";

  const res = await fetch(`${BASE_URL}${path}${qs}`, init);

  if (!res.ok) {
    throw new ApiError(res.status, `GET ${path} failed with ${res.status}`);
  }

  return (await res.json()) as T;
}
