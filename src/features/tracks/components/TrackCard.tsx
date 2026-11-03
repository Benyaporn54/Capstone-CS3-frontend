import Link from "next/link";
import type { TrackListItem } from "@/types/track";

type TrackCardProps = {
  track: TrackListItem;
};

export default function TrackCard({ track }: TrackCardProps) {
  return (
    <Link
      href={`/tracks/${track.id}`}
      className="group border-border bg-bg hover:border-border-strong focus-visible:ring-accent flex h-full flex-col gap-2 rounded-lg border p-5 transition-colors focus-visible:ring-2 focus-visible:outline-none"
    >
      <div className="flex flex-col gap-0.5">
        <h3 className="text-body-lg text-fg group-hover:text-accent font-semibold">
          {track.nameEn}
        </h3>
        {track.nameEn && (
          <p className="text-caption text-fg-muted">{track.nameTh}</p>
        )}
      </div>

      <p className="text-body text-fg-muted">{track.description}</p>
    </Link>
  );
}
