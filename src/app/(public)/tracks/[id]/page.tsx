import { Suspense } from "react";
import type { Metadata } from "next";
import TrackDetail from "@/features/tracks/components/TrackDetail";
import { getTrackById } from "@/features/tracks/api";

type TrackDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: TrackDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const trackId = Number(id);
  const track = Number.isInteger(trackId) ? await getTrackById(trackId) : null;

  if (!track) {
    return { title: "ไม่พบ Track | planIT" };
  }

  return {
    title: `${track.nameTh} | planIT`,
  };
}

export default function TrackDetailPage({ params }: TrackDetailPageProps) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
          <div className="bg-hover h-4 w-32 animate-pulse rounded-md" />
          <div className="bg-hover h-10 w-64 animate-pulse rounded-md" />
          <div className="bg-hover h-20 w-full max-w-3xl animate-pulse rounded-md" />
        </main>
      }
    >
      <TrackDetail params={params} />
    </Suspense>
  );
}
