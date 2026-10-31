import type { DefaultSession } from "next-auth";
import type { UserProfile } from "./auth";

// Adds the backend profile to the NextAuth session and JWT types
declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & Partial<UserProfile>;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userProfile?: UserProfile;
  }
}
