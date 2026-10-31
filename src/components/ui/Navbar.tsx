"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Avatar from "@/components/ui/Avatar";

// 1. แยกส่วนที่ใช้ usePathname() ออกมาเป็น Component ย่อย
function NavLinks() {
  const pathname = usePathname();

  const navItems = [
    { name: "รายวิชา", href: "/courses" },
    { name: "Track", href: "/tracks" },
    { name: "แผนการเรียน", href: "/curriculums" },
  ];

  return (
    <div className="flex items-center gap-8">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`text-body relative px-2 py-2 transition-colors ${
              isActive
                ? "text-fg font-bold"
                : "text-fg-muted hover:text-fg font-normal"
            } `}
          >
            {item.name}

            {isActive && (
              <span className="bg-accent absolute right-0 bottom-[-5px] left-0 mb-[1px] h-[3px]" />
            )}
          </Link>
        );
      })}
    </div>
  );
}

// Logged in → avatar linking to /profile, otherwise the login button
function UserMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="bg-hover h-9 w-9 animate-pulse rounded-full" />;
  }

  if (session?.user) {
    const name = session.user.displayName ?? session.user.name;
    return (
      <Link
        href="/profile"
        aria-label="โปรไฟล์"
        title={name ?? "โปรไฟล์"}
        className="focus-visible:ring-accent block rounded-full transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:outline-none"
      >
        <Avatar name={name} />
      </Link>
    );
  }

  return (
    <Link
      href="/login"
      className="border-fg-muted bg-accent-fg text-fg hover:bg-hover hover:text-fg hover:border-fg flex items-center gap-2 rounded-md border px-5 py-2 font-bold"
    >
      เข้าสู่ระบบ
    </Link>
  );
}

// 2. Component หลัก หุ้มด้วย Suspense
function Navbar() {
  return (
    <nav className="border-border bg-bg flex items-center gap-8 border-b-3 px-5 py-1">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="planIT logo"
            width={120}
            height={32}
            className="w-auto cursor-pointer"
            priority
          />
        </Link>

        {/* หุ้ม NavLinks ด้วย Suspense เพื่อป้องกัน Build Error ในช่วง Prerender */}
        <Suspense fallback={<div className="h-9 w-48" />}>
          <NavLinks />
        </Suspense>
      </div>

      <div className="mx-15 ml-auto">
        <UserMenu />
      </div>
    </nav>
  );
}

export default Navbar;