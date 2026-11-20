"use client";

import { signOut, useSession } from "next-auth/react";
import { LogOut } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";

const roleLabel: Record<string, string> = {
  student: "นักศึกษา",
  staff: "เจ้าหน้าที่",
  admin: "ผู้ดูแลระบบ",
};

export default function ProfileCard() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const name = user?.displayName ?? user?.name;

  return (
    <section className="border-border bg-bg flex flex-col gap-4 rounded-lg border p-6 sm:flex-row sm:items-center">
      {status === "loading" ? (
        <div className="flex items-center gap-4">
          <div className="bg-hover h-20 w-20 animate-pulse rounded-full" />
          <div className="flex flex-col gap-2">
            <div className="bg-hover h-6 w-48 animate-pulse rounded-md" />
            <div className="bg-hover h-4 w-64 animate-pulse rounded-md" />
          </div>
        </div>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <Avatar name={name} size="lg" />
          <div className="flex min-w-0 flex-col gap-1.5">
            <p className="text-h3 text-fg break-words">{name ?? "-"}</p>
            <p className="text-body text-fg-muted break-all">
              {user?.email ?? "-"}
            </p>
            <div className="flex flex-wrap gap-2">
              {user?.studentId && (
                <span className="bg-surface text-caption text-fg-muted rounded-sm px-2 py-0.5">
                  {user.studentId}
                </span>
              )}
              {user?.role && (
                <span className="bg-accent-soft text-caption text-accent rounded-sm px-2 py-0.5">
                  {roleLabel[user.role] ?? user.role}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
      <Button
        variant="danger-light"
        className="shrink-0 gap-2"
        onClick={() => signOut({ redirectTo: "/" })}
      >
        <LogOut size={16} />
        ออกจากระบบ
      </Button>
    </section>
  );
}
