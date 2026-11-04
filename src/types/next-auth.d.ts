import type { DefaultSession } from "next-auth";
import type { UserProfile } from "./auth";

declare module "next-auth" {
  interface User {
    backendToken?: string;
    profile?: UserProfile;
  }

  interface Session {
    backendToken?: string;
    user: DefaultSession["user"] & UserProfile;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    backendToken?: string;
    userProfile?: UserProfile;
  }
}
