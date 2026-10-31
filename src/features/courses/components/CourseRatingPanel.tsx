import type { CourseReviewSummary } from "@/types/review";
import DisplayStars from "./DisplayStars";

type CourseRatingPanelProps = {
  summary: CourseReviewSummary;
};

export default function CourseRatingPanel({ summary }: CourseRatingPanelProps) {
  const maxCount = Math.max(...summary.ratingCounts, 1);

  return (
    <section className="border-border flex flex-col gap-4 rounded-lg border p-5">
      <div className="flex items-center gap-3">
        <p className="text-h1 text-fg leading-none">
          {summary.reviewCount > 0 ? summary.averageRating.toFixed(1) : "—"}
        </p>
        <div className="flex flex-col gap-0.5">
          <DisplayStars value={summary.averageRating} />
          <p className="text-caption text-fg-muted">
            จาก {summary.reviewCount} รีวิว
          </p>
        </div>
      </div>

      <ul className="flex flex-col gap-1.5">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = summary.ratingCounts[star - 1];
          const width =
            summary.reviewCount === 0 ? 0 : (count / maxCount) * 100;

          return (
            <li key={star} className="flex items-center gap-2">
              <span className="text-caption text-fg-muted w-8 shrink-0">
                {star} ดาว
              </span>
              <div className="bg-border h-2 flex-1 overflow-hidden rounded-sm">
                <div
                  className="bg-signature h-full rounded-sm"
                  style={{ width: `${width}%` }}
                />
              </div>
              <span className="text-caption text-fg-muted w-6 shrink-0 text-right">
                {count}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="border-border grid grid-cols-2 gap-3 border-t pt-4">
        <div>
          <p className="text-caption text-fg-muted">ความยากเฉลี่ย</p>
          <p className="text-h3 text-fg">
            {summary.reviewCount > 0
              ? `${summary.averageDifficulty.toFixed(1)} / 5`
              : "—"}
          </p>
        </div>
        <div>
          <p className="text-caption text-fg-muted">ปริมาณงานเฉลี่ย</p>
          <p className="text-h3 text-fg">
            {summary.reviewCount > 0
              ? `${summary.averageWorkload.toFixed(1)} / 5`
              : "—"}
          </p>
        </div>
      </div>
    </section>
  );
}
