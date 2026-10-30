import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  /** 1-based */
  currentPage: number;
  totalPages: number;
  /** Page links become `${basePath}?page=N` */
  basePath: string;
};

type PageItem = number | "ellipsis";

/** 1 … 4 5 6 … 10 — always shows first, last, and the current page's neighbours */
function getPageItems(current: number, total: number): PageItem[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const items: PageItem[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) items.push("ellipsis");
  for (let p = start; p <= end; p++) items.push(p);
  if (end < total - 1) items.push("ellipsis");
  items.push(total);

  return items;
}

const itemBase =
  "inline-flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-body transition-colors";

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const href = (page: number) => `${basePath}?page=${page}`;
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav aria-label="เปลี่ยนหน้า" className="flex justify-center">
      <ul className="flex items-center gap-1">
        <li>
          {hasPrev ? (
            <Link
              href={href(currentPage - 1)}
              aria-label="หน้าก่อนหน้า"
              className={`${itemBase} text-fg hover:bg-hover`}
            >
              <ChevronLeft size={16} />
            </Link>
          ) : (
            <span
              aria-hidden
              className={`${itemBase} text-fg-muted pointer-events-none opacity-50`}
            >
              <ChevronLeft size={16} />
            </span>
          )}
        </li>

        {getPageItems(currentPage, totalPages).map((item, i) =>
          item === "ellipsis" ? (
            <li key={`ellipsis-${i}`} className={`${itemBase} text-fg-muted`}>
              …
            </li>
          ) : (
            <li key={item}>
              <Link
                href={href(item)}
                aria-current={item === currentPage ? "page" : undefined}
                className={
                  item === currentPage
                    ? `${itemBase} bg-accent text-accent-fg font-medium`
                    : `${itemBase} text-fg hover:bg-hover`
                }
              >
                {item}
              </Link>
            </li>
          ),
        )}

        <li>
          {hasNext ? (
            <Link
              href={href(currentPage + 1)}
              aria-label="หน้าถัดไป"
              className={`${itemBase} text-fg hover:bg-hover`}
            >
              <ChevronRight size={16} />
            </Link>
          ) : (
            <span
              aria-hidden
              className={`${itemBase} text-fg-muted pointer-events-none opacity-50`}
            >
              <ChevronRight size={16} />
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
