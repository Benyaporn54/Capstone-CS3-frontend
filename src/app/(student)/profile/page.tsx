import { Suspense } from "react";
import type { Metadata } from "next";
import ProfileCard from "@/features/profile/components/ProfileCard";
import MyReviewsLinkCard, {
  MyReviewsLinkCardSkeleton,
} from "@/features/profile/components/MyReviewsLinkCard";

export const metadata: Metadata = {
  title: "โปรไฟล์ | planIT",
};

export default function ProfilePage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10">
      <h1 className="text-h1 text-fg">โปรไฟล์</h1>
      <ProfileCard />
      {/* SCRUM-244: "รีวิวของฉัน" (เฉพาะนักศึกษา) — อ่าน session ใน Suspense */}
      <Suspense fallback={<MyReviewsLinkCardSkeleton />}>
        <MyReviewsLinkCard />
      </Suspense>
    </main>
  );
}
