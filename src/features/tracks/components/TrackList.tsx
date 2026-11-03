import { getTracks } from "../api";
import TrackCard from "./TrackCard";
import type { TrackListItem } from "@/types/track";

type TrackGroupSection = {
  id: number;
  nameTh: string;
  tracks: TrackListItem[];
};

function groupTracks(tracks: TrackListItem[]): TrackGroupSection[] {
  if (!Array.isArray(tracks)) return [];

  const sections: TrackGroupSection[] = [];

  for (const track of tracks) {
    const groupId = track.group?.id ?? 0;
    const groupName = track.group?.nameTh || "ทั่วไป";

    const current = sections.find((section) => section.id === groupId);
    if (current) {
      current.tracks.push(track);
    } else {
      sections.push({
        id: groupId,
        nameTh: groupName,
        tracks: [track],
      });
    }
  }

  return sections;
}

export default async function TrackList() {
  const tracks = await getTracks();

  if (!Array.isArray(tracks) || tracks.length === 0) {
    return (
      <p className="border-border bg-surface text-body text-fg-muted rounded-lg border p-8 text-center">
        ยังไม่มีข้อมูล Track
      </p>
    );
  }

  const sections = groupTracks(tracks);

  return (
    <div className="flex flex-col gap-8">
      {sections.map((section) => (
        <section key={section.id} className="flex flex-col gap-3">
          <h2 className="text-label text-fg-muted">{section.nameTh}</h2>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {section.tracks.map((track) => (
              <li key={track.id}>
                <TrackCard track={track} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
