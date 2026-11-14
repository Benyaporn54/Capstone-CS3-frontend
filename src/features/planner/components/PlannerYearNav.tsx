"use client";

import { useEffect, useState } from "react";
import type { PlanYear } from "@/types/plan";
import { yearAnchorId, yearCredits, yearHasMismatch } from "../utils";

type PlannerYearNavProps = {
  years: PlanYear[];
};

function yearStatusText(year: PlanYear): string {
  if (year.status === "completed") return "เรียนจบแล้ว";
  if (year.status === "current") return "กำลังเรียน";
  return `${yearCredits(year)} หน่วยกิต`;
}

/** เมนูปีด้านข้าง — ไฮไลต์ปีที่กำลังเลื่อนดูอยู่ */
export default function PlannerYearNav({ years }: PlannerYearNavProps) {
  const [active, setActive] = useState<number | null>(null);
  const yearKey = years.map((y) => y.year).join(",");

  useEffect(() => {
    const sections = yearKey
      .split(",")
      .map((y) => document.getElementById(yearAnchorId(Number(y))))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActive(Number(visible[0].target.id.replace("year-", "")));
        }
      },
      // นับว่า "อยู่" ปีไหนจากช่วงบนของจอ
      { rootMargin: "0px 0px -60% 0px" },
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [yearKey]);

  return (
    <nav aria-label="ปีการศึกษา">
      <ul className="flex gap-1 overflow-x-auto lg:flex-col">
        {years.map((year) => {
          const isActive = active === year.year;
          const hasMismatch = yearHasMismatch(year);
          return (
            <li key={year.year} className="shrink-0">
              <a
                href={`#${yearAnchorId(year.year)}`}
                aria-current={isActive ? "location" : undefined}
                className={`focus-visible:ring-accent flex h-10 items-center justify-between gap-4 rounded-md px-3 transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                  isActive ? "bg-hover text-fg" : "text-fg-muted hover:bg-hover"
                }`}
              >
                <span
                  className={`text-body ${isActive ? "text-fg font-medium" : "text-fg"}`}
                >
                  ปี {year.year}
                </span>
                <span className="text-caption flex items-center gap-1.5 whitespace-nowrap">
                  {hasMismatch && (
                    <span
                      className="bg-warning size-2 rounded-full"
                      title="มีวิชาที่ลงทะเบียนจริงไม่ตรงแผน"
                    />
                  )}
                  {yearStatusText(year)}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
