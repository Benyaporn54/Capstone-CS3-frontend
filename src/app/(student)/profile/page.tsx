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

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const name = user?.displayName ?? user?.name;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-6 py-10">
      <h1 className="text-h1 text-fg">โปรไฟล์</h1>

      <section className="border-border bg-bg flex flex-col items-center gap-4 rounded-lg border p-8 text-center">
        {status === "loading" ? (
          <>
            <div className="bg-hover h-20 w-20 animate-pulse rounded-full" />
            <div className="bg-hover h-6 w-48 animate-pulse rounded-md" />
          </>
        ) : (
          <>
            <Avatar name={name} size="lg" />
            <div className="flex flex-col gap-1">
              <p className="text-h3 text-fg">{name ?? "-"}</p>
              <p className="text-body text-fg-muted">{user?.email ?? "-"}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
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
          </>
        )}
      </section>

      <Button
        variant="danger-light"
        className="w-full gap-2"
        onClick={() => signOut({ redirectTo: "/" })}
      >
        <LogOut size={16} />
        ออกจากระบบ
      </Button>
    </main>
  );
}
