import Link from "next/link";
import { ChevronRight, MessageSquareText } from "lucide-react";
import { auth } from "@/auth";
import { loadMyReviews } from "@/features/reviews/components/MyReviews";

export default async function MyReviewsLinkCard() {
  const session = await auth();
  const token = session?.backendToken;
  if (!token || session?.user?.role !== "student") return null;

  const { reviewable, reviewed } = await loadMyReviews(token, "/profile");
  const pending = reviewable?.length ?? 0;

  const summary =
    reviewable === null || reviewed === null
      ? "ดูวิชาที่รีวิวได้และรีวิวที่เขียนไว้"
      : `รอรีวิว ${pending} วิชา · รีวิวแล้ว ${reviewed.length} วิชา`;

  return (
    <Link
      href="/profile/reviews"
      className="border-border bg-bg hover:bg-hover focus-visible:ring-accent flex items-center gap-4 rounded-lg border p-5 transition-colors focus-visible:ring-2 focus-visible:outline-none"
    >
      <span className="bg-accent-soft text-accent inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md">
        <MessageSquareText size={20} aria-hidden />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-body text-fg font-medium">รีวิวของฉัน</span>
        <span className="text-caption text-fg-muted">{summary}</span>
      </span>
      {pending > 0 && (
        <span className="bg-accent text-accent-fg text-caption shrink-0 rounded-full px-2 py-0.5 font-medium">
          รอรีวิว {pending}
        </span>
      )}
      <ChevronRight size={18} className="text-fg-muted shrink-0" aria-hidden />
    </Link>
  );
}

export function MyReviewsLinkCardSkeleton() {
  return (
    <div
      className="bg-hover h-[82px] w-full animate-pulse rounded-lg"
      aria-hidden
    />
  );
}
