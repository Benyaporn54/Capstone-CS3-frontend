// src/app/login/page.tsx
"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Info } from "lucide-react";
import Image from "next/image";

function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const message = searchParams.get("message");
  const error = searchParams.get("error");
const alert =
  error === "AccessDenied"
    ? "กรุณาเข้าสู่ระบบด้วยบัญชี @ad.sit.kmutt.ac.th เท่านั้น"
    : message;

  const handleMicrosoftLogin = () => {
    signIn("microsoft-entra-id", { callbackUrl });
  };

  return (
    <div className="bg-bg border-border flex w-full max-w-[420px] flex-col items-center rounded-2xl border p-8 text-center">
      {/* Logo */}
      <Image
        src="/smallLogo.png"
        alt="planIT logo"
        width={70}
        height={30}
        className="w-auto"
        priority
      />

      {/* Title */}
      <h1 className="text-h2 text-fg">เข้าสู่ระบบ planIT</h1>
      <p className="text-body text-fg-muted mt-2">
        ใช้บัญชี Microsoft ของคณะเพื่อสร้างแผนการเรียนและเขียนรีวิว
      </p>

      {/* Alert Message */}
      {alert && (
        <div className="bg-warning-soft text-label text-warning border-warning/20 mt-4 w-full rounded-md border p-3">
          {alert}
        </div>
      )}

      {/* Login Button */}
      <button
        onClick={handleMicrosoftLogin}
        className="border-fg bg-bg text-label text-fg hover:bg-hover mt-6 flex w-full cursor-pointer items-center justify-center gap-3 rounded-md border px-4 py-2.5 font-medium transition-colors"
      >
        <svg className="h-4 w-4 shrink-0" viewBox="0 0 23 23">
          <path fill="#f35325" d="M1 1h10v10H1z" />
          <path fill="#81bc06" d="M12 1h10v10H12z" />
          <path fill="#05a6f0" d="M1 12h10v10H1z" />
          <path fill="#ffba08" d="M12 12h10v10H12z" />
        </svg>
        เข้าสู่ระบบด้วย Microsoft
      </button>

      {/* Info Banner */}
      <div className="bg-accent-soft text-label text-accent mt-4 flex w-full items-center justify-center gap-2 rounded-lg p-3">
        <Info className="h-4 w-4 shrink-0" />
        <span className="text-fg">
          ใช้ได้เฉพาะอีเมล <strong>@ad.sit.kmutt.ac.th</strong>
        </span>
      </div>

      {/* Divider */}
      <div className="relative my-6 w-full">
        <div className="absolute inset-0 flex items-center">
          <div className="border-border w-full border-t" />
        </div>
        <div className="text-caption relative flex justify-center uppercase">
          <span className="bg-bg text-fg-muted px-3">หรือ</span>
        </div>
      </div>

      {/* Guest Link */}
      <Link
        href="/courses"
        className="text-body text-accent font-medium hover:underline"
      >
        ดูรายวิชาและรีวิวโดยไม่เข้าสู่ระบบ
      </Link>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="bg-surface flex min-h-screen items-center justify-center p-4">
      <Suspense
        fallback={<div className="text-fg-muted text-body">กำลังโหลด...</div>}
      >
        <LoginContent />
      </Suspense>
    </div>
  );
}
