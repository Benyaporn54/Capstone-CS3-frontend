import type { TrackListItem, TrackDetailData } from "@/types/track";

export async function getTracks(token?: string): Promise<TrackListItem[]> {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    const res = await fetch(`${baseUrl}/v1/tracks`, {
      headers,
      cache: "no-store",
    });

    if (!res.ok) return [];

    const data = await res.json();
    return Array.isArray(data) ? data : (data?.data ?? []);
  } catch (error) {
    console.error("Failed to fetch tracks:", error);
    return [];
  }
}

export async function getTrackById(
  id: number,
  token?: string,
): Promise<TrackDetailData | null> {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    const res = await fetch(`${baseUrl}/v1/tracks/${id}`, {
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 404) console.error(`Track with ID ${id} not found`);
      return null;
    }

    const data: TrackDetailData = await res.json();
    return data;
  } catch (error) {
    console.error(`Failed to fetch track detail for ID ${id}:`, error);
    return null;
  }
}
