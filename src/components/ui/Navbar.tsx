"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: "รายวิชา", href: "/course" },
    { name: "Track", href: "/track" },
    { name: "แผนการเรียน", href: "/curriculum" },
  ];

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

        <div className="flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-body relative px-2 py-2 transition-colors ${isActive ? "text-fg font-bold" : "text-fg-muted hover:text-fg font-normal"} `}
              >
                {item.name}

                {isActive && (
                  <span className="bg-accent absolute right-0 bottom-[-5px] left-0 mb-[1px] h-[3px]" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="ml-auto">
        <Link
          href="/login"
          className="border-fg-muted bg-accent-fg text-fg hover:bg-hover hover:text-fg hover:border-fg mx-15 flex items-center gap-2 rounded-md border px-5 py-2 font-bold"
        >
          เข้าสู่ระบบ
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
