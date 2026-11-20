import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import {
  loadMyReviews,
  ReviewableList,
  ReviewedList,
} from "@/features/reviews/components/MyReviews";

export const metadata: Metadata = {
  title: "รีวิวของฉัน | planIT",
};

type Tab = "pending" | "done";

type MyReviewsPageProps = {
  searchParams: Promise<{ tab?: string | string[] }>;
};

export default function MyReviewsPage({ searchParams }: MyReviewsPageProps) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-8">
      <div className="flex items-center gap-2">
        <Link
          href="/profile"
          aria-label="กลับไปหน้าโปรไฟล์"
          title="กลับไปหน้าโปรไฟล์"
          className="text-fg-muted hover:bg-hover hover:text-fg focus-visible:ring-accent -ml-2 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          <ArrowLeft size={20} aria-hidden />
        </Link>
        <nav aria-label="breadcrumb" className="text-body text-fg-muted">
          <ol className="flex items-center gap-1.5">
            <li>
              <Link href="/profile" className="hover:text-fg">
                โปรไฟล์
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-fg">รีวิวของฉัน</li>
          </ol>
        </nav>
      </div>

      <h1 className="text-h1 text-fg">รีวิวของฉัน</h1>

      <Suspense fallback={<MyReviewsSkeleton />}>
        <MyReviewsContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function MyReviewsContent({
  searchParams,
}: {
  searchParams: MyReviewsPageProps["searchParams"];
}) {
  const [session, { tab }] = await Promise.all([auth(), searchParams]);
  const token = session?.backendToken;
  if (!token || session?.user?.role !== "student") redirect("/profile");

  const requested = Array.isArray(tab) ? tab[0] : tab;
  const data = await loadMyReviews(
    token,
    requested ? `/profile/reviews?tab=${requested}` : "/profile/reviews",
  );
  const pendingCount = data.reviewable?.length;
  const doneCount = data.reviewed?.length;
  const active: Tab =
    requested === "pending" || requested === "done"
      ? requested
      : pendingCount === 0 && (doneCount ?? 0) > 0
        ? "done"
        : "pending";

  return (
    <div className="flex flex-col gap-5">
      <div
        role="tablist"
        aria-label="รีวิวของฉัน"
        className="border-border flex gap-6 border-b"
      >
        <TabLink tab="pending" active={active} count={pendingCount}>
          รอรีวิว
        </TabLink>
        <TabLink tab="done" active={active} count={doneCount}>
          รีวิวแล้ว
        </TabLink>
      </div>

      <div role="tabpanel">
        {active === "pending" ? (
          <ReviewableList {...data} />
        ) : (
          <ReviewedList reviewed={data.reviewed} />
        )}
      </div>
    </div>
  );
}

function TabLink({
  tab,
  active,
  count,
  children,
}: {
  tab: Tab;
  active: Tab;
  count?: number;
  children: React.ReactNode;
}) {
  const selected = tab === active;
  return (
    <Link
      href={`/profile/reviews?tab=${tab}`}
      role="tab"
      aria-selected={selected}
      replace
      scroll={false}
      className={`text-body -mb-px inline-flex items-center gap-1.5 border-b-2 pb-2.5 transition-colors ${
        selected
          ? "border-accent text-fg font-medium"
          : "text-fg-muted hover:text-fg border-transparent"
      }`}
    >
      {children}
      {count !== undefined && (
        <span
          className={`text-caption rounded-full px-1.5 py-0.5 ${
            selected ? "bg-accent-soft text-accent" : "bg-surface text-fg-muted"
          }`}
        >
          {count}
        </span>
      )}
    </Link>
  );
}

function MyReviewsSkeleton() {
  return (
    <div className="flex flex-col gap-5" aria-hidden>
      <div className="bg-hover h-9 w-56 animate-pulse rounded-md" />
      <div className="bg-hover h-48 w-full animate-pulse rounded-lg" />
    </div>
  );
}
