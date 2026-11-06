// Server-side API client. Only call from Server Components:
// API_INTERNAL_URL is not exposed to the browser.

const BASE_URL = process.env.API_INTERNAL_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public backendMessage?: string,
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

export async function apiPost<T>(
  path: string,
  body: unknown,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    method: "POST",
    headers: { "Content-Type": "application/json", ...init?.headers },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const body: unknown = await res.json().catch(() => null);
    const backendMessage =
      body &&
      typeof body === "object" &&
      "message" in body &&
      typeof body.message === "string" &&
      body.message.trim()
        ? body.message
        : undefined;
    throw new ApiError(
      res.status,
      backendMessage ?? `POST ${path} failed with ${res.status}`,
      backendMessage,
    );
  }

  if (res.status === 204) return undefined as T;
  const responseBody = await res.text();
  return (responseBody ? JSON.parse(responseBody) : undefined) as T;
}
