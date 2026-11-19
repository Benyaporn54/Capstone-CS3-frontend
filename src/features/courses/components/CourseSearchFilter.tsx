"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Filter, Loader2, Search, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
import TextField from "@/components/ui/TextField";
import type { CourseCategory } from "@/types/course";
import {
  buildCoursesHref,
  COURSE_QUERY_MAX_LENGTH,
  parseCourseCategories,
  parseCourseQuery,
} from "../searchParams";
import { saveLastCoursesHref } from "../lastCoursesHref";

const SEARCH_DEBOUNCE_MS = 300;

type CourseSearchFilterProps = {
  /** null = โหลดหมวดวิชาไม่สำเร็จ */
  categories: CourseCategory[] | null;
  initialQuery: string;
  initialCategories: string[];
};

/** SCRUM-231: ค้นหา (พิมพ์แล้วค้นอัตโนมัติ) + กรองหมวดวิชาบนหน้า /courses — เก็บค่าไว้ใน URL */
export default function CourseSearchFilter({
  categories,
  initialQuery,
  initialCategories,
}: CourseSearchFilterProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [selected, setSelected] = useState<string[]>(initialCategories);
  const [filterOpen, setFilterOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const filterRef = useRef<HTMLDivElement>(null);
  // ค่าที่อยู่ใน URL ล่าสุด — กันไม่ให้ debounce ยิง navigation ซ้ำ
  const appliedQuery = useRef(initialQuery.trim());
  // URL ล่าสุดที่ component นี้เป็นคนเปลี่ยนเอง
  const lastNavigatedKey = useRef(filterKey(initialQuery, initialCategories));

  // URL เปลี่ยนจากที่อื่น (กดเมนู "รายวิชา", ปุ่ม back/forward) → sync ช่องค้นหา + chip ตาม URL
  const searchParams = useSearchParams();
  const urlQuery = parseCourseQuery(searchParams.get("q") ?? undefined);
  const urlCategoriesParam = searchParams.get("category") ?? undefined;
  const urlKey = filterKey(urlQuery, parseCourseCategories(urlCategoriesParam));
  useEffect(() => {
    if (urlKey === lastNavigatedKey.current) return;
    lastNavigatedKey.current = urlKey;
    appliedQuery.current = urlQuery;
    setQuery(urlQuery);
    setSelected(parseCourseCategories(urlCategoriesParam));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlKey]);

  // จำ URL ล่าสุด (รวม page) ให้ปุ่ม "กลับไปหน้ารายวิชา" ในหน้า detail
  const currentSearch = searchParams.toString();
  useEffect(() => {
    saveLastCoursesHref(currentSearch);
  }, [currentSearch]);

  const navigate = (nextQuery: string, nextCategories: string[]) => {
    appliedQuery.current = nextQuery.trim();
    lastNavigatedKey.current = filterKey(nextQuery, nextCategories);
    // เปลี่ยนคำค้นหรือหมวด → กลับไปหน้า 1 (ไม่ส่ง page)
    startTransition(() => {
      router.replace(
        buildCoursesHref({ q: nextQuery, categories: nextCategories }),
        { scroll: false },
      );
    });
  };

  // พิมพ์แล้วรอ 300ms ค่อยค้น
  useEffect(() => {
    if (query.trim() === appliedQuery.current) return;
    const timer = setTimeout(
      () => navigate(query, selected),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
    // ยิงเฉพาะตอนคำค้นเปลี่ยน — หมวดวิชา navigate เองทันที
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    if (!filterOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!filterRef.current?.contains(event.target as Node))
        setFilterOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFilterOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [filterOpen]);

  const updateCategories = (next: string[]) => {
    setSelected(next);
    navigate(query, next);
  };

  const toggleCategory = (code: string) =>
    updateCategories(
      selected.includes(code)
        ? selected.filter((item) => item !== code)
        : [...selected, code],
    );

  const clearAll = () => {
    setQuery("");
    setSelected([]);
    navigate("", []);
  };

  const categoryName = (code: string) =>
    categories?.find((category) => category.code === code)?.nameTh ?? code;

  const hasFilters = query.trim() !== "" || selected.length > 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-2">
        <TextField
          type="search"
          value={query}
          maxLength={COURSE_QUERY_MAX_LENGTH}
          onChange={(event) => setQuery(event.target.value)}
          leftIcon={
            pending ? (
              <Loader2 size={16} className="animate-spin" aria-hidden />
            ) : (
              <Search size={16} aria-hidden />
            )
          }
          placeholder="ค้นหาด้วยรหัสวิชา ชื่อไทย หรือชื่ออังกฤษ"
          aria-label="ค้นหารายวิชา"
        />
        <div ref={filterRef} className="relative shrink-0">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setFilterOpen((open) => !open)}
            aria-label={
              selected.length > 0
                ? `กรองหมวดวิชา ${selected.length} หมวด`
                : "กรองหมวดวิชา"
            }
            aria-expanded={filterOpen}
            aria-controls="catalog-category-filter"
            className="border-border h-10 gap-1.5"
          >
            <Filter size={16} aria-hidden />
            <span>
              หมวดวิชา{selected.length > 0 ? ` (${selected.length})` : ""}
            </span>
            <ChevronDown size={14} aria-hidden />
          </Button>
          {filterOpen && (
            <div
              id="catalog-category-filter"
              className="border-border bg-bg shadow-pop absolute top-full right-0 z-20 mt-2 max-h-80 w-72 overflow-y-auto rounded-lg border p-3"
            >
              <p className="text-label text-fg mb-2">กรองตามหมวดวิชา</p>
              {categories === null ? (
                <div className="flex flex-col items-start gap-2">
                  <p role="alert" className="text-caption text-error">
                    โหลดหมวดวิชาไม่สำเร็จ
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.refresh()}
                  >
                    ลองอีกครั้ง
                  </Button>
                </div>
              ) : categories.length === 0 ? (
                <p className="text-caption text-fg-muted py-2">
                  ยังไม่มีหมวดวิชา
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {categories.map((category) => (
                    <Checkbox
                      key={category.code}
                      checked={selected.includes(category.code)}
                      onChange={() => toggleCategory(category.code)}
                      label={
                        <span>
                          {category.nameTh}
                          <span className="text-caption text-fg-muted block">
                            {category.code}
                          </span>
                        </span>
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2">
          {selected.map((code) => (
            <span
              key={code}
              className="bg-accent-soft text-caption text-accent inline-flex items-center gap-1 rounded-sm py-1 pr-1 pl-2"
            >
              {categoryName(code)}
              <button
                type="button"
                onClick={() =>
                  updateCategories(selected.filter((item) => item !== code))
                }
                aria-label={`เอาหมวด ${categoryName(code)} ออก`}
                className="hover:bg-accent/10 focus-visible:ring-accent rounded-sm p-0.5 focus-visible:ring-2 focus-visible:outline-none"
              >
                <X size={12} aria-hidden />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={clearAll}
            className="text-caption text-fg-muted hover:text-fg px-1"
          >
            ล้างทั้งหมด
          </button>
        </div>
      )}
    </div>
  );
}

function filterKey(query: string, categories: string[]): string {
  return `${query.trim()}|${categories.join(",")}`;
}
