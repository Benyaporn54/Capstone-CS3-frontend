"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, Plus, SquarePen } from "lucide-react";
import Button from "@/components/ui/Button";

export default function CourseDetailActions() {
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="secondary"
        className="px-2.5"
        aria-label={saved ? "เอาออกจากที่บันทึก" : "บันทึกวิชา"}
        aria-pressed={saved}
        onClick={() => setSaved((prev) => !prev)}
      >
        <Bookmark
          size={16}
          className={saved ? "text-accent fill-accent" : undefined}
        />
      </Button>
      <Button
        type="button"
        variant="secondary"
        className="gap-1.5"
        onClick={() => router.push("/login")}
      >
        <SquarePen size={16} />
        เขียนรีวิว
      </Button>
      <Button
        type="button"
        className="gap-1.5"
        onClick={() => router.push("/planner")}
      >
        <Plus size={16} />
        เพิ่มเข้าแผน
      </Button>
    </div>
  );
}
