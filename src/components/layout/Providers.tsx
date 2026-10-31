"use client";

import { SessionProvider } from "next-auth/react";

// Lets client components read the login session with useSession()
export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
