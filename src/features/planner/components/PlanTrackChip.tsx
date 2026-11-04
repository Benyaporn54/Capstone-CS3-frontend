import type { PlanTrack } from "@/types/plan";

type PlanTrackChipProps = {
  track: PlanTrack | null;
};

/** ชิป Track ของแผน — ใช้ทั้งการ์ดแผนและหัวหน้า Planner */
export default function PlanTrackChip({ track }: PlanTrackChipProps) {
  if (!track) {
    return (
      <span className="bg-hover text-caption text-fg-muted inline-flex w-fit rounded-full px-2.5 py-0.5">
        ยังไม่เลือก Track
      </span>
    );
  }

  return (
    <span
      title={track.nameTh}
      className="bg-accent-soft text-caption text-accent inline-flex w-fit rounded-full px-2.5 py-0.5 font-medium"
    >
      {track.nameEn}
    </span>
  );
}
