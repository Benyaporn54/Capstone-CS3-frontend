import { Suspense } from "react";
import TrackList from "@/features/tracks/components/TrackList";
import TrackListSkeleton from "@/features/tracks/components/TrackListSkeleton";

export default function TrackPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
      {/* Header Section */}
      <div className="flex max-w-2xl flex-col gap-2">
        <h1 className="text-h1 text-fg font-bold">Track</h1>
        <p className="text-body text-fg-muted">
          หลักสูตร IT 2567 มี 9 แผนการเรียน แต่ละ Track
          มีวิชาบังคับเลือกของตัวเองในหมวดวิชาเชิงลึก ดูว่าต้องเรียนอะไร ภาคไหน
          ก่อนตัดสินใจ
        </p>
      </div>

      {/* Track List Section */}
      <Suspense fallback={<TrackListSkeleton />}>
        <TrackList />
      </Suspense>
    </main>
  );
}
